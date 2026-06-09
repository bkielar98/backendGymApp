import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Friendship, FriendshipStatus } from "../entities/friendship.entity";
import { User } from "../entities/user.entity";
import { UserBodyMeasurementEntry } from "../entities/user-body-measurement-entry.entity";
import { UserWeightEntry } from "../entities/user-weight-entry.entity";
import { Workout, WorkoutStatus } from "../entities/workout.entity";
import { WorkoutExercise } from "../entities/workout-exercise.entity";
import { WorkoutSet } from "../entities/workout-set.entity";
import {
  CommonWorkout,
  CommonWorkoutStatus,
} from "../entities/common-workout.entity";
import { CommonWorkoutParticipant } from "../entities/common-workout-participant.entity";
import { CommonWorkoutsService } from "../common-workouts/common-workouts.service";
import { CreateFriendRequestDto } from "./dto/create-friend-request.dto";

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserWeightEntry)
    private weightEntryRepository: Repository<UserWeightEntry>,
    @InjectRepository(UserBodyMeasurementEntry)
    private bodyMeasurementEntryRepository: Repository<UserBodyMeasurementEntry>,
    @InjectRepository(Workout)
    private workoutRepository: Repository<Workout>,
    @InjectRepository(CommonWorkoutParticipant)
    private commonWorkoutParticipantRepository: Repository<CommonWorkoutParticipant>,
    private commonWorkoutsService: CommonWorkoutsService,
  ) {}

  async listFriends(userId: number) {
    const rows = await this.friendshipRepository.find({
      where: [
        { requesterUserId: userId, status: FriendshipStatus.ACCEPTED },
        { receiverUserId: userId, status: FriendshipStatus.ACCEPTED },
      ],
      relations: {
        requesterUser: true,
        receiverUser: true,
      },
      order: {
        updatedAt: "DESC",
      },
    });

    const friendUsers = rows.map((row) =>
      row.requesterUserId === userId ? row.receiverUser : row.requesterUser,
    );
    const activeWorkoutByFriendId =
      await this.getVisibleActiveWorkoutSummariesForFriends(friendUsers);

    return rows.map((row) => {
      const friend =
        row.requesterUserId === userId ? row.receiverUser : row.requesterUser;

      return {
        friendshipId: row.id,
        user: this.mapUser(friend),
        friendsSince: row.respondedAt,
        createdAt: row.createdAt,
        activeWorkout: activeWorkoutByFriendId.get(friend.id) ?? null,
      };
    });
  }

  async listIncomingRequests(userId: number) {
    const rows = await this.friendshipRepository.find({
      where: {
        receiverUserId: userId,
        status: FriendshipStatus.PENDING,
      },
      relations: {
        requesterUser: true,
      },
      order: {
        createdAt: "DESC",
      },
    });

    return rows.map((row) => ({
      id: row.id,
      status: row.status,
      createdAt: row.createdAt,
      user: this.mapUser(row.requesterUser),
    }));
  }

  async listOutgoingRequests(userId: number) {
    const rows = await this.friendshipRepository.find({
      where: {
        requesterUserId: userId,
        status: FriendshipStatus.PENDING,
      },
      relations: {
        receiverUser: true,
      },
      order: {
        createdAt: "DESC",
      },
    });

    return rows.map((row) => ({
      id: row.id,
      status: row.status,
      createdAt: row.createdAt,
      user: this.mapUser(row.receiverUser),
    }));
  }

  async createRequest(userId: number, dto: CreateFriendRequestDto) {
    if (userId === dto.targetUserId) {
      throw new BadRequestException(
        "You cannot send a friend request to yourself",
      );
    }

    const targetUser = await this.userRepository.findOne({
      where: { id: dto.targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException("User not found");
    }

    const existing = await this.friendshipRepository.findOne({
      where: [
        {
          requesterUserId: userId,
          receiverUserId: dto.targetUserId,
        },
        {
          requesterUserId: dto.targetUserId,
          receiverUserId: userId,
        },
      ],
      order: {
        createdAt: "DESC",
      },
    });

    if (existing?.status === FriendshipStatus.PENDING) {
      throw new BadRequestException("Friend request already exists");
    }

    if (existing?.status === FriendshipStatus.ACCEPTED) {
      throw new BadRequestException("Users are already friends");
    }

    const request = this.friendshipRepository.create({
      requesterUserId: userId,
      receiverUserId: dto.targetUserId,
      status: FriendshipStatus.PENDING,
      respondedAt: null,
    });

    const saved = await this.friendshipRepository.save(request);

    return {
      id: saved.id,
      status: saved.status,
      createdAt: saved.createdAt,
      user: this.mapUser(targetUser),
    };
  }

  async getFriendProfile(userId: number, friendUserId: number) {
    const friend = await this.getAcceptedFriendOrThrow(userId, friendUserId);
    const canShowHistory = !friend.hideWorkoutHistory;
    const [weightEntries, latestBodyMeasurement, workouts] = await Promise.all([
      this.weightEntryRepository.find({
        where: { user: { id: friendUserId } },
        order: { recordedOn: "DESC", id: "DESC" },
      }),
      this.bodyMeasurementEntryRepository.findOne({
        where: { user: { id: friendUserId } },
        order: { recordedOn: "DESC", id: "DESC" },
      }),
      canShowHistory
        ? this.workoutRepository.find({
            where: {
              userId: friendUserId,
              status: WorkoutStatus.COMPLETED,
            },
            relations: {
              exercises: {
                exercise: true,
                sets: true,
              },
            },
            order: { startedAt: "DESC" },
          })
        : Promise.resolve([]),
    ]);

    const latestWeight = weightEntries[0]?.weight ?? friend.weight ?? null;

    return {
      user: this.mapUser(friend),
      currentWeight: latestWeight,
      weightHistory: weightEntries.map((entry) => ({
        id: entry.id,
        recordedOn: entry.recordedOn,
        weight: entry.weight,
      })),
      bodyMeasurement: latestBodyMeasurement
        ? this.mapBodyMeasurement(latestBodyMeasurement)
        : null,
      workoutStats: this.mapWorkoutStats(workouts),
      recentWorkouts: workouts
        .slice(0, 5)
        .map((workout) => this.mapWorkoutSummary(workout)),
    };
  }

  async getFriendWorkoutHistory(
    userId: number,
    friendUserId: number,
    page?: number,
    limit?: number,
  ) {
    const friend = await this.getAcceptedFriendOrThrow(userId, friendUserId);
    if (friend.hideWorkoutHistory) {
      return {
        workouts: [],
        total: 0,
        page: Number.isFinite(page) && page && page > 0 ? page : 1,
        limit: Math.min(
          Number.isFinite(limit) && limit && limit > 0 ? limit : 20,
          100,
        ),
      };
    }

    const normalizedPage = Number.isFinite(page) && page && page > 0 ? page : 1;
    const normalizedLimit = Math.min(
      Number.isFinite(limit) && limit && limit > 0 ? limit : 20,
      100,
    );

    const [workouts, total] = await this.workoutRepository.findAndCount({
      where: {
        userId: friendUserId,
        status: WorkoutStatus.COMPLETED,
      },
      relations: {
        template: true,
        exercises: {
          exercise: true,
          sets: true,
        },
      },
      order: { startedAt: "DESC" },
      skip: (normalizedPage - 1) * normalizedLimit,
      take: normalizedLimit,
    });

    return {
      workouts: workouts.map((workout) => this.mapWorkoutSummary(workout)),
      total,
      page: normalizedPage,
      limit: normalizedLimit,
    };
  }

  async getFriendWorkout(
    userId: number,
    friendUserId: number,
    workoutId: number,
  ) {
    const friend = await this.getAcceptedFriendOrThrow(userId, friendUserId);
    const activeParticipant =
      await this.getFriendActiveCommonWorkoutParticipant(
        friendUserId,
        workoutId,
      );

    if (activeParticipant) {
      if (friend.hideActiveWorkout) {
        throw new NotFoundException("Workout not found");
      }

      return this.markReadOnly(
        await this.commonWorkoutsService.getIndexForUser(
          friendUserId,
          workoutId,
        ),
      );
    }

    if (friend.hideWorkoutHistory) {
      throw new NotFoundException("Workout not found");
    }

    const workout = await this.workoutRepository.findOne({
      where: {
        id: workoutId,
        userId: friendUserId,
        status: WorkoutStatus.COMPLETED,
      },
      relations: {
        template: true,
        exercises: {
          exercise: true,
          sets: true,
        },
      },
      order: {
        exercises: {
          order: "ASC",
          sets: {
            setNumber: "ASC",
          },
        },
      },
    });

    if (!workout) {
      throw new NotFoundException("Workout not found");
    }

    return {
      ...this.mapWorkoutSummary(workout),
      exercises: [...(workout.exercises || [])]
        .sort((left, right) => left.order - right.order)
        .map((exercise) => this.mapWorkoutExercise(exercise)),
    };
  }

  async getFriendWorkoutBlock(
    userId: number,
    friendUserId: number,
    workoutId: number,
    blockId: number,
  ) {
    const friend = await this.getAcceptedFriendOrThrow(userId, friendUserId);
    const activeParticipant =
      await this.getFriendActiveCommonWorkoutParticipant(
        friendUserId,
        workoutId,
      );

    if (!activeParticipant || friend.hideActiveWorkout) {
      throw new NotFoundException("Workout block not found");
    }

    return this.markReadOnly(
      await this.commonWorkoutsService.getBlockForUser(
        friendUserId,
        workoutId,
        blockId,
      ),
    );
  }

  async acceptRequest(userId: number, requestId: number) {
    const request = await this.friendshipRepository.findOne({
      where: {
        id: requestId,
        receiverUserId: userId,
        status: FriendshipStatus.PENDING,
      },
      relations: {
        requesterUser: true,
        receiverUser: true,
      },
    });

    if (!request) {
      throw new NotFoundException("Friend request not found");
    }

    request.status = FriendshipStatus.ACCEPTED;
    request.respondedAt = new Date();
    await this.friendshipRepository.save(request);

    return {
      id: request.id,
      status: request.status,
      respondedAt: request.respondedAt,
      users: [
        this.mapUser(request.requesterUser),
        this.mapUser(request.receiverUser),
      ],
    };
  }

  async rejectRequest(userId: number, requestId: number) {
    const request = await this.friendshipRepository.findOne({
      where: {
        id: requestId,
        receiverUserId: userId,
        status: FriendshipStatus.PENDING,
      },
    });

    if (!request) {
      throw new NotFoundException("Friend request not found");
    }

    request.status = FriendshipStatus.REJECTED;
    request.respondedAt = new Date();
    await this.friendshipRepository.save(request);

    return {
      success: true,
      message: "Friend request rejected",
      id: request.id,
      status: request.status,
    };
  }

  async cancelRequest(userId: number, requestId: number) {
    const request = await this.friendshipRepository.findOne({
      where: {
        id: requestId,
        requesterUserId: userId,
        status: FriendshipStatus.PENDING,
      },
    });

    if (!request) {
      throw new NotFoundException("Friend request not found");
    }

    await this.friendshipRepository.delete(request.id);

    return {
      success: true,
      message: "Friend request canceled",
      id: request.id,
    };
  }

  async removeFriend(userId: number, friendUserId: number) {
    const friendship = await this.friendshipRepository.findOne({
      where: [
        {
          requesterUserId: userId,
          receiverUserId: friendUserId,
          status: FriendshipStatus.ACCEPTED,
        },
        {
          requesterUserId: friendUserId,
          receiverUserId: userId,
          status: FriendshipStatus.ACCEPTED,
        },
      ],
    });

    if (!friendship) {
      throw new NotFoundException("Friendship not found");
    }

    await this.friendshipRepository.delete(friendship.id);

    return {
      success: true,
      message: "Friend removed",
      id: friendship.id,
      friendUserId,
    };
  }

  private mapUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarPath: user.avatarPath ?? null,
      avatarUrl: user.avatarPath ?? null,
    };
  }

  private async getVisibleActiveWorkoutSummariesForFriends(friends: User[]) {
    const visibleFriendIds = friends
      .filter((friend) => !friend.hideActiveWorkout)
      .map((friend) => friend.id);
    const activeWorkoutByFriendId = new Map<number, unknown>();

    if (visibleFriendIds.length === 0) {
      return activeWorkoutByFriendId;
    }

    const participants = await this.commonWorkoutParticipantRepository.find({
      where: {
        userId: In(visibleFriendIds),
        commonWorkout: {
          status: CommonWorkoutStatus.ACTIVE,
        },
      },
      relations: {
        commonWorkout: {
          template: true,
          participants: true,
          blocks: {
            defaultExercise: true,
          },
          exercises: {
            exercise: true,
            participantSets: true,
          },
        },
      },
      order: {
        commonWorkout: {
          startedAt: "DESC",
        },
      },
    });

    for (const participant of participants) {
      if (activeWorkoutByFriendId.has(participant.userId)) {
        continue;
      }

      activeWorkoutByFriendId.set(
        participant.userId,
        this.mapActiveCommonWorkoutSummary(participant.commonWorkout),
      );
    }

    return activeWorkoutByFriendId;
  }

  private async getFriendActiveCommonWorkoutParticipant(
    friendUserId: number,
    workoutId: number,
  ) {
    return this.commonWorkoutParticipantRepository.findOne({
      where: {
        userId: friendUserId,
        commonWorkoutId: workoutId,
        commonWorkout: {
          status: CommonWorkoutStatus.ACTIVE,
        },
      },
      relations: {
        commonWorkout: true,
      },
    });
  }

  private async getAcceptedFriendOrThrow(userId: number, friendUserId: number) {
    const friendship = await this.friendshipRepository.findOne({
      where: [
        {
          requesterUserId: userId,
          receiverUserId: friendUserId,
          status: FriendshipStatus.ACCEPTED,
        },
        {
          requesterUserId: friendUserId,
          receiverUserId: userId,
          status: FriendshipStatus.ACCEPTED,
        },
      ],
      relations: {
        requesterUser: true,
        receiverUser: true,
      },
    });

    if (!friendship) {
      throw new NotFoundException("Friendship not found");
    }

    return friendship.requesterUserId === userId
      ? friendship.receiverUser
      : friendship.requesterUser;
  }

  private mapBodyMeasurement(entry: UserBodyMeasurementEntry) {
    return {
      id: entry.id,
      recordedOn: entry.recordedOn,
      neck: entry.neck,
      shoulders: entry.shoulders,
      chest: entry.chest,
      leftBiceps: entry.leftBiceps,
      rightBiceps: entry.rightBiceps,
      leftForearm: entry.leftForearm,
      rightForearm: entry.rightForearm,
      upperAbs: entry.upperAbs,
      waist: entry.waist,
      lowerAbs: entry.lowerAbs,
      hips: entry.hips,
      leftThigh: entry.leftThigh,
      rightThigh: entry.rightThigh,
      leftCalf: entry.leftCalf,
      rightCalf: entry.rightCalf,
    };
  }

  private mapWorkoutSummary(workout: Workout) {
    const exercises = [...(workout.exercises || [])].sort(
      (left, right) => left.order - right.order,
    );
    const sets = exercises.flatMap((exercise) => exercise.sets || []);
    const performance = this.summarizeSets(sets);

    return {
      id: workout.id,
      name: workout.name,
      status: workout.status,
      startedAt: workout.startedAt,
      finishedAt: workout.finishedAt,
      exerciseCount: exercises.length,
      totalSets: sets.length,
      confirmedSets: sets.filter((set) => set.confirmed).length,
      totalWeight: performance.totalWeight,
      totalReps: performance.totalReps,
      totalVolume: performance.totalVolume,
      liftedWeight: performance.totalVolume,
      bestSet: performance.bestSet,
      exerciseNames: exercises
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

  private mapActiveCommonWorkoutSummary(workout: CommonWorkout) {
    const durationSeconds = this.getDurationSeconds(workout.startedAt, null);
    const exercises = workout.exercises || [];
    const sets = exercises.flatMap(
      (exercise) => exercise.participantSets || [],
    );

    return {
      id: workout.id,
      name: workout.name,
      status: workout.status,
      mode: (workout.participants || []).length <= 1 ? "solo" : "group",
      isSolo: (workout.participants || []).length <= 1,
      participantCount: (workout.participants || []).length,
      startedAt: workout.startedAt,
      finishedAt: workout.finishedAt,
      durationSeconds,
      durationLabel: this.getDurationLabel(durationSeconds),
      blockCount: (workout.blocks || []).length,
      exerciseCount: exercises.length,
      totalSets: sets.length,
      confirmedSets: sets.filter((set) => set.confirmed).length,
      exerciseNames: exercises
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

  private mapWorkoutExercise(workoutExercise: WorkoutExercise) {
    const sets = [...(workoutExercise.sets || [])].sort(
      (left, right) => left.setNumber - right.setNumber,
    );

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
      sets: sets.map((set) => ({
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

  private mapWorkoutStats(workouts: Workout[]) {
    const exercises = workouts.flatMap((workout) => workout.exercises || []);
    const sets = exercises.flatMap((exercise) => exercise.sets || []);
    const performance = this.summarizeSets(sets);

    return {
      workoutsCount: workouts.length,
      exerciseCount: exercises.length,
      totalSets: sets.length,
      confirmedSets: sets.filter((set) => set.confirmed).length,
      totalWeight: performance.totalWeight,
      totalReps: performance.totalReps,
      totalVolume: performance.totalVolume,
      liftedWeight: performance.totalVolume,
      bestSet: performance.bestSet,
    };
  }

  private summarizeSets(sets: WorkoutSet[]) {
    const confirmedSets = sets.filter((set) => set.confirmed);
    const totalWeight = confirmedSets.reduce(
      (sum, set) =>
        sum + (typeof set.currentWeight === "number" ? set.currentWeight : 0),
      0,
    );
    const totalReps = confirmedSets.reduce(
      (sum, set) =>
        sum + (typeof set.currentReps === "number" ? set.currentReps : 0),
      0,
    );
    const totalVolume = confirmedSets.reduce(
      (sum, set) =>
        sum +
        (typeof set.currentWeight === "number" &&
        typeof set.currentReps === "number"
          ? set.currentWeight * set.currentReps
          : 0),
      0,
    );
    const bestSet = [...confirmedSets]
      .filter(
        (set) =>
          typeof set.currentWeight === "number" &&
          typeof set.currentReps === "number" &&
          typeof set.repMax === "number",
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
      totalWeight,
      totalReps,
      totalVolume,
      bestSet: bestSet
        ? {
            id: bestSet.id,
            setNumber: bestSet.setNumber,
            weight: bestSet.currentWeight,
            reps: bestSet.currentReps,
            repMax: bestSet.repMax,
          }
        : null,
    };
  }

  private markReadOnly<T>(payload: T): T {
    if (Array.isArray(payload)) {
      return payload.map((item) => this.markReadOnly(item)) as T;
    }

    if (!payload || typeof payload !== "object") {
      return payload;
    }

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(payload)) {
      result[key] = this.markReadOnly(value);
    }

    if ("availableActions" in result) {
      result.availableActions = {
        changeExercise: false,
        addSet: false,
        updateOwnSets: false,
        removeOwnSets: false,
      };
    }

    return result as T;
  }
}
