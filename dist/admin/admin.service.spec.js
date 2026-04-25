"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const user_entity_1 = require("../entities/user.entity");
const workout_entity_1 = require("../entities/workout.entity");
(0, globals_1.describe)('AdminService', () => {
    let service;
    let userRepository;
    let workoutRepository;
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
            findAndCount: globals_1.jest.fn(),
        };
        exerciseRepository = {
            count: globals_1.jest.fn(),
        };
        usersService = {
            updateAvatar: globals_1.jest.fn(),
        };
        service = new admin_service_1.AdminService(userRepository, workoutRepository, exerciseRepository, usersService);
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
        await (0, globals_1.expect)(service.updateUserStatus(7, {
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
});
//# sourceMappingURL=admin.service.spec.js.map