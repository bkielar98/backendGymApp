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
const crypto_1 = require("crypto");
const workout_template_entity_1 = require("../entities/workout-template.entity");
const exercise_entity_1 = require("../entities/exercise.entity");
const workout_template_exercise_entity_1 = require("../entities/workout-template-exercise.entity");
const workout_template_member_entity_1 = require("../entities/workout-template-member.entity");
const friendship_entity_1 = require("../entities/friendship.entity");
const user_entity_1 = require("../entities/user.entity");
const workout_constants_1 = require("../common/constants/workout.constants");
let WorkoutTemplatesService = class WorkoutTemplatesService {
    constructor(templateRepository, templateExerciseRepository, templateMemberRepository, exerciseRepository, friendshipRepository, userRepository) {
        this.templateRepository = templateRepository;
        this.templateExerciseRepository = templateExerciseRepository;
        this.templateMemberRepository = templateMemberRepository;
        this.exerciseRepository = exerciseRepository;
        this.friendshipRepository = friendshipRepository;
        this.userRepository = userRepository;
    }
    async create(userId, createDto) {
        this.validateTemplateExercises(createDto.exercises);
        this.ensureExerciseLimit(createDto.exercises.length);
        this.ensureTotalSetsLimit(createDto.exercises.map((item) => item.setsCount));
        this.validateTemplateMetadata(createDto.startDate, createDto.endDate);
        const exerciseIds = createDto.exercises.map((item) => item.exerciseId);
        const exercises = exerciseIds.length
            ? await this.exerciseRepository.find({
                where: { id: (0, typeorm_2.In)(exerciseIds) },
            })
            : [];
        const exerciseMap = new Map(exercises.map((exercise) => [exercise.id, exercise]));
        const template = this.templateRepository.create({
            name: createDto.name,
            description: createDto.description?.trim() || null,
            labels: this.normalizeLabels(createDto.labels),
            startDate: this.normalizeDate(createDto.startDate),
            endDate: this.normalizeDate(createDto.endDate),
            tasks: this.normalizeTasks(createDto.tasks),
            isShared: false,
            shareCode: null,
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
        await this.syncMembers(saved, userId, createDto.memberUserIds ?? []);
        return this.findOne(userId, saved.id);
    }
    async findAll(userId) {
        const templates = await this.getTemplatesAccessibleToUser(userId);
        return templates.map((template) => this.mapTemplate(template, userId));
    }
    async findSharedWithMe(userId) {
        const templates = await this.getTemplatesAccessibleToUser(userId);
        return templates
            .filter((template) => template.userId !== userId)
            .map((template) => this.mapTemplate(template, userId));
    }
    async findSharedByCode(userId, shareCode) {
        const template = await this.templateRepository.findOne({
            where: {
                shareCode,
                isShared: true,
            },
        });
        if (!template) {
            throw new common_1.NotFoundException('Shared workout template not found');
        }
        const isOwner = template.userId === userId;
        const isMember = (template.members || []).some((member) => member.userId === userId);
        if (!isOwner && !isMember) {
            throw new common_1.NotFoundException('Shared workout template not found');
        }
        return this.mapTemplate(template, userId);
    }
    async findOne(userId, id) {
        const template = await this.getTemplateAccessibleToUser(userId, id);
        if (!template) {
            throw new common_1.NotFoundException('Workout template not found');
        }
        return this.mapTemplate(template, userId);
    }
    async update(userId, id, updateDto) {
        const template = await this.getTemplateEntityForUser(userId, id);
        this.validateTemplateMetadata(updateDto.startDate, updateDto.endDate);
        if (typeof updateDto.name === 'string') {
            template.name = updateDto.name;
        }
        if (typeof updateDto.description === 'string') {
            template.description = updateDto.description.trim() || null;
        }
        if (updateDto.labels) {
            template.labels = this.normalizeLabels(updateDto.labels);
        }
        if (updateDto.startDate !== undefined) {
            template.startDate = this.normalizeDate(updateDto.startDate);
        }
        if (updateDto.endDate !== undefined) {
            template.endDate = this.normalizeDate(updateDto.endDate);
        }
        if (updateDto.tasks) {
            template.tasks = this.normalizeTasks(updateDto.tasks);
        }
        if (updateDto.exercises) {
            this.validateTemplateExercises(updateDto.exercises);
            this.ensureExerciseLimit(updateDto.exercises.length);
            this.ensureTotalSetsLimit(updateDto.exercises.map((item) => item.setsCount));
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
        if (updateDto.memberUserIds) {
            await this.syncMembers(template, userId, updateDto.memberUserIds);
        }
        return this.findOne(userId, template.id);
    }
    async updateMembers(userId, templateId, memberUserIds) {
        const template = await this.getTemplateEntityForUser(userId, templateId);
        await this.syncMembers(template, userId, memberUserIds);
        return this.findOne(userId, template.id);
    }
    async share(userId, templateId, memberUserIds) {
        const template = await this.getTemplateEntityForUser(userId, templateId);
        if (memberUserIds.length > 0) {
            await this.syncMembers(template, userId, memberUserIds);
        }
        if (!template.shareCode) {
            template.shareCode = (0, crypto_1.randomUUID)();
        }
        template.isShared = true;
        await this.templateRepository.save(template);
        const details = await this.findOne(userId, template.id);
        return {
            ...details,
            shareCode: template.shareCode,
            shareUrl: `/workout-templates/shared/${template.shareCode}`,
        };
    }
    async addExercises(userId, templateId, dtos) {
        if (!Array.isArray(dtos) || dtos.length === 0) {
            throw new common_1.BadRequestException('At least one exercise is required');
        }
        this.validateTemplateExercises(dtos);
        const template = await this.getTemplateEntityForUser(userId, templateId);
        const templateExercises = [...(template.exercises || [])];
        this.ensureExerciseLimit(templateExercises.length + dtos.length);
        this.ensureTotalSetsLimit([
            ...templateExercises.map((item) => item.setsCount),
            ...dtos.map((dto) => dto.setsCount),
        ]);
        const exerciseIds = dtos.map((dto) => dto.exerciseId);
        const exercises = await this.exerciseRepository.find({
            where: { id: (0, typeorm_2.In)(exerciseIds) },
        });
        const exerciseMap = new Map(exercises.map((exercise) => [exercise.id, exercise]));
        for (const exerciseId of exerciseIds) {
            if (!exerciseMap.has(exerciseId)) {
                throw new common_1.NotFoundException(`Exercise ${exerciseId} not found`);
            }
        }
        const sortedDtos = [...dtos].sort((a, b) => a.order - b.order);
        for (const dto of sortedDtos) {
            const insertOrder = Math.min(dto.order, templateExercises.length);
            for (const item of templateExercises) {
                if (item.order >= insertOrder) {
                    item.order += 1;
                }
            }
            const newTemplateExercise = this.templateExerciseRepository.create({
                templateId: template.id,
                template,
                exerciseId: dto.exerciseId,
                exercise: exerciseMap.get(dto.exerciseId),
                setsCount: dto.setsCount,
                order: insertOrder,
            });
            templateExercises.push(newTemplateExercise);
        }
        await this.templateExerciseRepository.save(templateExercises);
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
        this.ensureTotalSetsLimit((template.exercises || []).map((item) => item.id === templateExercise.id ? setsCount : item.setsCount));
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
    async getTemplateAccessibleToUser(userId, id) {
        return this.templateRepository
            .createQueryBuilder('template')
            .leftJoinAndSelect('template.user', 'user')
            .leftJoinAndSelect('template.exercises', 'exerciseEntry')
            .leftJoinAndSelect('exerciseEntry.exercise', 'exercise')
            .leftJoinAndSelect('template.members', 'member')
            .leftJoinAndSelect('member.user', 'memberUser')
            .where('template.id = :id', { id })
            .andWhere(new typeorm_2.Brackets((qb) => {
            qb.where('template.userId = :userId', { userId }).orWhere('member.userId = :userId', { userId });
        }))
            .getOne();
    }
    async getTemplatesAccessibleToUser(userId) {
        return this.templateRepository
            .createQueryBuilder('template')
            .leftJoinAndSelect('template.user', 'user')
            .leftJoinAndSelect('template.exercises', 'exerciseEntry')
            .leftJoinAndSelect('exerciseEntry.exercise', 'exercise')
            .leftJoinAndSelect('template.members', 'member')
            .leftJoinAndSelect('member.user', 'memberUser')
            .where(new typeorm_2.Brackets((qb) => {
            qb.where('template.userId = :userId', { userId }).orWhere('member.userId = :userId', { userId });
        }))
            .orderBy('template.id', 'DESC')
            .addOrderBy('exerciseEntry.order', 'ASC')
            .addOrderBy('member.id', 'ASC')
            .getMany();
    }
    getTemplateExerciseForTemplate(template, templateExerciseId) {
        const templateExercise = (template.exercises || []).find((item) => item.id === templateExerciseId);
        if (!templateExercise) {
            throw new common_1.NotFoundException('Workout template exercise not found');
        }
        return templateExercise;
    }
    mapTemplate(template, currentUserId) {
        const isOwner = template.userId === currentUserId;
        const isMember = (template.members || []).some((member) => member.userId === currentUserId);
        return {
            id: template.id,
            name: template.name,
            description: template.description ?? null,
            labels: template.labels || [],
            startDate: template.startDate ?? null,
            endDate: template.endDate ?? null,
            tasks: template.tasks || [],
            isShared: template.isShared,
            shareCode: isOwner ? template.shareCode : null,
            access: isOwner ? 'owner' : isMember ? 'member' : 'none',
            owner: {
                id: template.user?.id ?? template.userId,
                name: template.user?.name ?? null,
                email: template.user?.email ?? null,
                avatarPath: template.user?.avatarPath ?? null,
            },
            members: (template.members || []).map((member) => ({
                id: member.user?.id ?? member.userId,
                name: member.user?.name ?? null,
                email: member.user?.email ?? null,
                avatarPath: member.user?.avatarPath ?? null,
            })),
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
    validateTemplateMetadata(startDate, endDate) {
        const normalizedStartDate = this.normalizeDate(startDate);
        const normalizedEndDate = this.normalizeDate(endDate);
        if (normalizedStartDate && normalizedEndDate && normalizedStartDate > normalizedEndDate) {
            throw new common_1.BadRequestException('Start date cannot be later than end date');
        }
    }
    ensureExerciseLimit(count) {
        if (count > workout_constants_1.MAX_TEMPLATE_EXERCISES) {
            throw new common_1.BadRequestException(`Workout template cannot have more than ${workout_constants_1.MAX_TEMPLATE_EXERCISES} exercises`);
        }
    }
    ensureTotalSetsLimit(setsCounts) {
        const totalSets = setsCounts.reduce((sum, setsCount) => sum + setsCount, 0);
        if (totalSets > workout_constants_1.MAX_TOTAL_SETS) {
            throw new common_1.BadRequestException(`Workout template cannot have more than ${workout_constants_1.MAX_TOTAL_SETS} total sets`);
        }
    }
    normalizeLabels(labels) {
        if (!labels) {
            return [];
        }
        return [...new Set(labels.map((label) => label.trim()).filter(Boolean))];
    }
    normalizeTasks(tasks) {
        if (!tasks) {
            return [];
        }
        return tasks.map((task) => task.trim()).filter(Boolean);
    }
    normalizeDate(value) {
        if (!value) {
            return null;
        }
        return new Date(value);
    }
    async syncMembers(template, ownerUserId, memberUserIds) {
        const nextMemberUserIds = [...new Set(memberUserIds)].filter((memberUserId) => memberUserId !== ownerUserId);
        if (nextMemberUserIds.length > workout_constants_1.MAX_TEMPLATE_MEMBERS) {
            throw new common_1.BadRequestException(`Workout template cannot be shared with more than ${workout_constants_1.MAX_TEMPLATE_MEMBERS} users`);
        }
        if (nextMemberUserIds.length === 0) {
            if ((template.members || []).length > 0) {
                await this.templateMemberRepository.delete({ templateId: template.id });
                template.members = [];
            }
            return;
        }
        const users = await this.userRepository.find({
            where: { id: (0, typeorm_2.In)(nextMemberUserIds) },
        });
        if (users.length !== nextMemberUserIds.length) {
            throw new common_1.NotFoundException('One or more selected users do not exist');
        }
        const friendships = await this.friendshipRepository.find({
            where: [
                {
                    requesterUserId: ownerUserId,
                    receiverUserId: (0, typeorm_2.In)(nextMemberUserIds),
                    status: friendship_entity_1.FriendshipStatus.ACCEPTED,
                },
                {
                    requesterUserId: (0, typeorm_2.In)(nextMemberUserIds),
                    receiverUserId: ownerUserId,
                    status: friendship_entity_1.FriendshipStatus.ACCEPTED,
                },
            ],
        });
        const allowedUserIds = new Set();
        for (const friendship of friendships) {
            allowedUserIds.add(friendship.requesterUserId === ownerUserId
                ? friendship.receiverUserId
                : friendship.requesterUserId);
        }
        const invalidUserId = nextMemberUserIds.find((memberUserId) => !allowedUserIds.has(memberUserId));
        if (invalidUserId) {
            throw new common_1.BadRequestException(`User ${invalidUserId} must be an accepted friend before sharing a plan`);
        }
        await this.templateMemberRepository.delete({ templateId: template.id });
        const members = nextMemberUserIds.map((memberUserId) => this.templateMemberRepository.create({
            templateId: template.id,
            userId: memberUserId,
            user: users.find((user) => user.id === memberUserId),
        }));
        template.members =
            members.length > 0 ? await this.templateMemberRepository.save(members) : [];
    }
};
exports.WorkoutTemplatesService = WorkoutTemplatesService;
exports.WorkoutTemplatesService = WorkoutTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(workout_template_entity_1.WorkoutTemplate)),
    __param(1, (0, typeorm_1.InjectRepository)(workout_template_exercise_entity_1.WorkoutTemplateExercise)),
    __param(2, (0, typeorm_1.InjectRepository)(workout_template_member_entity_1.WorkoutTemplateMember)),
    __param(3, (0, typeorm_1.InjectRepository)(exercise_entity_1.Exercise)),
    __param(4, (0, typeorm_1.InjectRepository)(friendship_entity_1.Friendship)),
    __param(5, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], WorkoutTemplatesService);
//# sourceMappingURL=workout-templates.service.js.map