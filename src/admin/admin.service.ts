import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { Workout, WorkoutStatus } from '../entities/workout.entity';
import {
  CommonWorkout,
  CommonWorkoutStatus,
} from '../entities/common-workout.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { WorkoutSet } from '../entities/workout-set.entity';
import { Exercise } from '../entities/exercise.entity';
import { CommonWorkoutsService } from '../common-workouts/common-workouts.service';
import { UsersService } from '../users/users.service';
import { AdminListUsersQueryDto } from './dto/admin-list-users-query.dto';
import { AdminUpdateUserRoleDto } from './dto/admin-update-user-role.dto';
import { AdminUpdateUserStatusDto } from './dto/admin-update-user-status.dto';
import { AdminListUserWorkoutsQueryDto } from './dto/admin-list-user-workouts-query.dto';
import { AdminResetUserPasswordDto } from './dto/admin-reset-user-password.dto';
import { AdminExerciseStatsQueryDto } from './dto/admin-exercise-stats-query.dto';

@Injectable()
export class AdminService {
  private readonly defaultPage = 1;
  private readonly defaultLimit = 20;
  private readonly maxLimit = 100;
  private readonly warsawTimeZone = 'Europe/Warsaw';
  private readonly profanityWords = [
    'chuj',
    'chuja',
    'chujem',
    'chujowy',
    'chujowa',
    'chujowe',
    'cipa',
    'cipe',
    'cipy',
    'dupa',
    'dupe',
    'dupy',
    'dziwka',
    'dziwko',
    'dziwki',
    'huj',
    'hujowy',
    'jebac',
    'jebany',
    'jebana',
    'jebane',
    'kurwa',
    'kurwo',
    'kurwy',
    'pierdolic',
    'pierdolony',
    'pierdolona',
    'pierdolone',
    'spierdalaj',
    'suka',
    'suko',
    'sukinsyn',
    'fuck',
    'fucking',
    'shit',
    'bitch',
    'asshole',
  ];

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workout)
    private readonly workoutRepository: Repository<Workout>,
    @InjectRepository(CommonWorkout)
    private readonly commonWorkoutRepository: Repository<CommonWorkout>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
    private readonly commonWorkoutsService: CommonWorkoutsService,
    private readonly usersService: UsersService,
  ) {}

  async listUsers(query: AdminListUsersQueryDto) {
    const page = this.normalizePage(query.page);
    const limit = this.normalizeLimit(query.limit);
    const search = query.search?.trim().toLowerCase();
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';

    const builder = this.userRepository.createQueryBuilder('user');

    if (search) {
      builder.where(
        '(LOWER(user.name) LIKE :search OR LOWER(user.email) LIKE :search)',
        { search: `%${search}%` },
      );
    }

    builder
      .orderBy(`user.${sortBy}`, sortOrder)
      .addOrderBy('user.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await builder.getManyAndCount();

    return {
      users: users.map((user) => this.mapAdminUser(user)),
      total,
      page,
      limit,
    };
  }

  async getUserById(userId: number) {
    const user = await this.findUserOrThrow(userId);
    return this.mapAdminUser(user);
  }

  async updateUserAvatar(userId: number, file: { filename: string }) {
    await this.usersService.updateAvatar(userId, file);
    return this.getUserById(userId);
  }

  async updateUserRole(
    actingUserId: number,
    userId: number,
    dto: AdminUpdateUserRoleDto,
  ) {
    await this.findUserOrThrow(userId);

    if (actingUserId === userId && dto.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin cannot remove their own admin role');
    }

    await this.userRepository.update(userId, {
      role: dto.role,
    });

    return this.getUserById(userId);
  }

  async updateUserStatus(
    actingUserId: number,
    userId: number,
    dto: AdminUpdateUserStatusDto,
  ) {
    const user = await this.findUserOrThrow(userId);

    if (
      actingUserId === userId &&
      user.role === UserRole.ADMIN &&
      !dto.isActive
    ) {
      throw new ForbiddenException('Admin cannot deactivate their own account');
    }

    await this.userRepository.update(userId, {
      isActive: dto.isActive,
      ...(dto.isActive ? {} : { refreshTokenHash: null }),
    });

    return this.getUserById(userId);
  }

  async resetUserPassword(userId: number, dto: AdminResetUserPasswordDto) {
    await this.findUserOrThrow(userId);
    const password = await bcrypt.hash(dto.password, 10);

    await this.userRepository.update(userId, {
      password,
      refreshTokenHash: null,
    });

    return {
      success: true,
      id: userId,
    };
  }

  async softDeleteUser(actingUserId: number, userId: number) {
    const user = await this.findUserOrThrow(userId);

    if (actingUserId === userId && user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Admin cannot deactivate their own account');
    }

    await this.userRepository.update(userId, {
      isActive: false,
      refreshTokenHash: null,
    });

    return {
      success: true,
      id: userId,
      isActive: false,
    };
  }

  async getStats() {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const monthRange = this.getCurrentWarsawMonthRange();

    const [
      totalUsers,
      activeUsersLast30Days,
      totalExercises,
      totalWorkouts,
      newUsersThisMonth,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({
        where: {
          isActive: true,
          lastLoginAt: MoreThanOrEqual(last30Days),
        },
      }),
      this.exerciseRepository.count(),
      this.workoutRepository.count({
        where: {
          status: WorkoutStatus.COMPLETED,
        },
      }),
      this.userRepository
        .createQueryBuilder('user')
        .where('user.createdAt >= :start AND user.createdAt < :end', {
          start: monthRange.start,
          end: monthRange.end,
        })
        .getCount(),
    ]);

    return {
      totalUsers,
      activeUsersLast30Days,
      totalExercises,
      totalWorkouts,
      newUsersThisMonth,
    };
  }

  async listUserWorkouts(userId: number, query: AdminListUserWorkoutsQueryDto) {
    await this.findUserOrThrow(userId);
    const page = this.normalizePage(query.page);
    const limit = this.normalizeLimit(query.limit);

    const [workouts, total] = await this.workoutRepository.findAndCount({
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
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      workouts: workouts.map((workout) => this.mapWorkoutSummary(workout)),
      total,
      page,
      limit,
    };
  }

  async listActiveWorkouts(query: AdminListUserWorkoutsQueryDto) {
    const page = this.normalizePage(query.page);
    const limit = this.normalizeLimit(query.limit);
    const offset = (page - 1) * limit;

    const [soloWorkouts, soloTotal, commonWorkouts, commonTotal] =
      await Promise.all([
        this.workoutRepository.find({
          where: {
            status: WorkoutStatus.ACTIVE,
          },
          order: { startedAt: 'DESC' },
          relations: {
            user: true,
            template: true,
            exercises: {
              exercise: true,
              sets: true,
            },
          },
        }),
        this.workoutRepository.count({
          where: {
            status: WorkoutStatus.ACTIVE,
          },
        }),
        this.commonWorkoutRepository.find({
          where: {
            status: CommonWorkoutStatus.ACTIVE,
          },
          order: { startedAt: 'DESC' },
          relations: {
            createdByUser: true,
            template: true,
            participants: {
              user: true,
            },
            exercises: {
              exercise: true,
              participantSets: true,
            },
          },
        }),
        this.commonWorkoutRepository.count({
          where: {
            status: CommonWorkoutStatus.ACTIVE,
          },
        }),
      ]);

    const workouts = [
      ...soloWorkouts.map((workout) => ({
        ...this.mapWorkoutSummary(workout),
        source: 'solo' as const,
        user: this.mapWorkoutUser(workout.user),
      })),
      ...commonWorkouts.map((workout) => this.mapCommonWorkoutSummary(workout)),
    ]
      .sort(
        (left, right) =>
          new Date(right.startedAt).getTime() -
          new Date(left.startedAt).getTime(),
      )
      .slice(offset, offset + limit);

    return {
      workouts,
      total: soloTotal + commonTotal,
      page,
      limit,
    };
  }

  async finishActiveWorkout(workoutId: number) {
    const workout = await this.workoutRepository.findOne({
      where: {
        id: workoutId,
        status: WorkoutStatus.ACTIVE,
      },
    });

    if (!workout) {
      throw new NotFoundException('Active workout not found');
    }

    workout.status = WorkoutStatus.COMPLETED;
    workout.finishedAt = new Date();
    await this.workoutRepository.save(workout);

    const completedWorkout = await this.workoutRepository.findOne({
      where: { id: workout.id },
      relations: {
        user: true,
        template: true,
        exercises: {
          exercise: true,
          sets: true,
        },
      },
    });

    return {
      success: true,
      workout: completedWorkout
        ? {
            ...this.mapWorkoutSummary(completedWorkout),
            source: 'solo',
            user: this.mapWorkoutUser(completedWorkout.user),
          }
        : {
            id: workout.id,
            source: 'solo',
            status: workout.status,
            finishedAt: workout.finishedAt,
          },
    };
  }

  async finishActiveCommonWorkout(commonWorkoutId: number) {
    const commonWorkout = await this.commonWorkoutRepository.findOne({
      where: {
        id: commonWorkoutId,
        status: CommonWorkoutStatus.ACTIVE,
      },
    });

    if (!commonWorkout) {
      throw new NotFoundException('Active common workout not found');
    }

    const workout = await this.commonWorkoutsService.finish(
      commonWorkout.createdByUserId,
      commonWorkout.id,
    );

    return {
      success: true,
      workout,
    };
  }

  async getExerciseStats(query: AdminExerciseStatsQueryDto) {
    const limit = this.normalizeLimit(query.limit);
    const rows = await this.exerciseRepository
      .createQueryBuilder('exercise')
      .innerJoin(
        WorkoutExercise,
        'workoutExercise',
        'workoutExercise.exerciseId = exercise.id',
      )
      .innerJoin(
        Workout,
        'workout',
        'workout.id = workoutExercise.workoutId AND workout.status = :status',
        { status: WorkoutStatus.COMPLETED },
      )
      .leftJoin(
        WorkoutSet,
        'workoutSet',
        'workoutSet.workoutExerciseId = workoutExercise.id AND workoutSet.confirmed = :confirmed',
        { confirmed: true },
      )
      .select('exercise.id', 'exerciseId')
      .addSelect('exercise.name', 'exerciseName')
      .addSelect('COUNT(DISTINCT workoutExercise.id)', 'workoutsCount')
      .addSelect('COUNT(workoutSet.id)', 'setsCount')
      .addSelect('AVG(workoutSet.currentWeight)', 'averageWeight')
      .addSelect('AVG(workoutSet.currentReps)', 'averageReps')
      .groupBy('exercise.id')
      .addGroupBy('exercise.name')
      .orderBy('COUNT(DISTINCT workoutExercise.id)', 'DESC')
      .addOrderBy('COUNT(workoutSet.id)', 'DESC')
      .addOrderBy('exercise.name', 'ASC')
      .limit(limit)
      .getRawMany<{
        exerciseId: string;
        exerciseName: string;
        workoutsCount: string;
        setsCount: string;
        averageWeight: string | null;
        averageReps: string | null;
      }>();

    return {
      exercises: rows.map((row) => ({
        exercise: {
          id: Number(row.exerciseId),
          name: row.exerciseName,
        },
        workoutsCount: Number(row.workoutsCount),
        setsCount: Number(row.setsCount),
        averageWeight: this.roundNullable(row.averageWeight),
        averageReps: this.roundNullable(row.averageReps),
      })),
      limit,
    };
  }

  async listProfaneExercises() {
    const exercises = await this.exerciseRepository.find({
      relations: {
        createdByUser: true,
      },
      order: {
        name: 'ASC',
      },
    });

    const flaggedExercises = exercises
      .map((exercise) => this.mapProfaneExercise(exercise))
      .filter((exercise): exercise is NonNullable<typeof exercise> =>
        Boolean(exercise),
      );

    return {
      exercises: flaggedExercises,
      total: flaggedExercises.length,
    };
  }

  private async findUserOrThrow(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private normalizePage(page?: number) {
    return typeof page === 'number' && page > 0 ? page : this.defaultPage;
  }

  private normalizeLimit(limit?: number) {
    if (typeof limit !== 'number' || limit <= 0) {
      return this.defaultLimit;
    }

    return Math.min(limit, this.maxLimit);
  }

  private mapAdminUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarPath: user.avatarPath ?? null,
      avatarUrl: user.avatarPath ?? null,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt ?? null,
      isActive: user.isActive,
    };
  }

  private mapWorkoutSummary(workout: Workout) {
    const orderedExercises = [...(workout.exercises || [])].sort(
      (a, b) => a.order - b.order,
    );
    const durationSeconds = this.getDurationSeconds(
      workout.startedAt,
      workout.finishedAt,
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

  private mapWorkoutUser(user?: User | null) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarPath: user.avatarPath ?? null,
      avatarUrl: user.avatarPath ?? null,
      role: user.role,
      isActive: user.isActive,
    };
  }

  private mapCommonWorkoutSummary(workout: CommonWorkout) {
    const exercises = workout.exercises || [];
    const sets = exercises.flatMap(
      (exercise) => exercise.participantSets || [],
    );
    const participants = workout.participants || [];
    const durationSeconds = this.getDurationSeconds(
      workout.startedAt,
      workout.finishedAt,
    );

    return {
      id: workout.id,
      name: workout.name,
      status: workout.status,
      source: 'common' as const,
      mode: 'common',
      isSolo: false,
      participantCount: participants.length,
      startedAt: workout.startedAt,
      finishedAt: workout.finishedAt,
      durationSeconds,
      durationLabel: this.getDurationLabel(durationSeconds),
      exerciseCount: exercises.length,
      totalSets: sets.length,
      confirmedSets: sets.filter((set) => set.confirmed).length,
      exerciseNames: Array.from(
        new Set(
          exercises
            .map((exercise) => exercise.exercise?.name)
            .filter((name): name is string => Boolean(name)),
        ),
      ),
      template: workout.template
        ? {
            id: workout.template.id,
            name: workout.template.name,
          }
        : null,
      createdByUser: this.mapWorkoutUser(workout.createdByUser),
      participants: participants.map((participant) =>
        this.mapWorkoutUser(participant.user),
      ),
    };
  }

  private roundNullable(value: string | number | null) {
    if (value === null) {
      return null;
    }

    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      return null;
    }

    return Math.round(numberValue * 100) / 100;
  }

  private mapProfaneExercise(exercise: Exercise) {
    const fields = [
      { name: 'name', value: exercise.name },
      { name: 'description', value: exercise.description ?? '' },
    ];
    const matches = fields.flatMap((field) =>
      this.findProfanityMatches(field.value).map((word) => ({
        field: field.name,
        word,
      })),
    );

    if (matches.length === 0) {
      return null;
    }

    return {
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      isGlobal: exercise.isGlobal,
      createdByUserId: exercise.createdByUserId,
      createdByUser: exercise.createdByUser
        ? this.mapWorkoutUser(exercise.createdByUser)
        : null,
      matches,
      matchedWords: Array.from(new Set(matches.map((match) => match.word))),
    };
  }

  private findProfanityMatches(value: string) {
    const normalized = value.toLowerCase();

    return this.profanityWords.filter((word) => {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(
        `(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`,
        'iu',
      ).test(normalized);
    });
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

  private getCurrentWarsawMonthRange(now = new Date()) {
    const currentParts = this.getTimeZoneParts(now, this.warsawTimeZone);
    const nextMonth =
      currentParts.month === 12
        ? { year: currentParts.year + 1, month: 1 }
        : { year: currentParts.year, month: currentParts.month + 1 };

    return {
      start: this.zonedDateToUtc(
        this.warsawTimeZone,
        currentParts.year,
        currentParts.month,
        1,
      ),
      end: this.zonedDateToUtc(
        this.warsawTimeZone,
        nextMonth.year,
        nextMonth.month,
        1,
      ),
    };
  }

  private zonedDateToUtc(
    timeZone: string,
    year: number,
    month: number,
    day: number,
    hour = 0,
    minute = 0,
    second = 0,
  ) {
    const utcGuess = new Date(
      Date.UTC(year, month - 1, day, hour, minute, second),
    );
    const offset = this.getTimeZoneOffsetMs(utcGuess, timeZone);

    return new Date(
      Date.UTC(year, month - 1, day, hour, minute, second) - offset,
    );
  }

  private getTimeZoneOffsetMs(date: Date, timeZone: string) {
    const parts = this.getTimeZoneParts(date, timeZone);
    const asUtcTimestamp = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );

    return asUtcTimestamp - date.getTime();
  }

  private getTimeZoneParts(date: Date, timeZone: string) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });

    const values = formatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .reduce(
        (parts, part) => {
          parts[part.type] = Number(part.value);
          return parts;
        },
        {} as Record<string, number>,
      );

    return {
      year: values.year,
      month: values.month,
      day: values.day,
      hour: values.hour,
      minute: values.minute,
      second: values.second,
    };
  }
}
