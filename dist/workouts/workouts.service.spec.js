"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const workouts_service_1 = require("./workouts.service");
const workout_entity_1 = require("../entities/workout.entity");
(0, globals_1.describe)('WorkoutsService', () => {
    let service;
    let workoutRepository;
    let workoutExerciseRepository;
    let workoutSetRepository;
    let templateRepository;
    let exerciseRepository;
    (0, globals_1.beforeEach)(() => {
        workoutRepository = {
            findOne: globals_1.jest.fn(),
            save: globals_1.jest.fn(),
            create: globals_1.jest.fn(),
            find: globals_1.jest.fn(),
            delete: globals_1.jest.fn(),
        };
        workoutExerciseRepository = {
            save: globals_1.jest.fn(),
            create: globals_1.jest.fn(),
            findOne: globals_1.jest.fn(),
            delete: globals_1.jest.fn(),
        };
        workoutSetRepository = {
            save: globals_1.jest.fn(),
            create: globals_1.jest.fn(),
            findOne: globals_1.jest.fn(),
            find: globals_1.jest.fn(),
            delete: globals_1.jest.fn(),
        };
        templateRepository = {
            findOne: globals_1.jest.fn(),
        };
        exerciseRepository = {
            findOne: globals_1.jest.fn(),
        };
        service = new workouts_service_1.WorkoutsService(workoutRepository, workoutExerciseRepository, workoutSetRepository, templateRepository, exerciseRepository);
    });
    (0, globals_1.it)('starts an empty workout when templateId is omitted', async () => {
        const createdWorkout = {
            userId: 15,
            templateId: null,
            template: null,
            name: 'Workout',
            status: workout_entity_1.WorkoutStatus.ACTIVE,
            startedAt: new Date('2026-03-20T10:00:00.000Z'),
            finishedAt: null,
            exercises: [],
        };
        const savedWorkout = {
            ...createdWorkout,
            id: 1,
        };
        workoutRepository.findOne
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(savedWorkout);
        workoutRepository.create.mockReturnValue(createdWorkout);
        workoutRepository.save.mockResolvedValue(savedWorkout);
        const result = await service.startWorkout(15, {});
        (0, globals_1.expect)(templateRepository.findOne).not.toHaveBeenCalled();
        (0, globals_1.expect)(result).toMatchObject({
            id: 1,
            template: null,
            exercises: [],
        });
    });
    (0, globals_1.it)('returns a duration label for finished workouts', async () => {
        const workout = {
            id: 2,
            userId: 15,
            name: 'Upper A',
            status: workout_entity_1.WorkoutStatus.COMPLETED,
            startedAt: new Date('2026-03-20T10:00:00.000Z'),
            finishedAt: new Date('2026-03-20T12:15:00.000Z'),
            template: null,
            exercises: [],
        };
        workoutRepository.findOne.mockResolvedValue(workout);
        const result = await service.findOne(15, 2);
        (0, globals_1.expect)(result).toMatchObject({
            durationSeconds: 8100,
            durationLabel: '2h 15min',
        });
    });
    (0, globals_1.it)('returns only completed workouts in history with card summary fields', async () => {
        workoutRepository.find.mockResolvedValue([
            {
                id: 7,
                userId: 15,
                name: 'Push Day',
                status: workout_entity_1.WorkoutStatus.COMPLETED,
                startedAt: new Date('2026-03-20T10:00:00.000Z'),
                finishedAt: new Date('2026-03-20T11:00:00.000Z'),
                template: { id: 4, name: 'Upper 1' },
                exercises: [
                    {
                        id: 20,
                        order: 0,
                        exercise: {
                            id: 1,
                            name: 'Bench Press',
                            description: 'Chest exercise',
                            muscleGroups: ['chest'],
                        },
                        sets: [
                            { id: 1, setNumber: 1 },
                            { id: 2, setNumber: 2 },
                        ],
                    },
                    {
                        id: 21,
                        order: 1,
                        exercise: {
                            id: 2,
                            name: 'Shoulder Press',
                            description: 'Shoulder exercise',
                            muscleGroups: ['shoulders'],
                        },
                        sets: [{ id: 3, setNumber: 1 }],
                    },
                ],
            },
        ]);
        const result = await service.findHistory(15);
        (0, globals_1.expect)(workoutRepository.find).toHaveBeenCalledWith({
            where: {
                userId: 15,
                status: workout_entity_1.WorkoutStatus.COMPLETED,
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
        (0, globals_1.expect)(result).toMatchObject([
            {
                id: 7,
                exerciseCount: 2,
                totalSets: 3,
                exerciseNames: ['Bench Press', 'Shoulder Press'],
            },
        ]);
        (0, globals_1.expect)(result[0]).not.toHaveProperty('exercises');
    });
});
//# sourceMappingURL=workouts.service.spec.js.map