"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const websockets_1 = require("@nestjs/websockets");
const common_workouts_gateway_1 = require("./common-workouts.gateway");
(0, globals_1.describe)('CommonWorkoutsGateway', () => {
    let gateway;
    let emit;
    let jwtService;
    let userRepository;
    let participantRepository;
    (0, globals_1.beforeEach)(() => {
        jwtService = {
            verify: globals_1.jest.fn(),
        };
        userRepository = {
            findOne: globals_1.jest.fn(),
        };
        participantRepository = {
            findOne: globals_1.jest.fn(),
        };
        gateway = new common_workouts_gateway_1.CommonWorkoutsGateway(jwtService, userRepository, participantRepository);
        emit = globals_1.jest.fn();
        gateway.server = {
            to: globals_1.jest.fn().mockReturnValue({
                emit,
            }),
        };
    });
    (0, globals_1.it)('disconnects socket when token is missing', async () => {
        const disconnect = globals_1.jest.fn();
        const client = {
            id: 'socket-1',
            handshake: {
                auth: {},
                headers: {},
                query: {},
            },
            disconnect,
            data: {},
        };
        await gateway.handleConnection(client);
        (0, globals_1.expect)(disconnect).toHaveBeenCalled();
        (0, globals_1.expect)(jwtService.verify).not.toHaveBeenCalled();
    });
    (0, globals_1.it)('disconnects socket when token user does not exist', async () => {
        const disconnect = globals_1.jest.fn();
        const client = {
            id: 'socket-2',
            handshake: {
                auth: {
                    token: 'Bearer token-value',
                },
                headers: {},
                query: {},
            },
            disconnect,
            data: {},
        };
        jwtService.verify.mockReturnValue({ sub: 15 });
        userRepository.findOne.mockResolvedValue(null);
        await gateway.handleConnection(client);
        (0, globals_1.expect)(disconnect).toHaveBeenCalled();
    });
    (0, globals_1.it)('joins room only for workout participant', async () => {
        const join = globals_1.jest.fn();
        const client = {
            data: { userId: 15 },
            join,
        };
        participantRepository.findOne.mockResolvedValue({
            id: 1,
            commonWorkoutId: 5,
            userId: 15,
        });
        const result = await gateway.handleJoinCommonWorkout({ commonWorkoutId: 5 }, client);
        (0, globals_1.expect)(participantRepository.findOne).toHaveBeenCalledWith({
            where: {
                commonWorkoutId: 5,
                userId: 15,
            },
        });
        (0, globals_1.expect)(join).toHaveBeenCalledWith('common-workout-5');
        (0, globals_1.expect)(result).toEqual({
            event: 'joined',
            data: { commonWorkoutId: 5, workoutId: 5 },
        });
    });
    (0, globals_1.it)('joins room with neutral workout alias event', async () => {
        const join = globals_1.jest.fn();
        const client = {
            data: { userId: 15 },
            join,
        };
        participantRepository.findOne.mockResolvedValue({
            id: 1,
            commonWorkoutId: 5,
            userId: 15,
        });
        const result = await gateway.handleJoinWorkout({ workoutId: 5 }, client);
        (0, globals_1.expect)(join).toHaveBeenCalledWith('common-workout-5');
        (0, globals_1.expect)(result).toEqual({
            event: 'joined',
            data: { commonWorkoutId: 5, workoutId: 5 },
        });
    });
    (0, globals_1.it)('rejects joining room for non participant', async () => {
        const client = {
            data: { userId: 16 },
            join: globals_1.jest.fn(),
        };
        participantRepository.findOne.mockResolvedValue(null);
        await (0, globals_1.expect)(gateway.handleJoinCommonWorkout({ commonWorkoutId: 5 }, client)).rejects.toBeInstanceOf(websockets_1.WsException);
        (0, globals_1.expect)(client.join).not.toHaveBeenCalled();
    });
    (0, globals_1.it)('reports subscribers only when room exists and has sockets', () => {
        gateway.server = {
            sockets: {
                adapter: {
                    rooms: new Map([
                        ['common-workout-5', new Set(['socket-1'])],
                    ]),
                },
            },
        };
        (0, globals_1.expect)(gateway.hasSubscribers(5)).toBe(true);
        (0, globals_1.expect)(gateway.hasSubscribers(6)).toBe(false);
    });
    (0, globals_1.it)('emits both legacy and neutral workout events', () => {
        gateway.emitUpdated(5, { id: 5 });
        gateway.emitFinished(5, { id: 5 });
        (0, globals_1.expect)(emit).toHaveBeenNthCalledWith(1, 'commonWorkoutUpdated', { id: 5 });
        (0, globals_1.expect)(emit).toHaveBeenNthCalledWith(2, 'workoutUpdated', { id: 5 });
        (0, globals_1.expect)(emit).toHaveBeenNthCalledWith(3, 'commonWorkoutFinished', { id: 5 });
        (0, globals_1.expect)(emit).toHaveBeenNthCalledWith(4, 'workoutFinished', { id: 5 });
    });
});
//# sourceMappingURL=common-workouts.gateway.spec.js.map