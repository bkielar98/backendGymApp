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
exports.MuscleStatusService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const muscle_status_entity_1 = require("../entities/muscle-status.entity");
let MuscleStatusService = class MuscleStatusService {
    constructor(muscleStatusRepository) {
        this.muscleStatusRepository = muscleStatusRepository;
    }
    async create(userId, createDto) {
        const status = this.muscleStatusRepository.create({
            userId,
            ...createDto,
        });
        return this.muscleStatusRepository.save(status);
    }
    async findAll(userId) {
        return this.muscleStatusRepository.find({ where: { userId } });
    }
    async findOne(id) {
        const status = await this.muscleStatusRepository.findOne({ where: { id } });
        if (!status) {
            throw new common_1.NotFoundException('Muscle status not found');
        }
        return status;
    }
    async update(id, updateDto) {
        await this.muscleStatusRepository.update(id, updateDto);
        return this.findOne(id);
    }
    async remove(id) {
        const status = await this.findOne(id);
        await this.muscleStatusRepository.delete(id);
        return {
            success: true,
            message: 'Muscle status removed',
            id: status.id,
            muscleGroup: status.muscleGroup,
        };
    }
    async updateLastTrained(userId, muscleGroups) {
        for (const group of muscleGroups) {
            await this.muscleStatusRepository.upsert({
                userId,
                muscleGroup: group,
                lastTrainedAt: new Date(),
            }, ['userId', 'muscleGroup']);
        }
    }
};
exports.MuscleStatusService = MuscleStatusService;
exports.MuscleStatusService = MuscleStatusService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(muscle_status_entity_1.MuscleStatus)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MuscleStatusService);
//# sourceMappingURL=muscle-status.service.js.map