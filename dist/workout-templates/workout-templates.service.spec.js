"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const workout_templates_service_1 = require("./workout-templates.service");
(0, globals_1.describe)('WorkoutTemplatesService', () => {
    let service;
    let templateRepository;
    let templateExerciseRepository;
    let templateMemberRepository;
    let exerciseRepository;
    let friendshipRepository;
    let userRepository;
    (0, globals_1.beforeEach)(() => {
        templateRepository = {
            create: globals_1.jest.fn(),
            save: globals_1.jest.fn(),
            findOne: globals_1.jest.fn(),
            createQueryBuilder: globals_1.jest.fn(),
        };
        templateExerciseRepository = {
            create: globals_1.jest.fn(),
        };
        templateMemberRepository = {
            delete: globals_1.jest.fn(),
            create: globals_1.jest.fn(),
            save: globals_1.jest.fn(),
            find: globals_1.jest.fn(),
        };
        exerciseRepository = {
            find: globals_1.jest.fn(),
        };
        friendshipRepository = {
            find: globals_1.jest.fn(),
        };
        userRepository = {
            find: globals_1.jest.fn(),
        };
        service = new workout_templates_service_1.WorkoutTemplatesService(templateRepository, templateExerciseRepository, templateMemberRepository, exerciseRepository, friendshipRepository, userRepository);
    });
    (0, globals_1.it)('creates a workout template with an empty exercise list', async () => {
        templateRepository.create.mockImplementation((value) => value);
        templateRepository.save.mockResolvedValue({ id: 11 });
        templateRepository.findOne.mockResolvedValue({
            id: 11,
            name: 'Empty plan',
            userId: 7,
            description: null,
            labels: [],
            startDate: null,
            endDate: null,
            tasks: [],
            isShared: false,
            shareCode: null,
            members: [],
            exercises: [],
        });
        templateRepository.createQueryBuilder.mockReturnValue({
            leftJoinAndSelect: globals_1.jest.fn().mockReturnThis(),
            where: globals_1.jest.fn().mockReturnThis(),
            andWhere: globals_1.jest.fn().mockReturnThis(),
            getOne: globals_1.jest.fn().mockResolvedValue({
                id: 11,
                name: 'Empty plan',
                userId: 7,
                description: null,
                labels: [],
                startDate: null,
                endDate: null,
                tasks: [],
                isShared: false,
                shareCode: null,
                members: [],
                exercises: [],
            }),
        });
        await (0, globals_1.expect)(service.create(7, {
            name: 'Empty plan',
            exercises: [],
        })).resolves.toEqual({
            id: 11,
            name: 'Empty plan',
            description: null,
            labels: [],
            startDate: null,
            endDate: null,
            tasks: [],
            isShared: false,
            shareCode: null,
            access: 'owner',
            owner: {
                id: 7,
                name: null,
                email: null,
                avatarPath: null,
            },
            members: [],
            exercises: [],
        });
        (0, globals_1.expect)(exerciseRepository.find).not.toHaveBeenCalled();
        (0, globals_1.expect)(templateMemberRepository.delete).not.toHaveBeenCalled();
        (0, globals_1.expect)(templateRepository.create).toHaveBeenCalledWith({
            name: 'Empty plan',
            description: null,
            labels: [],
            startDate: null,
            endDate: null,
            tasks: [],
            isShared: false,
            shareCode: null,
            userId: 7,
            exercises: [],
        });
    });
});
//# sourceMappingURL=workout-templates.service.spec.js.map