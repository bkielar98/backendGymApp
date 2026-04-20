"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const workouts_service_1 = require("./workouts.service");
(0, globals_1.describe)('WorkoutsService active state', () => {
    let service;
    let workoutRepository;
    (0, globals_1.beforeEach)(() => {
        workoutRepository = {
            findOne: globals_1.jest.fn(),
        };
        service = new workouts_service_1.WorkoutsService(workoutRepository, {}, {}, {}, {});
    });
    (0, globals_1.it)('returns null when there is no active workout', async () => {
        workoutRepository.findOne.mockResolvedValue(null);
        await (0, globals_1.expect)(service.getActiveWorkout(14)).resolves.toBeNull();
    });
    (0, globals_1.it)('loads exercises and sets for the active workout response', async () => {
        workoutRepository.findOne.mockResolvedValue({
            id: 9,
            name: 'Solo',
            status: 'active',
            startedAt: new Date('2026-04-14T10:00:00.000Z'),
            finishedAt: null,
            template: null,
            exercises: [
                {
                    id: 4,
                    order: 0,
                    exercise: {
                        id: 7,
                        name: 'Bench Press',
                        description: 'Chest',
                        muscleGroups: ['chest'],
                    },
                    sets: [
                        {
                            id: 11,
                            setNumber: 1,
                            previousWeight: 80,
                            previousReps: 8,
                            currentWeight: null,
                            currentReps: null,
                            repMax: null,
                            confirmed: false,
                        },
                    ],
                },
            ],
        });
        const result = await service.getActiveWorkout(14);
        (0, globals_1.expect)(workoutRepository.findOne).toHaveBeenCalledWith(globals_1.expect.objectContaining({
            where: { userId: 14, status: 'active' },
            relations: {
                template: true,
                exercises: {
                    exercise: true,
                    sets: true,
                },
            },
        }));
        (0, globals_1.expect)(result?.exerciseCount).toBe(1);
        (0, globals_1.expect)(result?.exercises).toHaveLength(1);
        (0, globals_1.expect)(result?.exercises[0].sets).toHaveLength(1);
    });
});
//# sourceMappingURL=workouts.active.spec.js.map