"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const user_entity_1 = require("../entities/user.entity");
const workout_entity_1 = require("../entities/workout.entity");
const common_workout_entity_1 = require("../entities/common-workout.entity");
(0, globals_1.describe)('AdminService', () => {
    let service;
    let userRepository;
    let workoutRepository;
    let commonWorkoutRepository;
    let exerciseRepository;
    let usersService;
    (0, globals_1.beforeEach)(() => {
        userRepository = {
            createQueryBuilder: globals_1.jest.fn(),
            findOne: globals_1.jest.fn(),
            update: globals_1.jest.fn(),
            count: globals_1.jest.fn(),
        };
        workoutRepository = {
            count: globals_1.jest.fn(),
            find: globals_1.jest.fn(),
            findAndCount: globals_1.jest.fn(),
            findOne: globals_1.jest.fn(),
            save: globals_1.jest.fn(),
        };
        commonWorkoutRepository = {
            count: globals_1.jest.fn(),
            find: globals_1.jest.fn(),
            findOne: globals_1.jest.fn(),
            save: globals_1.jest.fn(),
        };
        exerciseRepository = {
            count: globals_1.jest.fn(),
            createQueryBuilder: globals_1.jest.fn(),
            find: globals_1.jest.fn(),
        };
        usersService = {
            updateAvatar: globals_1.jest.fn(),
        };
        service = new admin_service_1.AdminService(userRepository, workoutRepository, commonWorkoutRepository, exerciseRepository, usersService);
    });
    (0, globals_1.it)('lists users with pagination and search', async () => {
        const builder = {
            where: globals_1.jest.fn().mockReturnThis(),
            orderBy: globals_1.jest.fn().mockReturnThis(),
            addOrderBy: globals_1.jest.fn().mockReturnThis(),
            skip: globals_1.jest.fn().mockReturnThis(),
            take: globals_1.jest.fn().mockReturnThis(),
            getManyAndCount: globals_1.jest.fn().mockResolvedValue([
                [
                    {
                        id: 5,
                        email: 'adam@example.com',
                        name: 'Adam',
                        avatarPath: '/uploads/avatars/a.jpg',
                        role: user_entity_1.UserRole.USER,
                        createdAt: new Date('2026-04-01T10:00:00.000Z'),
                        lastLoginAt: new Date('2026-04-20T08:00:00.000Z'),
                        isActive: true,
                    },
                ],
                1,
            ]),
        };
        userRepository.createQueryBuilder.mockReturnValue(builder);
        await (0, globals_1.expect)(service.listUsers({
            page: 2,
            limit: 10,
            search: 'AdaM',
            sortBy: 'email',
            sortOrder: 'ASC',
        })).resolves.toMatchObject({
            users: [
                {
                    id: 5,
                    email: 'adam@example.com',
                    name: 'Adam',
                    avatarUrl: '/uploads/avatars/a.jpg',
                    role: user_entity_1.UserRole.USER,
                    isActive: true,
                },
            ],
            total: 1,
            page: 2,
            limit: 10,
        });
        (0, globals_1.expect)(builder.where).toHaveBeenCalledWith('(LOWER(user.name) LIKE :search OR LOWER(user.email) LIKE :search)', { search: '%adam%' });
        (0, globals_1.expect)(builder.orderBy).toHaveBeenCalledWith('user.email', 'ASC');
        (0, globals_1.expect)(builder.skip).toHaveBeenCalledWith(10);
        (0, globals_1.expect)(builder.take).toHaveBeenCalledWith(10);
    });
    (0, globals_1.it)('updates user status and clears refresh token when deactivating', async () => {
        userRepository.findOne
            .mockResolvedValueOnce({
            id: 7,
            email: 'user@example.com',
        })
            .mockResolvedValueOnce({
            id: 7,
            email: 'user@example.com',
            name: 'User',
            avatarPath: null,
            role: user_entity_1.UserRole.USER,
            createdAt: new Date('2026-04-02T10:00:00.000Z'),
            lastLoginAt: new Date('2026-04-20T08:00:00.000Z'),
            isActive: false,
        });
        userRepository.update.mockResolvedValue({ affected: 1 });
        await (0, globals_1.expect)(service.updateUserStatus(3, 7, {
            isActive: false,
        })).resolves.toMatchObject({
            id: 7,
            isActive: false,
        });
        (0, globals_1.expect)(userRepository.update).toHaveBeenCalledWith(7, {
            isActive: false,
            refreshTokenHash: null,
        });
    });
    (0, globals_1.it)('does not allow admin to deactivate their own account', async () => {
        userRepository.findOne.mockResolvedValue({
            id: 3,
            email: 'admin@example.com',
            role: user_entity_1.UserRole.ADMIN,
        });
        await (0, globals_1.expect)(service.updateUserStatus(3, 3, {
            isActive: false,
        })).rejects.toBeInstanceOf(common_1.ForbiddenException);
        (0, globals_1.expect)(userRepository.update).not.toHaveBeenCalled();
    });
    (0, globals_1.it)('does not allow admin to remove their own admin role', async () => {
        userRepository.findOne.mockResolvedValue({
            id: 3,
            email: 'admin@example.com',
            role: user_entity_1.UserRole.ADMIN,
        });
        await (0, globals_1.expect)(service.updateUserRole(3, 3, {
            role: user_entity_1.UserRole.USER,
        })).rejects.toBeInstanceOf(common_1.ForbiddenException);
        (0, globals_1.expect)(userRepository.update).not.toHaveBeenCalled();
    });
    (0, globals_1.it)('allows admin to change another users role', async () => {
        userRepository.findOne
            .mockResolvedValueOnce({
            id: 7,
            email: 'user@example.com',
            role: user_entity_1.UserRole.USER,
        })
            .mockResolvedValueOnce({
            id: 7,
            email: 'user@example.com',
            name: 'User',
            avatarPath: null,
            role: user_entity_1.UserRole.ADMIN,
            createdAt: new Date('2026-04-02T10:00:00.000Z'),
            lastLoginAt: null,
            isActive: true,
        });
        userRepository.update.mockResolvedValue({ affected: 1 });
        await (0, globals_1.expect)(service.updateUserRole(3, 7, {
            role: user_entity_1.UserRole.ADMIN,
        })).resolves.toMatchObject({
            id: 7,
            role: user_entity_1.UserRole.ADMIN,
        });
        (0, globals_1.expect)(userRepository.update).toHaveBeenCalledWith(7, {
            role: user_entity_1.UserRole.ADMIN,
        });
    });
    (0, globals_1.it)('does not allow admin to soft delete their own account', async () => {
        userRepository.findOne.mockResolvedValue({
            id: 3,
            email: 'admin@example.com',
            role: user_entity_1.UserRole.ADMIN,
        });
        await (0, globals_1.expect)(service.softDeleteUser(3, 3)).rejects.toBeInstanceOf(common_1.ForbiddenException);
        (0, globals_1.expect)(userRepository.update).not.toHaveBeenCalled();
    });
    (0, globals_1.it)('returns admin dashboard stats', async () => {
        const monthBuilder = {
            where: globals_1.jest.fn().mockReturnThis(),
            getCount: globals_1.jest.fn().mockResolvedValue(4),
        };
        userRepository.createQueryBuilder.mockReturnValue(monthBuilder);
        userRepository.count
            .mockResolvedValueOnce(25)
            .mockResolvedValueOnce(9);
        exerciseRepository.count.mockResolvedValue(32);
        workoutRepository.count.mockResolvedValue(87);
        await (0, globals_1.expect)(service.getStats()).resolves.toEqual({
            totalUsers: 25,
            activeUsersLast30Days: 9,
            totalExercises: 32,
            totalWorkouts: 87,
            newUsersThisMonth: 4,
        });
        (0, globals_1.expect)(monthBuilder.where).toHaveBeenCalledWith('user.createdAt >= :start AND user.createdAt < :end', globals_1.expect.objectContaining({
            start: globals_1.expect.any(Date),
            end: globals_1.expect.any(Date),
        }));
    });
    (0, globals_1.it)('lists completed workouts for a specific user', async () => {
        userRepository.findOne.mockResolvedValue({
            id: 15,
            email: 'user@example.com',
        });
        workoutRepository.findAndCount.mockResolvedValue([
            [
                {
                    id: 33,
                    userId: 15,
                    name: 'Leg Day',
                    status: workout_entity_1.WorkoutStatus.COMPLETED,
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
        ]);
        await (0, globals_1.expect)(service.listUserWorkouts(15, {
            page: 1,
            limit: 5,
        })).resolves.toMatchObject({
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
    (0, globals_1.it)('updates avatar through shared user service and returns fresh admin detail', async () => {
        usersService.updateAvatar.mockResolvedValue(undefined);
        userRepository.findOne.mockResolvedValue({
            id: 8,
            email: 'avatar@example.com',
            name: 'Avatar User',
            avatarPath: '/uploads/avatars/new.jpg',
            role: user_entity_1.UserRole.ADMIN,
            createdAt: new Date('2026-04-03T10:00:00.000Z'),
            lastLoginAt: null,
            isActive: true,
        });
        await (0, globals_1.expect)(service.updateUserAvatar(8, {
            filename: 'new.jpg',
        })).resolves.toMatchObject({
            id: 8,
            avatarUrl: '/uploads/avatars/new.jpg',
        });
        (0, globals_1.expect)(usersService.updateAvatar).toHaveBeenCalledWith(8, {
            filename: 'new.jpg',
        });
    });
    (0, globals_1.it)('resets user password and invalidates refresh token', async () => {
        userRepository.findOne.mockResolvedValue({
            id: 9,
            email: 'reset@example.com',
        });
        userRepository.update.mockResolvedValue({ affected: 1 });
        await (0, globals_1.expect)(service.resetUserPassword(9, {
            password: 'newPassword123',
        })).resolves.toEqual({
            success: true,
            id: 9,
        });
        (0, globals_1.expect)(userRepository.update).toHaveBeenCalledWith(9, {
            password: globals_1.expect.any(String),
            refreshTokenHash: null,
        });
    });
    (0, globals_1.it)('lists active solo and common workouts with owner details', async () => {
        workoutRepository.find.mockResolvedValue([
            {
                id: 44,
                userId: 12,
                user: {
                    id: 12,
                    email: 'owner@example.com',
                    name: 'Owner',
                    avatarPath: null,
                    role: user_entity_1.UserRole.USER,
                    isActive: true,
                },
                name: 'Push',
                status: workout_entity_1.WorkoutStatus.ACTIVE,
                startedAt: new Date('2026-05-01T10:00:00.000Z'),
                finishedAt: null,
                template: null,
                exercises: [],
            },
        ]);
        workoutRepository.count.mockResolvedValue(1);
        commonWorkoutRepository.find.mockResolvedValue([
            {
                id: 8,
                name: 'Team Push',
                status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
                startedAt: new Date('2026-05-01T11:00:00.000Z'),
                finishedAt: null,
                template: null,
                createdByUser: {
                    id: 17,
                    email: 'creator@example.com',
                    name: 'Creator',
                    avatarPath: null,
                    role: user_entity_1.UserRole.USER,
                    isActive: true,
                },
                participants: [
                    {
                        user: {
                            id: 17,
                            email: 'creator@example.com',
                            name: 'Creator',
                            avatarPath: null,
                            role: user_entity_1.UserRole.USER,
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
        ]);
        commonWorkoutRepository.count.mockResolvedValue(1);
        await (0, globals_1.expect)(service.listActiveWorkouts({
            page: 1,
            limit: 10,
        })).resolves.toMatchObject({
            workouts: [
                {
                    id: 8,
                    source: 'common',
                    status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
                    participantCount: 1,
                    totalSets: 2,
                    confirmedSets: 1,
                },
                {
                    id: 44,
                    source: 'solo',
                    status: workout_entity_1.WorkoutStatus.ACTIVE,
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
    (0, globals_1.it)('finishes active solo workout as admin', async () => {
        const activeWorkout = {
            id: 55,
            name: 'Pull',
            status: workout_entity_1.WorkoutStatus.ACTIVE,
            startedAt: new Date('2026-05-01T10:00:00.000Z'),
            finishedAt: null,
        };
        workoutRepository.findOne
            .mockResolvedValueOnce(activeWorkout)
            .mockResolvedValueOnce({
            ...activeWorkout,
            status: workout_entity_1.WorkoutStatus.COMPLETED,
            finishedAt: new Date('2026-05-01T11:00:00.000Z'),
            user: null,
            exercises: [],
            template: null,
        });
        workoutRepository.save.mockResolvedValue({
            ...activeWorkout,
            status: workout_entity_1.WorkoutStatus.COMPLETED,
        });
        await (0, globals_1.expect)(service.finishActiveWorkout(55)).resolves.toMatchObject({
            success: true,
            workout: {
                id: 55,
                source: 'solo',
                status: workout_entity_1.WorkoutStatus.COMPLETED,
            },
        });
        (0, globals_1.expect)(workoutRepository.save).toHaveBeenCalledWith(globals_1.expect.objectContaining({
            id: 55,
            status: workout_entity_1.WorkoutStatus.COMPLETED,
            finishedAt: globals_1.expect.any(Date),
        }));
    });
    (0, globals_1.it)('finishes active common workout as admin', async () => {
        commonWorkoutRepository.findOne
            .mockResolvedValueOnce({
            id: 66,
            status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
            startedAt: new Date('2026-05-01T10:00:00.000Z'),
            finishedAt: null,
            participants: [],
            exercises: [],
            template: null,
            createdByUser: null,
        })
            .mockResolvedValueOnce({
            id: 66,
            name: 'Team Push',
            status: common_workout_entity_1.CommonWorkoutStatus.COMPLETED,
            startedAt: new Date('2026-05-01T10:00:00.000Z'),
            finishedAt: new Date('2026-05-01T11:00:00.000Z'),
            participants: [],
            exercises: [],
            template: null,
            createdByUser: null,
        });
        commonWorkoutRepository.save.mockResolvedValue({
            id: 66,
            status: common_workout_entity_1.CommonWorkoutStatus.COMPLETED,
        });
        await (0, globals_1.expect)(service.finishActiveCommonWorkout(66)).resolves.toMatchObject({
            success: true,
            workout: {
                id: 66,
                source: 'common',
                status: common_workout_entity_1.CommonWorkoutStatus.COMPLETED,
            },
        });
        (0, globals_1.expect)(commonWorkoutRepository.save).toHaveBeenCalledWith(globals_1.expect.objectContaining({
            id: 66,
            status: common_workout_entity_1.CommonWorkoutStatus.COMPLETED,
            finishedAt: globals_1.expect.any(Date),
        }));
    });
    (0, globals_1.it)('returns exercise popularity and average set stats', async () => {
        const builder = {
            innerJoin: globals_1.jest.fn().mockReturnThis(),
            leftJoin: globals_1.jest.fn().mockReturnThis(),
            select: globals_1.jest.fn().mockReturnThis(),
            addSelect: globals_1.jest.fn().mockReturnThis(),
            groupBy: globals_1.jest.fn().mockReturnThis(),
            addGroupBy: globals_1.jest.fn().mockReturnThis(),
            orderBy: globals_1.jest.fn().mockReturnThis(),
            addOrderBy: globals_1.jest.fn().mockReturnThis(),
            limit: globals_1.jest.fn().mockReturnThis(),
            getRawMany: globals_1.jest.fn().mockResolvedValue([
                {
                    exerciseId: '3',
                    exerciseName: 'Squat',
                    workoutsCount: '7',
                    setsCount: '18',
                    averageWeight: '102.3456',
                    averageReps: '8.4444',
                },
            ]),
        };
        exerciseRepository.createQueryBuilder.mockReturnValue(builder);
        await (0, globals_1.expect)(service.getExerciseStats({
            limit: 5,
        })).resolves.toEqual({
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
        (0, globals_1.expect)(builder.limit).toHaveBeenCalledWith(5);
    });
    (0, globals_1.it)('lists exercises that contain profane words for moderation', async () => {
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
                    role: user_entity_1.UserRole.USER,
                    isActive: true,
                },
            },
        ]);
        await (0, globals_1.expect)(service.listProfaneExercises()).resolves.toMatchObject({
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
//# sourceMappingURL=admin.service.spec.js.map