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
exports.GymsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const gym_entity_1 = require("../entities/gym.entity");
let GymsService = class GymsService {
    constructor(gymRepository) {
        this.gymRepository = gymRepository;
    }
    async create(createGymDto) {
        const gym = this.gymRepository.create(createGymDto);
        return this.gymRepository.save(gym);
    }
    async findAll() {
        return this.gymRepository.find();
    }
    async findOne(id) {
        const gym = await this.gymRepository.findOne({ where: { id } });
        if (!gym) {
            throw new common_1.NotFoundException('Gym not found');
        }
        return gym;
    }
    async update(id, updateGymDto) {
        await this.gymRepository.update(id, updateGymDto);
        return this.findOne(id);
    }
    async remove(id) {
        const gym = await this.findOne(id);
        await this.gymRepository.delete(id);
        return {
            success: true,
            message: 'Gym removed',
            id: gym.id,
            name: gym.name,
        };
    }
};
exports.GymsService = GymsService;
exports.GymsService = GymsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gym_entity_1.Gym)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], GymsService);
//# sourceMappingURL=gyms.service.js.map