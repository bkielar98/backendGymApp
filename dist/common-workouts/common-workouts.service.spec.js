"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const common_1 = require("@nestjs/common");
const common_workouts_service_1 = require("./common-workouts.service");
(0, globals_1.describe)('CommonWorkoutsService', () => {
    let service;
    let workoutRepository;
    let workoutExerciseRepository;
    let workoutSetRepository;
    let gateway;
    let personalBestRepository;
    (0, globals_1.beforeEach)(() => {
        workoutRepository = {
            create: globals_1.jest.fn(),
            save: globals_1.jest.fn(),
            find: globals_1.jest.fn(),
            findOne: globals_1.jest.fn(),
        };
        workoutExerciseRepository = {
            create: globals_1.jest.fn(),
            save: globals_1.jest.fn(),
        };
        workoutSetRepository = {
            create: globals_1.jest.fn(),
            save: globals_1.jest.fn(),
        };
        gateway = {
            hasSubscribers: globals_1.jest.fn(),
            emitUpdated: globals_1.jest.fn(),
            emitFinished: globals_1.jest.fn(),
        };
        personalBestRepository = {
            findOne: globals_1.jest.fn(),
            create: globals_1.jest.fn((value) => value),
            save: globals_1.jest.fn(),
        };
        service = new common_workouts_service_1.CommonWorkoutsService({}, {}, {}, {}, workoutRepository, workoutExerciseRepository, workoutSetRepository, {}, {}, {}, personalBestRepository, gateway);
    });
    (0, globals_1.it)('does not emit update when room has no subscribers', () => {
        gateway.hasSubscribers.mockReturnValue(false);
        service.emitUpdatedIfSubscribed(14, { id: 14 });
        (0, globals_1.expect)(gateway.hasSubscribers).toHaveBeenCalledWith(14);
        (0, globals_1.expect)(gateway.emitUpdated).not.toHaveBeenCalled();
    });
    (0, globals_1.it)('emits update when room has subscribers', () => {
        gateway.hasSubscribers.mockReturnValue(true);
        service.emitUpdatedIfSubscribed(15, { id: 15, name: 'Leg day' });
        (0, globals_1.expect)(gateway.hasSubscribers).toHaveBeenCalledWith(15);
        (0, globals_1.expect)(gateway.emitUpdated).toHaveBeenCalledWith(15, {
            id: 15,
            name: 'Leg day',
        });
    });
    (0, globals_1.it)('maps common workout as a workout with solo metadata and inline exercise details', () => {
        const payload = service.mapWorkout({
            id: 9,
            name: 'Workout',
            status: 'active',
            startedAt: new Date('2026-03-31T10:00:00.000Z'),
            finishedAt: null,
            template: null,
            participants: [
                {
                    id: 101,
                    user: {
                        id: 1,
                        email: 'user@example.com',
                        name: 'User',
                        avatarPath: '/uploads/avatars/u.jpg',
                    },
                },
            ],
            exercises: [
                {
                    id: 201,
                    order: 0,
                    exercise: {
                        id: 44,
                        name: 'Bench Press',
                        description: 'Chest',
                        muscleGroups: ['chest'],
                    },
                    participantSets: [
                        {
                            id: 301,
                            participantId: 101,
                            setNumber: 1,
                            previousWeight: 80,
                            previousReps: 8,
                            currentWeight: 85,
                            currentReps: 6,
                            repMax: 102,
                            confirmed: true,
                        },
                    ],
                },
            ],
        });
        (0, globals_1.expect)(payload.participants).toEqual([
            {
                id: 101,
                user: {
                    id: 1,
                    email: 'user@example.com',
                    name: 'User',
                    avatarPath: '/uploads/avatars/u.jpg',
                    avatarUrl: '/uploads/avatars/u.jpg',
                },
            },
        ]);
        (0, globals_1.expect)(payload.mode).toBe('solo');
        (0, globals_1.expect)(payload.isSolo).toBe(true);
        (0, globals_1.expect)(payload.participantCount).toBe(1);
        (0, globals_1.expect)(payload.exercises).toEqual([
            {
                id: 201,
                order: 0,
                exercise: {
                    id: 44,
                    name: 'Bench Press',
                    description: 'Chest',
                    muscleGroups: ['chest'],
                },
                setsCount: 1,
                participants: [
                    {
                        participantId: 101,
                        user: {
                            id: 1,
                            email: 'user@example.com',
                            name: 'User',
                            avatarPath: '/uploads/avatars/u.jpg',
                            avatarUrl: '/uploads/avatars/u.jpg',
                        },
                        sets: [
                            {
                                id: 301,
                                setNumber: 1,
                                previousWeight: 80,
                                previousReps: 8,
                                currentWeight: 85,
                                currentReps: 6,
                                repMax: 102,
                                confirmed: true,
                            },
                        ],
                    },
                ],
            },
        ]);
    });
    (0, globals_1.it)('maps common workout exercise detail separately', () => {
        const payload = service.mapCommonWorkoutExerciseDetail({
            id: 201,
            order: 0,
            exercise: {
                id: 44,
                name: 'Bench Press',
                description: 'Chest',
                muscleGroups: ['chest'],
            },
            commonWorkout: {
                participants: [
                    {
                        id: 101,
                        user: {
                            id: 1,
                            email: 'user@example.com',
                            name: 'User',
                            avatarPath: '/uploads/avatars/u.jpg',
                        },
                    },
                ],
            },
            participantSets: [
                {
                    id: 301,
                    participantId: 101,
                    setNumber: 1,
                    previousWeight: 80,
                    previousReps: 8,
                    currentWeight: 85,
                    currentReps: 6,
                    repMax: 102,
                    confirmed: true,
                },
            ],
        });
        (0, globals_1.expect)(payload).toEqual({
            id: 201,
            order: 0,
            exercise: {
                id: 44,
                name: 'Bench Press',
                description: 'Chest',
                muscleGroups: ['chest'],
            },
            setsCount: 1,
            participants: [
                {
                    participantId: 101,
                    user: {
                        id: 1,
                        email: 'user@example.com',
                        name: 'User',
                        avatarPath: '/uploads/avatars/u.jpg',
                        avatarUrl: '/uploads/avatars/u.jpg',
                    },
                    sets: [
                        {
                            id: 301,
                            setNumber: 1,
                            previousWeight: 80,
                            previousReps: 8,
                            currentWeight: 85,
                            currentReps: 6,
                            repMax: 102,
                            confirmed: true,
                        },
                    ],
                },
            ],
        });
    });
    (0, globals_1.it)('copies completed common workout exercises into history deterministically', async () => {
        workoutRepository.create.mockImplementation((value) => value);
        workoutRepository.save.mockResolvedValue({
            id: 900,
            userId: 15,
            templateId: null,
            name: 'Workout',
            status: 'completed',
            startedAt: new Date('2026-04-20T10:00:00.000Z'),
            finishedAt: new Date('2026-04-20T11:00:00.000Z'),
            exercises: [],
        });
        workoutExerciseRepository.create.mockImplementation((value) => value);
        workoutExerciseRepository.save
            .mockResolvedValueOnce({ id: 1001 })
            .mockResolvedValueOnce({ id: 1002 });
        workoutSetRepository.create.mockImplementation((value) => value);
        workoutSetRepository.save.mockResolvedValue(undefined);
        personalBestRepository.findOne.mockResolvedValue(null);
        personalBestRepository.save.mockResolvedValue(undefined);
        await service.createIndividualWorkoutFromCommonWorkout({
            templateId: null,
            name: 'Workout',
            startedAt: new Date('2026-04-20T10:00:00.000Z'),
            finishedAt: new Date('2026-04-20T11:00:00.000Z'),
            exercises: [
                {
                    exerciseId: 11,
                    order: 0,
                    participantSets: [
                        {
                            participantId: 501,
                            setNumber: 1,
                            previousWeight: 80,
                            previousReps: 8,
                            currentWeight: 85,
                            currentReps: 6,
                            repMax: 102,
                            confirmed: true,
                        },
                    ],
                },
                {
                    exerciseId: 12,
                    order: 1,
                    participantSets: [
                        {
                            participantId: 501,
                            setNumber: 1,
                            previousWeight: 40,
                            previousReps: 10,
                            currentWeight: 45,
                            currentReps: 8,
                            repMax: 57,
                            confirmed: true,
                        },
                    ],
                },
            ],
        }, {
            id: 501,
            userId: 15,
        });
        (0, globals_1.expect)(workoutExerciseRepository.save).toHaveBeenNthCalledWith(1, globals_1.expect.objectContaining({
            workoutId: 900,
            exerciseId: 11,
            order: 0,
        }));
        (0, globals_1.expect)(workoutExerciseRepository.save).toHaveBeenNthCalledWith(2, globals_1.expect.objectContaining({
            workoutId: 900,
            exerciseId: 12,
            order: 1,
        }));
        (0, globals_1.expect)(workoutSetRepository.save).toHaveBeenNthCalledWith(1, [
            globals_1.expect.objectContaining({
                workoutExerciseId: 1001,
                currentWeight: 85,
                currentReps: 6,
            }),
        ]);
        (0, globals_1.expect)(workoutSetRepository.save).toHaveBeenNthCalledWith(2, [
            globals_1.expect.objectContaining({
                workoutExerciseId: 1002,
                currentWeight: 45,
                currentReps: 8,
            }),
        ]);
        (0, globals_1.expect)(personalBestRepository.save).toHaveBeenNthCalledWith(1, globals_1.expect.objectContaining({
            userId: 15,
            exerciseId: 11,
            weight: 85,
            reps: 6,
            repMax: 102,
        }));
    });
    (0, globals_1.it)('builds workout summary for active and historical workout ids', async () => {
        globals_1.jest.spyOn(service, 'getCommonWorkoutEntityForUser').mockResolvedValue({
            id: 12,
            name: 'Workout',
            status: 'active',
            startedAt: new Date('2026-04-20T10:00:00.000Z'),
            finishedAt: null,
            template: null,
            participants: [{ id: 1, userId: 15 }],
            exercises: [
                {
                    id: 101,
                    order: 0,
                    exercise: { name: 'Bench Press' },
                    participantSets: [
                        { setNumber: 1, confirmed: true },
                        { setNumber: 2, confirmed: false },
                    ],
                },
            ],
        });
        await (0, globals_1.expect)(service.getSummaryForUser(15, 12)).resolves.toMatchObject({
            id: 12,
            source: 'session',
            mode: 'solo',
            exerciseCount: 1,
            totalSets: 2,
            confirmedSets: 1,
        });
        service.getCommonWorkoutEntityForUser.mockRejectedValueOnce(new common_1.NotFoundException('Workout not found'));
        workoutRepository.findOne.mockResolvedValue({
            id: 55,
            userId: 15,
            name: 'History workout',
            status: 'completed',
            startedAt: new Date('2026-04-18T10:00:00.000Z'),
            finishedAt: new Date('2026-04-18T11:00:00.000Z'),
            template: null,
            exercises: [
                {
                    id: 201,
                    order: 0,
                    exercise: { id: 77, name: 'Squat' },
                    sets: [
                        { confirmed: true },
                        { confirmed: true },
                    ],
                },
            ],
        });
        await (0, globals_1.expect)(service.getSummaryForUser(15, 55)).resolves.toMatchObject({
            id: 55,
            source: 'history',
            mode: 'solo',
            exerciseCount: 1,
            totalSets: 2,
            confirmedSets: 2,
        });
    });
    (0, globals_1.it)('returns dashboard stats with favorite exercise, day and partner', async () => {
        const completedWorkout = {
            id: 400,
            userId: 15,
            status: 'completed',
            startedAt: new Date('2026-04-07T10:00:00.000Z'),
            finishedAt: new Date('2026-04-07T11:00:00.000Z'),
            exercises: [
                {
                    exerciseId: 11,
                    exercise: { id: 11, name: 'Bench Press' },
                    sets: [{ confirmed: true }, { confirmed: true }],
                },
            ],
        };
        workoutRepository.find.mockResolvedValue([completedWorkout]);
        const commonWorkoutRepository = service.commonWorkoutRepository;
        commonWorkoutRepository.find = globals_1.jest.fn().mockResolvedValue([
            {
                startedAt: new Date('2026-04-07T10:00:00.000Z'),
                participants: [
                    { userId: 15, user: { id: 15, name: 'Adam' } },
                    { userId: 18, user: { id: 18, name: 'Kyzn', avatarPath: '/a.png' } },
                ],
            },
        ]);
        personalBestRepository.findOne.mockResolvedValue({
            weight: 90,
            reps: 8,
            repMax: 114,
            achievedAt: new Date('2026-04-07T11:00:00.000Z'),
        });
        await (0, globals_1.expect)(service.getDashboardStatsForUser(15, {
            dateFrom: '2026-04-01',
            dateTo: '2026-04-30',
        })).resolves.toMatchObject({
            workoutsCount: 1,
            favoriteExercise: {
                exercise: {
                    id: 11,
                    name: 'Bench Press',
                },
            },
            favoriteTrainingDay: {
                day: 'tuesday',
                workoutsCount: 1,
            },
            favoriteTrainingPartner: {
                user: {
                    id: 18,
                    name: 'Kyzn',
                },
            },
        });
    });
    (0, globals_1.it)('rejects absurdly wide dashboard ranges before hitting repositories', async () => {
        await (0, globals_1.expect)(service.getDashboardStatsForUser(15, {
            dateFrom: '2010-01-01',
            dateTo: '2026-04-30',
        })).rejects.toBeInstanceOf(common_1.BadRequestException);
        (0, globals_1.expect)(workoutRepository.find).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=common-workouts.service.spec.js.map