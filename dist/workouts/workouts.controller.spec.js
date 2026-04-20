"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const workouts_controller_1 = require("./workouts.controller");
(0, globals_1.describe)('WorkoutsController', () => {
    let controller;
    let workoutsService;
    (0, globals_1.beforeEach)(() => {
        workoutsService = {
            findAll: globals_1.jest.fn(),
            findHistory: globals_1.jest.fn(),
            findOne: globals_1.jest.fn(),
            findSummary: globals_1.jest.fn(),
            updateWorkout: globals_1.jest.fn(),
            removeWorkout: globals_1.jest.fn(),
        };
        controller = new workouts_controller_1.WorkoutsController(workoutsService);
    });
    (0, globals_1.it)('exposes only workout history endpoints', async () => {
        workoutsService.findAll.mockResolvedValue([{ id: 2 }]);
        workoutsService.findHistory.mockResolvedValue([{ id: 1 }]);
        workoutsService.findOne.mockResolvedValue({ id: 3 });
        workoutsService.findSummary.mockResolvedValue({ id: 3, exerciseCount: 4 });
        workoutsService.updateWorkout.mockResolvedValue({ id: 3, name: 'Edited' });
        workoutsService.removeWorkout.mockResolvedValue({ success: true });
        await (0, globals_1.expect)(controller.findAll({ user: { id: 14 } })).resolves.toEqual([{ id: 2 }]);
        await (0, globals_1.expect)(controller.findHistory({ user: { id: 14 } })).resolves.toEqual([{ id: 1 }]);
        await (0, globals_1.expect)(controller.findOne({ user: { id: 14 } }, 3)).resolves.toEqual({ id: 3 });
        await (0, globals_1.expect)(controller.findSummary({ user: { id: 14 } }, 3)).resolves.toEqual({
            id: 3,
            exerciseCount: 4,
        });
        await (0, globals_1.expect)(controller.updateWorkout({ user: { id: 14 } }, 3, { name: 'Edited' })).resolves.toEqual({ id: 3, name: 'Edited' });
        await (0, globals_1.expect)(controller.removeWorkout({ user: { id: 14 } }, 3)).resolves.toEqual({
            success: true,
        });
        (0, globals_1.expect)(workoutsService.findAll).toHaveBeenCalledWith(14);
        (0, globals_1.expect)(workoutsService.findHistory).toHaveBeenCalledWith(14);
        (0, globals_1.expect)(workoutsService.findOne).toHaveBeenCalledWith(14, 3);
        (0, globals_1.expect)(workoutsService.findSummary).toHaveBeenCalledWith(14, 3);
        (0, globals_1.expect)(workoutsService.updateWorkout).toHaveBeenCalledWith(14, 3, {
            name: 'Edited',
        });
        (0, globals_1.expect)(workoutsService.removeWorkout).toHaveBeenCalledWith(14, 3);
    });
});
//# sourceMappingURL=workouts.controller.spec.js.map