import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import {
  CommonWorkout,
  CommonWorkoutStatus,
} from '../entities/common-workout.entity';
import {
  CommonWorkoutBlock,
  CommonWorkoutBlockStatus,
} from '../entities/common-workout-block.entity';
import { CommonWorkoutParticipant } from '../entities/common-workout-participant.entity';
import { CommonWorkoutExercise } from '../entities/common-workout-exercise.entity';
import { CommonWorkoutParticipantSet } from '../entities/common-workout-participant-set.entity';
import { Workout, WorkoutStatus } from '../entities/workout.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { WorkoutSet } from '../entities/workout-set.entity';
import { WorkoutTemplate } from '../entities/workout-template.entity';
import { Exercise } from '../entities/exercise.entity';
import { User } from '../entities/user.entity';
import { UserExercisePersonalBest } from '../entities/user-exercise-personal-best.entity';
import { CommonWorkoutsGateway } from './common-workouts.gateway';
import { StartCommonWorkoutDto } from './dto/start-common-workout.dto';
import { UpdateCommonWorkoutDto } from './dto/update-common-workout.dto';
import { AddCommonWorkoutExerciseDto } from './dto/add-common-workout-exercise.dto';
import { CreateCommonWorkoutBlockDto } from './dto/create-common-workout-block.dto';
import { ChangeCommonWorkoutExercisePositionDto } from './dto/change-common-workout-exercise-position.dto';
import { ChangeCommonWorkoutExerciseDto } from './dto/change-common-workout-exercise.dto';
import { UpdateCommonWorkoutSetDto } from './dto/update-common-workout-set.dto';
import { GetWorkoutDashboardStatsDto } from './dto/get-workout-dashboard-stats.dto';
import { calculateBrzyckiRepMax } from '../common/utils/rep-max.util';
import {
  MAX_COMMON_WORKOUT_EXERCISES,
  MAX_COMMON_WORKOUT_PARTICIPANTS,
  MAX_DASHBOARD_RANGE_DAYS,
  MAX_EXERCISE_SETS,
  MAX_TOTAL_SETS,
} from '../common/constants/workout.constants';

@Injectable()
export class CommonWorkoutsService {
  private readonly logger = new Logger(CommonWorkoutsService.name);

  constructor(
    @InjectRepository(CommonWorkout)
    private readonly commonWorkoutRepository: Repository<CommonWorkout>,
    @InjectRepository(CommonWorkoutBlock)
    private readonly commonWorkoutBlockRepository: Repository<CommonWorkoutBlock>,
    @InjectRepository(CommonWorkoutParticipant)
    private readonly participantRepository: Repository<CommonWorkoutParticipant>,
    @InjectRepository(CommonWorkoutExercise)
    private readonly commonWorkoutExerciseRepository: Repository<CommonWorkoutExercise>,
    @InjectRepository(CommonWorkoutParticipantSet)
    private readonly participantSetRepository: Repository<CommonWorkoutParticipantSet>,
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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserExercisePersonalBest)
    private readonly personalBestRepository: Repository<UserExercisePersonalBest>,
    private readonly gateway: CommonWorkoutsGateway,
  ) {}

  async start(userId: number, dto: StartCommonWorkoutDto) {
    const participantUserIds = Array.from(
      new Set([userId, ...(dto.participantUserIds || [])]),
    );
    this.ensureCommonWorkoutParticipantLimit(participantUserIds.length);
    await this.ensureUsersExist(participantUserIds);
    await this.ensureParticipantsHaveNoActiveWorkouts(participantUserIds);

    let template: WorkoutTemplate | null = null;
    if (typeof dto.templateId === 'number') {
      template = await this.getAccessibleWorkoutTemplateForUser(
        userId,
        dto.templateId,
      );
    }

    const commonWorkout = this.commonWorkoutRepository.create({
      createdByUserId: userId,
      templateId: template?.id ?? null,
      template,
      name: dto.name || template?.name || 'Workout',
      status: CommonWorkoutStatus.ACTIVE,
      startedAt: new Date(),
      finishedAt: null,
      participants: [],
      exercises: [],
    });

    const savedWorkout = await this.commonWorkoutRepository.save(commonWorkout);
    const users = await this.userRepository.findBy({
      id: In(participantUserIds),
    });
    const participants = users.map((user) =>
      this.participantRepository.create({
        commonWorkoutId: savedWorkout.id,
        commonWorkout: savedWorkout,
        userId: user.id,
        user,
        sets: [],
      }),
    );

    const savedParticipants =
      await this.participantRepository.save(participants);

    const sortedTemplateExercises = [...(template?.exercises || [])].sort(
      (a, b) => a.order - b.order,
    );
    this.ensureCommonWorkoutExerciseLimit(
      sortedTemplateExercises.length * savedParticipants.length,
    );
    this.ensureCommonWorkoutTotalSetsLimit(
      sortedTemplateExercises.reduce(
        (sum, exercise) => sum + exercise.setsCount,
        0,
      ) * savedParticipants.length,
    );

    for (const participant of savedParticipants) {
      for (const templateExercise of sortedTemplateExercises) {
        const block = await this.getOrCreateCommonWorkoutBlock(
          savedWorkout.id,
          templateExercise.exerciseId,
          templateExercise.order,
        );

        await this.createCommonExercise(
          savedWorkout.id,
          participant,
          templateExercise.exerciseId,
          templateExercise.order,
          templateExercise.setsCount,
          block,
        );
      }
    }

    const payload = await this.getByIdForUser(userId, savedWorkout.id);
    this.emitUpdatedIfSubscribed(savedWorkout.id, payload);
    return payload;
  }

  async getActive(userId: number) {
    const participant = await this.participantRepository.findOne({
      where: {
        userId,
        commonWorkout: {
          status: CommonWorkoutStatus.ACTIVE,
        },
      },
      relations: {
        commonWorkout: true,
      },
    });

    if (!participant) {
      return null;
    }

    return this.getByIdForUser(userId, participant.commonWorkoutId);
  }

  async listForUser(userId: number) {
    const workouts = await this.commonWorkoutRepository.find({
      where: {
        participants: {
          userId,
        },
      },
      relations: {
        template: true,
        participants: {
          user: true,
        },
        blocks: {
          defaultExercise: true,
        },
        exercises: {
          participant: {
            user: true,
          },
          exercise: true,
          participantSets: true,
        },
      },
      order: {
        startedAt: 'DESC',
        blocks: {
          order: 'ASC',
        },
        exercises: {
          order: 'ASC',
          participantSets: {
            setNumber: 'ASC',
          },
        },
      },
    });

    return workouts.map((workout) => this.mapWorkoutIndex(workout));
  }

  async finishActive(userId: number) {
    const participant = await this.participantRepository.findOne({
      where: {
        userId,
        commonWorkout: {
          status: CommonWorkoutStatus.ACTIVE,
        },
      },
      relations: {
        commonWorkout: true,
      },
    });

    if (!participant) {
      throw new NotFoundException('Active common workout not found');
    }

    return this.finish(userId, participant.commonWorkoutId);
  }

  async getByIdForUser(userId: number, commonWorkoutId: number) {
    const commonWorkout = await this.getCommonWorkoutEntityForUser(
      userId,
      commonWorkoutId,
    );
    return this.mapWorkout(commonWorkout);
  }

  async getIndexForUser(userId: number, commonWorkoutId: number) {
    const commonWorkout = await this.getCommonWorkoutEntityForUser(
      userId,
      commonWorkoutId,
    );
    return this.mapWorkoutIndex(commonWorkout);
  }

  async getHistoryForUser(userId: number) {
    const workouts = await this.workoutRepository.find({
      where: {
        userId,
        status: WorkoutStatus.COMPLETED,
      },
      order: { startedAt: 'DESC' },
      relations: {
        template: true,
        exercises: {
          exercise: true,
          sets: true,
        },
      },
    });

    return workouts.map((workout) => this.mapHistoricalWorkoutSummary(workout));
  }

  async getHistoricalByIdForUser(userId: number, workoutId: number) {
    const workout = await this.getHistoricalWorkoutEntityForUser(
      userId,
      workoutId,
    );
    return this.mapHistoricalWorkout(workout);
  }

  async getHistoricalSummaryForUser(userId: number, workoutId: number) {
    const workout = await this.getHistoricalWorkoutEntityForUser(
      userId,
      workoutId,
    );
    return this.mapHistoricalWorkoutPerformanceSummary(workout);
  }

  async updateHistoricalWorkout(
    userId: number,
    workoutId: number,
    dto: UpdateCommonWorkoutDto,
  ) {
    const workout = await this.getHistoricalWorkoutEntityForUser(
      userId,
      workoutId,
    );

    if (typeof dto.name === 'string') {
      workout.name = dto.name;
      await this.workoutRepository.save(workout);
    }

    return this.getHistoricalByIdForUser(userId, workout.id);
  }

  async removeHistoricalWorkout(userId: number, workoutId: number) {
    await this.getHistoricalWorkoutEntityForUser(userId, workoutId);
    await this.workoutRepository.delete({
      id: workoutId,
      userId,
    });

    return { success: true, message: 'Workout removed' };
  }

  async getSummaryForUser(userId: number, workoutId: number) {
    try {
      const commonWorkout = await this.getCommonWorkoutEntityForUser(
        userId,
        workoutId,
      );
      return {
        ...this.mapWorkoutPerformanceSummary(commonWorkout),
        source: 'session',
      };
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }

    const workout = await this.workoutRepository.findOne({
      where: {
        id: workoutId,
        userId,
        status: WorkoutStatus.COMPLETED,
      },
      relations: {
        user: true,
        template: true,
        exercises: {
          exercise: true,
          sets: true,
        },
      },
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

    return {
      ...this.mapHistoricalWorkoutPerformanceSummary(workout),
      source: 'history',
    };
  }

  async getExerciseHistoryForUser(userId: number, exerciseId: number) {
    const workoutExercises = await this.workoutExerciseRepository.find({
      where: {
        exerciseId,
        workout: {
          userId,
          status: WorkoutStatus.COMPLETED,
        },
      },
      relations: {
        workout: true,
        exercise: true,
        sets: true,
      },
      order: {
        workout: {
          startedAt: 'DESC',
        },
        sets: {
          setNumber: 'ASC',
        },
      },
    });

    if (workoutExercises.length === 0) {
      const exercise = await this.exerciseRepository.findOne({
        where: { id: exerciseId },
      });

      if (!exercise) {
        throw new NotFoundException('Exercise not found');
      }

      return {
        exercise: {
          id: exercise.id,
          name: exercise.name,
        },
        history: [],
      };
    }

    const exercise = workoutExercises[0].exercise;

    return {
      exercise: {
        id: exercise.id,
        name: exercise.name,
      },
      history: workoutExercises.map((workoutExercise) => ({
        workoutId: workoutExercise.workoutId,
        workoutName: workoutExercise.workout?.name ?? 'Workout',
        exerciseName: workoutExercise.exercise?.name ?? exercise.name,
        date: this.toDateOnly(
          workoutExercise.workout?.finishedAt ??
            workoutExercise.workout?.startedAt ??
            new Date(),
        ),
        sets: [...(workoutExercise.sets || [])]
          .sort((a, b) => a.setNumber - b.setNumber)
          .map((set) => ({
            id: set.id,
            setNumber: set.setNumber,
            weight: set.currentWeight,
            reps: set.currentReps,
            repMax: set.repMax,
            confirmed: set.confirmed,
            label: this.formatSetLabel(set.currentWeight, set.currentReps),
          })),
      })),
    };
  }

  async getDashboardStatsForUser(
    userId: number,
    dto: GetWorkoutDashboardStatsDto,
  ) {
    const range = this.getDateRange(dto.dateFrom, dto.dateTo);
    const workouts = await this.workoutRepository.find({
      where: {
        userId,
        status: WorkoutStatus.COMPLETED,
        startedAt: Between(range.from, range.to),
      },
      relations: {
        exercises: {
          exercise: true,
          sets: true,
        },
      },
      order: {
        startedAt: 'DESC',
      },
    });

    const favoriteExercise = await this.getFavoriteExerciseStat(
      userId,
      workouts,
    );
    const favoriteDay = this.getFavoriteTrainingDay(workouts);
    const favoritePartner = await this.getFavoritePartnerStat(
      userId,
      range.from,
      range.to,
    );

    return {
      dateFrom: dto.dateFrom,
      dateTo: dto.dateTo,
      workoutsCount: workouts.length,
      favoriteExercise,
      favoriteTrainingDay: favoriteDay,
      favoriteTrainingPartner: favoritePartner,
    };
  }

  async getExerciseByIdForUser(
    userId: number,
    commonWorkoutId: number,
    commonWorkoutExerciseId: number,
  ) {
    const exercise = await this.getCommonWorkoutExerciseEntityForUser(
      userId,
      commonWorkoutId,
      commonWorkoutExerciseId,
    );
    return this.mapCommonWorkoutExerciseDetail(exercise);
  }

  async getBlockForUser(
    userId: number,
    commonWorkoutId: number,
    blockId: number,
  ) {
    const commonWorkout = await this.getCommonWorkoutEntityForUser(
      userId,
      commonWorkoutId,
    );
    const blocks = this.mapWorkoutBlocks(commonWorkout, true);
    const block = blocks.find(
      (item) => item.id === blockId || item.order === blockId,
    );

    if (!block) {
      throw new NotFoundException('Workout block not found');
    }

    return {
      workoutId: commonWorkout.id,
      ...block,
    };
  }

  async updateCommonWorkout(
    userId: number,
    commonWorkoutId: number,
    dto: UpdateCommonWorkoutDto,
  ) {
    const commonWorkout = await this.getActiveCommonWorkoutEntityForUser(
      userId,
      commonWorkoutId,
    );

    if (typeof dto.name === 'string') {
      commonWorkout.name = dto.name;
      await this.commonWorkoutRepository.save(commonWorkout);
    }

    const payload = await this.getWorkoutResponse(userId, commonWorkout.id);
    this.emitUpdatedIfSubscribed(commonWorkout.id, payload);
    return payload;
  }

  async removeActiveWorkout(userId: number, commonWorkoutId: number) {
    const commonWorkout = await this.getActiveCommonWorkoutEntityForUser(
      userId,
      commonWorkoutId,
    );

    await this.commonWorkoutRepository.delete({
      id: commonWorkout.id,
      status: CommonWorkoutStatus.ACTIVE,
    });

    const payload = {
      success: true,
      discarded: true,
      workoutId: commonWorkout.id,
    };
    this.emitDiscardedIfSubscribed(commonWorkout.id, payload);
    return payload;
  }

  async addExercise(
    userId: number,
    commonWorkoutId: number,
    dto: AddCommonWorkoutExerciseDto,
  ) {
    return this.addBlock(userId, commonWorkoutId, {
      defaultExerciseId: dto.exerciseId,
      order: dto.order,
      setsCount: dto.setsCount,
    });
  }

  async addBlock(
    userId: number,
    commonWorkoutId: number,
    dto: CreateCommonWorkoutBlockDto,
  ) {
    const commonWorkout =
      await this.getActiveCommonWorkoutStructureEntityForUser(
        userId,
        commonWorkoutId,
      );
    this.getWorkoutParticipantForUser(commonWorkout, userId);
    const participants = [...(commonWorkout.participants || [])];
    const defaultExerciseId = dto.defaultExerciseId;
    const exercise =
      typeof defaultExerciseId === 'number'
        ? await this.getAccessibleExerciseForUser(userId, defaultExerciseId)
        : null;
    const exercises = [...(commonWorkout.exercises || [])];
    const existingOrders = [...(commonWorkout.blocks || [])].map(
      (block) => block.order,
    );
    const nextOrder = Math.max(-1, ...existingOrders) + 1;
    const insertOrder = Math.max(
      0,
      Math.min(dto.order ?? nextOrder, nextOrder),
    );

    this.ensureCommonWorkoutExerciseLimit(
      exercises.length + participants.length,
    );
    this.ensureCommonWorkoutTotalSetsLimit(
      this.getCommonWorkoutTotalSets(exercises) +
        (dto.setsCount ?? 0) * participants.length,
    );

    const shiftedBlocks = [...(commonWorkout.blocks || [])];
    for (const block of shiftedBlocks) {
      if (block.order >= insertOrder) {
        block.order += 1;
      }
    }
    await this.commonWorkoutBlockRepository.save(shiftedBlocks);

    const block = await this.createCommonWorkoutBlock(
      commonWorkout,
      exercise?.id ?? null,
      insertOrder,
    );

    for (const participant of participants) {
      await this.createCommonExercise(
        commonWorkout.id,
        participant,
        exercise?.id ?? null,
        insertOrder,
        dto.setsCount ?? 0,
        block,
      );
    }

    const payload = await this.getBlockResponse(
      userId,
      commonWorkout.id,
      block.id,
    );
    this.emitUpdatedIfSubscribed(commonWorkout.id, payload);
    return payload;
  }

  async changeExercisePosition(
    userId: number,
    commonWorkoutId: number,
    exerciseOrder: number,
    dto: ChangeCommonWorkoutExercisePositionDto,
  ) {
    const commonWorkout =
      await this.getActiveCommonWorkoutStructureEntityForUser(
        userId,
        commonWorkoutId,
      );
    const participant = this.getWorkoutParticipantForUser(
      commonWorkout,
      userId,
    );
    const exercises = this.getSortedParticipantExercises(
      commonWorkout.exercises || [],
      participant.id,
    );
    const currentExercise = this.getParticipantExerciseByOrder(
      exercises,
      exerciseOrder,
    );
    const maxOrder = Math.max(0, exercises.length - 1);
    const targetOrder = Math.max(0, Math.min(dto.order, maxOrder));
    const currentOrder = currentExercise.order;

    if (targetOrder !== currentOrder) {
      for (const item of exercises) {
        if (item.id === currentExercise.id) {
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

      currentExercise.order = targetOrder;
      await this.commonWorkoutExerciseRepository.save(exercises);
    }

    const payload = await this.getWorkoutExerciseResponse(
      userId,
      commonWorkout.id,
      currentExercise.order,
    );
    this.emitUpdatedIfSubscribed(commonWorkout.id, payload);
    return payload;
  }

  async changeExercise(
    userId: number,
    commonWorkoutId: number,
    exerciseOrder: number,
    dto: ChangeCommonWorkoutExerciseDto,
  ) {
    const currentExercise = await this.getCommonWorkoutExerciseEntityForUser(
      userId,
      commonWorkoutId,
      exerciseOrder,
    );
    const exercise = await this.getAccessibleExerciseForUser(
      userId,
      dto.exerciseId,
    );

    currentExercise.exerciseId = exercise.id;
    currentExercise.exercise = exercise;
    currentExercise.completed = false;
    currentExercise.completedAt = null;
    await this.commonWorkoutExerciseRepository.save(currentExercise);

    const previousSetsByUserId = await this.getPreviousSetsByUserIdForExercise(
      [userId],
      exercise.id,
    );

    for (const set of currentExercise.participantSets || []) {
      const previousSet = previousSetsByUserId.get(userId)?.get(set.setNumber);

      set.previousWeight = previousSet?.currentWeight ?? null;
      set.previousReps = previousSet?.currentReps ?? null;
    }

    await this.participantSetRepository.save(
      currentExercise.participantSets || [],
    );
    await this.syncWorkoutExerciseCompletion(currentExercise.id);

    const payload = await this.getWorkoutExerciseResponse(
      userId,
      commonWorkoutId,
      currentExercise.order,
    );
    this.emitUpdatedIfSubscribed(commonWorkoutId, payload);
    return payload;
  }

  async removeExercise(
    userId: number,
    commonWorkoutId: number,
    exerciseOrder: number,
  ) {
    const commonWorkout =
      await this.getActiveCommonWorkoutStructureEntityForUser(
        userId,
        commonWorkoutId,
      );
    const participant = this.getWorkoutParticipantForUser(
      commonWorkout,
      userId,
    );
    const participantExercises = this.getSortedParticipantExercises(
      commonWorkout.exercises || [],
      participant.id,
    );
    const currentExercise = this.getParticipantExerciseByOrder(
      participantExercises,
      exerciseOrder,
    );

    await this.commonWorkoutExerciseRepository.delete({
      id: currentExercise.id,
      commonWorkoutId: commonWorkout.id,
    });

    const remainingExercises = participantExercises.filter(
      (item) => item.id !== currentExercise.id,
    );

    for (const item of remainingExercises) {
      if (item.order > currentExercise.order) {
        item.order -= 1;
      }
    }

    await this.commonWorkoutExerciseRepository.save(remainingExercises);

    const payload = await this.getWorkoutResponse(userId, commonWorkout.id);
    this.emitUpdatedIfSubscribed(commonWorkout.id, payload);
    return payload;
  }

  async addSet(userId: number, exerciseOrder: number) {
    const commonWorkoutExercise =
      await this.getActiveCommonWorkoutExerciseForUser(userId, exerciseOrder);
    const existingSets = commonWorkoutExercise.participantSets || [];
    const nextSetNumber =
      Math.max(0, ...existingSets.map((set) => set.setNumber)) + 1;

    if (nextSetNumber > MAX_EXERCISE_SETS) {
      throw new BadRequestException(
        `Common workout exercise cannot have more than ${MAX_EXERCISE_SETS} sets`,
      );
    }

    this.ensureCommonWorkoutTotalSetsLimit(
      this.getCommonWorkoutTotalSets(
        commonWorkoutExercise.commonWorkout.exercises || [],
      ) + 1,
    );

    const previousSetsByUserId =
      typeof commonWorkoutExercise.exerciseId === 'number'
        ? await this.getPreviousSetsByUserIdForExercise(
            [userId],
            commonWorkoutExercise.exerciseId,
          )
        : new Map<number, Map<number, WorkoutSet>>();
    const previousSet = previousSetsByUserId.get(userId)?.get(nextSetNumber);

    await this.participantSetRepository.save(
      this.participantSetRepository.create({
        participantId: commonWorkoutExercise.participantId,
        commonWorkoutExerciseId: commonWorkoutExercise.id,
        setNumber: nextSetNumber,
        previousWeight: previousSet?.currentWeight ?? null,
        previousReps: previousSet?.currentReps ?? null,
        currentWeight: null,
        currentReps: null,
        durationSeconds: null,
        repMax: null,
        confirmed: false,
      }),
    );
    await this.syncWorkoutExerciseCompletion(commonWorkoutExercise.id);

    const payload = await this.getWorkoutExerciseResponse(
      userId,
      commonWorkoutExercise.commonWorkoutId,
      commonWorkoutExercise.order,
    );
    this.emitUpdatedIfSubscribed(
      commonWorkoutExercise.commonWorkoutId,
      payload,
    );
    return payload;
  }

  async removeSet(userId: number, participantSetId: number) {
    const participantSet = await this.getParticipantSetForUser(
      userId,
      participantSetId,
    );
    const commonWorkoutExerciseId = participantSet.commonWorkoutExerciseId;
    const commonWorkoutId =
      participantSet.commonWorkoutExercise.commonWorkoutId;
    const exerciseOrder = participantSet.commonWorkoutExercise.order;

    await this.participantSetRepository.remove(participantSet);

    const remainingSets = await this.participantSetRepository.find({
      where: { commonWorkoutExerciseId },
      relations: {
        participant: true,
        commonWorkoutExercise: true,
      },
      order: { setNumber: 'ASC' },
    });

    for (let index = 0; index < remainingSets.length; index += 1) {
      remainingSets[index].setNumber = index + 1;
    }

    await this.participantSetRepository.save(remainingSets);
    await this.syncWorkoutExerciseCompletion(commonWorkoutExerciseId);

    const payload = await this.getWorkoutExerciseResponse(
      userId,
      commonWorkoutId,
      exerciseOrder,
    );
    this.emitUpdatedIfSubscribed(commonWorkoutId, payload);
    return payload;
  }

  async updateSet(
    userId: number,
    participantSetId: number,
    dto: UpdateCommonWorkoutSetDto,
  ) {
    const participantSet = await this.getParticipantSetForUser(
      userId,
      participantSetId,
    );
    const nextWeight =
      typeof dto.currentWeight === 'number'
        ? dto.currentWeight
        : participantSet.currentWeight;
    const nextReps =
      typeof dto.currentReps === 'number'
        ? dto.currentReps
        : participantSet.currentReps;
    const nextDuration =
      typeof dto.durationSeconds === 'number'
        ? dto.durationSeconds
        : participantSet.durationSeconds;
    const nextRepMax = this.calculateRepMax(nextWeight, nextReps);

    await this.participantSetRepository.update(participantSetId, {
      currentWeight: nextWeight,
      currentReps: nextReps,
      durationSeconds: nextDuration,
      repMax: nextRepMax,
      confirmed: true,
    });
    await this.syncWorkoutExerciseCompletion(
      participantSet.commonWorkoutExerciseId,
    );

    const payload = await this.getWorkoutExerciseResponse(
      userId,
      participantSet.commonWorkoutExercise.commonWorkoutId,
      participantSet.commonWorkoutExercise.order,
    );
    this.emitUpdatedIfSubscribed(
      participantSet.commonWorkoutExercise.commonWorkoutId,
      payload,
    );
    return payload;
  }

  async finish(userId: number, commonWorkoutId: number) {
    const commonWorkout = await this.getActiveCommonWorkoutEntityForUser(
      userId,
      commonWorkoutId,
    );

    commonWorkout.status = CommonWorkoutStatus.COMPLETED;
    commonWorkout.finishedAt = new Date();
    await this.commonWorkoutRepository.save(commonWorkout);

    for (const participant of commonWorkout.participants || []) {
      await this.createIndividualWorkoutFromCommonWorkout(
        commonWorkout,
        participant,
      );
    }

    const payload = await this.getByIdForUser(userId, commonWorkout.id);
    this.emitFinishedIfSubscribed(commonWorkout.id, payload);
    return payload;
  }

  private emitUpdatedIfSubscribed(commonWorkoutId: number, payload: unknown) {
    if (!this.gateway.hasSubscribers(commonWorkoutId)) {
      return;
    }

    this.logPayloadMetrics('commonWorkoutUpdated', commonWorkoutId, payload);
    this.gateway.emitUpdated(commonWorkoutId, payload);
  }

  private emitFinishedIfSubscribed(commonWorkoutId: number, payload: unknown) {
    if (!this.gateway.hasSubscribers(commonWorkoutId)) {
      return;
    }

    this.logPayloadMetrics('commonWorkoutFinished', commonWorkoutId, payload);
    this.gateway.emitFinished(commonWorkoutId, payload);
  }

  private emitDiscardedIfSubscribed(commonWorkoutId: number, payload: unknown) {
    if (!this.gateway.hasSubscribers(commonWorkoutId)) {
      return;
    }

    this.logPayloadMetrics('commonWorkoutDiscarded', commonWorkoutId, payload);
    this.gateway.emitDiscarded(commonWorkoutId, payload);
  }

  private logPayloadMetrics(
    eventName: string,
    commonWorkoutId: number,
    payload: unknown,
  ) {
    try {
      const payloadSizeBytes = Buffer.byteLength(
        JSON.stringify(payload),
        'utf8',
      );

      if (payloadSizeBytes >= 100_000) {
        this.logger.warn(
          `${eventName} payload for common workout ${commonWorkoutId} is ${payloadSizeBytes} bytes`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Could not measure payload size for ${eventName} in common workout ${commonWorkoutId}`,
      );
    }
  }

  private async getWorkoutResponse(userId: number, commonWorkoutId: number) {
    return {
      workout: await this.getIndexForUser(userId, commonWorkoutId),
    };
  }

  private async getWorkoutExerciseResponse(
    userId: number,
    commonWorkoutId: number,
    exerciseOrder: number,
  ) {
    const [workout, exercise] = await Promise.all([
      this.getIndexForUser(userId, commonWorkoutId),
      this.getExerciseByIdForUser(userId, commonWorkoutId, exerciseOrder),
    ]);

    return { workout, exercise };
  }

  private async getBlockResponse(
    userId: number,
    commonWorkoutId: number,
    blockId: number,
  ) {
    const [workout, block] = await Promise.all([
      this.getIndexForUser(userId, commonWorkoutId),
      this.getBlockForUser(userId, commonWorkoutId, blockId),
    ]);

    return { workout, block };
  }

  private async createCommonExercise(
    commonWorkoutId: number,
    participant: CommonWorkoutParticipant,
    exerciseId: number | null,
    order: number,
    setsCount: number,
    block?: CommonWorkoutBlock | null,
  ) {
    const exercise =
      typeof exerciseId === 'number'
        ? await this.exerciseRepository.findOne({ where: { id: exerciseId } })
        : null;

    if (typeof exerciseId === 'number' && !exercise) {
      throw new NotFoundException('Exercise not found');
    }

    const commonWorkoutExercise = this.commonWorkoutExerciseRepository.create({
      commonWorkoutId,
      participantId: participant.id,
      participant,
      blockId: block?.id ?? null,
      block: block ?? null,
      exerciseId,
      exercise,
      order,
      completed: false,
      completedAt: null,
      participantSets: [],
    });

    const savedExercise = await this.commonWorkoutExerciseRepository.save(
      commonWorkoutExercise,
    );

    if (setsCount > 0) {
      const previousSetsByUserId =
        typeof exerciseId === 'number'
          ? await this.getPreviousSetsByUserIdForExercise(
              [participant.userId],
              exerciseId,
            )
          : new Map<number, Map<number, WorkoutSet>>();
      const participantSets: CommonWorkoutParticipantSet[] = [];

      for (let i = 1; i <= setsCount; i += 1) {
        const previousSet = previousSetsByUserId
          .get(participant.userId)
          ?.get(i);

        participantSets.push(
          this.participantSetRepository.create({
            participantId: participant.id,
            commonWorkoutExerciseId: savedExercise.id,
            setNumber: i,
            previousWeight: previousSet?.currentWeight ?? null,
            previousReps: previousSet?.currentReps ?? null,
            currentWeight: null,
            currentReps: null,
            durationSeconds: null,
            repMax: null,
            confirmed: false,
          }),
        );
      }

      await this.participantSetRepository.save(participantSets);
    }

    return savedExercise;
  }

  private async createCommonWorkoutBlock(
    commonWorkout: Pick<CommonWorkout, 'id'>,
    defaultExerciseId: number | null,
    order: number,
  ) {
    const block = this.commonWorkoutBlockRepository.create({
      commonWorkoutId: commonWorkout.id,
      defaultExerciseId,
      order,
      status: CommonWorkoutBlockStatus.ACTIVE,
      completedAt: null,
      userExercises: [],
    });

    return this.commonWorkoutBlockRepository.save(block);
  }

  private async getOrCreateCommonWorkoutBlock(
    commonWorkoutId: number,
    defaultExerciseId: number | null,
    order: number,
  ) {
    const existing = await this.commonWorkoutBlockRepository.findOne({
      where: { commonWorkoutId, order },
    });

    if (existing) {
      return existing;
    }

    return this.createCommonWorkoutBlock(
      { id: commonWorkoutId },
      defaultExerciseId,
      order,
    );
  }

  private async syncWorkoutExerciseCompletion(commonWorkoutExerciseId: number) {
    const exercise = await this.commonWorkoutExerciseRepository.findOne({
      where: { id: commonWorkoutExerciseId },
      relations: {
        participantSets: true,
        block: {
          userExercises: {
            participantSets: true,
          },
        },
      },
    });

    if (!exercise) {
      return;
    }

    const sets = exercise.participantSets || [];
    const completed =
      sets.length > 0 &&
      sets.every((set) => set.confirmed && this.hasValidTrainingValue(set));

    if (exercise.completed !== completed) {
      exercise.completed = completed;
      exercise.completedAt = completed ? new Date() : null;
      await this.commonWorkoutExerciseRepository.save(exercise);
    }

    if (exercise.blockId) {
      await this.syncWorkoutBlockCompletion(exercise.blockId);
    }
  }

  private async syncWorkoutBlockCompletion(blockId: number) {
    const block = await this.commonWorkoutBlockRepository.findOne({
      where: { id: blockId },
      relations: {
        userExercises: {
          participantSets: true,
        },
      },
    });

    if (!block) {
      return;
    }

    const userExercises = block.userExercises || [];
    const completed =
      userExercises.length > 0 &&
      userExercises.every((exercise) => exercise.completed);
    const nextStatus = completed
      ? CommonWorkoutBlockStatus.COMPLETED
      : CommonWorkoutBlockStatus.ACTIVE;

    if (block.status !== nextStatus) {
      block.status = nextStatus;
      block.completedAt = completed ? new Date() : null;
      await this.commonWorkoutBlockRepository.save(block);
    }
  }

  private hasValidTrainingValue(set: CommonWorkoutParticipantSet) {
    return (
      (typeof set.currentReps === 'number' && set.currentReps > 0) ||
      (typeof set.durationSeconds === 'number' && set.durationSeconds > 0)
    );
  }

  private async createIndividualWorkoutFromCommonWorkout(
    commonWorkout: CommonWorkout,
    participant: CommonWorkoutParticipant,
  ) {
    const workout = this.workoutRepository.create({
      userId: participant.userId,
      templateId: commonWorkout.templateId,
      name: commonWorkout.name,
      status: WorkoutStatus.COMPLETED,
      startedAt: commonWorkout.startedAt,
      finishedAt: commonWorkout.finishedAt,
      exercises: [],
    });

    const savedWorkout = await this.workoutRepository.save(workout);
    const orderedExercises = this.getSortedParticipantExercises(
      commonWorkout.exercises || [],
      participant.id,
    );

    if (orderedExercises.length === 0) {
      return;
    }

    for (const commonExercise of orderedExercises) {
      if (typeof commonExercise.exerciseId !== 'number') {
        continue;
      }

      const workoutExercise = this.workoutExerciseRepository.create({
        workoutId: savedWorkout.id,
        exerciseId: commonExercise.exerciseId,
        order: commonExercise.order,
      });
      const savedWorkoutExercise =
        await this.workoutExerciseRepository.save(workoutExercise);

      const participantSets = [...(commonExercise.participantSets || [])].sort(
        (a, b) => a.setNumber - b.setNumber,
      );

      if (participantSets.length === 0) {
        continue;
      }

      const workoutSets = participantSets.map((set) =>
        this.workoutSetRepository.create({
          workoutExerciseId: savedWorkoutExercise.id,
          setNumber: set.setNumber,
          previousWeight: set.previousWeight,
          previousReps: set.previousReps,
          currentWeight: set.currentWeight,
          currentReps: set.currentReps,
          repMax: set.repMax,
          confirmed: set.confirmed,
        }),
      );

      await this.workoutSetRepository.save(workoutSets);
      await this.syncPersonalBestForSavedWorkoutExercise(
        participant.userId,
        commonExercise.exerciseId,
        savedWorkout,
        savedWorkoutExercise,
        workoutSets,
      );
    }
  }

  private async ensureUsersExist(userIds: number[]) {
    const users = await this.userRepository.findBy({ id: In(userIds) });
    if (users.length !== userIds.length) {
      throw new NotFoundException('User not found');
    }
  }

  private async ensureParticipantsHaveNoActiveWorkouts(userIds: number[]) {
    const activeRegularWorkouts = await this.workoutRepository.find({
      where: {
        userId: In(userIds),
        status: WorkoutStatus.ACTIVE,
      },
    });

    if (activeRegularWorkouts.length > 0) {
      throw new BadRequestException(
        'One of the participants already has an active workout',
      );
    }

    const activeCommonParticipants = await this.participantRepository.find({
      where: {
        userId: In(userIds),
        commonWorkout: {
          status: CommonWorkoutStatus.ACTIVE,
        },
      },
      relations: {
        commonWorkout: true,
      },
    });

    if (activeCommonParticipants.length > 0) {
      throw new BadRequestException(
        'One of the participants already has an active common workout',
      );
    }
  }

  private ensureCommonWorkoutParticipantLimit(count: number) {
    if (count > MAX_COMMON_WORKOUT_PARTICIPANTS) {
      throw new BadRequestException(
        `Common workout cannot have more than ${MAX_COMMON_WORKOUT_PARTICIPANTS} participants`,
      );
    }
  }

  private ensureCommonWorkoutExerciseLimit(count: number) {
    if (count > MAX_COMMON_WORKOUT_EXERCISES) {
      throw new BadRequestException(
        `Common workout cannot have more than ${MAX_COMMON_WORKOUT_EXERCISES} exercises`,
      );
    }
  }

  private ensureCommonWorkoutTotalSetsLimit(totalSets: number) {
    if (totalSets > MAX_TOTAL_SETS) {
      throw new BadRequestException(
        `Common workout cannot have more than ${MAX_TOTAL_SETS} total sets`,
      );
    }
  }

  private getCommonWorkoutTotalSets(exercises: CommonWorkoutExercise[]) {
    return exercises.reduce((sum, exercise) => {
      const setsCount = Math.max(
        0,
        ...(exercise.participantSets || []).map((set) => set.setNumber),
      );

      return sum + (Number.isFinite(setsCount) ? setsCount : 0);
    }, 0);
  }

  private async getActiveCommonWorkoutEntityForUser(
    userId: number,
    commonWorkoutId: number,
  ) {
    const commonWorkout = await this.getCommonWorkoutEntityForUser(
      userId,
      commonWorkoutId,
    );
    if (commonWorkout.status !== CommonWorkoutStatus.ACTIVE) {
      throw new NotFoundException('Active common workout not found');
    }

    return commonWorkout;
  }

  private async getActiveCommonWorkoutStructureEntityForUser(
    userId: number,
    commonWorkoutId: number,
  ) {
    const commonWorkout = await this.getCommonWorkoutStructureEntityForUser(
      userId,
      commonWorkoutId,
    );
    if (commonWorkout.status !== CommonWorkoutStatus.ACTIVE) {
      throw new NotFoundException('Active common workout not found');
    }

    return commonWorkout;
  }

  private async getCommonWorkoutEntityForUser(
    userId: number,
    commonWorkoutId: number,
  ) {
    const commonWorkout = await this.commonWorkoutRepository.findOne({
      where: { id: commonWorkoutId },
      relations: {
        template: true,
        participants: {
          user: true,
          sets: true,
        },
        blocks: {
          defaultExercise: true,
          userExercises: {
            participant: {
              user: true,
            },
            exercise: true,
            participantSets: true,
          },
        },
        exercises: {
          participant: {
            user: true,
          },
          exercise: true,
          participantSets: true,
        },
      },
    });

    if (!commonWorkout) {
      throw new NotFoundException('Common workout not found');
    }

    const isParticipant = (commonWorkout.participants || []).some(
      (participant) => participant.userId === userId,
    );

    if (!isParticipant) {
      throw new NotFoundException('Common workout not found');
    }

    return commonWorkout;
  }

  private async getCommonWorkoutStructureEntityForUser(
    userId: number,
    commonWorkoutId: number,
  ) {
    const commonWorkout = await this.commonWorkoutRepository
      .createQueryBuilder('commonWorkout')
      .leftJoinAndSelect('commonWorkout.participants', 'participant')
      .leftJoinAndSelect('participant.user', 'participantUser')
      .leftJoinAndSelect('commonWorkout.blocks', 'block')
      .leftJoinAndSelect('block.defaultExercise', 'blockDefaultExercise')
      .leftJoinAndSelect('commonWorkout.exercises', 'exerciseEntry')
      .leftJoinAndSelect('exerciseEntry.block', 'exerciseBlock')
      .leftJoinAndSelect('exerciseEntry.participant', 'exerciseParticipant')
      .leftJoinAndSelect('exerciseEntry.exercise', 'exercise')
      .leftJoinAndSelect('exerciseEntry.participantSets', 'participantSet')
      .where('commonWorkout.id = :commonWorkoutId', { commonWorkoutId })
      .orderBy('block.order', 'ASC')
      .addOrderBy('exerciseParticipant.id', 'ASC')
      .addOrderBy('exerciseEntry.order', 'ASC')
      .addOrderBy('participantSet.setNumber', 'ASC')
      .addOrderBy('participant.id', 'ASC')
      .getOne();

    if (!commonWorkout) {
      throw new NotFoundException('Common workout not found');
    }

    const isParticipant = (commonWorkout.participants || []).some(
      (participant) => participant.userId === userId,
    );

    if (!isParticipant) {
      throw new NotFoundException('Common workout not found');
    }

    return commonWorkout;
  }

  private async getHistoricalWorkoutEntityForUser(
    userId: number,
    workoutId: number,
  ) {
    const workout = await this.workoutRepository.findOne({
      where: {
        id: workoutId,
        userId,
        status: WorkoutStatus.COMPLETED,
      },
      relations: {
        user: true,
        template: true,
        exercises: {
          exercise: true,
          sets: true,
        },
      },
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

  private getWorkoutParticipantForUser(
    commonWorkout: CommonWorkout,
    userId: number,
  ) {
    const participant = (commonWorkout.participants || []).find(
      (item) => item.userId === userId,
    );

    if (!participant) {
      throw new NotFoundException('Common workout not found');
    }

    return participant;
  }

  private getSortedParticipantExercises(
    exercises: CommonWorkoutExercise[],
    participantId: number,
  ) {
    return exercises
      .filter((exercise) => exercise.participantId === participantId)
      .sort((left, right) => left.order - right.order);
  }

  private getParticipantExerciseByOrder(
    exercises: CommonWorkoutExercise[],
    exerciseIdentifier: number,
  ) {
    const commonWorkoutExercise = exercises.find(
      (exercise) =>
        exercise.order === exerciseIdentifier ||
        exercise.id === exerciseIdentifier ||
        exercise.exerciseId === exerciseIdentifier,
    );

    if (!commonWorkoutExercise) {
      throw new NotFoundException('Common workout exercise not found');
    }

    return commonWorkoutExercise;
  }

  private async getActiveCommonWorkoutExerciseForUser(
    userId: number,
    exerciseIdentifier: number,
  ) {
    const exercise = await this.commonWorkoutExerciseRepository
      .createQueryBuilder('commonWorkoutExercise')
      .leftJoinAndSelect('commonWorkoutExercise.exercise', 'exercise')
      .leftJoinAndSelect('commonWorkoutExercise.commonWorkout', 'commonWorkout')
      .leftJoinAndSelect('commonWorkoutExercise.participant', 'participant')
      .leftJoinAndSelect(
        'commonWorkoutExercise.participantSets',
        'participantSet',
      )
      .where('participant.userId = :userId', { userId })
      .andWhere(
        '(commonWorkoutExercise.order = :exerciseIdentifier OR commonWorkoutExercise.id = :exerciseIdentifier OR commonWorkoutExercise.exerciseId = :exerciseIdentifier)',
        { exerciseIdentifier },
      )
      .andWhere('commonWorkout.status = :status', {
        status: CommonWorkoutStatus.ACTIVE,
      })
      .orderBy('participantSet.setNumber', 'ASC')
      .getOne();

    if (!exercise) {
      throw new NotFoundException('Common workout exercise not found');
    }

    return exercise;
  }

  private async getCommonWorkoutExerciseEntityForUser(
    userId: number,
    commonWorkoutId: number,
    exerciseIdentifier: number,
  ) {
    const exercise = await this.commonWorkoutExerciseRepository
      .createQueryBuilder('commonWorkoutExercise')
      .leftJoinAndSelect('commonWorkoutExercise.exercise', 'exercise')
      .leftJoinAndSelect('commonWorkoutExercise.commonWorkout', 'commonWorkout')
      .leftJoinAndSelect('commonWorkoutExercise.participant', 'participant')
      .leftJoinAndSelect('participant.user', 'participantUser')
      .leftJoinAndSelect(
        'commonWorkoutExercise.participantSets',
        'participantSet',
      )
      .where('participant.userId = :userId', { userId })
      .andWhere(
        '(commonWorkoutExercise.order = :exerciseIdentifier OR commonWorkoutExercise.id = :exerciseIdentifier OR commonWorkoutExercise.exerciseId = :exerciseIdentifier)',
        { exerciseIdentifier },
      )
      .andWhere('commonWorkoutExercise.commonWorkoutId = :commonWorkoutId', {
        commonWorkoutId,
      })
      .orderBy('participantSet.setNumber', 'ASC')
      .getOne();

    if (!exercise) {
      throw new NotFoundException('Common workout exercise not found');
    }

    return exercise;
  }

  private async getParticipantSetForUser(
    userId: number,
    participantSetId: number,
  ) {
    const participantSet = await this.participantSetRepository
      .createQueryBuilder('participantSet')
      .leftJoinAndSelect('participantSet.participant', 'participant')
      .leftJoinAndSelect('participant.user', 'participantUser')
      .leftJoinAndSelect('participant.commonWorkout', 'participantWorkout')
      .leftJoinAndSelect(
        'participantSet.commonWorkoutExercise',
        'commonWorkoutExercise',
      )
      .leftJoinAndSelect('commonWorkoutExercise.commonWorkout', 'commonWorkout')
      .leftJoinAndSelect('commonWorkoutExercise.exercise', 'exercise')
      .where('participantSet.id = :participantSetId', { participantSetId })
      .andWhere('participant.userId = :userId', { userId })
      .andWhere('participantWorkout.status = :status', {
        status: CommonWorkoutStatus.ACTIVE,
      })
      .getOne();

    if (!participantSet) {
      throw new NotFoundException('Common workout set not found');
    }

    return participantSet;
  }

  private async getPreviousSetForUserExerciseSetNumber(
    userId: number,
    exerciseId: number,
    setNumber: number,
  ) {
    const previousWorkoutExercise =
      await this.workoutExerciseRepository.findOne({
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

    return (
      previousWorkoutExercise?.sets?.find(
        (set) => set.setNumber === setNumber,
      ) || null
    );
  }

  private async getPreviousSetsByUserIdForExercise(
    userIds: number[],
    exerciseId: number,
  ) {
    const uniqueUserIds = [...new Set(userIds)];
    const previousSets = await Promise.all(
      uniqueUserIds.map(async (userId) => {
        const previousWorkoutExercise =
          await this.workoutExerciseRepository.findOne({
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

        return [
          userId,
          new Map<number, WorkoutSet>(
            (previousWorkoutExercise?.sets || []).map((set) => [
              set.setNumber,
              set,
            ]),
          ),
        ] as const;
      }),
    );

    return new Map<number, Map<number, WorkoutSet>>(previousSets);
  }

  private async getAccessibleExerciseForUser(
    userId: number,
    exerciseId: number,
  ) {
    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    if (exercise.isGlobal) {
      return exercise;
    }

    if (exercise.createdByUserId === userId) {
      return exercise;
    }

    throw new NotFoundException('Exercise not found');
  }

  private async getAccessibleWorkoutTemplateForUser(
    userId: number,
    templateId: number,
  ) {
    const template = await this.templateRepository.findOne({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Workout template not found');
    }

    const isOwner = template.userId === userId;
    const isMember = (template.members || []).some(
      (member) => member.userId === userId,
    );

    if (!isOwner && !isMember) {
      throw new NotFoundException('Workout template not found');
    }

    return template;
  }

  private async syncPersonalBestForSavedWorkoutExercise(
    userId: number,
    exerciseId: number,
    workout: Workout,
    workoutExercise: WorkoutExercise,
    sets: WorkoutSet[],
  ) {
    const bestSet = [...sets]
      .filter(
        (set) =>
          set.confirmed &&
          typeof set.currentWeight === 'number' &&
          typeof set.currentReps === 'number' &&
          typeof set.repMax === 'number',
      )
      .sort((left, right) => this.compareSetPerformance(right, left))[0];

    if (!bestSet) {
      return;
    }

    const existingBest = await this.personalBestRepository.findOne({
      where: {
        userId,
        exerciseId,
      },
    });

    if (
      existingBest &&
      this.compareSetPerformance(bestSet, {
        currentWeight: existingBest.weight,
        currentReps: existingBest.reps,
        repMax: existingBest.repMax,
      } as WorkoutSet) <= 0
    ) {
      return;
    }

    const payload =
      existingBest ||
      this.personalBestRepository.create({ userId, exerciseId });
    payload.workoutId = workout.id;
    payload.workout = workout;
    payload.weight = bestSet.currentWeight as number;
    payload.reps = bestSet.currentReps as number;
    payload.repMax = bestSet.repMax as number;
    payload.achievedAt = workout.finishedAt ?? workout.startedAt;

    await this.personalBestRepository.save(payload);
  }

  private calculateRepMax(weight?: number | null, reps?: number | null) {
    return calculateBrzyckiRepMax(weight, reps);
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

  private mapWorkout(commonWorkout: CommonWorkout) {
    const participantList = [...(commonWorkout.participants || [])];
    const participantSummaries = participantList.map((participant) =>
      this.mapParticipantSummary(participant),
    );
    const exercises = [...(commonWorkout.exercises || [])]
      .sort((left, right) => this.compareParticipantExercises(left, right))
      .map((exercise) => this.mapWorkoutExercise(exercise));
    const blocks = this.mapWorkoutBlocks(commonWorkout, false);

    return {
      ...this.mapWorkoutSummary(commonWorkout),
      participants: participantSummaries,
      blocks,
      exercises,
    };
  }

  private mapWorkoutIndex(commonWorkout: CommonWorkout) {
    const participantList = [...(commonWorkout.participants || [])];
    const participantSummaries = participantList.map((participant) =>
      this.mapParticipantSummary(participant),
    );
    const exercises = [...(commonWorkout.exercises || [])]
      .sort((left, right) => this.compareParticipantExercises(left, right))
      .map((exercise) => this.mapWorkoutExerciseIndex(exercise));
    const blocks = this.mapWorkoutBlocks(commonWorkout, false);

    return {
      ...this.mapWorkoutSummary(commonWorkout),
      participants: participantSummaries,
      blocks,
      exercises,
    };
  }

  private mapWorkoutPerformanceSummary(commonWorkout: CommonWorkout) {
    const participantList = [...(commonWorkout.participants || [])];
    const exerciseEntries = [...(commonWorkout.exercises || [])].sort(
      (left, right) => this.compareParticipantExercises(left, right),
    );
    const sets = exerciseEntries.flatMap(
      (exercise) => exercise.participantSets || [],
    );

    return {
      ...this.mapWorkoutSummary(commonWorkout),
      ...this.summarizeSetPerformance(sets),
      participants: participantList.map((participant) =>
        this.mapCommonParticipantPerformance(participant, exerciseEntries),
      ),
      exercises: exerciseEntries.map((exercise) =>
        this.mapCommonExercisePerformance(exercise),
      ),
    };
  }

  private mapWorkoutSummary(commonWorkout: CommonWorkout) {
    const durationSeconds = this.getDurationSeconds(
      commonWorkout.startedAt,
      commonWorkout.finishedAt,
    );
    const participantCount = (commonWorkout.participants || []).length;
    const isSolo = participantCount <= 1;
    const exerciseEntries = [...(commonWorkout.exercises || [])].sort(
      (left, right) => this.compareParticipantExercises(left, right),
    );
    const totalSets = this.getCommonWorkoutTotalSets(exerciseEntries);
    const confirmedSets = exerciseEntries.reduce(
      (sum, exercise) =>
        sum +
        (exercise.participantSets || []).filter((set) => set.confirmed).length,
      0,
    );

    return {
      id: commonWorkout.id,
      name: commonWorkout.name,
      status: commonWorkout.status,
      mode: isSolo ? 'solo' : 'group',
      isSolo,
      participantCount,
      startedAt: commonWorkout.startedAt,
      finishedAt: commonWorkout.finishedAt,
      durationSeconds,
      durationLabel: this.getDurationLabel(durationSeconds),
      blockCount:
        (commonWorkout.blocks || []).length ||
        this.getLegacyBlockOrders(exerciseEntries).length,
      exerciseCount: exerciseEntries.length,
      totalSets,
      confirmedSets,
      exerciseNames: exerciseEntries
        .map((exercise) => exercise.exercise?.name)
        .filter((name): name is string => Boolean(name)),
      template: commonWorkout.template
        ? {
            id: commonWorkout.template.id,
            name: commonWorkout.template.name,
          }
        : null,
    };
  }

  private mapHistoricalWorkoutSummary(workout: Workout) {
    const durationSeconds = this.getDurationSeconds(
      workout.startedAt,
      workout.finishedAt,
    );
    const orderedExercises = [...(workout.exercises || [])].sort(
      (a, b) => a.order - b.order,
    );

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
      totalSets: orderedExercises.reduce(
        (sum, exercise) => sum + (exercise.sets?.length || 0),
        0,
      ),
      confirmedSets: orderedExercises.reduce(
        (sum, exercise) =>
          sum + (exercise.sets || []).filter((set) => set.confirmed).length,
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

  private mapHistoricalWorkoutPerformanceSummary(workout: Workout) {
    const user = this.mapHistoricalWorkoutUser(workout);
    const orderedExercises = [...(workout.exercises || [])].sort(
      (a, b) => a.order - b.order,
    );
    const sets = orderedExercises.flatMap((exercise) => exercise.sets || []);

    return {
      ...this.mapHistoricalWorkoutSummary(workout),
      ...this.summarizeSetPerformance(sets),
      participants: [
        {
          participantId: null,
          user,
          ...this.summarizeSetPerformance(sets),
          exercises: orderedExercises.map((exercise) =>
            this.mapHistoricalParticipantExercisePerformance(exercise),
          ),
        },
      ],
      exercises: orderedExercises.map((exercise) =>
        this.mapHistoricalExercisePerformance(exercise, user),
      ),
    };
  }

  private mapHistoricalWorkout(workout: Workout) {
    const exercises = [...(workout.exercises || [])]
      .sort((a, b) => a.order - b.order)
      .map((exercise) => this.mapHistoricalWorkoutExercise(exercise));

    return {
      ...this.mapHistoricalWorkoutSummary(workout),
      exercises,
    };
  }

  private mapCommonWorkoutExerciseDetail(
    commonWorkoutExercise: CommonWorkoutExercise,
  ) {
    return this.mapWorkoutExercise(commonWorkoutExercise);
  }

  private mapWorkoutBlocks(commonWorkout: CommonWorkout, includeSets: boolean) {
    const participantList = [...(commonWorkout.participants || [])].sort(
      (left, right) => left.id - right.id,
    );
    const blocks = [...(commonWorkout.blocks || [])].sort(
      (left, right) => left.order - right.order,
    );

    if (blocks.length === 0) {
      return this.getLegacyBlockOrders(commonWorkout.exercises || []).map(
        (order) =>
          this.mapLegacyWorkoutBlock(
            order,
            participantList,
            commonWorkout.exercises || [],
            includeSets,
          ),
      );
    }

    return blocks.map((block) => {
      const blockExercises = (commonWorkout.exercises || []).filter(
        (exercise) => exercise.blockId === block.id,
      );

      return {
        id: block.id,
        order: block.order,
        status: block.status,
        completedAt: block.completedAt,
        defaultExercise: this.mapExerciseSummary(block.defaultExercise),
        users: participantList.map((participant) =>
          this.mapBlockUserExercise(
            participant,
            blockExercises.find(
              (exercise) => exercise.participantId === participant.id,
            ) ?? null,
            includeSets,
          ),
        ),
      };
    });
  }

  private mapLegacyWorkoutBlock(
    order: number,
    participants: CommonWorkoutParticipant[],
    exercises: CommonWorkoutExercise[],
    includeSets: boolean,
  ) {
    const blockExercises = exercises.filter(
      (exercise) => exercise.order === order,
    );
    const completed =
      blockExercises.length > 0 &&
      blockExercises.every((exercise) => exercise.completed);

    return {
      id: order,
      order,
      status: completed
        ? CommonWorkoutBlockStatus.COMPLETED
        : CommonWorkoutBlockStatus.ACTIVE,
      completedAt: null,
      defaultExercise: null,
      users: participants.map((participant) =>
        this.mapBlockUserExercise(
          participant,
          blockExercises.find(
            (exercise) => exercise.participantId === participant.id,
          ) ?? null,
          includeSets,
        ),
      ),
    };
  }

  private mapBlockUserExercise(
    participant: CommonWorkoutParticipant,
    exercise: CommonWorkoutExercise | null,
    includeSets: boolean,
  ) {
    const sets = [...(exercise?.participantSets || [])].sort(
      (left, right) => left.setNumber - right.setNumber,
    );

    return {
      participantId: participant.id,
      user: this.mapParticipantSummary(participant).user,
      workoutExerciseId: exercise?.id ?? null,
      exercise: this.mapExerciseSummary(exercise?.exercise),
      completed: Boolean(exercise?.completed),
      completedAt: exercise?.completedAt ?? null,
      setsCount: sets.length,
      confirmedSets: sets.filter((set) => set.confirmed).length,
      ...(includeSets
        ? {
            sets: sets.map((set) => this.mapCommonSet(set)),
            availableActions: {
              changeExercise: true,
              addSet: true,
              updateOwnSets: true,
              removeOwnSets: true,
            },
          }
        : {}),
    };
  }

  private getLegacyBlockOrders(exercises: CommonWorkoutExercise[]) {
    return Array.from(
      new Set(exercises.map((exercise) => exercise.order)),
    ).sort((a, b) => a - b);
  }

  private mapWorkoutExerciseIndex(
    commonWorkoutExercise: CommonWorkoutExercise,
  ) {
    const participantSets = commonWorkoutExercise.participantSets || [];
    const setsCount =
      Math.max(0, ...participantSets.map((set) => set.setNumber)) || 0;

    return {
      id: commonWorkoutExercise.id,
      workoutExerciseId: commonWorkoutExercise.id,
      userId: commonWorkoutExercise.participant?.userId ?? null,
      order: commonWorkoutExercise.order,
      exerciseId:
        commonWorkoutExercise.exercise?.id ?? commonWorkoutExercise.exerciseId,
      exerciseName: commonWorkoutExercise.exercise?.name ?? null,
      exerciseDescription: commonWorkoutExercise.exercise?.description ?? null,
      exerciseMuscleGroups: commonWorkoutExercise.exercise?.muscleGroups ?? [],
      setsCount,
      confirmedSets: participantSets.filter((set) => set.confirmed).length,
    };
  }

  private mapCommonParticipantPerformance(
    participant: CommonWorkoutParticipant,
    exerciseEntries: CommonWorkoutExercise[],
  ) {
    const participantExercises = this.getSortedParticipantExercises(
      exerciseEntries,
      participant.id,
    );
    const sets = participantExercises.flatMap(
      (exercise) => exercise.participantSets || [],
    );

    return {
      ...this.mapParticipantSummary(participant),
      ...this.summarizeSetPerformance(sets),
      exercises: participantExercises.map((exercise) =>
        this.mapCommonParticipantExercisePerformance(exercise, participant),
      ),
    };
  }

  private mapCommonExercisePerformance(
    commonWorkoutExercise: CommonWorkoutExercise,
  ) {
    const participantSets = [
      ...(commonWorkoutExercise.participantSets || []),
    ].sort((a, b) => a.setNumber - b.setNumber);
    const participant = commonWorkoutExercise.participant;
    const participantSummary = participant
      ? this.mapParticipantSummary(participant)
      : null;

    return {
      id: commonWorkoutExercise.id,
      userId: participant?.userId ?? null,
      order: commonWorkoutExercise.order,
      exercise: this.mapExerciseSummary(commonWorkoutExercise.exercise),
      ...this.summarizeSetPerformance(participantSets),
      participants: participantSummary
        ? [
            {
              participantId: participantSummary.id,
              user: participantSummary.user,
              ...this.summarizeSetPerformance(participantSets),
              sets: participantSets.map((set) => this.mapPerformanceSet(set)),
            },
          ]
        : [],
    };
  }

  private mapCommonParticipantExercisePerformance(
    commonWorkoutExercise: CommonWorkoutExercise,
    _participant: CommonWorkoutParticipant,
  ) {
    const sets = (commonWorkoutExercise.participantSets || []).sort(
      (a, b) => a.setNumber - b.setNumber,
    );

    return {
      workoutExerciseId: commonWorkoutExercise.id,
      order: commonWorkoutExercise.order,
      exercise: this.mapExerciseSummary(commonWorkoutExercise.exercise),
      ...this.summarizeSetPerformance(sets),
      sets: sets.map((set) => this.mapPerformanceSet(set)),
    };
  }

  private mapHistoricalExercisePerformance(
    workoutExercise: WorkoutExercise,
    user: unknown,
  ) {
    const sets = [...(workoutExercise.sets || [])].sort(
      (a, b) => a.setNumber - b.setNumber,
    );

    return {
      id: workoutExercise.id,
      order: workoutExercise.order,
      exercise: this.mapExerciseSummary(workoutExercise.exercise),
      ...this.summarizeSetPerformance(sets),
      participants: [
        {
          participantId: null,
          user,
          ...this.summarizeSetPerformance(sets),
          sets: sets.map((set) => this.mapPerformanceSet(set)),
        },
      ],
    };
  }

  private mapHistoricalParticipantExercisePerformance(
    workoutExercise: WorkoutExercise,
  ) {
    const sets = [...(workoutExercise.sets || [])].sort(
      (a, b) => a.setNumber - b.setNumber,
    );

    return {
      workoutExerciseId: workoutExercise.id,
      order: workoutExercise.order,
      exercise: this.mapExerciseSummary(workoutExercise.exercise),
      ...this.summarizeSetPerformance(sets),
      sets: sets.map((set) => this.mapPerformanceSet(set)),
    };
  }

  private summarizeSetPerformance(
    sets: Array<{
      id: number;
      setNumber: number;
      currentWeight?: number | null;
      currentReps?: number | null;
      repMax?: number | null;
      confirmed?: boolean;
    }>,
  ) {
    const confirmedSets = sets.filter((set) => set.confirmed);
    const totalVolume = confirmedSets.reduce(
      (sum, set) => sum + this.getSetVolume(set.currentWeight, set.currentReps),
      0,
    );
    const totalWeight = confirmedSets.reduce(
      (sum, set) =>
        sum + (typeof set.currentWeight === 'number' ? set.currentWeight : 0),
      0,
    );
    const totalReps = confirmedSets.reduce(
      (sum, set) =>
        sum + (typeof set.currentReps === 'number' ? set.currentReps : 0),
      0,
    );
    const bestSet = [...confirmedSets]
      .filter(
        (set) =>
          typeof set.currentWeight === 'number' &&
          typeof set.currentReps === 'number' &&
          typeof set.repMax === 'number',
      )
      .sort((left, right) => {
        const repMaxDifference = (right.repMax ?? 0) - (left.repMax ?? 0);
        if (repMaxDifference !== 0) {
          return repMaxDifference;
        }

        const weightDifference =
          (right.currentWeight ?? 0) - (left.currentWeight ?? 0);
        if (weightDifference !== 0) {
          return weightDifference;
        }

        return (right.currentReps ?? 0) - (left.currentReps ?? 0);
      })[0];

    return {
      totalSets: sets.length,
      confirmedSets: confirmedSets.length,
      totalWeight,
      totalReps,
      totalVolume,
      liftedWeight: totalVolume,
      bestSet: bestSet ? this.mapPerformanceSet(bestSet) : null,
    };
  }

  private mapPerformanceSet(set: {
    id: number;
    setNumber: number;
    currentWeight?: number | null;
    currentReps?: number | null;
    repMax?: number | null;
    confirmed?: boolean;
  }) {
    const weight =
      typeof set.currentWeight === 'number' ? set.currentWeight : null;
    const reps = typeof set.currentReps === 'number' ? set.currentReps : null;

    return {
      id: set.id,
      setNumber: set.setNumber,
      weight,
      reps,
      volume: this.getSetVolume(weight, reps),
      repMax: set.repMax ?? null,
      confirmed: Boolean(set.confirmed),
    };
  }

  private getSetVolume(weight?: number | null, reps?: number | null) {
    if (typeof weight !== 'number' || typeof reps !== 'number') {
      return 0;
    }

    return weight * reps;
  }

  private mapHistoricalWorkoutUser(workout: Workout) {
    return {
      id: workout.user?.id ?? workout.userId,
      email: workout.user?.email ?? null,
      name: workout.user?.name ?? null,
      avatarPath: workout.user?.avatarPath ?? null,
      avatarUrl: workout.user?.avatarPath ?? null,
    };
  }

  private mapExerciseSummary(exercise?: Exercise | null) {
    return exercise
      ? {
          id: exercise.id,
          name: exercise.name,
          description: exercise.description,
          muscleGroups: exercise.muscleGroups,
        }
      : null;
  }

  private mapHistoricalWorkoutExercise(workoutExercise: WorkoutExercise) {
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

  private mapParticipantSummary(participant: CommonWorkoutParticipant) {
    return {
      id: participant.id,
      user: {
        id: participant.user.id,
        email: participant.user.email,
        name: participant.user.name,
        avatarPath: participant.user.avatarPath ?? null,
        avatarUrl: participant.user.avatarPath ?? null,
      },
    };
  }

  private mapWorkoutExercise(commonWorkoutExercise: CommonWorkoutExercise) {
    return {
      id: commonWorkoutExercise.id,
      workoutExerciseId: commonWorkoutExercise.id,
      userId: commonWorkoutExercise.participant?.userId ?? null,
      order: commonWorkoutExercise.order,
      exerciseId:
        commonWorkoutExercise.exercise?.id ?? commonWorkoutExercise.exerciseId,
      exerciseName: commonWorkoutExercise.exercise?.name ?? null,
      exerciseDescription: commonWorkoutExercise.exercise?.description ?? null,
      exerciseMuscleGroups: commonWorkoutExercise.exercise?.muscleGroups ?? [],
      sets: [...(commonWorkoutExercise.participantSets || [])]
        .sort((a, b) => a.setNumber - b.setNumber)
        .map((set) => this.mapCommonSet(set)),
    };
  }

  private mapCommonSet(set: CommonWorkoutParticipantSet) {
    return {
      id: set.id,
      setNumber: set.setNumber,
      previousWeight: set.previousWeight,
      previousReps: set.previousReps,
      currentWeight: set.currentWeight,
      currentReps: set.currentReps,
      durationSeconds: set.durationSeconds ?? null,
      repMax: set.repMax,
      confirmed: set.confirmed,
    };
  }

  private compareParticipantExercises(
    left: CommonWorkoutExercise,
    right: CommonWorkoutExercise,
  ) {
    const leftUserId = left.participant?.userId ?? Number.MAX_SAFE_INTEGER;
    const rightUserId = right.participant?.userId ?? Number.MAX_SAFE_INTEGER;

    if (leftUserId !== rightUserId) {
      return leftUserId - rightUserId;
    }

    return left.order - right.order;
  }

  private compareSetPerformance(
    left: Pick<WorkoutSet, 'repMax' | 'currentWeight' | 'currentReps'>,
    right: Pick<WorkoutSet, 'repMax' | 'currentWeight' | 'currentReps'>,
  ) {
    const repMaxDifference = (left.repMax ?? 0) - (right.repMax ?? 0);
    if (repMaxDifference !== 0) {
      return repMaxDifference;
    }

    const weightDifference =
      (left.currentWeight ?? 0) - (right.currentWeight ?? 0);
    if (weightDifference !== 0) {
      return weightDifference;
    }

    return (left.currentReps ?? 0) - (right.currentReps ?? 0);
  }

  private formatSetLabel(weight?: number | null, reps?: number | null) {
    if (typeof weight !== 'number' || typeof reps !== 'number') {
      return null;
    }

    return `${weight}x${reps}`;
  }

  private toDateOnly(date: Date) {
    return new Date(date).toISOString().slice(0, 10);
  }

  private getDateRange(dateFrom: string, dateTo: string) {
    const from = new Date(`${dateFrom}T00:00:00.000Z`);
    const to = new Date(`${dateTo}T23:59:59.999Z`);

    if (
      Number.isNaN(from.getTime()) ||
      Number.isNaN(to.getTime()) ||
      from > to
    ) {
      throw new BadRequestException('Invalid dashboard date range');
    }

    const rangeInDays = Math.ceil((to.getTime() - from.getTime()) / 86_400_000);
    if (rangeInDays > MAX_DASHBOARD_RANGE_DAYS) {
      throw new BadRequestException(
        `Dashboard date range cannot exceed ${MAX_DASHBOARD_RANGE_DAYS} days`,
      );
    }

    return { from, to };
  }

  private isDateInRange(date: Date, from: Date, to: Date) {
    const timestamp = new Date(date).getTime();
    return timestamp >= from.getTime() && timestamp <= to.getTime();
  }

  private async getFavoriteExerciseStat(userId: number, workouts: Workout[]) {
    const counters = new Map<
      number,
      { exercise: Exercise; workoutsCount: number; setsCount: number }
    >();

    for (const workout of workouts) {
      for (const workoutExercise of workout.exercises || []) {
        if (!workoutExercise.exercise) {
          continue;
        }

        const current = counters.get(workoutExercise.exerciseId) || {
          exercise: workoutExercise.exercise,
          workoutsCount: 0,
          setsCount: 0,
        };
        current.workoutsCount += 1;
        current.setsCount += (workoutExercise.sets || []).length;
        counters.set(workoutExercise.exerciseId, current);
      }
    }

    const favorite = [...counters.entries()].sort((left, right) => {
      const workoutCountDifference =
        right[1].workoutsCount - left[1].workoutsCount;
      if (workoutCountDifference !== 0) {
        return workoutCountDifference;
      }

      const setCountDifference = right[1].setsCount - left[1].setsCount;
      if (setCountDifference !== 0) {
        return setCountDifference;
      }

      return left[1].exercise.name.localeCompare(right[1].exercise.name);
    })[0];

    if (!favorite) {
      return null;
    }

    const [exerciseId, data] = favorite;
    const personalBest =
      (await this.personalBestRepository.findOne({
        where: {
          userId,
          exerciseId,
        },
      })) || (await this.findHistoricalBestForExercise(userId, exerciseId));

    return {
      exercise: {
        id: data.exercise.id,
        name: data.exercise.name,
      },
      workoutsCount: data.workoutsCount,
      setsCount: data.setsCount,
      personalRecord: personalBest
        ? {
            weight: personalBest.weight,
            reps: personalBest.reps,
            repMax: personalBest.repMax,
            achievedAt: personalBest.achievedAt,
          }
        : null,
    };
  }

  private getFavoriteTrainingDay(workouts: Workout[]) {
    const counters = new Map<string, number>();

    for (const workout of workouts) {
      const weekday = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        timeZone: 'UTC',
      })
        .format(new Date(workout.startedAt))
        .toLowerCase();
      counters.set(weekday, (counters.get(weekday) || 0) + 1);
    }

    const favorite = [...counters.entries()].sort((left, right) => {
      const countDifference = right[1] - left[1];
      if (countDifference !== 0) {
        return countDifference;
      }

      return left[0].localeCompare(right[0]);
    })[0];

    if (!favorite) {
      return null;
    }

    return {
      day: favorite[0],
      workoutsCount: favorite[1],
    };
  }

  private async getFavoritePartnerStat(userId: number, from: Date, to: Date) {
    const completedSessions = await this.commonWorkoutRepository.find({
      where: {
        status: CommonWorkoutStatus.COMPLETED,
        startedAt: Between(from, to),
      },
      relations: {
        participants: {
          user: true,
        },
      },
      order: {
        startedAt: 'DESC',
      },
    });

    const counters = new Map<number, { user: User; sessionsCount: number }>();

    for (const session of completedSessions) {
      const participantIds = new Set(
        (session.participants || []).map((participant) => participant.userId),
      );
      if (!participantIds.has(userId)) {
        continue;
      }

      for (const participant of session.participants || []) {
        if (participant.userId === userId || !participant.user) {
          continue;
        }

        const current = counters.get(participant.userId) || {
          user: participant.user,
          sessionsCount: 0,
        };
        current.sessionsCount += 1;
        counters.set(participant.userId, current);
      }
    }

    const favorite = [...counters.entries()].sort((left, right) => {
      const countDifference = right[1].sessionsCount - left[1].sessionsCount;
      if (countDifference !== 0) {
        return countDifference;
      }

      return left[1].user.name.localeCompare(right[1].user.name);
    })[0];

    if (!favorite) {
      return null;
    }

    return {
      user: {
        id: favorite[1].user.id,
        name: favorite[1].user.name,
        avatarPath: favorite[1].user.avatarPath ?? null,
        avatarUrl: favorite[1].user.avatarPath ?? null,
      },
      workoutsCount: favorite[1].sessionsCount,
    };
  }

  private async findHistoricalBestForExercise(
    userId: number,
    exerciseId: number,
  ) {
    const workoutExercises = await this.workoutExerciseRepository.find({
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

    const candidates = workoutExercises
      .flatMap((exercise) =>
        (exercise.sets || [])
          .filter(
            (set) =>
              set.confirmed &&
              typeof set.currentWeight === 'number' &&
              typeof set.currentReps === 'number' &&
              typeof set.repMax === 'number',
          )
          .map((set) => ({
            weight: set.currentWeight as number,
            reps: set.currentReps as number,
            repMax: set.repMax as number,
            achievedAt:
              exercise.workout.finishedAt ?? exercise.workout.startedAt,
          })),
      )
      .sort((left, right) =>
        this.compareSetPerformance(
          {
            currentWeight: right.weight,
            currentReps: right.reps,
            repMax: right.repMax,
          } as WorkoutSet,
          {
            currentWeight: left.weight,
            currentReps: left.reps,
            repMax: left.repMax,
          } as WorkoutSet,
        ),
      );

    return candidates[0] || null;
  }
}
