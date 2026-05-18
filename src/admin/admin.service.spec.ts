import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserRole } from '../entities/user.entity';
import { WorkoutStatus } from '../entities/workout.entity';
import { CommonWorkoutStatus } from '../entities/common-workout.entity';

describe('AdminService', () => {
  let service: AdminService;
  let userRepository: {
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    count: jest.Mock;
  };
  let workoutRepository: {
    count: jest.Mock;
    find: jest.Mock;
    findAndCount: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let commonWorkoutRepository: {
    count: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let exerciseRepository: {
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
    find: jest.Mock;
  };
  let usersService: {
    updateAvatar: jest.Mock;
  };

  beforeEach(() => {
    userRepository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    };
    workoutRepository = {
      count: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    commonWorkoutRepository = {
      count: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    exerciseRepository = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
      find: jest.fn(),
    };
    usersService = {
      updateAvatar: jest.fn(),
    };
    service = new AdminService(
      userRepository as never,
      workoutRepository as never,
      commonWorkoutRepository as never,
      exerciseRepository as never,
      usersService as never,
    );
  });

  it('lists users with pagination and search', async () => {
    const builder = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([
        [
          {
            id: 5,
            email: 'adam@example.com',
            name: 'Adam',
            avatarPath: '/uploads/avatars/a.jpg',
            role: UserRole.USER,
            createdAt: new Date('2026-04-01T10:00:00.000Z'),
            lastLoginAt: new Date('2026-04-20T08:00:00.000Z'),
            isActive: true,
          },
        ],
        1,
      ] as never),
    };
    userRepository.createQueryBuilder.mockReturnValue(builder as never);

    await expect(
      service.listUsers({
        page: 2,
        limit: 10,
        search: 'AdaM',
        sortBy: 'email',
        sortOrder: 'ASC',
      }),
    ).resolves.toMatchObject({
      users: [
        {
          id: 5,
          email: 'adam@example.com',
          name: 'Adam',
          avatarUrl: '/uploads/avatars/a.jpg',
          role: UserRole.USER,
          isActive: true,
        },
      ],
      total: 1,
      page: 2,
      limit: 10,
    });

    expect(builder.where).toHaveBeenCalledWith(
      '(LOWER(user.name) LIKE :search OR LOWER(user.email) LIKE :search)',
      { search: '%adam%' },
    );
    expect(builder.orderBy).toHaveBeenCalledWith('user.email', 'ASC');
    expect(builder.skip).toHaveBeenCalledWith(10);
    expect(builder.take).toHaveBeenCalledWith(10);
  });

  it('updates user status and clears refresh token when deactivating', async () => {
    userRepository.findOne
      .mockResolvedValueOnce({
        id: 7,
        email: 'user@example.com',
      } as never)
      .mockResolvedValueOnce({
        id: 7,
        email: 'user@example.com',
        name: 'User',
        avatarPath: null,
        role: UserRole.USER,
        createdAt: new Date('2026-04-02T10:00:00.000Z'),
        lastLoginAt: new Date('2026-04-20T08:00:00.000Z'),
        isActive: false,
      } as never);
    userRepository.update.mockResolvedValue({ affected: 1 } as never);

    await expect(
      service.updateUserStatus(3, 7, {
        isActive: false,
      }),
    ).resolves.toMatchObject({
      id: 7,
      isActive: false,
    });

    expect(userRepository.update).toHaveBeenCalledWith(7, {
      isActive: false,
      refreshTokenHash: null,
    });
  });

  it('does not allow admin to deactivate their own account', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 3,
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    } as never);

    await expect(
      service.updateUserStatus(3, 3, {
        isActive: false,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('does not allow admin to remove their own admin role', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 3,
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    } as never);

    await expect(
      service.updateUserRole(3, 3, {
        role: UserRole.USER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('allows admin to change another users role', async () => {
    userRepository.findOne
      .mockResolvedValueOnce({
        id: 7,
        email: 'user@example.com',
        role: UserRole.USER,
      } as never)
      .mockResolvedValueOnce({
        id: 7,
        email: 'user@example.com',
        name: 'User',
        avatarPath: null,
        role: UserRole.ADMIN,
        createdAt: new Date('2026-04-02T10:00:00.000Z'),
        lastLoginAt: null,
        isActive: true,
      } as never);
    userRepository.update.mockResolvedValue({ affected: 1 } as never);

    await expect(
      service.updateUserRole(3, 7, {
        role: UserRole.ADMIN,
      }),
    ).resolves.toMatchObject({
      id: 7,
      role: UserRole.ADMIN,
    });

    expect(userRepository.update).toHaveBeenCalledWith(7, {
      role: UserRole.ADMIN,
    });
  });

  it('does not allow admin to soft delete their own account', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 3,
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    } as never);

    await expect(service.softDeleteUser(3, 3)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('returns admin dashboard stats', async () => {
    const monthBuilder = {
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(4 as never),
    };
    userRepository.createQueryBuilder.mockReturnValue(monthBuilder as never);
    userRepository.count
      .mockResolvedValueOnce(25 as never)
      .mockResolvedValueOnce(9 as never);
    exerciseRepository.count.mockResolvedValue(32 as never);
    workoutRepository.count.mockResolvedValue(87 as never);

    await expect(service.getStats()).resolves.toEqual({
      totalUsers: 25,
      activeUsersLast30Days: 9,
      totalExercises: 32,
      totalWorkouts: 87,
      newUsersThisMonth: 4,
    });

    expect(monthBuilder.where).toHaveBeenCalledWith(
      'user.createdAt >= :start AND user.createdAt < :end',
      expect.objectContaining({
        start: expect.any(Date),
        end: expect.any(Date),
      }),
    );
  });

  it('lists completed workouts for a specific user', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 15,
      email: 'user@example.com',
    } as never);
    workoutRepository.findAndCount.mockResolvedValue([
      [
        {
          id: 33,
          userId: 15,
          name: 'Leg Day',
          status: WorkoutStatus.COMPLETED,
          startedAt: new Date('2026-04-20T10:00:00.000Z'),
          finishedAt: new Date('2026-04-20T11:10:00.000Z'),
          template: { id: 4, name: 'Lower' },
          exercises: [
            {
              order: 0,
              exercise: { id: 1, name: 'Squat' },
              sets: [{ confirmed: true }, { confirmed: false }],
            },
          ],
        },
      ],
      1,
    ] as never);

    await expect(
      service.listUserWorkouts(15, {
        page: 1,
        limit: 5,
      }),
    ).resolves.toMatchObject({
      workouts: [
        {
          id: 33,
          name: 'Leg Day',
          exerciseCount: 1,
          totalSets: 2,
          confirmedSets: 1,
          exerciseNames: ['Squat'],
          template: {
            id: 4,
            name: 'Lower',
          },
        },
      ],
      total: 1,
      page: 1,
      limit: 5,
    });
  });

  it('updates avatar through shared user service and returns fresh admin detail', async () => {
    usersService.updateAvatar.mockResolvedValue(undefined as never);
    userRepository.findOne.mockResolvedValue({
      id: 8,
      email: 'avatar@example.com',
      name: 'Avatar User',
      avatarPath: '/uploads/avatars/new.jpg',
      role: UserRole.ADMIN,
      createdAt: new Date('2026-04-03T10:00:00.000Z'),
      lastLoginAt: null,
      isActive: true,
    } as never);

    await expect(
      service.updateUserAvatar(8, {
        filename: 'new.jpg',
      }),
    ).resolves.toMatchObject({
      id: 8,
      avatarUrl: '/uploads/avatars/new.jpg',
    });

    expect(usersService.updateAvatar).toHaveBeenCalledWith(8, {
      filename: 'new.jpg',
    });
  });

  it('resets user password and invalidates refresh token', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 9,
      email: 'reset@example.com',
    } as never);
    userRepository.update.mockResolvedValue({ affected: 1 } as never);

    await expect(
      service.resetUserPassword(9, {
        password: 'newPassword123',
      }),
    ).resolves.toEqual({
      success: true,
      id: 9,
    });

    expect(userRepository.update).toHaveBeenCalledWith(9, {
      password: expect.any(String),
      refreshTokenHash: null,
    });
  });

  it('lists active workouts with owner details', async () => {
    workoutRepository.find.mockResolvedValue([
      {
        id: 44,
        userId: 12,
        user: {
          id: 12,
          email: 'owner@example.com',
          name: 'Owner',
          avatarPath: null,
          role: UserRole.USER,
          isActive: true,
        },
        name: 'Push',
        status: WorkoutStatus.ACTIVE,
        startedAt: new Date('2026-05-01T10:00:00.000Z'),
        finishedAt: null,
        template: null,
        exercises: [],
      },
    ] as never);
    workoutRepository.count.mockResolvedValue(1 as never);
    commonWorkoutRepository.find.mockResolvedValue([
      {
        id: 8,
        name: 'Team Push',
        status: CommonWorkoutStatus.ACTIVE,
        startedAt: new Date('2026-05-01T11:00:00.000Z'),
        finishedAt: null,
        template: null,
        createdByUser: {
          id: 17,
          email: 'creator@example.com',
          name: 'Creator',
          avatarPath: null,
          role: UserRole.USER,
          isActive: true,
        },
        participants: [
          {
            user: {
              id: 17,
              email: 'creator@example.com',
              name: 'Creator',
              avatarPath: null,
              role: UserRole.USER,
              isActive: true,
            },
          },
        ],
        exercises: [
          {
            exercise: { id: 4, name: 'Bench Press' },
            participantSets: [{ confirmed: true }, { confirmed: false }],
          },
        ],
      },
    ] as never);
    commonWorkoutRepository.count.mockResolvedValue(1 as never);

    await expect(
      service.listActiveWorkouts({
        page: 1,
        limit: 10,
      }),
    ).resolves.toMatchObject({
      workouts: [
        {
          id: 8,
          source: 'common',
          status: CommonWorkoutStatus.ACTIVE,
          participantCount: 1,
          totalSets: 2,
          confirmedSets: 1,
        },
        {
          id: 44,
          source: 'solo',
          status: WorkoutStatus.ACTIVE,
          user: {
            id: 12,
            email: 'owner@example.com',
          },
        },
      ],
      total: 2,
      page: 1,
      limit: 10,
    });
  });

  it('finishes active workout as admin', async () => {
    const activeWorkout = {
      id: 55,
      name: 'Pull',
      status: WorkoutStatus.ACTIVE,
      startedAt: new Date('2026-05-01T10:00:00.000Z'),
      finishedAt: null,
    };
    workoutRepository.findOne
      .mockResolvedValueOnce(activeWorkout as never)
      .mockResolvedValueOnce({
        ...activeWorkout,
        status: WorkoutStatus.COMPLETED,
        finishedAt: new Date('2026-05-01T11:00:00.000Z'),
        user: null,
        exercises: [],
        template: null,
      } as never);
    workoutRepository.save.mockResolvedValue({
      ...activeWorkout,
      status: WorkoutStatus.COMPLETED,
    } as never);

    await expect(service.finishActiveWorkout(55)).resolves.toMatchObject({
      success: true,
      workout: {
        id: 55,
        status: WorkoutStatus.COMPLETED,
      },
    });

    expect(workoutRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 55,
        status: WorkoutStatus.COMPLETED,
        finishedAt: expect.any(Date),
      }),
    );
  });

  it('finishes active common workout as admin', async () => {
    commonWorkoutRepository.findOne.mockResolvedValue({
      id: 66,
      createdByUserId: 12,
      status: CommonWorkoutStatus.ACTIVE,
      startedAt: new Date('2026-05-01T10:00:00.000Z'),
      finishedAt: null,
      participants: [],
      exercises: [],
      template: null,
      createdByUser: null,
    } as never);
    commonWorkoutRepository.save.mockResolvedValue({
      id: 66,
      status: CommonWorkoutStatus.COMPLETED,
    } as never);

    await expect(service.finishActiveCommonWorkout(66)).resolves.toMatchObject({
      success: true,
      workout: {
        id: 66,
        source: 'common',
        status: CommonWorkoutStatus.COMPLETED,
      },
    });

    expect(commonWorkoutRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 66,
        status: CommonWorkoutStatus.COMPLETED,
        finishedAt: expect.any(Date),
      }),
    );
  });

  it('returns exercise popularity and average set stats', async () => {
    const builder = {
      innerJoin: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        {
          exerciseId: '3',
          exerciseName: 'Squat',
          workoutsCount: '7',
          setsCount: '18',
          averageWeight: '102.3456',
          averageReps: '8.4444',
        },
      ] as never),
    };
    exerciseRepository.createQueryBuilder.mockReturnValue(builder as never);

    await expect(
      service.getExerciseStats({
        limit: 5,
      }),
    ).resolves.toEqual({
      exercises: [
        {
          exercise: {
            id: 3,
            name: 'Squat',
          },
          workoutsCount: 7,
          setsCount: 18,
          averageWeight: 102.35,
          averageReps: 8.44,
        },
      ],
      limit: 5,
    });

    expect(builder.limit).toHaveBeenCalledWith(5);
  });

  it('lists exercises that contain profane words for moderation', async () => {
    exerciseRepository.find.mockResolvedValue([
      {
        id: 1,
        name: 'Normal Squat',
        description: 'Clean',
        isGlobal: true,
        createdByUserId: null,
        createdByUser: null,
      },
      {
        id: 2,
        name: 'Kurwa press',
        description: 'Bad word in name',
        isGlobal: false,
        createdByUserId: 8,
        createdByUser: {
          id: 8,
          email: 'creator@example.com',
          name: 'Creator',
          avatarPath: null,
          role: UserRole.USER,
          isActive: true,
        },
      },
    ] as never);

    await expect(service.listProfaneExercises()).resolves.toMatchObject({
      exercises: [
        {
          id: 2,
          matchedWords: ['kurwa'],
          matches: [
            {
              field: 'name',
              word: 'kurwa',
            },
          ],
        },
      ],
      total: 1,
    });
  });
});
