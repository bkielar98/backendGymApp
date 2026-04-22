"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const common_workouts_controller_1 = require("./common-workouts.controller");
(0, globals_1.describe)('CommonWorkoutsController', () => {
    let controller;
    let service;
    (0, globals_1.beforeEach)(() => {
        service = {
            getActive: globals_1.jest.fn(),
            getHistoryForUser: globals_1.jest.fn(),
            getHistoricalByIdForUser: globals_1.jest.fn(),
            getHistoricalSummaryForUser: globals_1.jest.fn(),
            updateHistoricalWorkout: globals_1.jest.fn(),
            removeHistoricalWorkout: globals_1.jest.fn(),
            getSummaryForUser: globals_1.jest.fn(),
            getIndexForUser: globals_1.jest.fn(),
            getExerciseHistoryForUser: globals_1.jest.fn(),
            getDashboardStatsForUser: globals_1.jest.fn(),
        };
        controller = new common_workouts_controller_1.CommonWorkoutsController(service);
    });
    (0, globals_1.it)('exposes summary, exercise history and dashboard stats on workouts api', async () => {
        service.getHistoryForUser.mockResolvedValue([{ id: 11 }]);
        service.getHistoricalByIdForUser.mockResolvedValue({ id: 11, exercises: [] });
        service.getHistoricalSummaryForUser.mockResolvedValue({ id: 11, exerciseCount: 2 });
        service.updateHistoricalWorkout.mockResolvedValue({ id: 11, name: 'Edited' });
        service.removeHistoricalWorkout.mockResolvedValue({ success: true });
        service.getSummaryForUser.mockResolvedValue({ id: 12, source: 'history' });
        service.getIndexForUser.mockResolvedValue({ id: 12, exercises: [] });
        service.getExerciseHistoryForUser.mockResolvedValue({
            exercise: { id: 7, name: 'Bench Press' },
            history: [],
        });
        service.getDashboardStatsForUser.mockResolvedValue({
            workoutsCount: 8,
        });
        await (0, globals_1.expect)(controller.findHistory({ user: { id: 14 } })).resolves.toEqual([{ id: 11 }]);
        await (0, globals_1.expect)(controller.findHistoryOne({ user: { id: 14 } }, 11)).resolves.toEqual({
            id: 11,
            exercises: [],
        });
        await (0, globals_1.expect)(controller.findHistorySummary({ user: { id: 14 } }, 11)).resolves.toEqual({
            id: 11,
            exerciseCount: 2,
        });
        await (0, globals_1.expect)(controller.updateHistory({ user: { id: 14 } }, 11, { name: 'Edited' })).resolves.toEqual({
            id: 11,
            name: 'Edited',
        });
        await (0, globals_1.expect)(controller.removeHistory({ user: { id: 14 } }, 11)).resolves.toEqual({
            success: true,
        });
        await (0, globals_1.expect)(controller.findSummary({ user: { id: 14 } }, 12)).resolves.toEqual({
            id: 12,
            source: 'history',
        });
        await (0, globals_1.expect)(controller.findIndex({ user: { id: 14 } }, 12)).resolves.toEqual({
            id: 12,
            exercises: [],
        });
        await (0, globals_1.expect)(controller.findOne({ user: { id: 14 } }, 12)).resolves.toEqual({
            id: 12,
            exercises: [],
        });
        await (0, globals_1.expect)(controller.getExerciseHistory({ user: { id: 14 } }, 7)).resolves.toEqual({
            exercise: { id: 7, name: 'Bench Press' },
            history: [],
        });
        await (0, globals_1.expect)(controller.getDashboardStats({ user: { id: 14 } }, { dateFrom: '2026-04-01', dateTo: '2026-04-30' })).resolves.toEqual({
            workoutsCount: 8,
        });
        (0, globals_1.expect)(service.getHistoryForUser).toHaveBeenCalledWith(14);
        (0, globals_1.expect)(service.getHistoricalByIdForUser).toHaveBeenCalledWith(14, 11);
        (0, globals_1.expect)(service.getHistoricalSummaryForUser).toHaveBeenCalledWith(14, 11);
        (0, globals_1.expect)(service.updateHistoricalWorkout).toHaveBeenCalledWith(14, 11, {
            name: 'Edited',
        });
        (0, globals_1.expect)(service.removeHistoricalWorkout).toHaveBeenCalledWith(14, 11);
        (0, globals_1.expect)(service.getSummaryForUser).toHaveBeenCalledWith(14, 12);
        (0, globals_1.expect)(service.getIndexForUser).toHaveBeenCalledWith(14, 12);
        (0, globals_1.expect)(service.getExerciseHistoryForUser).toHaveBeenCalledWith(14, 7);
        (0, globals_1.expect)(service.getDashboardStatsForUser).toHaveBeenCalledWith(14, {
            dateFrom: '2026-04-01',
            dateTo: '2026-04-30',
        });
    });
});
//# sourceMappingURL=common-workouts.controller.spec.js.map