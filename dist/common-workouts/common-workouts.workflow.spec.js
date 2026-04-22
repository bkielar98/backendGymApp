"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const common_workouts_service_1 = require("./common-workouts.service");
const common_workout_entity_1 = require("../entities/common-workout.entity");
(0, globals_1.describe)('CommonWorkoutsService workflow', () => {
    let service;
    let commonWorkoutRepository;
    let participantRepository;
    let commonWorkoutExerciseRepository;
    let participantSetRepository;
    let workoutRepository;
    let templateRepository;
    let exerciseRepository;
    let userRepository;
    let personalBestRepository;
    (0, globals_1.beforeEach)(() => {
        commonWorkoutRepository = {
            create: globals_1.jest.fn((value) => value),
            save: globals_1.jest.fn(),
        };
        participantRepository = {
            create: globals_1.jest.fn((value) => value),
            save: globals_1.jest.fn(),
            find: globals_1.jest.fn(),
        };
        commonWorkoutExerciseRepository = {
            create: globals_1.jest.fn((value) => value),
            save: globals_1.jest.fn(),
        };
        participantSetRepository = {
            create: globals_1.jest.fn((value) => value),
            save: globals_1.jest.fn(),
        };
        workoutRepository = {
            find: globals_1.jest.fn(),
        };
        templateRepository = {
            findOne: globals_1.jest.fn(),
        };
        exerciseRepository = {
            findOne: globals_1.jest.fn(),
        };
        userRepository = {
            findBy: globals_1.jest.fn(),
        };
        personalBestRepository = {
            findOne: globals_1.jest.fn(),
            create: globals_1.jest.fn((value) => value),
            save: globals_1.jest.fn(),
        };
        service = new common_workouts_service_1.CommonWorkoutsService(commonWorkoutRepository, participantRepository, commonWorkoutExerciseRepository, participantSetRepository, workoutRepository, { create: globals_1.jest.fn(), save: globals_1.jest.fn() }, { create: globals_1.jest.fn(), save: globals_1.jest.fn() }, templateRepository, exerciseRepository, userRepository, personalBestRepository, {
            hasSubscribers: globals_1.jest.fn().mockReturnValue(false),
            emitUpdated: globals_1.jest.fn(),
            emitFinished: globals_1.jest.fn(),
        });
    });
    (0, globals_1.it)('starts solo workout session from legacy common-workouts flow', async () => {
        const startedAt = new Date('2026-04-20T10:00:00.000Z');
        const savedWorkout = {
            id: 33,
            createdByUserId: 14,
            templateId: 5,
            name: 'Workout',
            status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
            startedAt,
            finishedAt: null,
            participants: [],
            exercises: [],
        };
        const soloUser = { id: 14, email: 'solo@example.com', name: 'Solo', avatarPath: null };
        commonWorkoutRepository.save.mockResolvedValue(savedWorkout);
        templateRepository.findOne.mockResolvedValue({
            id: 5,
            userId: 14,
            name: 'Solo plan',
            exercises: [{ exerciseId: 71, order: 0, setsCount: 2 }],
        });
        userRepository.findBy.mockResolvedValue([soloUser]);
        participantRepository.save.mockResolvedValue([
            {
                id: 101,
                commonWorkoutId: 33,
                userId: 14,
                user: soloUser,
            },
        ]);
        participantRepository.find
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([
            {
                id: 101,
                commonWorkoutId: 33,
                userId: 14,
            },
        ]);
        workoutRepository.find.mockResolvedValue([]);
        exerciseRepository.findOne.mockResolvedValue({
            id: 71,
            name: 'Bench Press',
        });
        commonWorkoutExerciseRepository.save.mockResolvedValue({ id: 444 });
        participantSetRepository.save.mockResolvedValue([]);
        globals_1.jest
            .spyOn(service, 'getByIdForUser')
            .mockResolvedValue({
            id: 33,
            name: 'Workout',
            mode: 'solo',
            isSolo: true,
            participantCount: 1,
            participants: [{ id: 101, user: { id: 14 } }],
            exercises: [{ id: 444, setsCount: 2 }],
        });
        globals_1.jest
            .spyOn(service, 'getPreviousSetsByUserIdForExercise')
            .mockResolvedValue(new Map([[14, new Map()]]));
        const result = await service.start(14, { templateId: 5 });
        (0, globals_1.expect)(userRepository.findBy).toHaveBeenCalledWith({ id: globals_1.expect.anything() });
        (0, globals_1.expect)(participantRepository.save).toHaveBeenCalledWith([
            globals_1.expect.objectContaining({
                commonWorkoutId: 33,
                userId: 14,
            }),
        ]);
        (0, globals_1.expect)(result).toMatchObject({
            id: 33,
            mode: 'solo',
            isSolo: true,
            participantCount: 1,
        });
    });
    (0, globals_1.it)('starts workout from a template shared with the current user', async () => {
        const savedWorkout = {
            id: 34,
            createdByUserId: 14,
            templateId: 8,
            name: 'Shared plan',
            status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
            startedAt: new Date('2026-04-21T10:00:00.000Z'),
            finishedAt: null,
            participants: [],
            exercises: [],
        };
        const user = { id: 14, email: 'member@example.com', name: 'Member', avatarPath: null };
        commonWorkoutRepository.save.mockResolvedValue(savedWorkout);
        templateRepository.findOne.mockResolvedValue({
            id: 8,
            userId: 22,
            name: 'Shared plan',
            members: [{ userId: 14 }],
            exercises: [],
        });
        userRepository.findBy.mockResolvedValue([user]);
        participantRepository.save.mockResolvedValue([
            {
                id: 102,
                commonWorkoutId: 34,
                userId: 14,
                user,
            },
        ]);
        participantRepository.find.mockResolvedValue([]);
        workoutRepository.find.mockResolvedValue([]);
        globals_1.jest
            .spyOn(service, 'getByIdForUser')
            .mockResolvedValue({
            id: 34,
            name: 'Shared plan',
            mode: 'solo',
            isSolo: true,
        });
        await (0, globals_1.expect)(service.start(14, { templateId: 8 })).resolves.toMatchObject({
            id: 34,
            name: 'Shared plan',
        });
        (0, globals_1.expect)(templateRepository.findOne).toHaveBeenCalledWith({
            where: { id: 8 },
        });
        (0, globals_1.expect)(commonWorkoutRepository.create).toHaveBeenCalledWith(globals_1.expect.objectContaining({
            templateId: 8,
            name: 'Shared plan',
        }));
    });
    (0, globals_1.it)('finishes workout session and creates history for every participant', async () => {
        const commonWorkout = {
            id: 45,
            status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
            startedAt: new Date('2026-04-20T10:00:00.000Z'),
            finishedAt: null,
            participants: [
                { id: 201, userId: 14 },
                { id: 202, userId: 19 },
            ],
            exercises: [],
        };
        commonWorkoutRepository.save.mockResolvedValue({
            ...commonWorkout,
            status: common_workout_entity_1.CommonWorkoutStatus.COMPLETED,
            finishedAt: globals_1.expect.any(Date),
        });
        globals_1.jest
            .spyOn(service, 'getActiveCommonWorkoutEntityForUser')
            .mockResolvedValue(commonWorkout);
        const createHistorySpy = globals_1.jest
            .spyOn(service, 'createIndividualWorkoutFromCommonWorkout')
            .mockResolvedValue(undefined);
        globals_1.jest
            .spyOn(service, 'getByIdForUser')
            .mockResolvedValue({ id: 45, status: 'completed' });
        const result = await service.finish(14, 45);
        (0, globals_1.expect)(createHistorySpy).toHaveBeenCalledTimes(2);
        (0, globals_1.expect)(createHistorySpy).toHaveBeenNthCalledWith(1, globals_1.expect.any(Object), {
            id: 201,
            userId: 14,
        });
        (0, globals_1.expect)(createHistorySpy).toHaveBeenNthCalledWith(2, globals_1.expect.any(Object), {
            id: 202,
            userId: 19,
        });
        (0, globals_1.expect)(result).toEqual({ id: 45, status: 'completed' });
    });
});
//# sourceMappingURL=common-workouts.workflow.spec.js.map