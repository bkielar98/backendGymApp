import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workout, WorkoutStatus } from '../entities/workout.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { WorkoutSet } from '../entities/workout-set.entity';
import { WorkoutTemplate } from '../entities/workout-template.entity';
import { StartWorkoutDto } from './dto/start-workout.dto';
import { UpdateWorkoutSetDto } from './dto/update-workout-set.dto';
import { ConfirmWorkoutSetDto } from './dto/confirm-workout-set.dto';

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(Workout)
    private readonly workoutRepository: Repository<Workout>,
    @InjectRepository(WorkoutExercise)
    private readonly workoutExerciseRepository: Repository<WorkoutExercise>,
    @InjectRepository(WorkoutSet)
    private readonly workoutSetRepository: Repository<WorkoutSet>,
    @InjectRepository(WorkoutTemplate)
    private readonly templateRepository: Repository<WorkoutTemplate>,
  ) {}

  async startWorkout(userId: number, dto: StartWorkoutDto) {
    const activeWorkout = await this.workoutRepository.findOne({
      where: { userId, status: WorkoutStatus.ACTIVE },
    });

    if (activeWorkout) {
      throw new BadRequestException('User already has an active workout');
    }

    const template = await this.templateRepository.findOne({
      where: { id: dto.templateId, userId },
    });

    if (!template) {
      throw new NotFoundException('Workout template not found');
    }

    const workout = this.workoutRepository.create({
      userId,
      templateId: template.id,
      template,
      name: template.name,
      status: WorkoutStatus.ACTIVE,
      startedAt: new Date(),
      finishedAt: null,
      exercises: [],
    });

    const savedWorkout = await this.workoutRepository.save(workout);

    const sortedTemplateExercises = [...(template.exercises || [])].sort(
      (a, b) => a.order - b.order,
    );

    for (const templateExercise of sortedTemplateExercises) {
      const workoutExercise = this.workoutExerciseRepository.create({
        workoutId: savedWorkout.id,
        exerciseId: templateExercise.exerciseId,
        exercise: templateExercise.exercise,
        order: templateExercise.order,
        sets: [],
      });

      const savedWorkoutExercise =
        await this.workoutExerciseRepository.save(workoutExercise);

      const previousSets = await this.getPreviousSetsForExercise(
        userId,
        templateExercise.exerciseId,
      );

      const setsToCreate: WorkoutSet[] = [];

      for (let i = 1; i <= templateExercise.setsCount; i += 1) {
        const previousSet = previousSets.find((set) => set.setNumber === i);

        setsToCreate.push(
          this.workoutSetRepository.create({
            workoutExerciseId: savedWorkoutExercise.id,
            setNumber: i,
            previousWeight: previousSet?.currentWeight ?? null,
            previousReps: previousSet?.currentReps ?? null,
            currentWeight: null,
            currentReps: null,
            repMax: null,
            confirmed: false,
          }),
        );
      }

      await this.workoutSetRepository.save(setsToCreate);
    }

    return this.getWorkoutByIdForUser(userId, savedWorkout.id);
  }

  async getActiveWorkout(userId: number) {
    const workout = await this.workoutRepository.findOne({
      where: { userId, status: WorkoutStatus.ACTIVE },
      relations: {
        template: true,
      },
    });

    if (!workout) {
      throw new NotFoundException('Active workout not found');
    }

    return this.mapWorkout(workout);
  }

  async findAll(userId: number) {
    const workouts = await this.workoutRepository.find({
      where: { userId },
      order: { startedAt: 'DESC' },
      relations: {
        template: true,
      },
    });

    return workouts.map((workout) => this.mapWorkout(workout));
  }

  async findOne(userId: number, workoutId: number) {
    return this.getWorkoutByIdForUser(userId, workoutId);
  }

  async updateSet(userId: number, setId: number, dto: UpdateWorkoutSetDto) {
    const set = await this.getSetForUser(userId, setId);

    if (typeof dto.currentWeight === 'number') {
      set.currentWeight = dto.currentWeight;
    }

    if (typeof dto.currentReps === 'number') {
      set.currentReps = dto.currentReps;
    }

    set.repMax = this.calculateRepMax(set.currentWeight, set.currentReps);

    await this.workoutSetRepository.save(set);

    return this.getWorkoutExerciseByIdForUser(userId, set.workoutExercise.id);
  }

  async confirmSet(userId: number, setId: number, dto: ConfirmWorkoutSetDto) {
    const set = await this.getSetForUser(userId, setId);

    set.currentWeight = dto.currentWeight;
    set.currentReps = dto.currentReps;
    set.repMax = this.calculateRepMax(set.currentWeight, set.currentReps);
    set.confirmed = true;

    await this.workoutSetRepository.save(set);

    return this.getWorkoutExerciseByIdForUser(userId, set.workoutExercise.id);
  }

  async addSet(userId: number, workoutExerciseId: number) {
    const workoutExercise = await this.getWorkoutExerciseEntityForUser(
      userId,
      workoutExerciseId,
    );

    const nextSetNumber =
      Math.max(0, ...workoutExercise.sets.map((set) => set.setNumber)) + 1;

    const previousSets = await this.getPreviousSetsForExercise(
      userId,
      workoutExercise.exercise.id,
    );

    const previousSet = previousSets.find((set) => set.setNumber === nextSetNumber);

    const newSet = this.workoutSetRepository.create({
      workoutExerciseId: workoutExercise.id,
      workoutExercise,
      setNumber: nextSetNumber,
      previousWeight: previousSet?.currentWeight ?? null,
      previousReps: previousSet?.currentReps ?? null,
      currentWeight: null,
      currentReps: null,
      repMax: null,
      confirmed: false,
    });

    await this.workoutSetRepository.save(newSet);

    return this.getWorkoutExerciseByIdForUser(userId, workoutExercise.id);
  }

  async removeSet(userId: number, setId: number) {
    const set = await this.getSetForUser(userId, setId);
    const workoutExerciseId = set.workoutExercise.id;

    await this.workoutSetRepository.delete(set.id);

    const remainingSets = await this.workoutSetRepository.find({
      where: { workoutExerciseId },
      order: { setNumber: 'ASC' },
    });

    for (let index = 0; index < remainingSets.length; index += 1) {
      remainingSets[index].setNumber = index + 1;
    }

    await this.workoutSetRepository.save(remainingSets);

    return this.getWorkoutExerciseByIdForUser(userId, workoutExerciseId);
  }

  async finishActiveWorkout(userId: number) {
    const workout = await this.workoutRepository.findOne({
      where: { userId, status: WorkoutStatus.ACTIVE },
    });

    if (!workout) {
      throw new NotFoundException('Active workout not found');
    }

    workout.status = WorkoutStatus.COMPLETED;
    workout.finishedAt = new Date();

    await this.workoutRepository.save(workout);

    return this.getWorkoutByIdForUser(userId, workout.id);
  }

  private async getWorkoutByIdForUser(userId: number, workoutId: number) {
    const workout = await this.workoutRepository.findOne({
      where: { id: workoutId, userId },
      relations: {
        template: true,
      },
    });

    if (!workout) {
      throw new NotFoundException('Workout not found');
    }

    return this.mapWorkout(workout);
  }

  private async getWorkoutExerciseEntityForUser(
    userId: number,
    workoutExerciseId: number,
  ) {
    const workoutExercise = await this.workoutExerciseRepository.findOne({
      where: {
        id: workoutExerciseId,
        workout: {
          userId,
          status: WorkoutStatus.ACTIVE,
        },
      },
      relations: {
        workout: true,
        exercise: true,
        sets: true,
      },
      order: {
        sets: {
          setNumber: 'ASC',
        },
      },
    });

    if (!workoutExercise) {
      throw new NotFoundException('Workout exercise not found');
    }

    return workoutExercise;
  }

  private async getWorkoutExerciseByIdForUser(
    userId: number,
    workoutExerciseId: number,
  ) {
    const workoutExercise = await this.getWorkoutExerciseEntityForUser(
      userId,
      workoutExerciseId,
    );

    return this.mapWorkoutExercise(workoutExercise);
  }

  private async getSetForUser(userId: number, setId: number) {
    const set = await this.workoutSetRepository.findOne({
      where: {
        id: setId,
        workoutExercise: {
          workout: {
            userId,
            status: WorkoutStatus.ACTIVE,
          },
        },
      },
      relations: {
        workoutExercise: {
          workout: true,
          exercise: true,
          sets: true,
        },
      },
      order: {
        workoutExercise: {
          sets: {
            setNumber: 'ASC',
          },
        },
      },
    });

    if (!set) {
      throw new NotFoundException('Workout set not found');
    }

    return set;
  }

  private async getPreviousSetsForExercise(userId: number, exerciseId: number) {
    const previousWorkoutExercise = await this.workoutExerciseRepository.findOne({
      where: {
        exerciseId,
        workout: {
          userId,
          status: WorkoutStatus.COMPLETED,
        },
      },
      relations: {
        workout: true,
        sets: true,
      },
      order: {
        workout: {
          finishedAt: 'DESC',
        },
        sets: {
          setNumber: 'ASC',
        },
      },
    });

    return previousWorkoutExercise?.sets || [];
  }

  private calculateRepMax(weight?: number | null, reps?: number | null) {
    if (
      typeof weight !== 'number' ||
      typeof reps !== 'number' ||
      weight <= 0 ||
      reps <= 0
    ) {
      return null;
    }

    const repMax = weight * (1 + reps / 30);
    return Math.round(repMax * 100) / 100;
  }

  private getDurationSeconds(startedAt: Date, finishedAt: Date | null) {
    const start = new Date(startedAt).getTime();
    const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();

    return Math.max(0, Math.floor((end - start) / 1000));
  }

  private mapWorkout(workout: Workout) {
    return {
      id: workout.id,
      name: workout.name,
      status: workout.status,
      startedAt: workout.startedAt,
      finishedAt: workout.finishedAt,
      durationSeconds: this.getDurationSeconds(workout.startedAt, workout.finishedAt),
      template: workout.template
        ? {
            id: workout.template.id,
            name: workout.template.name,
          }
        : null,
      exercises: [...(workout.exercises || [])]
        .sort((a, b) => a.order - b.order)
        .map((exercise) => this.mapWorkoutExercise(exercise)),
    };
  }

  private mapWorkoutExercise(workoutExercise: WorkoutExercise) {
    return {
      id: workoutExercise.id,
      order: workoutExercise.order,
      exercise: workoutExercise.exercise
        ? {
            id: workoutExercise.exercise.id,
            name: workoutExercise.exercise.name,
            description: workoutExercise.exercise.description,
            muscleGroups: workoutExercise.exercise.muscleGroups,
          }
        : null,
      sets: [...(workoutExercise.sets || [])]
        .sort((a, b) => a.setNumber - b.setNumber)
        .map((set) => ({
          id: set.id,
          setNumber: set.setNumber,
          previousWeight: set.previousWeight,
          previousReps: set.previousReps,
          currentWeight: set.currentWeight,
          currentReps: set.currentReps,
          repMax: set.repMax,
          confirmed: set.confirmed,
        })),
    };
  }
}
