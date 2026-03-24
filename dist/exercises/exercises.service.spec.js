"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../entities/user.entity");
const exercises_service_1 = require("./exercises.service");
const workout_entity_1 = require("../entities/workout.entity");
(0, globals_1.describe)('ExercisesService', () => {
    let service;
    let exerciseRepository;
    let workoutExerciseRepository;
    (0, globals_1.beforeEach)(() => {
        exerciseRepository = {
            create: globals_1.jest.fn(),
            save: globals_1.jest.fn(),
            find: globals_1.jest.fn(),
            findOne: globals_1.jest.fn(),
            update: globals_1.jest.fn(),
            delete: globals_1.jest.fn(),
            createQueryBuilder: globals_1.jest.fn(),
        };
        workoutExerciseRepository = {
            find: globals_1.jest.fn(),
        };
        service = new exercises_service_1.ExercisesService(exerciseRepository, workoutExerciseRepository);
    });
    (0, globals_1.it)('creates admin exercises as global', async () => {
        const created = {
            id: 1,
            name: 'Bench Press',
            isGlobal: true,
            createdByUserId: null,
        };
        exerciseRepository.create.mockReturnValue(created);
        exerciseRepository.save.mockResolvedValue(created);
        await (0, globals_1.expect)(service.create({ id: 14, role: user_entity_1.UserRole.ADMIN }, { name: 'Bench Press', description: 'desc', muscleGroups: ['chest'] })).resolves.toMatchObject({
            isGlobal: true,
            createdByUserId: null,
        });
    });
    (0, globals_1.it)('creates regular user exercises as private', async () => {
        const created = {
            id: 2,
            name: 'My Curl',
            isGlobal: false,
            createdByUserId: 15,
        };
        exerciseRepository.create.mockReturnValue(created);
        exerciseRepository.save.mockResolvedValue(created);
        await (0, globals_1.expect)(service.create({ id: 15, role: user_entity_1.UserRole.USER }, { name: 'My Curl', description: 'desc', muscleGroups: ['biceps'] })).resolves.toMatchObject({
            isGlobal: false,
            createdByUserId: 15,
        });
    });
    (0, globals_1.it)('hides private exercises from other users', async () => {
        const privateExercise = {
            id: 10,
            name: 'Private Exercise',
            isGlobal: false,
            createdByUserId: 15,
        };
        exerciseRepository.findOne.mockResolvedValue(privateExercise);
        await (0, globals_1.expect)(service.findOne({ id: 16, role: user_entity_1.UserRole.USER }, 10)).rejects.toBeInstanceOf(common_1.NotFoundException);
    });
    (0, globals_1.it)('returns custom exercises only for the owner', async () => {
        const items = [{ id: 10, name: 'Private Exercise', createdByUserId: 15 }];
        exerciseRepository.find.mockResolvedValue(items);
        await (0, globals_1.expect)(service.findCustom({ id: 15, role: user_entity_1.UserRole.USER })).resolves.toEqual(items);
        (0, globals_1.expect)(exerciseRepository.find).toHaveBeenCalledWith({
            where: {
                isGlobal: false,
                createdByUserId: 15,
            },
            order: {
                name: 'ASC',
            },
        });
    });
    (0, globals_1.it)('returns exercise history grouped by date', async () => {
        exerciseRepository.findOne.mockResolvedValue({
            id: 1,
            name: 'Bench Press',
            isGlobal: true,
            createdByUserId: null,
        });
        workoutExerciseRepository.find.mockResolvedValue([
            {
                id: 30,
                exerciseId: 1,
                workout: {
                    id: 6,
                    userId: 15,
                    status: workout_entity_1.WorkoutStatus.COMPLETED,
                    startedAt: new Date('2026-03-23T09:00:00.000Z'),
                    finishedAt: new Date('2026-03-23T10:00:00.000Z'),
                },
                sets: [
                    {
                        id: 300,
                        setNumber: 1,
                        previousWeight: 75,
                        previousReps: 8,
                        currentWeight: 80,
                        currentReps: 8,
                        repMax: 101.33,
                        confirmed: true,
                    },
                ],
            },
            {
                id: 29,
                exerciseId: 1,
                workout: {
                    id: 5,
                    userId: 15,
                    status: workout_entity_1.WorkoutStatus.COMPLETED,
                    startedAt: new Date('2026-03-17T09:00:00.000Z'),
                    finishedAt: new Date('2026-03-17T10:00:00.000Z'),
                },
                sets: [
                    {
                        id: 290,
                        setNumber: 1,
                        previousWeight: 72.5,
                        previousReps: 8,
                        currentWeight: 77.5,
                        currentReps: 8,
                        repMax: 98.17,
                        confirmed: true,
                    },
                ],
            },
        ]);
        await (0, globals_1.expect)(service.findHistory({ id: 15, role: user_entity_1.UserRole.USER }, 1)).resolves.toEqual([
            {
                date: '2026-03-23',
                sets: [
                    {
                        id: 300,
                        setNumber: 1,
                        previousWeight: 75,
                        previousReps: 8,
                        currentWeight: 80,
                        currentReps: 8,
                        repMax: 101.33,
                        confirmed: true,
                    },
                ],
            },
            {
                date: '2026-03-17',
                sets: [
                    {
                        id: 290,
                        setNumber: 1,
                        previousWeight: 72.5,
                        previousReps: 8,
                        currentWeight: 77.5,
                        currentReps: 8,
                        repMax: 98.17,
                        confirmed: true,
                    },
                ],
            },
        ]);
    });
});
//# sourceMappingURL=exercises.service.spec.js.map