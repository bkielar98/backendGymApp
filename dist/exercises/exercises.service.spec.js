"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../entities/user.entity");
const exercises_service_1 = require("./exercises.service");
(0, globals_1.describe)('ExercisesService', () => {
    let service;
    let exerciseRepository;
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
        service = new exercises_service_1.ExercisesService(exerciseRepository);
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
});
//# sourceMappingURL=exercises.service.spec.js.map