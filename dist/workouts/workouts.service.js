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
exports.WorkoutsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const exercise_entity_1 = require("../entities/exercise.entity");
const gym_gateway_1 = require("../gym/gym.gateway");
const muscle_status_service_1 = require("../muscle-status/muscle-status.service");
let WorkoutsService = class WorkoutsService {
    constructor(exerciseRepository, gymGateway, muscleStatusService) {
        this.exerciseRepository = exerciseRepository;
        this.gymGateway = gymGateway;
        this.muscleStatusService = muscleStatusService;
    }
    async logSet(userId, logSetDto) {
        const exercise = await this.exerciseRepository.findOne({ where: { id: logSetDto.exerciseId } });
        if (!exercise) {
            throw new Error('Exercise not found');
        }
        const oneRM = logSetDto.weight * (1 + 0.0333 * logSetDto.reps);
        this.gymGateway.server.to(`gym-${logSetDto.gymId}`).emit('leaderboardUpdate', { userId, oneRM, exerciseId: logSetDto.exerciseId });
        await this.muscleStatusService.updateLastTrained(userId, exercise.muscleGroups);
        return { oneRM };
    }
};
exports.WorkoutsService = WorkoutsService;
exports.WorkoutsService = WorkoutsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(exercise_entity_1.Exercise)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        gym_gateway_1.GymGateway,
        muscle_status_service_1.MuscleStatusService])
], WorkoutsService);
//# sourceMappingURL=workouts.service.js.map