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
import { Exercise } from '../entities/exercise.entity';
import { StartWorkoutDto } from './dto/start-workout.dto';
import { UpdateWorkoutSetDto } from './dto/update-workout-set.dto';
import { ConfirmWorkoutSetDto } from './dto/confirm-workout-set.dto';
import { AddWorkoutExerciseDto } from './dto/add-workout-exercise.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import {
  MAX_ACTIVE_WORKOUT_EXERCISES,
  MAX_EXERCISE_SETS,
  MAX_TOTAL_SETS,
} from '../common/constants/workout.constants';
import { calculateBrzyckiRepMax } from '../common/utils/rep-max.util';

@Injectable()
export class WorkoutsService {
  private readonly workoutRelations = {
    template: true,
    exercises: {
      exercise: true,
      sets: true,
    },
  } as const;

  constructor(
    @InjectRepository(Workout)
    private readonly workoutRepository: Repository<Workout>,
    @InjectRepository(WorkoutExercise)
    private readonly workoutExerciseRepository: Repository<WorkoutExercise>,
    @InjectRepository(WorkoutSet)
    private readonly workoutSetRepository: Repository<WorkoutSet>,
    @InjectRepository(WorkoutTemplate)
    private readonly templateRepository: Repository<WorkoutTemplate>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
  ) {}

  async startWorkout(userId: number, dto: StartWorkoutDto) {
    const activeWorkout = await this.workoutRepository.findOne({
      where: { userId, status: WorkoutStatus.ACTIVE },
    });

    if (activeWorkout) {
      throw new BadRequestException('User already has an active workout');
    }

    let template: WorkoutTemplate | null = null;

    if (typeof dto.templateId === 'number') {
      template = await this.templateRepository.findOne({
        where: { id: dto.templateId, userId },
      });

      if (!template) {
        throw new NotFoundException('Workout template not found');
      }
    }

    const workout = this.workoutRepository.create({
      userId,
      templateId: template?.id ?? null,
      template,
      name: dto.name || template?.name || 'Workout',
      status: WorkoutStatus.ACTIVE,
      startedAt: new Date(),
      finishedAt: null,
      exercises: [],
    });

    const savedWorkout = await this.workoutRepository.save(workout);

    const sortedTemplateExercises = [...(template?.exercises || [])].sort(
      (a, b) => a.order - b.order,
    );
    this.ensureWorkoutExerciseLimit(sortedTemplateExercises.length);
    this.ensureWorkoutTotalSetsLimit(
      sortedTemplateExercises.reduce((sum, exercise) => sum + exercise.setsCount, 0),
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

  async updateWorkout(userId: number, workoutId: number, dto: UpdateWorkoutDto) {
    const workout = await this.getWorkoutEntityForUser(userId, workoutId);

    if (typeof dto.name === 'string') {
      workout.name = dto.name;
      await this.workoutRepository.save(workout);
    }

    return this.getWorkoutByIdForUser(userId, workout.id);
  }

  async getActiveWorkout(userId: number) {
    const workout = await this.workoutRepository.findOne({
      where: { userId, status: WorkoutStatus.ACTIVE },
      relations: this.workoutRelations,
      order: {
        exercises: {
          order: 'ASC',
          sets: {
            setNumber: 'ASC',
          },
        },
      },
    });

    if (!workout) {
      return null;
    }

    return this.mapWorkout(workout);
  }

  async findAll(userId: number) {
    const workouts = await this.workoutRepository.find({
      where: { userId },
      order: { startedAt: 'DESC' },
      relations: this.workoutRelations,
    });

    return workouts.map((workout) => this.mapWorkout(workout));
  }

  async findHistory(userId: number) {
    const workouts = await this.workoutRepository.find({
      where: {
        userId,
        status: WorkoutStatus.COMPLETED,
      },
      order: { startedAt: 'DESC' },
      relations: this.workoutRelations,
    });

    return workouts.map((workout) => this.mapWorkout(workout));
  }

  async findOne(userId: number, workoutId: number) {
    return this.getWorkoutByIdForUser(userId, workoutId);
  }

  async findSummary(userId: number, workoutId: number) {
    const workout = await this.getWorkoutEntityForUser(userId, workoutId);
    return this.mapWorkoutSummary(workout);
  }

  async removeWorkout(userId: number, workoutId: number) {
    await this.getWorkoutEntityForUser(userId, workoutId);
    await this.workoutRepository.delete({
      id: workoutId,
      userId,
    });

    return { success: true, message: 'Workout removed' };
  }

  async addExercise(userId: number, workoutId: number, dto: AddWorkoutExerciseDto) {
    const workout = await this.getActiveWorkoutEntityForUser(userId, workoutId);
    const exercise = await this.getAccessibleExerciseForUser(userId, dto.exerciseId);
    const workoutExercises = [...(workout.exercises || [])];
    this.ensureWorkoutExerciseLimit(workoutExercises.length + 1);
    this.ensureWorkoutTotalSetsLimit(
      this.getWorkoutTotalSets(workoutExercises) + (dto.setsCount ?? 0),
    );
    const insertOrder = Math.min(dto.order ?? workoutExercises.length, workoutExercises.length);

    for (const item of workoutExercises) {
      if (item.order >= insertOrder) {
        item.order += 1;
      }
    }

    await this.workoutExerciseRepository.save(workoutExercises);

    const workoutExercise = this.workoutExerciseRepository.create({
      workoutId: workout.id,
      workout,
      exerciseId: exercise.id,
      exercise,
      order: insertOrder,
      sets: [],
    });

    const savedWorkoutExercise =
      await this.workoutExerciseRepository.save(workoutExercise);

    if ((dto.setsCount ?? 0) > 0) {
      const previousSets = await this.getPreviousSetsForExercise(userId, exercise.id);
      const setsToCreate: WorkoutSet[] = [];

      for (let i = 1; i <= (dto.setsCount ?? 0); i += 1) {
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

    return this.getWorkoutByIdForUser(userId, workout.id);
  }

  async changeExercisePosition(
    userId: number,
    workoutId: number,
    workoutExerciseId: number,
    order: number,
  ) {
    const workout = await this.getActiveWorkoutEntityForUser(userId, workoutId);
    const workoutExercises = [...(workout.exercises || [])];
    const workoutExercise = this.getWorkoutExerciseFromWorkout(
      workout,
      workoutExerciseId,
    );
    const maxOrder = Math.max(0, workoutExercises.length - 1);
    const targetOrder = Math.max(0, Math.min(order, maxOrder));
    const currentOrder = workoutExercise.order;

    if (currentOrder === targetOrder) {
      return this.getWorkoutByIdForUser(userId, workout.id);
    }

    for (const item of workoutExercises) {
      if (item.id === workoutExercise.id) {
        continue;
      }

      if (targetOrder < currentOrder) {
        if (item.order >= targetOrder && item.order < currentOrder) {
          item.order += 1;
        }
      } else if (item.order <= targetOrder && item.order > currentOrder) {
        item.order -= 1;
      }
    }

    workoutExercise.order = targetOrder;
    await this.workoutExerciseRepository.save(workoutExercises);

    return this.getWorkoutByIdForUser(userId, workout.id);
  }

  async changeExercise(
    userId: number,
    workoutId: number,
    workoutExerciseId: number,
    exerciseId: number,
  ) {
    const workout = await this.getActiveWorkoutEntityForUser(userId, workoutId);
    const workoutExercise = this.getWorkoutExerciseFromWorkout(
      workout,
      workoutExerciseId,
    );
    const exercise = await this.getAccessibleExerciseForUser(userId, exerciseId);

    workoutExercise.exerciseId = exercise.id;
    workoutExercise.exercise = exercise;
    await this.workoutExerciseRepository.save(workoutExercise);

    return this.getWorkoutByIdForUser(userId, workout.id);
  }

  async removeExercise(userId: number, workoutId: number, workoutExerciseId: number) {
    const workout = await this.getActiveWorkoutEntityForUser(userId, workoutId);
    const workoutExercise = this.getWorkoutExerciseFromWorkout(
      workout,
      workoutExerciseId,
    );

    await this.workoutExerciseRepository.delete({
      id: workoutExerciseId,
      workoutId: workout.id,
    });

    const remainingExercises = (workout.exercises || []).filter(
      (item) => item.id !== workoutExerciseId,
    );

    for (const item of remainingExercises) {
      if (item.order > workoutExercise.order) {
        item.order -= 1;
      }
    }

    await this.workoutExerciseRepository.save(remainingExercises);

    return this.getWorkoutByIdForUser(userId, workout.id);
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

    if (nextSetNumber > MAX_EXERCISE_SETS) {
      throw new BadRequestException(
        `Workout exercise cannot have more than ${MAX_EXERCISE_SETS} sets`,
      );
    }

    this.ensureWorkoutTotalSetsLimit(
      this.getWorkoutTotalSets(workoutExercise.workout.exercises || [] as WorkoutExercise[]) + 1,
    );

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

  async addSetToWorkoutExercise(
    userId: number,
    workoutId: number,
    workoutExerciseId: number,
  ) {
    const workout = await this.getActiveWorkoutEntityForUser(userId, workoutId);
    const workoutExercise = this.getWorkoutExerciseFromWorkout(
      workout,
      workoutExerciseId,
    );

    return this.addSet(userId, workoutExercise.id);
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
      relations: this.workoutRelations,
      order: {
        exercises: {
          order: 'ASC',
          sets: {
            setNumber: 'ASC',
          },
        },
      },
    });

    if (!workout) {
      throw new NotFoundException('Workout not found');
    }

    return this.mapWorkout(workout);
  }

  private async getWorkoutEntityForUser(userId: number, workoutId: number) {
    const workout = await this.workoutRepository.findOne({
      where: { id: workoutId, userId },
      relations: this.workoutRelations,
      order: {
        exercises: {
          order: 'ASC',
          sets: {
            setNumber: 'ASC',
          },
        },
      },
    });

    if (!workout) {
      throw new NotFoundException('Workout not found');
    }

    return workout;
  }

  private async getActiveWorkoutEntityForUser(userId: number, workoutId: number) {
    const workout = await this.workoutRepository.findOne({
      where: {
        id: workoutId,
        userId,
        status: WorkoutStatus.ACTIVE,
      },
      relations: this.workoutRelations,
      order: {
        exercises: {
          order: 'ASC',
          sets: {
            setNumber: 'ASC',
          },
        },
      },
    });

    if (!workout) {
      throw new NotFoundException('Active workout not found');
    }

    return workout;
  }

  private getWorkoutExerciseFromWorkout(
    workout: Workout,
    workoutExerciseId: number,
  ) {
    const workoutExercise = (workout.exercises || []).find(
      (item) => item.id === workoutExerciseId,
    );

    if (!workoutExercise) {
      throw new NotFoundException('Workout exercise not found');
    }

    return workoutExercise;
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

  private async getAccessibleExerciseForUser(userId: number, exerciseId: number) {
    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    if (exercise.isGlobal || exercise.createdByUserId === userId) {
      return exercise;
    }

    throw new NotFoundException('Exercise not found');
  }

  private calculateRepMax(weight?: number | null, reps?: number | null) {
    return calculateBrzyckiRepMax(weight, reps);
  }

  private ensureWorkoutExerciseLimit(count: number) {
    if (count > MAX_ACTIVE_WORKOUT_EXERCISES) {
      throw new BadRequestException(
        `Workout cannot have more than ${MAX_ACTIVE_WORKOUT_EXERCISES} exercises`,
      );
    }
  }

  private ensureWorkoutTotalSetsLimit(totalSets: number) {
    if (totalSets > MAX_TOTAL_SETS) {
      throw new BadRequestException(
        `Workout cannot have more than ${MAX_TOTAL_SETS} total sets`,
      );
    }
  }

  private getWorkoutTotalSets(exercises: WorkoutExercise[]) {
    return exercises.reduce((sum, exercise) => sum + (exercise.sets?.length || 0), 0);
  }

  private getDurationSeconds(startedAt: Date, finishedAt: Date | null) {
    const start = new Date(startedAt).getTime();
    const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();

    return Math.max(0, Math.floor((end - start) / 1000));
  }

  private getDurationLabel(durationSeconds: number) {
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = durationSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }

    if (minutes > 0) {
      return `${minutes}min ${seconds}s`;
    }

    return `${seconds}s`;
  }

  private mapWorkout(workout: Workout) {
    const exercises = [...(workout.exercises || [])]
      .sort((a, b) => a.order - b.order)
      .map((exercise) => this.mapWorkoutExercise(exercise));

    return {
      ...this.mapWorkoutSummary(workout),
      exercises,
    };
  }

  private mapWorkoutSummary(workout: Workout) {
    const durationSeconds = this.getDurationSeconds(workout.startedAt, workout.finishedAt);
    const orderedExercises = [...(workout.exercises || [])].sort((a, b) => a.order - b.order);

    return {
      id: workout.id,
      name: workout.name,
      status: workout.status,
      mode: 'solo',
      isSolo: true,
      participantCount: 1,
      startedAt: workout.startedAt,
      finishedAt: workout.finishedAt,
      durationSeconds,
      durationLabel: this.getDurationLabel(durationSeconds),
      exerciseCount: orderedExercises.length,
      totalSets: orderedExercises.reduce((sum, exercise) => sum + (exercise.sets?.length || 0), 0),
      confirmedSets: orderedExercises.reduce(
        (sum, exercise) => sum + (exercise.sets || []).filter((set) => set.confirmed).length,
        0,
      ),
      exerciseNames: orderedExercises
        .map((exercise) => exercise.exercise?.name)
        .filter((name): name is string => Boolean(name)),
      template: workout.template
        ? {
            id: workout.template.id,
            name: workout.template.name,
          }
        : null,
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
