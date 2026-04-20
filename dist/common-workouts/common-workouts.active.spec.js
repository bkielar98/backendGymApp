"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const common_workouts_service_1 = require("./common-workouts.service");
(0, globals_1.describe)('CommonWorkoutsService active state', () => {
    let service;
    let participantRepository;
    (0, globals_1.beforeEach)(() => {
        participantRepository = {
            findOne: globals_1.jest.fn(),
        };
        service = new common_workouts_service_1.CommonWorkoutsService({}, participantRepository, {}, {}, {}, {}, {}, {}, {}, {}, {}, {});
    });
    (0, globals_1.it)('returns null when there is no active common workout', async () => {
        participantRepository.findOne.mockResolvedValue(null);
        await (0, globals_1.expect)(service.getActive(14)).resolves.toBeNull();
    });
});
//# sourceMappingURL=common-workouts.active.spec.js.map