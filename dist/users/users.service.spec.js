"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../entities/user.entity");
const users_service_1 = require("./users.service");
(0, globals_1.describe)('UsersService', () => {
    let service;
    let userRepository;
    let weightEntryRepository;
    let bodyMeasurementEntryRepository;
    (0, globals_1.beforeEach)(() => {
        userRepository = {
            findOne: globals_1.jest.fn(),
            update: globals_1.jest.fn(),
            delete: globals_1.jest.fn(),
        };
        weightEntryRepository = {
            find: globals_1.jest.fn(),
            findOne: globals_1.jest.fn(),
            create: globals_1.jest.fn(),
            save: globals_1.jest.fn(),
            remove: globals_1.jest.fn(),
        };
        bodyMeasurementEntryRepository = {
            find: globals_1.jest.fn(),
            findOne: globals_1.jest.fn(),
            create: globals_1.jest.fn(),
            save: globals_1.jest.fn(),
            remove: globals_1.jest.fn(),
        };
        service = new users_service_1.UsersService(userRepository, weightEntryRepository, bodyMeasurementEntryRepository);
    });
    (0, globals_1.it)('builds lightweight session profile', async () => {
        userRepository.findOne.mockResolvedValue({
            id: 19,
            email: 'user@example.com',
            name: 'User',
            gender: 'male',
            role: user_entity_1.UserRole.USER,
            avatarPath: '/uploads/avatars/test.jpg',
            weight: null,
            weightEntries: [
                { id: 2, recordedOn: '2026-03-12', weight: 79.8 },
                { id: 1, recordedOn: '2026-03-11', weight: 80.1 },
            ],
            bodyMeasurementEntries: [],
        });
        await (0, globals_1.expect)(service.getSessionProfile(19)).resolves.toMatchObject({
            email: 'user@example.com',
            avatarUrl: '/uploads/avatars/test.jpg',
        });
    });
    (0, globals_1.it)('rejects email change when current password is invalid', async () => {
        userRepository.findOne.mockResolvedValue({
            id: 19,
            email: 'user@example.com',
            password: await bcrypt.hash('Password123!', 10),
            name: 'User',
            role: user_entity_1.UserRole.USER,
            weightEntries: [],
            bodyMeasurementEntries: [],
        });
        await (0, globals_1.expect)(service.updateEmail(19, {
            currentPassword: 'wrong-password',
            newEmail: 'new@example.com',
        })).rejects.toBeInstanceOf(common_1.UnauthorizedException);
    });
    (0, globals_1.it)('returns body measurement history as a plain array', async () => {
        bodyMeasurementEntryRepository.find.mockResolvedValue([
            {
                id: 2,
                recordedOn: '2026-03-12',
                neck: 38,
                shoulders: 119,
                chest: 105,
                leftBiceps: 34,
                rightBiceps: 34,
                leftForearm: 30,
                rightForearm: 30,
                upperAbs: 89,
                waist: 81,
                lowerAbs: 85,
                hips: 97,
                leftThigh: 57,
                rightThigh: 57,
                leftCalf: 36,
                rightCalf: 36,
            },
            {
                id: 1,
                recordedOn: '2026-03-11',
                neck: 37,
                shoulders: 118,
                chest: 104,
                leftBiceps: 33,
                rightBiceps: 33,
                leftForearm: 29,
                rightForearm: 29,
                upperAbs: 90,
                waist: 82,
                lowerAbs: 86,
                hips: 98,
                leftThigh: 58,
                rightThigh: 58,
                leftCalf: 37,
                rightCalf: 37,
            },
        ]);
        userRepository.findOne.mockResolvedValue({
            id: 19,
            email: 'user@example.com',
            name: 'User',
            role: user_entity_1.UserRole.USER,
            weightEntries: [],
            bodyMeasurementEntries: [],
        });
        await (0, globals_1.expect)(service.listBodyMeasurementEntries(19)).resolves.toMatchObject([
            {
                recordedOn: '2026-03-12',
                neck: 38,
                waist: 81,
            },
            {
                recordedOn: '2026-03-11',
                neck: 37,
                waist: 82,
            },
        ]);
    });
});
//# sourceMappingURL=users.service.spec.js.map