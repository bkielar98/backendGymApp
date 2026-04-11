import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CommonWorkout, CommonWorkoutStatus } from '../entities/common-workout.entity';
import { CommonWorkoutParticipant } from '../entities/common-workout-participant.entity';
import { CommonWorkoutExercise } from '../entities/common-workout-exercise.entity';
import { CommonWorkoutParticipantSet } from '../entities/common-workout-participant-set.entity';
import { Workout, WorkoutStatus } from '../entities/workout.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { WorkoutSet } from '../entities/workout-set.entity';
import { WorkoutTemplate } from '../entities/workout-template.entity';
import { Exercise } from '../entities/exercise.entity';
import { User } from '../entities/user.entity';
import { CommonWorkoutsGateway } from './common-workouts.gateway';
import { StartCommonWorkoutDto } from './dto/start-common-workout.dto';
import { UpdateCommonWorkoutDto } from './dto/update-common-workout.dto';
import { AddCommonWorkoutExerciseDto } from './dto/add-common-workout-exercise.dto';
import { ChangeCommonWorkoutExercisePositionDto } from './dto/change-common-workout-exercise-position.dto';
import { ChangeCommonWorkoutExerciseDto } from './dto/change-common-workout-exercise.dto';
import { UpdateCommonWorkoutSetDto } from './dto/update-common-workout-set.dto';
import { ConfirmCommonWorkoutSetDto } from './dto/confirm-common-workout-set.dto';

@Injectable()
export class CommonWorkoutsService {
  private readonly logger = new Logger(CommonWorkoutsService.name);

  constructor(
    @InjectRepository(CommonWorkout)
    private readonly commonWorkoutRepository: Repository<CommonWorkout>,
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
    private readonly gateway: CommonWorkoutsGateway,
  ) {}

  async start(userId: number, dto: StartCommonWorkoutDto) {
    const participantUserIds = Array.from(new Set([userId, ...(dto.participantUserIds || [])]));
    await this.ensureUsersExist(participantUserIds);
    await this.ensureParticipantsHaveNoActiveWorkouts(participantUserIds);

    let template: WorkoutTemplate | null = null;
    if (typeof dto.templateId === 'number') {
      template = await this.templateRepository.findOne({
        where: { id: dto.templateId, userId },
      });

      if (!template) {
        throw new NotFoundException('Workout template not found');
      }
    }

    const commonWorkout = this.commonWorkoutRepository.create({
      createdByUserId: userId,
      templateId: template?.id ?? null,
      template,
      name: dto.name || template?.name || 'Common workout',
      status: CommonWorkoutStatus.ACTIVE,
      startedAt: new Date(),
      finishedAt: null,
      participants: [],
      exercises: [],
    });

    const savedWorkout = await this.commonWorkoutRepository.save(commonWorkout);
    const users = await this.userRepository.findBy({ id: In(participantUserIds) });
    const participants = users.map((user) =>
      this.participantRepository.create({
        commonWorkoutId: savedWorkout.id,
        commonWorkout: savedWorkout,
        userId: user.id,
        user,
        sets: [],
      }),
    );

    await this.participantRepository.save(participants);

    const sortedTemplateExercises = [...(template?.exercises || [])].sort(
      (a, b) => a.order - b.order,
    );

    for (const templateExercise of sortedTemplateExercises) {
      await this.createCommonExercise(
        savedWorkout.id,
        templateExercise.exerciseId,
        templateExercise.order,
        templateExercise.setsCount,
      );
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

  async getByIdForUser(userId: number, commonWorkoutId: number) {
    const commonWorkout = await this.getCommonWorkoutSummaryEntityForUser(userId, commonWorkoutId);
    return this.mapCommonWorkoutSummary(commonWorkout);
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

  async updateCommonWorkout(userId: number, commonWorkoutId: number, dto: UpdateCommonWorkoutDto) {
    const commonWorkout = await this.getActiveCommonWorkoutEntityForUser(userId, commonWorkoutId);

    if (typeof dto.name === 'string') {
      commonWorkout.name = dto.name;
      await this.commonWorkoutRepository.save(commonWorkout);
    }

    const payload = await this.getByIdForUser(userId, commonWorkout.id);
    this.emitUpdatedIfSubscribed(commonWorkout.id, payload);
    return payload;
  }

  async addExercise(userId: number, commonWorkoutId: number, dto: AddCommonWorkoutExerciseDto) {
    const commonWorkout = await this.getActiveCommonWorkoutStructureEntityForUser(
      userId,
      commonWorkoutId,
    );
    const exercise = await this.getAccessibleExerciseForUsers(
      commonWorkout.participants.map((participant) => participant.userId),
      dto.exerciseId,
    );
    const exercises = [...(commonWorkout.exercises || [])];
    const insertOrder = Math.min(dto.order ?? exercises.length, exercises.length);

    for (const item of exercises) {
      if (item.order >= insertOrder) {
        item.order += 1;
      }
    }

    await this.commonWorkoutExerciseRepository.save(exercises);
    const createdExercise = await this.createCommonExercise(
      commonWorkout.id,
      exercise.id,
      insertOrder,
      dto.setsCount ?? 0,
      commonWorkout.participants,
    );

    const payload = await this.getWorkoutExerciseResponse(
      userId,
      commonWorkout.id,
      createdExercise.id,
    );
    this.emitUpdatedIfSubscribed(commonWorkout.id, payload);
    return payload;
  }

  async changeExercisePosition(
    userId: number,
    commonWorkoutId: number,
    commonWorkoutExerciseId: number,
    dto: ChangeCommonWorkoutExercisePositionDto,
  ) {
    const commonWorkout = await this.getActiveCommonWorkoutStructureEntityForUser(
      userId,
      commonWorkoutId,
    );
    const exercises = [...(commonWorkout.exercises || [])];
    const currentExercise = this.getCommonWorkoutExerciseFromWorkout(
      commonWorkout,
      commonWorkoutExerciseId,
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

    const payload = await this.getByIdForUser(userId, commonWorkout.id);
    this.emitUpdatedIfSubscribed(commonWorkout.id, payload);
    return payload;
  }

  async changeExercise(
    userId: number,
    commonWorkoutId: number,
    commonWorkoutExerciseId: number,
    dto: ChangeCommonWorkoutExerciseDto,
  ) {
    const commonWorkout = await this.getActiveCommonWorkoutStructureEntityForUser(
      userId,
      commonWorkoutId,
    );
    const currentExercise = this.getCommonWorkoutExerciseFromWorkout(
      commonWorkout,
      commonWorkoutExerciseId,
    );
    const exercise = await this.getAccessibleExerciseForUsers(
      commonWorkout.participants.map((participant) => participant.userId),
      dto.exerciseId,
    );

    currentExercise.exerciseId = exercise.id;
    currentExercise.exercise = exercise;
    await this.commonWorkoutExerciseRepository.save(currentExercise);

    const participantSets = await this.participantSetRepository.find({
      where: {
        commonWorkoutExerciseId: currentExercise.id,
      },
      relations: {
        participant: true,
      },
      order: {
        setNumber: 'ASC',
      },
    });

    const previousSetsByUserId = await this.getPreviousSetsByUserIdForExercise(
      [...new Set(participantSets.map((set) => set.participant.userId))],
      exercise.id,
    );

    for (const set of participantSets) {
      const previousSet = previousSetsByUserId.get(set.participant.userId)?.get(set.setNumber);

      set.previousWeight = previousSet?.currentWeight ?? null;
      set.previousReps = previousSet?.currentReps ?? null;
    }

    await this.participantSetRepository.save(participantSets);

    const payload = await this.getByIdForUser(userId, commonWorkout.id);
    this.emitUpdatedIfSubscribed(commonWorkout.id, payload);
    return payload;
  }

  async removeExercise(userId: number, commonWorkoutId: number, commonWorkoutExerciseId: number) {
    const commonWorkout = await this.getActiveCommonWorkoutStructureEntityForUser(
      userId,
      commonWorkoutId,
    );
    const currentExercise = this.getCommonWorkoutExerciseFromWorkout(
      commonWorkout,
      commonWorkoutExerciseId,
    );

    await this.commonWorkoutExerciseRepository.delete({
      id: currentExercise.id,
      commonWorkoutId: commonWorkout.id,
    });

    const remainingExercises = (commonWorkout.exercises || []).filter(
      (item) => item.id !== currentExercise.id,
    );

    for (const item of remainingExercises) {
      if (item.order > currentExercise.order) {
        item.order -= 1;
      }
    }

    await this.commonWorkoutExerciseRepository.save(remainingExercises);

    const payload = await this.getByIdForUser(userId, commonWorkout.id);
    this.emitUpdatedIfSubscribed(commonWorkout.id, payload);
    return payload;
  }

  async addSet(userId: number, commonWorkoutExerciseId: number) {
    const commonWorkoutExercise = await this.getActiveCommonWorkoutExerciseForUser(
      userId,
      commonWorkoutExerciseId,
    );
    const existingSets = commonWorkoutExercise.participantSets || [];
    const nextSetNumber = Math.max(0, ...existingSets.map((set) => set.setNumber)) + 1;

    const participants = commonWorkoutExercise.commonWorkout.participants || [];
    const previousSetsByUserId = await this.getPreviousSetsByUserIdForExercise(
      participants.map((participant) => participant.userId),
      commonWorkoutExercise.exerciseId,
    );

    const newSets = participants.map((participant) => {
      const previousSet = previousSetsByUserId.get(participant.userId)?.get(nextSetNumber);

      return this.participantSetRepository.create({
        participantId: participant.id,
        commonWorkoutExerciseId: commonWorkoutExercise.id,
        setNumber: nextSetNumber,
        previousWeight: previousSet?.currentWeight ?? null,
        previousReps: previousSet?.currentReps ?? null,
        currentWeight: null,
        currentReps: null,
        repMax: null,
        confirmed: false,
      });
    });

    await this.participantSetRepository.save(newSets);

    const payload = await this.getWorkoutExerciseResponse(
      userId,
      commonWorkoutExercise.commonWorkoutId,
      commonWorkoutExercise.id,
    );
    this.emitUpdatedIfSubscribed(commonWorkoutExercise.commonWorkoutId, payload);
    return payload;
  }

  async removeSet(userId: number, participantSetId: number) {
    const participantSet = await this.getParticipantSetForUser(userId, participantSetId);
    const commonWorkoutExerciseId = participantSet.commonWorkoutExerciseId;
    const setNumber = participantSet.setNumber;
    const commonWorkoutId = participantSet.commonWorkoutExercise.commonWorkoutId;

    const matchingSets = await this.participantSetRepository.find({
      where: {
        commonWorkoutExerciseId,
        setNumber,
      },
      relations: {
        participant: true,
        commonWorkoutExercise: true,
      },
      order: {
        participantId: 'ASC',
      },
    });

    await this.participantSetRepository.remove(matchingSets);

    const remainingSets = await this.participantSetRepository.find({
      where: { commonWorkoutExerciseId },
      relations: {
        participant: true,
        commonWorkoutExercise: true,
      },
      order: { setNumber: 'ASC' },
    });

    const groupedByParticipant = new Map<number, CommonWorkoutParticipantSet[]>();
    for (const set of remainingSets) {
      const list = groupedByParticipant.get(set.participantId) || [];
      list.push(set);
      groupedByParticipant.set(set.participantId, list);
    }

    for (const sets of groupedByParticipant.values()) {
      for (let index = 0; index < sets.length; index += 1) {
        sets[index].setNumber = index + 1;
      }

      await this.participantSetRepository.save(sets);
    }

    const payload = await this.getWorkoutExerciseResponse(
      userId,
      commonWorkoutId,
      commonWorkoutExerciseId,
    );
    this.emitUpdatedIfSubscribed(commonWorkoutId, payload);
    return payload;
  }

  async updateSet(userId: number, participantSetId: number, dto: UpdateCommonWorkoutSetDto) {
    const participantSet = await this.getParticipantSetForUser(userId, participantSetId);

    if (typeof dto.currentWeight === 'number') {
      participantSet.currentWeight = dto.currentWeight;
    }

    if (typeof dto.currentReps === 'number') {
      participantSet.currentReps = dto.currentReps;
    }

    participantSet.repMax = this.calculateRepMax(
      participantSet.currentWeight,
      participantSet.currentReps,
    );

    await this.participantSetRepository.save(participantSet);

    const payload = await this.getWorkoutExerciseResponse(
      userId,
      participantSet.commonWorkoutExercise.commonWorkoutId,
      participantSet.commonWorkoutExerciseId,
    );
    this.emitUpdatedIfSubscribed(participantSet.commonWorkoutExercise.commonWorkoutId, payload);
    return payload;
  }

  async confirmSet(userId: number, participantSetId: number, dto: ConfirmCommonWorkoutSetDto) {
    const participantSet = await this.getParticipantSetForUser(userId, participantSetId);

    participantSet.currentWeight = dto.currentWeight;
    participantSet.currentReps = dto.currentReps;
    participantSet.repMax = this.calculateRepMax(
      participantSet.currentWeight,
      participantSet.currentReps,
    );
    participantSet.confirmed = true;

    await this.participantSetRepository.save(participantSet);

    const payload = await this.getWorkoutExerciseResponse(
      userId,
      participantSet.commonWorkoutExercise.commonWorkoutId,
      participantSet.commonWorkoutExerciseId,
    );
    this.emitUpdatedIfSubscribed(participantSet.commonWorkoutExercise.commonWorkoutId, payload);
    return payload;
  }

  async finish(userId: number, commonWorkoutId: number) {
    const commonWorkout = await this.getActiveCommonWorkoutEntityForUser(userId, commonWorkoutId);

    commonWorkout.status = CommonWorkoutStatus.COMPLETED;
    commonWorkout.finishedAt = new Date();
    await this.commonWorkoutRepository.save(commonWorkout);

    for (const participant of commonWorkout.participants || []) {
      await this.createIndividualWorkoutFromCommonWorkout(commonWorkout, participant);
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

  private logPayloadMetrics(eventName: string, commonWorkoutId: number, payload: unknown) {
    try {
      const payloadSizeBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');

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

  private async getWorkoutExerciseResponse(
    userId: number,
    commonWorkoutId: number,
    commonWorkoutExerciseId: number,
  ) {
    const [workout, exercise] = await Promise.all([
      this.getByIdForUser(userId, commonWorkoutId),
      this.getExerciseByIdForUser(userId, commonWorkoutId, commonWorkoutExerciseId),
    ]);

    return {
      workout,
      exercise,
    };
  }

  private async createCommonExercise(
    commonWorkoutId: number,
    exerciseId: number,
    order: number,
    setsCount: number,
    participantsOverride?: CommonWorkoutParticipant[],
  ) {
    const participants =
      participantsOverride ||
      (await this.participantRepository.find({
        where: { commonWorkoutId },
        order: { id: 'ASC' },
      }));

    if (participants.length === 0) {
      throw new NotFoundException('Common workout not found');
    }

    const exercise = await this.exerciseRepository.findOne({ where: { id: exerciseId } });
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    const commonWorkoutExercise = this.commonWorkoutExerciseRepository.create({
      commonWorkoutId,
      exerciseId,
      exercise,
      order,
      participantSets: [],
    });

    const savedExercise = await this.commonWorkoutExerciseRepository.save(commonWorkoutExercise);

    if (setsCount > 0) {
      const previousSetsByUserId = await this.getPreviousSetsByUserIdForExercise(
        participants.map((participant) => participant.userId),
        exerciseId,
      );
      const participantSets: CommonWorkoutParticipantSet[] = [];

      for (const participant of participants) {
        for (let i = 1; i <= setsCount; i += 1) {
          const previousSet = previousSetsByUserId.get(participant.userId)?.get(i);

          participantSets.push(
            this.participantSetRepository.create({
              participantId: participant.id,
              commonWorkoutExerciseId: savedExercise.id,
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
      }

      await this.participantSetRepository.save(participantSets);
    }

    return savedExercise;
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
    const orderedExercises = [...(commonWorkout.exercises || [])].sort(
      (a, b) => a.order - b.order,
    );

    for (const commonExercise of orderedExercises) {
      const workoutExercise = this.workoutExerciseRepository.create({
        workoutId: savedWorkout.id,
        workout: savedWorkout,
        exerciseId: commonExercise.exerciseId,
        exercise: commonExercise.exercise,
        order: commonExercise.order,
        sets: [],
      });

      const savedWorkoutExercise = await this.workoutExerciseRepository.save(workoutExercise);
      const participantSets = (commonExercise.participantSets || [])
        .filter((set) => set.participantId === participant.id)
        .sort((a, b) => a.setNumber - b.setNumber);

      const setsToCreate = participantSets.map((set) =>
        this.workoutSetRepository.create({
          workoutExerciseId: savedWorkoutExercise.id,
          workoutExercise: savedWorkoutExercise,
          setNumber: set.setNumber,
          previousWeight: set.previousWeight,
          previousReps: set.previousReps,
          currentWeight: set.currentWeight,
          currentReps: set.currentReps,
          repMax: set.repMax,
          confirmed: set.confirmed,
        }),
      );

      await this.workoutSetRepository.save(setsToCreate);
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
      throw new BadRequestException('One of the participants already has an active workout');
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

  private async getActiveCommonWorkoutEntityForUser(userId: number, commonWorkoutId: number) {
    const commonWorkout = await this.getCommonWorkoutEntityForUser(userId, commonWorkoutId);
    if (commonWorkout.status !== CommonWorkoutStatus.ACTIVE) {
      throw new NotFoundException('Active common workout not found');
    }

    return commonWorkout;
  }

  private async getActiveCommonWorkoutStructureEntityForUser(
    userId: number,
    commonWorkoutId: number,
  ) {
    const commonWorkout = await this.getCommonWorkoutStructureEntityForUser(userId, commonWorkoutId);
    if (commonWorkout.status !== CommonWorkoutStatus.ACTIVE) {
      throw new NotFoundException('Active common workout not found');
    }

    return commonWorkout;
  }

  private async getCommonWorkoutEntityForUser(userId: number, commonWorkoutId: number) {
    const commonWorkout = await this.commonWorkoutRepository.findOne({
      where: { id: commonWorkoutId },
      relations: {
        template: true,
        participants: {
          user: true,
          sets: true,
        },
        exercises: {
          exercise: true,
          participantSets: {
            participant: {
              user: true,
            },
          },
        },
      },
      order: {
        exercises: {
          order: 'ASC',
          participantSets: {
            setNumber: 'ASC',
          },
        },
        participants: {
          id: 'ASC',
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

  private async getCommonWorkoutSummaryEntityForUser(userId: number, commonWorkoutId: number) {
    const commonWorkout = await this.commonWorkoutRepository.findOne({
      where: { id: commonWorkoutId },
      relations: {
        template: true,
        participants: {
          user: true,
        },
        exercises: {
          exercise: true,
        },
      },
      order: {
        exercises: {
          order: 'ASC',
        },
        participants: {
          id: 'ASC',
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

    const exerciseIds = (commonWorkout.exercises || []).map((exercise) => exercise.id);
    const setsCountByExerciseId = await this.getSetsCountByExerciseId(exerciseIds);

    return {
      commonWorkout,
      setsCountByExerciseId,
    };
  }

  private async getCommonWorkoutStructureEntityForUser(userId: number, commonWorkoutId: number) {
    const commonWorkout = await this.commonWorkoutRepository.findOne({
      where: { id: commonWorkoutId },
      relations: {
        participants: true,
        exercises: {
          exercise: true,
        },
      },
      order: {
        exercises: {
          order: 'ASC',
        },
        participants: {
          id: 'ASC',
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

  private getCommonWorkoutExerciseFromWorkout(
    commonWorkout: CommonWorkout,
    commonWorkoutExerciseId: number,
  ) {
    const commonWorkoutExercise = (commonWorkout.exercises || []).find(
      (exercise) => exercise.id === commonWorkoutExerciseId,
    );

    if (!commonWorkoutExercise) {
      throw new NotFoundException('Common workout exercise not found');
    }

    return commonWorkoutExercise;
  }

  private async getActiveCommonWorkoutExerciseForUser(
    userId: number,
    commonWorkoutExerciseId: number,
  ) {
    const exercise = await this.commonWorkoutExerciseRepository.findOne({
      where: {
        id: commonWorkoutExerciseId,
        commonWorkout: {
          status: CommonWorkoutStatus.ACTIVE,
        },
      },
      relations: {
        exercise: true,
        commonWorkout: {
          participants: true,
        },
        participantSets: true,
      },
    });

    if (!exercise) {
      throw new NotFoundException('Common workout exercise not found');
    }

    const isParticipant = (exercise.commonWorkout?.participants || []).some(
      (participant) => participant.userId === userId,
    );

    if (!isParticipant) {
      throw new NotFoundException('Common workout exercise not found');
    }

    return exercise;
  }

  private async getCommonWorkoutExerciseEntityForUser(
    userId: number,
    commonWorkoutId: number,
    commonWorkoutExerciseId: number,
  ) {
    const exercise = await this.commonWorkoutExerciseRepository.findOne({
      where: {
        id: commonWorkoutExerciseId,
        commonWorkoutId,
      },
      relations: {
        exercise: true,
        commonWorkout: {
          participants: {
            user: true,
          },
        },
        participantSets: true,
      },
      order: {
        participantSets: {
          setNumber: 'ASC',
        },
      },
    });

    if (!exercise) {
      throw new NotFoundException('Common workout exercise not found');
    }

    const isParticipant = (exercise.commonWorkout?.participants || []).some(
      (participant) => participant.userId === userId,
    );

    if (!isParticipant) {
      throw new NotFoundException('Common workout exercise not found');
    }

    return exercise;
  }

  private async getParticipantSetForUser(userId: number, participantSetId: number) {
    const participantSet = await this.participantSetRepository.findOne({
      where: {
        id: participantSetId,
        participant: {
          userId,
          commonWorkout: {
            status: CommonWorkoutStatus.ACTIVE,
          },
        },
      },
      relations: {
        participant: {
          user: true,
          commonWorkout: true,
        },
        commonWorkoutExercise: {
          commonWorkout: true,
          exercise: true,
        },
      },
    });

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

    return previousWorkoutExercise?.sets?.find((set) => set.setNumber === setNumber) || null;
  }

  private async getPreviousSetsByUserIdForExercise(userIds: number[], exerciseId: number) {
    const uniqueUserIds = [...new Set(userIds)];
    const previousSets = await Promise.all(
      uniqueUserIds.map(async (userId) => {
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

        return [
          userId,
          new Map<number, WorkoutSet>(
            (previousWorkoutExercise?.sets || []).map((set) => [set.setNumber, set]),
          ),
        ] as const;
      }),
    );

    return new Map<number, Map<number, WorkoutSet>>(previousSets);
  }

  private async getAccessibleExerciseForUsers(userIds: number[], exerciseId: number) {
    const exercise = await this.exerciseRepository.findOne({ where: { id: exerciseId } });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    if (exercise.isGlobal) {
      return exercise;
    }

    if (userIds.every((userId) => exercise.createdByUserId === userId)) {
      return exercise;
    }

    throw new NotFoundException('Exercise not found');
  }

  private async getSetsCountByExerciseId(commonWorkoutExerciseIds: number[]) {
    if (commonWorkoutExerciseIds.length === 0) {
      return new Map<number, number>();
    }

    const rawCounts = await this.participantSetRepository
      .createQueryBuilder('participantSet')
      .select('participantSet.commonWorkoutExerciseId', 'commonWorkoutExerciseId')
      .addSelect('MAX(participantSet.setNumber)', 'setsCount')
      .where('participantSet.commonWorkoutExerciseId IN (:...ids)', {
        ids: commonWorkoutExerciseIds,
      })
      .groupBy('participantSet.commonWorkoutExerciseId')
      .getRawMany<{ commonWorkoutExerciseId: string; setsCount: string }>();

    return new Map<number, number>(
      rawCounts.map((entry) => [
        Number(entry.commonWorkoutExerciseId),
        Number(entry.setsCount) || 0,
      ]),
    );
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

  private mapCommonWorkoutSummary(summary: {
    commonWorkout: CommonWorkout;
    setsCountByExerciseId: Map<number, number>;
  }) {
    const { commonWorkout, setsCountByExerciseId } = summary;
    const durationSeconds = this.getDurationSeconds(
      commonWorkout.startedAt,
      commonWorkout.finishedAt,
    );

    const participantList = [...(commonWorkout.participants || [])];
    const participantSummaries = participantList.map((participant) => ({
      id: participant.id,
      user: {
        id: participant.user.id,
        email: participant.user.email,
        name: participant.user.name,
        avatarPath: participant.user.avatarPath ?? null,
        avatarUrl: participant.user.avatarPath ?? null,
      },
    }));
    const exercises = [...(commonWorkout.exercises || [])]
      .sort((a, b) => a.order - b.order)
      .map((exercise) => {
        return {
          id: exercise.id,
          order: exercise.order,
          exercise: exercise.exercise
            ? {
                id: exercise.exercise.id,
                name: exercise.exercise.name,
                description: exercise.exercise.description,
                muscleGroups: exercise.exercise.muscleGroups,
              }
            : null,
          setsCount: setsCountByExerciseId.get(exercise.id) ?? 0,
        };
      });

    return {
      id: commonWorkout.id,
      name: commonWorkout.name,
      status: commonWorkout.status,
      startedAt: commonWorkout.startedAt,
      finishedAt: commonWorkout.finishedAt,
      durationSeconds,
      durationLabel: this.getDurationLabel(durationSeconds),
      template: commonWorkout.template
        ? {
            id: commonWorkout.template.id,
            name: commonWorkout.template.name,
          }
        : null,
      participants: participantSummaries,
      exercises,
    };
  }

  private mapCommonWorkoutExerciseDetail(commonWorkoutExercise: CommonWorkoutExercise) {
    const participantList = [...(commonWorkoutExercise.commonWorkout?.participants || [])];
    const participantSummaries = participantList.map((participant) => ({
      id: participant.id,
      user: {
        id: participant.user.id,
        email: participant.user.email,
        name: participant.user.name,
        avatarPath: participant.user.avatarPath ?? null,
        avatarUrl: participant.user.avatarPath ?? null,
      },
    }));

    const setsByParticipantId = new Map<number, CommonWorkoutParticipantSet[]>();
    for (const set of commonWorkoutExercise.participantSets || []) {
      const items = setsByParticipantId.get(set.participantId) || [];
      items.push(set);
      setsByParticipantId.set(set.participantId, items);
    }

    return {
      id: commonWorkoutExercise.id,
      order: commonWorkoutExercise.order,
      exercise: commonWorkoutExercise.exercise
        ? {
            id: commonWorkoutExercise.exercise.id,
            name: commonWorkoutExercise.exercise.name,
            description: commonWorkoutExercise.exercise.description,
            muscleGroups: commonWorkoutExercise.exercise.muscleGroups,
          }
        : null,
      setsCount:
        Math.max(0, ...Array.from(setsByParticipantId.values()).map((sets) => sets.length)) || 0,
      participants: participantSummaries.map((participant) => ({
        participantId: participant.id,
        user: participant.user,
        sets: (setsByParticipantId.get(participant.id) || [])
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
      })),
    };
  }
}
