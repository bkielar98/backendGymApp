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
const workout_template_exercise_entity_1 = require("../entities/workout-template-exercise.entity");
let WorkoutTemplatesService = class WorkoutTemplatesService {
    constructor(templateRepository, templateExerciseRepository, exerciseRepository) {
        this.templateRepository = templateRepository;
        this.templateExerciseRepository = templateExerciseRepository;
        this.exerciseRepository = exerciseRepository;
    }
    async create(userId, createDto) {
        this.validateTemplateExercises(createDto.exercises);
        const exerciseIds = createDto.exercises.map((item) => item.exerciseId);
        const exercises = await this.exerciseRepository.find({
            where: { id: (0, typeorm_2.In)(exerciseIds) },
        });
        const exerciseMap = new Map(exercises.map((exercise) => [exercise.id, exercise]));
        const template = this.templateRepository.create({
            name: createDto.name,
            userId,
            exercises: createDto.exercises.map((item) => {
                const exercise = exerciseMap.get(item.exerciseId);
                if (!exercise) {
                    throw new common_1.NotFoundException(`Exercise ${item.exerciseId} not found`);
                }
                return this.templateExerciseRepository.create({
                    exerciseId: item.exerciseId,
                    exercise,
                    setsCount: item.setsCount,
                    order: item.order,
                });
            }),
        });
        const saved = await this.templateRepository.save(template);
        return this.findOne(userId, saved.id);
    }
    async findAll(userId) {
        const templates = await this.templateRepository.find({
            where: { userId },
            order: { id: 'DESC' },
        });
        return templates.map((template) => this.mapTemplate(template));
    }
    async findOne(userId, id) {
        const template = await this.templateRepository.findOne({
            where: { id, userId },
        });
        if (!template) {
            throw new common_1.NotFoundException('Workout template not found');
        }
        return this.mapTemplate(template);
    }
    async update(userId, id, updateDto) {
        const template = await this.getTemplateEntityForUser(userId, id);
        if (typeof updateDto.name === 'string') {
            template.name = updateDto.name;
        }
        if (updateDto.exercises) {
            this.validateTemplateExercises(updateDto.exercises);
            const existingItems = template.exercises || [];
            const existingItemsById = new Map(existingItems.map((item) => [item.id, item]));
            const exerciseIds = updateDto.exercises.map((item) => item.exerciseId);
            const exercises = await this.exerciseRepository.find({
                where: { id: (0, typeorm_2.In)(exerciseIds) },
            });
            const exerciseMap = new Map(exercises.map((exercise) => [exercise.id, exercise]));
            const nextItems = [];
            const keptIds = new Set();
            for (const item of updateDto.exercises) {
                const exercise = exerciseMap.get(item.exerciseId);
                if (!exercise) {
                    throw new common_1.NotFoundException(`Exercise ${item.exerciseId} not found`);
                }
                if (typeof item.id === 'number') {
                    const existingItem = existingItemsById.get(item.id);
                    if (!existingItem) {
                        throw new common_1.NotFoundException(`Workout template exercise ${item.id} not found`);
                    }
                    existingItem.exerciseId = item.exerciseId;
                    existingItem.exercise = exercise;
                    existingItem.setsCount = item.setsCount;
                    existingItem.order = item.order;
                    keptIds.add(existingItem.id);
                    nextItems.push(existingItem);
                    continue;
                }
                nextItems.push(this.templateExerciseRepository.create({
                    templateId: template.id,
                    exerciseId: item.exerciseId,
                    exercise,
                    setsCount: item.setsCount,
                    order: item.order,
                }));
            }
            const idsToDelete = existingItems
                .filter((item) => !keptIds.has(item.id))
                .map((item) => item.id);
            if (idsToDelete.length > 0) {
                await this.templateExerciseRepository.delete(idsToDelete);
            }
            template.exercises = nextItems;
        }
        await this.templateRepository.save(template);
        return this.findOne(userId, template.id);
    }
    async addExercise(userId, templateId, dto) {
        const template = await this.getTemplateEntityForUser(userId, templateId);
        const templateExercises = [...(template.exercises || [])];
        const exercise = await this.exerciseRepository.findOne({
            where: { id: dto.exerciseId },
        });
        if (!exercise) {
            throw new common_1.NotFoundException(`Exercise ${dto.exerciseId} not found`);
        }
        const insertOrder = Math.min(dto.order, templateExercises.length);
        for (const item of templateExercises) {
            if (item.order >= insertOrder) {
                item.order += 1;
            }
        }
        await this.templateExerciseRepository.save(templateExercises);
        const templateExercise = this.templateExerciseRepository.create({
            templateId: template.id,
            template,
            exerciseId: dto.exerciseId,
            exercise,
            setsCount: dto.setsCount,
            order: insertOrder,
        });
        await this.templateExerciseRepository.save(templateExercise);
        return this.findOne(userId, template.id);
    }
    async changeExercisePosition(userId, templateId, templateExerciseId, order) {
        const template = await this.getTemplateEntityForUser(userId, templateId);
        const templateExercises = [...(template.exercises || [])];
        const templateExercise = this.getTemplateExerciseForTemplate(template, templateExerciseId);
        const maxOrder = Math.max(0, templateExercises.length - 1);
        const targetOrder = Math.max(0, Math.min(order, maxOrder));
        const currentOrder = templateExercise.order;
        if (currentOrder === targetOrder) {
            return this.findOne(userId, template.id);
        }
        for (const item of templateExercises) {
            if (item.id === templateExercise.id) {
                continue;
            }
            if (targetOrder < currentOrder) {
                if (item.order >= targetOrder && item.order < currentOrder) {
                    item.order += 1;
                }
            }
            else if (item.order <= targetOrder && item.order > currentOrder) {
                item.order -= 1;
            }
        }
        templateExercise.order = targetOrder;
        await this.templateExerciseRepository.save(templateExercises);
        return this.findOne(userId, template.id);
    }
    async changeExercise(userId, templateId, templateExerciseId, exerciseId) {
        const template = await this.getTemplateEntityForUser(userId, templateId);
        const templateExercise = this.getTemplateExerciseForTemplate(template, templateExerciseId);
        const exercise = await this.exerciseRepository.findOne({
            where: { id: exerciseId },
        });
        if (!exercise) {
            throw new common_1.NotFoundException(`Exercise ${exerciseId} not found`);
        }
        templateExercise.exerciseId = exerciseId;
        templateExercise.exercise = exercise;
        await this.templateExerciseRepository.save(templateExercise);
        return this.findOne(userId, template.id);
    }
    async changeExerciseSetsCount(userId, templateId, templateExerciseId, setsCount) {
        const template = await this.getTemplateEntityForUser(userId, templateId);
        const templateExercise = this.getTemplateExerciseForTemplate(template, templateExerciseId);
        templateExercise.setsCount = setsCount;
        await this.templateExerciseRepository.save(templateExercise);
        return this.findOne(userId, template.id);
    }
    async removeExercise(userId, templateId, templateExerciseId) {
        const template = await this.getTemplateEntityForUser(userId, templateId);
        const templateExercise = this.getTemplateExerciseForTemplate(template, templateExerciseId);
        await this.templateExerciseRepository.delete({
            id: templateExerciseId,
            templateId: template.id,
        });
        const remainingExercises = (template.exercises || []).filter((item) => item.id !== templateExerciseId);
        for (const item of remainingExercises) {
            if (item.order > templateExercise.order) {
                item.order -= 1;
            }
        }
        await this.templateExerciseRepository.save(remainingExercises);
        return this.findOne(userId, template.id);
    }
    async remove(userId, id) {
        const template = await this.getTemplateEntityForUser(userId, id);
        await this.templateRepository.delete(id);
        return { message: 'Workout template removed' };
    }
    async getTemplateEntityForUser(userId, id) {
        const template = await this.templateRepository.findOne({
            where: { id, userId },
        });
        if (!template) {
            throw new common_1.NotFoundException('Workout template not found');
        }
        return template;
    }
    getTemplateExerciseForTemplate(template, templateExerciseId) {
        const templateExercise = (template.exercises || []).find((item) => item.id === templateExerciseId);
        if (!templateExercise) {
            throw new common_1.NotFoundException('Workout template exercise not found');
        }
        return templateExercise;
    }
    mapTemplate(template) {
        return {
            id: template.id,
            name: template.name,
            exercises: [...(template.exercises || [])]
                .sort((a, b) => a.order - b.order)
                .map((item) => ({
                id: item.id,
                exerciseId: item.exerciseId,
                order: item.order,
                setsCount: item.setsCount,
                exercise: item.exercise
                    ? {
                        id: item.exercise.id,
                        name: item.exercise.name,
                        description: item.exercise.description,
                        muscleGroups: item.exercise.muscleGroups,
                    }
                    : null,
            })),
        };
    }
    validateTemplateExercises(exercises) {
        const orders = new Set();
        const ids = new Set();
        for (const item of exercises) {
            if (orders.has(item.order)) {
                throw new common_1.BadRequestException(`Order ${item.order} is duplicated in workout template exercises`);
            }
            orders.add(item.order);
            if (typeof item.id === 'number') {
                if (ids.has(item.id)) {
                    throw new common_1.BadRequestException(`Workout template exercise ${item.id} is duplicated in request`);
                }
                ids.add(item.id);
            }
        }
    }
};
exports.WorkoutTemplatesService = WorkoutTemplatesService;
exports.WorkoutTemplatesService = WorkoutTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(workout_template_entity_1.WorkoutTemplate)),
    __param(1, (0, typeorm_1.InjectRepository)(workout_template_exercise_entity_1.WorkoutTemplateExercise)),
    __param(2, (0, typeorm_1.InjectRepository)(exercise_entity_1.Exercise)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], WorkoutTemplatesService);
//# sourceMappingURL=workout-templates.service.js.map