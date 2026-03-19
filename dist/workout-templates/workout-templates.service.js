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
exports.WorkoutTemplatesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const workout_template_entity_1 = require("../entities/workout-template.entity");
const exercise_entity_1 = require("../entities/exercise.entity");
let WorkoutTemplatesService = class WorkoutTemplatesService {
    constructor(templateRepository, exerciseRepository) {
        this.templateRepository = templateRepository;
        this.exerciseRepository = exerciseRepository;
    }
    async create(userId, createDto) {
        const exercises = await this.exerciseRepository.findByIds(createDto.exerciseIds);
        const template = this.templateRepository.create({
            name: createDto.name,
            userId,
            exercises,
        });
        return this.templateRepository.save(template);
    }
    async findAll(userId) {
        return this.templateRepository.find({
            where: { userId },
            relations: ['exercises'],
        });
    }
    async findOne(id) {
        return this.templateRepository.findOne({
            where: { id },
            relations: ['exercises'],
        });
    }
    async update(id, updateDto) {
        if (updateDto.exerciseIds) {
            const exercises = await this.exerciseRepository.findByIds(updateDto.exerciseIds);
            await this.templateRepository.update(id, { ...updateDto, exercises });
        }
        else {
            await this.templateRepository.update(id, updateDto);
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.templateRepository.delete(id);
    }
};
exports.WorkoutTemplatesService = WorkoutTemplatesService;
exports.WorkoutTemplatesService = WorkoutTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(workout_template_entity_1.WorkoutTemplate)),
    __param(1, (0, typeorm_1.InjectRepository)(exercise_entity_1.Exercise)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], WorkoutTemplatesService);
//# sourceMappingURL=workout-templates.service.js.map