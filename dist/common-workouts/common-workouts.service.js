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
exports.CommonWorkoutsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_workout_entity_1 = require("../entities/common-workout.entity");
const common_workout_participant_entity_1 = require("../entities/common-workout-participant.entity");
const common_workout_exercise_entity_1 = require("../entities/common-workout-exercise.entity");
const common_workout_participant_set_entity_1 = require("../entities/common-workout-participant-set.entity");
const workout_entity_1 = require("../entities/workout.entity");
const workout_exercise_entity_1 = require("../entities/workout-exercise.entity");
const workout_set_entity_1 = require("../entities/workout-set.entity");
const workout_template_entity_1 = require("../entities/workout-template.entity");
const exercise_entity_1 = require("../entities/exercise.entity");
const user_entity_1 = require("../entities/user.entity");
const common_workouts_gateway_1 = require("./common-workouts.gateway");
let CommonWorkoutsService = class CommonWorkoutsService {
    constructor(commonWorkoutRepository, participantRepository, commonWorkoutExerciseRepository, participantSetRepository, workoutRepository, workoutExerciseRepository, workoutSetRepository, templateRepository, exerciseRepository, userRepository, gateway) {
        this.commonWorkoutRepository = commonWorkoutRepository;
        this.participantRepository = participantRepository;
        this.commonWorkoutExerciseRepository = commonWorkoutExerciseRepository;
        this.participantSetRepository = participantSetRepository;
        this.workoutRepository = workoutRepository;
        this.workoutExerciseRepository = workoutExerciseRepository;
        this.workoutSetRepository = workoutSetRepository;
        this.templateRepository = templateRepository;
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
        this.gateway = gateway;
    }
    async start(userId, dto) {
        const participantUserIds = Array.from(new Set([userId, ...(dto.participantUserIds || [])]));
        await this.ensureUsersExist(participantUserIds);
        await this.ensureParticipantsHaveNoActiveWorkouts(participantUserIds);
        let template = null;
        if (typeof dto.templateId === 'number') {
            template = await this.templateRepository.findOne({
                where: { id: dto.templateId, userId },
            });
            if (!template) {
                throw new common_1.NotFoundException('Workout template not found');
            }
        }
        const commonWorkout = this.commonWorkoutRepository.create({
            createdByUserId: userId,
            templateId: template?.id ?? null,
            template,
            name: dto.name || template?.name || 'Common workout',
            status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
            startedAt: new Date(),
            finishedAt: null,
            participants: [],
            exercises: [],
        });
        const savedWorkout = await this.commonWorkoutRepository.save(commonWorkout);
        const users = await this.userRepository.findBy({ id: (0, typeorm_2.In)(participantUserIds) });
        const participants = users.map((user) => this.participantRepository.create({
            commonWorkoutId: savedWorkout.id,
            commonWorkout: savedWorkout,
            userId: user.id,
            user,
            sets: [],
        }));
        await this.participantRepository.save(participants);
        const sortedTemplateExercises = [...(template?.exercises || [])].sort((a, b) => a.order - b.order);
        for (const templateExercise of sortedTemplateExercises) {
            await this.createCommonExercise(savedWorkout.id, templateExercise.exerciseId, templateExercise.order, templateExercise.setsCount);
        }
        const payload = await this.getByIdForUser(userId, savedWorkout.id);
        this.gateway.emitUpdated(savedWorkout.id, payload);
        return payload;
    }
    async getActive(userId) {
        const participant = await this.participantRepository.findOne({
            where: {
                userId,
                commonWorkout: {
                    status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
                },
            },
            relations: {
                commonWorkout: true,
            },
        });
        if (!participant) {
            throw new common_1.NotFoundException('Active common workout not found');
        }
        return this.getByIdForUser(userId, participant.commonWorkoutId);
    }
    async getByIdForUser(userId, commonWorkoutId) {
        const commonWorkout = await this.getCommonWorkoutEntityForUser(userId, commonWorkoutId);
        return this.mapCommonWorkout(commonWorkout);
    }
    async updateCommonWorkout(userId, commonWorkoutId, dto) {
        const commonWorkout = await this.getActiveCommonWorkoutEntityForUser(userId, commonWorkoutId);
        if (typeof dto.name === 'string') {
            commonWorkout.name = dto.name;
            await this.commonWorkoutRepository.save(commonWorkout);
        }
        const payload = await this.getByIdForUser(userId, commonWorkout.id);
        this.gateway.emitUpdated(commonWorkout.id, payload);
        return payload;
    }
    async addExercise(userId, commonWorkoutId, dto) {
        const commonWorkout = await this.getActiveCommonWorkoutEntityForUser(userId, commonWorkoutId);
        const exercise = await this.getAccessibleExerciseForUsers(commonWorkout.participants.map((participant) => participant.userId), dto.exerciseId);
        const exercises = [...(commonWorkout.exercises || [])];
        const insertOrder = Math.min(dto.order ?? exercises.length, exercises.length);
        for (const item of exercises) {
            if (item.order >= insertOrder) {
                item.order += 1;
            }
        }
        await this.commonWorkoutExerciseRepository.save(exercises);
        await this.createCommonExercise(commonWorkout.id, exercise.id, insertOrder, dto.setsCount ?? 0);
        const payload = await this.getByIdForUser(userId, commonWorkout.id);
        this.gateway.emitUpdated(commonWorkout.id, payload);
        return payload;
    }
    async changeExercisePosition(userId, commonWorkoutId, commonWorkoutExerciseId, dto) {
        const commonWorkout = await this.getActiveCommonWorkoutEntityForUser(userId, commonWorkoutId);
        const exercises = [...(commonWorkout.exercises || [])];
        const currentExercise = this.getCommonWorkoutExerciseFromWorkout(commonWorkout, commonWorkoutExerciseId);
        const maxOrder = Math.max(0, exercises.length - 1);
        const targetOrder = Math.max(0, Math.min(dto.order, maxOrder));
        const currentOrder = currentExercise.order;
        if (targetOrder !== currentOrder) {
            for (const item of exercises) {
                if (item.id === currentExercise.id) {
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
            currentExercise.order = targetOrder;
            await this.commonWorkoutExerciseRepository.save(exercises);
        }
        const payload = await this.getByIdForUser(userId, commonWorkout.id);
        this.gateway.emitUpdated(commonWorkout.id, payload);
        return payload;
    }
    async changeExercise(userId, commonWorkoutId, commonWorkoutExerciseId, dto) {
        const commonWorkout = await this.getActiveCommonWorkoutEntityForUser(userId, commonWorkoutId);
        const currentExercise = this.getCommonWorkoutExerciseFromWorkout(commonWorkout, commonWorkoutExerciseId);
        const exercise = await this.getAccessibleExerciseForUsers(commonWorkout.participants.map((participant) => participant.userId), dto.exerciseId);
        currentExercise.exerciseId = exercise.id;
        currentExercise.exercise = exercise;
        await this.commonWorkoutExerciseRepository.save(currentExercise);
        const participantSets = await this.participantSetRepository.find({
            where: {
                commonWorkoutExerciseId: currentExercise.id,
            },
            relations: {
                participant: true,
            },
            order: {
                setNumber: 'ASC',
            },
        });
        for (const set of participantSets) {
            const previousSet = await this.getPreviousSetForUserExerciseSetNumber(set.participant.userId, exercise.id, set.setNumber);
            set.previousWeight = previousSet?.currentWeight ?? null;
            set.previousReps = previousSet?.currentReps ?? null;
        }
        await this.participantSetRepository.save(participantSets);
        const payload = await this.getByIdForUser(userId, commonWorkout.id);
        this.gateway.emitUpdated(commonWorkout.id, payload);
        return payload;
    }
    async removeExercise(userId, commonWorkoutId, commonWorkoutExerciseId) {
        const commonWorkout = await this.getActiveCommonWorkoutEntityForUser(userId, commonWorkoutId);
        const currentExercise = this.getCommonWorkoutExerciseFromWorkout(commonWorkout, commonWorkoutExerciseId);
        await this.commonWorkoutExerciseRepository.delete({
            id: currentExercise.id,
            commonWorkoutId: commonWorkout.id,
        });
        const remainingExercises = (commonWorkout.exercises || []).filter((item) => item.id !== currentExercise.id);
        for (const item of remainingExercises) {
            if (item.order > currentExercise.order) {
                item.order -= 1;
            }
        }
        await this.commonWorkoutExerciseRepository.save(remainingExercises);
        const payload = await this.getByIdForUser(userId, commonWorkout.id);
        this.gateway.emitUpdated(commonWorkout.id, payload);
        return payload;
    }
    async addSet(userId, commonWorkoutExerciseId) {
        const commonWorkoutExercise = await this.getActiveCommonWorkoutExerciseForUser(userId, commonWorkoutExerciseId);
        const existingSets = commonWorkoutExercise.participantSets || [];
        const nextSetNumber = Math.max(0, ...existingSets.map((set) => set.setNumber)) + 1;
        for (const participant of commonWorkoutExercise.commonWorkout.participants || []) {
            const previousSet = await this.getPreviousSetForUserExerciseSetNumber(participant.userId, commonWorkoutExercise.exerciseId, nextSetNumber);
            const newSet = this.participantSetRepository.create({
                participantId: participant.id,
                participant,
                commonWorkoutExerciseId: commonWorkoutExercise.id,
                commonWorkoutExercise,
                setNumber: nextSetNumber,
                previousWeight: previousSet?.currentWeight ?? null,
                previousReps: previousSet?.currentReps ?? null,
                currentWeight: null,
                currentReps: null,
                repMax: null,
                confirmed: false,
            });
            await this.participantSetRepository.save(newSet);
        }
        const payload = await this.getByIdForUser(userId, commonWorkoutExercise.commonWorkoutId);
        this.gateway.emitUpdated(commonWorkoutExercise.commonWorkoutId, payload);
        return payload;
    }
    async removeSet(userId, participantSetId) {
        const participantSet = await this.getParticipantSetForUser(userId, participantSetId);
        const commonWorkoutExerciseId = participantSet.commonWorkoutExerciseId;
        const setNumber = participantSet.setNumber;
        const commonWorkoutId = participantSet.commonWorkoutExercise.commonWorkoutId;
        const matchingSets = await this.participantSetRepository.find({
            where: {
                commonWorkoutExerciseId,
                setNumber,
            },
            relations: {
                participant: true,
                commonWorkoutExercise: true,
            },
            order: {
                participantId: 'ASC',
            },
        });
        await this.participantSetRepository.remove(matchingSets);
        const remainingSets = await this.participantSetRepository.find({
            where: { commonWorkoutExerciseId },
            relations: {
                participant: true,
                commonWorkoutExercise: true,
            },
            order: { setNumber: 'ASC' },
        });
        const groupedByParticipant = new Map();
        for (const set of remainingSets) {
            const list = groupedByParticipant.get(set.participantId) || [];
            list.push(set);
            groupedByParticipant.set(set.participantId, list);
        }
        for (const sets of groupedByParticipant.values()) {
            for (let index = 0; index < sets.length; index += 1) {
                sets[index].setNumber = index + 1;
            }
            await this.participantSetRepository.save(sets);
        }
        const payload = await this.getByIdForUser(userId, commonWorkoutId);
        this.gateway.emitUpdated(commonWorkoutId, payload);
        return payload;
    }
    async updateSet(userId, participantSetId, dto) {
        const participantSet = await this.getParticipantSetForUser(userId, participantSetId);
        if (typeof dto.currentWeight === 'number') {
            participantSet.currentWeight = dto.currentWeight;
        }
        if (typeof dto.currentReps === 'number') {
            participantSet.currentReps = dto.currentReps;
        }
        participantSet.repMax = this.calculateRepMax(participantSet.currentWeight, participantSet.currentReps);
        await this.participantSetRepository.save(participantSet);
        const payload = await this.getByIdForUser(userId, participantSet.commonWorkoutExercise.commonWorkoutId);
        this.gateway.emitUpdated(participantSet.commonWorkoutExercise.commonWorkoutId, payload);
        return payload;
    }
    async confirmSet(userId, participantSetId, dto) {
        const participantSet = await this.getParticipantSetForUser(userId, participantSetId);
        participantSet.currentWeight = dto.currentWeight;
        participantSet.currentReps = dto.currentReps;
        participantSet.repMax = this.calculateRepMax(participantSet.currentWeight, participantSet.currentReps);
        participantSet.confirmed = true;
        await this.participantSetRepository.save(participantSet);
        const payload = await this.getByIdForUser(userId, participantSet.commonWorkoutExercise.commonWorkoutId);
        this.gateway.emitUpdated(participantSet.commonWorkoutExercise.commonWorkoutId, payload);
        return payload;
    }
    async finish(userId, commonWorkoutId) {
        const commonWorkout = await this.getActiveCommonWorkoutEntityForUser(userId, commonWorkoutId);
        commonWorkout.status = common_workout_entity_1.CommonWorkoutStatus.COMPLETED;
        commonWorkout.finishedAt = new Date();
        await this.commonWorkoutRepository.save(commonWorkout);
        for (const participant of commonWorkout.participants || []) {
            await this.createIndividualWorkoutFromCommonWorkout(commonWorkout, participant);
        }
        const payload = await this.getByIdForUser(userId, commonWorkout.id);
        this.gateway.emitFinished(commonWorkout.id, payload);
        return payload;
    }
    async createCommonExercise(commonWorkoutId, exerciseId, order, setsCount) {
        const commonWorkout = await this.commonWorkoutRepository.findOne({
            where: { id: commonWorkoutId },
            relations: {
                participants: true,
            },
        });
        if (!commonWorkout) {
            throw new common_1.NotFoundException('Common workout not found');
        }
        const exercise = await this.exerciseRepository.findOne({ where: { id: exerciseId } });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        const commonWorkoutExercise = this.commonWorkoutExerciseRepository.create({
            commonWorkoutId,
            commonWorkout,
            exerciseId,
            exercise,
            order,
            participantSets: [],
        });
        const savedExercise = await this.commonWorkoutExerciseRepository.save(commonWorkoutExercise);
        for (const participant of commonWorkout.participants || []) {
            for (let i = 1; i <= setsCount; i += 1) {
                const previousSet = await this.getPreviousSetForUserExerciseSetNumber(participant.userId, exerciseId, i);
                const participantSet = this.participantSetRepository.create({
                    participantId: participant.id,
                    participant,
                    commonWorkoutExerciseId: savedExercise.id,
                    commonWorkoutExercise: savedExercise,
                    setNumber: i,
                    previousWeight: previousSet?.currentWeight ?? null,
                    previousReps: previousSet?.currentReps ?? null,
                    currentWeight: null,
                    currentReps: null,
                    repMax: null,
                    confirmed: false,
                });
                await this.participantSetRepository.save(participantSet);
            }
        }
    }
    async createIndividualWorkoutFromCommonWorkout(commonWorkout, participant) {
        const workout = this.workoutRepository.create({
            userId: participant.userId,
            templateId: commonWorkout.templateId,
            name: commonWorkout.name,
            status: workout_entity_1.WorkoutStatus.COMPLETED,
            startedAt: commonWorkout.startedAt,
            finishedAt: commonWorkout.finishedAt,
            exercises: [],
        });
        const savedWorkout = await this.workoutRepository.save(workout);
        const orderedExercises = [...(commonWorkout.exercises || [])].sort((a, b) => a.order - b.order);
        for (const commonExercise of orderedExercises) {
            const workoutExercise = this.workoutExerciseRepository.create({
                workoutId: savedWorkout.id,
                workout: savedWorkout,
                exerciseId: commonExercise.exerciseId,
                exercise: commonExercise.exercise,
                order: commonExercise.order,
                sets: [],
            });
            const savedWorkoutExercise = await this.workoutExerciseRepository.save(workoutExercise);
            const participantSets = (commonExercise.participantSets || [])
                .filter((set) => set.participantId === participant.id)
                .sort((a, b) => a.setNumber - b.setNumber);
            const setsToCreate = participantSets.map((set) => this.workoutSetRepository.create({
                workoutExerciseId: savedWorkoutExercise.id,
                workoutExercise: savedWorkoutExercise,
                setNumber: set.setNumber,
                previousWeight: set.previousWeight,
                previousReps: set.previousReps,
                currentWeight: set.currentWeight,
                currentReps: set.currentReps,
                repMax: set.repMax,
                confirmed: set.confirmed,
            }));
            await this.workoutSetRepository.save(setsToCreate);
        }
    }
    async ensureUsersExist(userIds) {
        const users = await this.userRepository.findBy({ id: (0, typeorm_2.In)(userIds) });
        if (users.length !== userIds.length) {
            throw new common_1.NotFoundException('User not found');
        }
    }
    async ensureParticipantsHaveNoActiveWorkouts(userIds) {
        const activeRegularWorkouts = await this.workoutRepository.find({
            where: {
                userId: (0, typeorm_2.In)(userIds),
                status: workout_entity_1.WorkoutStatus.ACTIVE,
            },
        });
        if (activeRegularWorkouts.length > 0) {
            throw new common_1.BadRequestException('One of the participants already has an active workout');
        }
        const activeCommonParticipants = await this.participantRepository.find({
            where: {
                userId: (0, typeorm_2.In)(userIds),
                commonWorkout: {
                    status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
                },
            },
            relations: {
                commonWorkout: true,
            },
        });
        if (activeCommonParticipants.length > 0) {
            throw new common_1.BadRequestException('One of the participants already has an active common workout');
        }
    }
    async getActiveCommonWorkoutEntityForUser(userId, commonWorkoutId) {
        const commonWorkout = await this.getCommonWorkoutEntityForUser(userId, commonWorkoutId);
        if (commonWorkout.status !== common_workout_entity_1.CommonWorkoutStatus.ACTIVE) {
            throw new common_1.NotFoundException('Active common workout not found');
        }
        return commonWorkout;
    }
    async getCommonWorkoutEntityForUser(userId, commonWorkoutId) {
        const commonWorkout = await this.commonWorkoutRepository.findOne({
            where: { id: commonWorkoutId },
            relations: {
                template: true,
                participants: {
                    user: true,
                    sets: true,
                },
                exercises: {
                    exercise: true,
                    participantSets: {
                        participant: {
                            user: true,
                        },
                    },
                },
            },
            order: {
                exercises: {
                    order: 'ASC',
                    participantSets: {
                        setNumber: 'ASC',
                    },
                },
                participants: {
                    id: 'ASC',
                },
            },
        });
        if (!commonWorkout) {
            throw new common_1.NotFoundException('Common workout not found');
        }
        const isParticipant = (commonWorkout.participants || []).some((participant) => participant.userId === userId);
        if (!isParticipant) {
            throw new common_1.NotFoundException('Common workout not found');
        }
        return commonWorkout;
    }
    getCommonWorkoutExerciseFromWorkout(commonWorkout, commonWorkoutExerciseId) {
        const commonWorkoutExercise = (commonWorkout.exercises || []).find((exercise) => exercise.id === commonWorkoutExerciseId);
        if (!commonWorkoutExercise) {
            throw new common_1.NotFoundException('Common workout exercise not found');
        }
        return commonWorkoutExercise;
    }
    async getActiveCommonWorkoutExerciseForUser(userId, commonWorkoutExerciseId) {
        const exercise = await this.commonWorkoutExerciseRepository.findOne({
            where: {
                id: commonWorkoutExerciseId,
                commonWorkout: {
                    status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
                },
            },
            relations: {
                exercise: true,
                commonWorkout: {
                    participants: true,
                },
                participantSets: true,
            },
        });
        if (!exercise) {
            throw new common_1.NotFoundException('Common workout exercise not found');
        }
        const isParticipant = (exercise.commonWorkout?.participants || []).some((participant) => participant.userId === userId);
        if (!isParticipant) {
            throw new common_1.NotFoundException('Common workout exercise not found');
        }
        return exercise;
    }
    async getParticipantSetForUser(userId, participantSetId) {
        const participantSet = await this.participantSetRepository.findOne({
            where: {
                id: participantSetId,
                participant: {
                    userId,
                    commonWorkout: {
                        status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
                    },
                },
            },
            relations: {
                participant: {
                    user: true,
                    commonWorkout: true,
                },
                commonWorkoutExercise: {
                    commonWorkout: true,
                    exercise: true,
                },
            },
        });
        if (!participantSet) {
            throw new common_1.NotFoundException('Common workout set not found');
        }
        return participantSet;
    }
    async getPreviousSetForUserExerciseSetNumber(userId, exerciseId, setNumber) {
        const previousWorkoutExercise = await this.workoutExerciseRepository.findOne({
            where: {
                exerciseId,
                workout: {
                    userId,
                    status: workout_entity_1.WorkoutStatus.COMPLETED,
                },
            },
            relations: {
                workout: true,
                sets: true,
            },
            order: {
                workout: {
                    finishedAt: 'DESC',
                },
                sets: {
                    setNumber: 'ASC',
                },
            },
        });
        return previousWorkoutExercise?.sets?.find((set) => set.setNumber === setNumber) || null;
    }
    async getAccessibleExerciseForUsers(userIds, exerciseId) {
        const exercise = await this.exerciseRepository.findOne({ where: { id: exerciseId } });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        if (exercise.isGlobal) {
            return exercise;
        }
        if (userIds.every((userId) => exercise.createdByUserId === userId)) {
            return exercise;
        }
        throw new common_1.NotFoundException('Exercise not found');
    }
    calculateRepMax(weight, reps) {
        if (typeof weight !== 'number' ||
            typeof reps !== 'number' ||
            weight <= 0 ||
            reps <= 0) {
            return null;
        }
        const repMax = weight * (1 + reps / 30);
        return Math.round(repMax * 100) / 100;
    }
    getDurationSeconds(startedAt, finishedAt) {
        const start = new Date(startedAt).getTime();
        const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
        return Math.max(0, Math.floor((end - start) / 1000));
    }
    getDurationLabel(durationSeconds) {
        const hours = Math.floor(durationSeconds / 3600);
        const minutes = Math.floor((durationSeconds % 3600) / 60);
        const seconds = durationSeconds % 60;
        if (hours > 0) {
            return `${hours}h ${minutes}min`;
        }
        if (minutes > 0) {
            return `${minutes}min ${seconds}s`;
        }
        return `${seconds}s`;
    }
    mapCommonWorkout(commonWorkout) {
        const durationSeconds = this.getDurationSeconds(commonWorkout.startedAt, commonWorkout.finishedAt);
        const participants = [...(commonWorkout.participants || [])].map((participant) => ({
            id: participant.id,
            user: {
                id: participant.user.id,
                email: participant.user.email,
                name: participant.user.name,
                avatarPath: participant.user.avatarPath ?? null,
                avatarUrl: participant.user.avatarPath ?? null,
            },
        }));
        const exercises = [...(commonWorkout.exercises || [])]
            .sort((a, b) => a.order - b.order)
            .map((exercise) => {
            const participantEntries = participants.map((participantSummary) => {
                const participant = (commonWorkout.participants || []).find((item) => item.id === participantSummary.id);
                const sets = (exercise.participantSets || [])
                    .filter((set) => set.participantId === participantSummary.id)
                    .sort((a, b) => a.setNumber - b.setNumber)
                    .map((set) => ({
                    id: set.id,
                    setNumber: set.setNumber,
                    previousWeight: set.previousWeight,
                    previousReps: set.previousReps,
                    currentWeight: set.currentWeight,
                    currentReps: set.currentReps,
                    repMax: set.repMax,
                    confirmed: set.confirmed,
                }));
                return {
                    participantId: participantSummary.id,
                    user: participant?.user
                        ? {
                            id: participant.user.id,
                            email: participant.user.email,
                            name: participant.user.name,
                            avatarPath: participant.user.avatarPath ?? null,
                            avatarUrl: participant.user.avatarPath ?? null,
                        }
                        : null,
                    sets,
                };
            });
            return {
                id: exercise.id,
                order: exercise.order,
                exercise: exercise.exercise
                    ? {
                        id: exercise.exercise.id,
                        name: exercise.exercise.name,
                        description: exercise.exercise.description,
                        muscleGroups: exercise.exercise.muscleGroups,
                    }
                    : null,
                setsCount: Math.max(0, ...participantEntries.map((entry) => entry.sets.length)),
                participants: participantEntries,
            };
        });
        return {
            id: commonWorkout.id,
            name: commonWorkout.name,
            status: commonWorkout.status,
            startedAt: commonWorkout.startedAt,
            finishedAt: commonWorkout.finishedAt,
            durationSeconds,
            durationLabel: this.getDurationLabel(durationSeconds),
            template: commonWorkout.template
                ? {
                    id: commonWorkout.template.id,
                    name: commonWorkout.template.name,
                }
                : null,
            participants,
            exercises,
        };
    }
};
exports.CommonWorkoutsService = CommonWorkoutsService;
exports.CommonWorkoutsService = CommonWorkoutsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(common_workout_entity_1.CommonWorkout)),
    __param(1, (0, typeorm_1.InjectRepository)(common_workout_participant_entity_1.CommonWorkoutParticipant)),
    __param(2, (0, typeorm_1.InjectRepository)(common_workout_exercise_entity_1.CommonWorkoutExercise)),
    __param(3, (0, typeorm_1.InjectRepository)(common_workout_participant_set_entity_1.CommonWorkoutParticipantSet)),
    __param(4, (0, typeorm_1.InjectRepository)(workout_entity_1.Workout)),
    __param(5, (0, typeorm_1.InjectRepository)(workout_exercise_entity_1.WorkoutExercise)),
    __param(6, (0, typeorm_1.InjectRepository)(workout_set_entity_1.WorkoutSet)),
    __param(7, (0, typeorm_1.InjectRepository)(workout_template_entity_1.WorkoutTemplate)),
    __param(8, (0, typeorm_1.InjectRepository)(exercise_entity_1.Exercise)),
    __param(9, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        common_workouts_gateway_1.CommonWorkoutsGateway])
], CommonWorkoutsService);
//# sourceMappingURL=common-workouts.service.js.map