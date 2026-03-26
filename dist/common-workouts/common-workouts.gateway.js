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
const socket_io_1 = require("socket.io");
let CommonWorkoutsGateway = class CommonWorkoutsGateway {
    handleConnection(client) {
        console.log('Common workout client connected:', client.id);
    }
    handleDisconnect(client) {
        console.log('Common workout client disconnected:', client.id);
    }
    handleJoinCommonWorkout(data, client) {
        client.join(`common-workout-${data.commonWorkoutId}`);
        return { event: 'joined', data: { commonWorkoutId: data.commonWorkoutId } };
    }
    emitUpdated(commonWorkoutId, payload) {
        this.server
            .to(`common-workout-${commonWorkoutId}`)
            .emit('commonWorkoutUpdated', payload);
    }
    emitFinished(commonWorkoutId, payload) {
        this.server
            .to(`common-workout-${commonWorkoutId}`)
            .emit('commonWorkoutFinished', payload);
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
    __metadata("design:returntype", void 0)
], CommonWorkoutsGateway.prototype, "handleJoinCommonWorkout", null);
exports.CommonWorkoutsGateway = CommonWorkoutsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: '/common-workouts' })
], CommonWorkoutsGateway);
//# sourceMappingURL=common-workouts.gateway.js.map