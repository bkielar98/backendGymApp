"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonWorkoutsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const socket_io_1 = require("socket.io");
const typeorm_2 = require("typeorm");
const common_workout_participant_entity_1 = require("../entities/common-workout-participant.entity");
const user_entity_1 = require("../entities/user.entity");
let CommonWorkoutsGateway = class CommonWorkoutsGateway {
    constructor(jwtService, userRepository, participantRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.participantRepository = participantRepository;
    }
    async handleConnection(client) {
        try {
            const token = this.extractToken(client);
            const payload = this.jwtService.verify(token);
            const user = await this.userRepository.findOne({
                where: { id: payload.sub },
            });
            if (!user) {
                client.disconnect();
                return;
            }
            client.data.userId = user.id;
            console.log('Common workout client connected:', client.id);
        }
        catch {
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        console.log('Common workout client disconnected:', client.id);
    }
    async handleJoinCommonWorkout(data, client) {
        return this.joinWorkoutRoom(data.commonWorkoutId, client);
    }
    async handleJoinWorkout(data, client) {
        return this.joinWorkoutRoom(data.workoutId ?? data.commonWorkoutId, client);
    }
    emitUpdated(commonWorkoutId, payload) {
        this.server
            .to(`common-workout-${commonWorkoutId}`)
            .emit('commonWorkoutUpdated', payload);
        this.server.to(`common-workout-${commonWorkoutId}`).emit('workoutUpdated', payload);
    }
    emitFinished(commonWorkoutId, payload) {
        this.server
            .to(`common-workout-${commonWorkoutId}`)
            .emit('commonWorkoutFinished', payload);
        this.server.to(`common-workout-${commonWorkoutId}`).emit('workoutFinished', payload);
    }
    hasSubscribers(commonWorkoutId) {
        const room = this.server?.sockets?.adapter?.rooms?.get(`common-workout-${commonWorkoutId}`);
        return (room?.size ?? 0) > 0;
    }
    async joinWorkoutRoom(commonWorkoutId, client) {
        const userId = client.data.userId;
        if (typeof userId !== 'number') {
            throw new websockets_1.WsException('Unauthorized');
        }
        if (typeof commonWorkoutId !== 'number') {
            throw new websockets_1.WsException('Common workout not found');
        }
        const participant = await this.participantRepository.findOne({
            where: {
                commonWorkoutId,
                userId,
            },
        });
        if (!participant) {
            throw new websockets_1.WsException('Common workout not found');
        }
        client.join(`common-workout-${commonWorkoutId}`);
        return { event: 'joined', data: { commonWorkoutId, workoutId: commonWorkoutId } };
    }
    extractToken(client) {
        const authToken = client.handshake.auth?.token;
        if (typeof authToken === 'string' && authToken.length > 0) {
            return authToken.startsWith('Bearer ') ? authToken.slice(7) : authToken;
        }
        const headerToken = client.handshake.headers?.authorization;
        if (typeof headerToken === 'string' && headerToken.startsWith('Bearer ')) {
            return headerToken.slice(7);
        }
        const queryToken = client.handshake.query?.token;
        if (typeof queryToken === 'string' && queryToken.length > 0) {
            return queryToken.startsWith('Bearer ') ? queryToken.slice(7) : queryToken;
        }
        throw new websockets_1.WsException('Missing bearer token');
    }
};
exports.CommonWorkoutsGateway = CommonWorkoutsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], CommonWorkoutsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinCommonWorkout'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsGateway.prototype, "handleJoinCommonWorkout", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinWorkout'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsGateway.prototype, "handleJoinWorkout", null);
exports.CommonWorkoutsGateway = CommonWorkoutsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: '/common-workouts' }),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(common_workout_participant_entity_1.CommonWorkoutParticipant)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CommonWorkoutsGateway);
//# sourceMappingURL=common-workouts.gateway.js.map