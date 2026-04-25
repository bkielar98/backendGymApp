import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Workout, WorkoutStatus } from '../entities/workout.entity';
import { Exercise } from '../entities/exercise.entity';
import { UsersService } from '../users/users.service';
import { AdminListUsersQueryDto } from './dto/admin-list-users-query.dto';
import { AdminUpdateUserRoleDto } from './dto/admin-update-user-role.dto';
import { AdminUpdateUserStatusDto } from './dto/admin-update-user-status.dto';
import { AdminListUserWorkoutsQueryDto } from './dto/admin-list-user-workouts-query.dto';

@Injectable()
export class AdminService {
  private readonly defaultPage = 1;
  private readonly defaultLimit = 20;
  private readonly maxLimit = 100;
  private readonly warsawTimeZone = 'Europe/Warsaw';

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workout)
    private readonly workoutRepository: Repository<Workout>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
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

  async updateUserStatus(userId: number, dto: AdminUpdateUserStatusDto) {
    await this.findUserOrThrow(userId);
    await this.userRepository.update(userId, {
      isActive: dto.isActive,
      ...(dto.isActive ? {} : { refreshTokenHash: null }),
    });

    return this.getUserById(userId);
  }

  async softDeleteUser(userId: number) {
    await this.findUserOrThrow(userId);
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
    const orderedExercises = [...(workout.exercises || [])].sort((a, b) => a.order - b.order);
    const durationSeconds = this.getDurationSeconds(workout.startedAt, workout.finishedAt);

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
      end: this.zonedDateToUtc(this.warsawTimeZone, nextMonth.year, nextMonth.month, 1),
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
    const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    const offset = this.getTimeZoneOffsetMs(utcGuess, timeZone);

    return new Date(Date.UTC(year, month - 1, day, hour, minute, second) - offset);
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
