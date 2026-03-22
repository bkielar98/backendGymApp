"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const exercises_controller_1 = require("./exercises.controller");
(0, globals_1.describe)('ExercisesController', () => {
    let controller;
    let exercisesService;
    (0, globals_1.beforeEach)(() => {
        exercisesService = {
            create: globals_1.jest.fn(),
            findAll: globals_1.jest.fn(),
            findCustom: globals_1.jest.fn(),
            findOne: globals_1.jest.fn(),
            update: globals_1.jest.fn(),
            remove: globals_1.jest.fn(),
        };
        controller = new exercises_controller_1.ExercisesController(exercisesService);
    });
    (0, globals_1.it)('wraps list responses in items/total', async () => {
        const items = [{ id: 1, name: 'Bench Press' }];
        exercisesService.findAll.mockResolvedValue(items);
        await (0, globals_1.expect)(controller.findAll({ user: { id: 15 } })).resolves.toEqual({
            items,
            total: 1,
        });
    });
    (0, globals_1.it)('wraps custom list responses in items/total', async () => {
        const items = [{ id: 2, name: 'My Custom Row' }];
        exercisesService.findCustom.mockResolvedValue(items);
        await (0, globals_1.expect)(controller.findCustom({ user: { id: 15 } })).resolves.toEqual({
            items,
            total: 1,
        });
    });
    (0, globals_1.it)('wraps create response in item', async () => {
        const item = { id: 3, name: 'Lat Pulldown' };
        exercisesService.create.mockResolvedValue(item);
        await (0, globals_1.expect)(controller.create({ user: { id: 15 } }, { name: 'Lat Pulldown', muscleGroups: ['back'] })).resolves.toEqual({ item });
    });
});
//# sourceMappingURL=exercises.controller.spec.js.map