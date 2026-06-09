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
var CommonWorkoutsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonWorkoutsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_workout_entity_1 = require("../entities/common-workout.entity");
const common_workout_block_entity_1 = require("../entities/common-workout-block.entity");
const common_workout_participant_entity_1 = require("../entities/common-workout-participant.entity");
const common_workout_exercise_entity_1 = require("../entities/common-workout-exercise.entity");
const common_workout_participant_set_entity_1 = require("../entities/common-workout-participant-set.entity");
const workout_entity_1 = require("../entities/workout.entity");
const workout_exercise_entity_1 = require("../entities/workout-exercise.entity");
const workout_set_entity_1 = require("../entities/workout-set.entity");
const workout_template_entity_1 = require("../entities/workout-template.entity");
const exercise_entity_1 = require("../entities/exercise.entity");
const user_entity_1 = require("../entities/user.entity");
const user_exercise_personal_best_entity_1 = require("../entities/user-exercise-personal-best.entity");
const common_workouts_gateway_1 = require("./common-workouts.gateway");
const rep_max_util_1 = require("../common/utils/rep-max.util");
const workout_constants_1 = require("../common/constants/workout.constants");
let CommonWorkoutsService = CommonWorkoutsService_1 = class CommonWorkoutsService {
    constructor(commonWorkoutRepository, commonWorkoutBlockRepository, participantRepository, commonWorkoutExerciseRepository, participantSetRepository, workoutRepository, workoutExerciseRepository, workoutSetRepository, templateRepository, exerciseRepository, userRepository, personalBestRepository, gateway) {
        this.commonWorkoutRepository = commonWorkoutRepository;
        this.commonWorkoutBlockRepository = commonWorkoutBlockRepository;
        this.participantRepository = participantRepository;
        this.commonWorkoutExerciseRepository = commonWorkoutExerciseRepository;
        this.participantSetRepository = participantSetRepository;
        this.workoutRepository = workoutRepository;
        this.workoutExerciseRepository = workoutExerciseRepository;
        this.workoutSetRepository = workoutSetRepository;
        this.templateRepository = templateRepository;
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
        this.personalBestRepository = personalBestRepository;
        this.gateway = gateway;
        this.logger = new common_1.Logger(CommonWorkoutsService_1.name);
        this.defaultPage = 1;
        this.defaultLimit = 20;
        this.maxLimit = 100;
    }
    async start(userId, dto) {
        const participantUserIds = Array.from(new Set([userId, ...(dto.participantUserIds || [])]));
        this.ensureCommonWorkoutParticipantLimit(participantUserIds.length);
        await this.ensureUsersExist(participantUserIds);
        await this.ensureParticipantsHaveNoActiveWorkouts(participantUserIds);
        let template = null;
        if (typeof dto.templateId === 'number') {
            template = await this.getAccessibleWorkoutTemplateForUser(userId, dto.templateId);
        }
        const commonWorkout = this.commonWorkoutRepository.create({
            createdByUserId: userId,
            templateId: template?.id ?? null,
            template,
            name: dto.name || template?.name || 'Workout',
            status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
            startedAt: new Date(),
            finishedAt: null,
            participants: [],
            exercises: [],
        });
        const savedWorkout = await this.commonWorkoutRepository.save(commonWorkout);
        const users = await this.userRepository.findBy({
            id: (0, typeorm_2.In)(participantUserIds),
        });
        const participants = users.map((user) => this.participantRepository.create({
            commonWorkoutId: savedWorkout.id,
            commonWorkout: savedWorkout,
            userId: user.id,
            user,
            sets: [],
        }));
        const savedParticipants = await this.participantRepository.save(participants);
        const sortedTemplateExercises = [...(template?.exercises || [])].sort((a, b) => a.order - b.order);
        this.ensureCommonWorkoutExerciseLimit(sortedTemplateExercises.length * savedParticipants.length);
        this.ensureCommonWorkoutTotalSetsLimit(sortedTemplateExercises.reduce((sum, exercise) => sum + exercise.setsCount, 0) * savedParticipants.length);
        for (const participant of savedParticipants) {
            for (const templateExercise of sortedTemplateExercises) {
                const block = await this.getOrCreateCommonWorkoutBlock(savedWorkout.id, templateExercise.exerciseId, templateExercise.order);
                await this.createCommonExercise(savedWorkout.id, participant, templateExercise.exerciseId, templateExercise.order, templateExercise.setsCount, block);
            }
        }
        const payload = await this.getByIdForUser(userId, savedWorkout.id);
        this.emitUpdatedIfSubscribed(savedWorkout.id, payload);
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
            return null;
        }
        return this.getByIdForUser(userId, participant.commonWorkoutId);
    }
    async listForUser(userId, query = {}) {
        const page = this.normalizePage(query.page);
        const limit = this.normalizeLimit(query.limit);
        const search = this.normalizeSearch(query.text_search);
        const baseQuery = this.commonWorkoutRepository
            .createQueryBuilder('workout')
            .leftJoin('workout.participants', 'participant')
            .leftJoin('workout.template', 'template')
            .leftJoin('workout.exercises', 'workoutExercise')
            .leftJoin('workoutExercise.exercise', 'exercise')
            .where('participant.userId = :userId', { userId });
        if (search) {
            baseQuery.andWhere(new typeorm_2.Brackets((qb) => {
                qb.where('LOWER(workout.name) LIKE :search', {
                    search: `%${search}%`,
                })
                    .orWhere('LOWER(COALESCE(template.name, \'\')) LIKE :search', {
                    search: `%${search}%`,
                })
                    .orWhere('LOWER(COALESCE(exercise.name, \'\')) LIKE :search', {
                    search: `%${search}%`,
                });
            }));
        }
        const total = await baseQuery
            .clone()
            .select('workout.id')
            .distinct(true)
            .getCount();
        const rows = await baseQuery
            .clone()
            .select('workout.id', 'id')
            .addSelect('workout.startedAt', 'startedAt')
            .distinct(true)
            .orderBy('workout.startedAt', 'DESC')
            .addOrderBy('workout.id', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getRawMany();
        const ids = rows.map((row) => Number(row.id));
        const workouts = ids.length
            ? await this.commonWorkoutRepository.find({
                where: { id: (0, typeorm_2.In)(ids) },
                relations: {
                    template: true,
                    participants: {
                        user: true,
                    },
                    blocks: {
                        defaultExercise: true,
                    },
                    exercises: {
                        participant: {
                            user: true,
                        },
                        exercise: true,
                        participantSets: true,
                    },
                },
                order: {
                    startedAt: 'DESC',
                    blocks: {
                        order: 'ASC',
                    },
                    exercises: {
                        order: 'ASC',
                        participantSets: {
                            setNumber: 'ASC',
                        },
                    },
                },
            })
            : [];
        const workoutById = new Map(workouts.map((workout) => [workout.id, workout]));
        return {
            workouts: ids
                .map((id) => workoutById.get(id))
                .filter((workout) => Boolean(workout))
                .map((workout) => this.mapWorkoutIndex(workout)),
            total,
            page,
            limit,
        };
    }
    async finishActive(userId) {
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
        return this.finish(userId, participant.commonWorkoutId);
    }
    async getByIdForUser(userId, commonWorkoutId) {
        const commonWorkout = await this.getCommonWorkoutEntityForUser(userId, commonWorkoutId);
        return this.mapWorkout(commonWorkout);
    }
    async getIndexForUser(userId, commonWorkoutId) {
        const commonWorkout = await this.getCommonWorkoutIndexEntityForUser(userId, commonWorkoutId);
        return this.mapWorkoutIndex(commonWorkout);
    }
    async getHistoryForUser(userId, query = {}) {
        const page = this.normalizePage(query.page);
        const limit = this.normalizeLimit(query.limit);
        const search = this.normalizeSearch(query.text_search);
        const baseQuery = this.workoutRepository
            .createQueryBuilder('workout')
            .leftJoin('workout.template', 'template')
            .leftJoin('workout.exercises', 'workoutExercise')
            .leftJoin('workoutExercise.exercise', 'exercise')
            .where('workout.userId = :userId', { userId })
            .andWhere('workout.status = :status', {
            status: workout_entity_1.WorkoutStatus.COMPLETED,
        });
        if (search) {
            baseQuery.andWhere(new typeorm_2.Brackets((qb) => {
                qb.where('LOWER(workout.name) LIKE :search', {
                    search: `%${search}%`,
                })
                    .orWhere('LOWER(COALESCE(template.name, \'\')) LIKE :search', {
                    search: `%${search}%`,
                })
                    .orWhere('LOWER(COALESCE(exercise.name, \'\')) LIKE :search', {
                    search: `%${search}%`,
                });
            }));
        }
        const total = await baseQuery
            .clone()
            .select('workout.id')
            .distinct(true)
            .getCount();
        const rows = await baseQuery
            .clone()
            .select('workout.id', 'id')
            .addSelect('workout.startedAt', 'startedAt')
            .distinct(true)
            .orderBy('workout.startedAt', 'DESC')
            .addOrderBy('workout.id', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getRawMany();
        const ids = rows.map((row) => Number(row.id));
        const workouts = ids.length
            ? await this.workoutRepository.find({
                where: { id: (0, typeorm_2.In)(ids), userId, status: workout_entity_1.WorkoutStatus.COMPLETED },
                order: { startedAt: 'DESC' },
                relations: {
                    template: true,
                    exercises: {
                        exercise: true,
                        sets: true,
                    },
                },
            })
            : [];
        const workoutById = new Map(workouts.map((workout) => [workout.id, workout]));
        return {
            workouts: ids
                .map((id) => workoutById.get(id))
                .filter((workout) => Boolean(workout))
                .map((workout) => this.mapHistoricalWorkoutSummary(workout)),
            total,
            page,
            limit,
        };
    }
    async getHistoricalByIdForUser(userId, workoutId) {
        const workout = await this.getHistoricalWorkoutEntityForUser(userId, workoutId);
        return this.mapHistoricalWorkout(workout);
    }
    async getHistoricalSummaryForUser(userId, workoutId) {
        const workout = await this.getHistoricalWorkoutEntityForUser(userId, workoutId);
        return this.mapHistoricalWorkoutPerformanceSummary(workout);
    }
    async updateHistoricalWorkout(userId, workoutId, dto) {
        const workout = await this.getHistoricalWorkoutEntityForUser(userId, workoutId);
        if (typeof dto.name === 'string') {
            workout.name = dto.name;
            await this.workoutRepository.save(workout);
        }
        return this.getHistoricalByIdForUser(userId, workout.id);
    }
    async removeHistoricalWorkout(userId, workoutId) {
        await this.getHistoricalWorkoutEntityForUser(userId, workoutId);
        await this.workoutRepository.delete({
            id: workoutId,
            userId,
        });
        return { success: true, message: 'Workout removed' };
    }
    async getSummaryForUser(userId, workoutId) {
        try {
            const commonWorkout = await this.getCommonWorkoutEntityForUser(userId, workoutId);
            return {
                ...this.mapWorkoutPerformanceSummary(commonWorkout),
                source: 'session',
            };
        }
        catch (error) {
            if (!(error instanceof common_1.NotFoundException)) {
                throw error;
            }
        }
        const workout = await this.workoutRepository.findOne({
            where: {
                id: workoutId,
                userId,
                status: workout_entity_1.WorkoutStatus.COMPLETED,
            },
            relations: {
                user: true,
                template: true,
                exercises: {
                    exercise: true,
                    sets: true,
                },
            },
            order: {
                exercises: {
                    order: 'ASC',
                    sets: {
                        setNumber: 'ASC',
                    },
                },
            },
        });
        if (!workout) {
            throw new common_1.NotFoundException('Workout not found');
        }
        return {
            ...this.mapHistoricalWorkoutPerformanceSummary(workout),
            source: 'history',
        };
    }
    async getExerciseHistoryForUser(userId, exerciseId, query = {}) {
        const page = this.normalizePage(query.page);
        const limit = this.normalizeLimit(query.limit);
        const search = this.normalizeSearch(query.text_search);
        const baseQuery = this.workoutExerciseRepository
            .createQueryBuilder('workoutExercise')
            .innerJoin('workoutExercise.workout', 'workout')
            .where('workoutExercise.exerciseId = :exerciseId', { exerciseId })
            .andWhere('workout.userId = :userId', { userId })
            .andWhere('workout.status = :status', {
            status: workout_entity_1.WorkoutStatus.COMPLETED,
        });
        if (search) {
            baseQuery.andWhere('LOWER(workout.name) LIKE :search', {
                search: `%${search}%`,
            });
        }
        const total = await baseQuery.getCount();
        const rows = await baseQuery
            .clone()
            .select('workoutExercise.id', 'id')
            .orderBy('workout.startedAt', 'DESC')
            .addOrderBy('workoutExercise.id', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getRawMany();
        const ids = rows.map((row) => Number(row.id));
        const workoutExercises = ids.length
            ? await this.workoutExerciseRepository.find({
                where: { id: (0, typeorm_2.In)(ids) },
                relations: {
                    workout: true,
                    exercise: true,
                    sets: true,
                },
                order: {
                    workout: {
                        startedAt: 'DESC',
                    },
                    sets: {
                        setNumber: 'ASC',
                    },
                },
            })
            : [];
        if (workoutExercises.length === 0) {
            const exercise = await this.exerciseRepository.findOne({
                where: { id: exerciseId },
            });
            if (!exercise) {
                throw new common_1.NotFoundException('Exercise not found');
            }
            return {
                exercise: {
                    id: exercise.id,
                    name: exercise.name,
                },
                history: [],
                total,
                page,
                limit,
            };
        }
        const exercise = workoutExercises[0].exercise;
        const workoutExerciseById = new Map(workoutExercises.map((workoutExercise) => [
            workoutExercise.id,
            workoutExercise,
        ]));
        return {
            exercise: {
                id: exercise.id,
                name: exercise.name,
            },
            history: ids
                .map((id) => workoutExerciseById.get(id))
                .filter((workoutExercise) => Boolean(workoutExercise))
                .map((workoutExercise) => ({
                workoutId: workoutExercise.workoutId,
                workoutName: workoutExercise.workout?.name ?? 'Workout',
                exerciseName: workoutExercise.exercise?.name ?? exercise.name,
                date: this.toDateOnly(workoutExercise.workout?.finishedAt ??
                    workoutExercise.workout?.startedAt ??
                    new Date()),
                sets: [...(workoutExercise.sets || [])]
                    .sort((a, b) => a.setNumber - b.setNumber)
                    .map((set) => ({
                    id: set.id,
                    setNumber: set.setNumber,
                    weight: set.currentWeight,
                    reps: set.currentReps,
                    repMax: set.repMax,
                    confirmed: set.confirmed,
                    label: this.formatSetLabel(set.currentWeight, set.currentReps),
                })),
            })),
            total,
            page,
            limit,
        };
    }
    async getDashboardStatsForUser(userId, dto) {
        const range = this.getDateRange(dto.dateFrom, dto.dateTo);
        const workouts = await this.workoutRepository.find({
            where: {
                userId,
                status: workout_entity_1.WorkoutStatus.COMPLETED,
                startedAt: (0, typeorm_2.Between)(range.from, range.to),
            },
            relations: {
                exercises: {
                    exercise: true,
                    sets: true,
                },
            },
            order: {
                startedAt: 'DESC',
            },
        });
        const favoriteExercise = await this.getFavoriteExerciseStat(userId, workouts);
        const favoriteDay = this.getFavoriteTrainingDay(workouts);
        const favoritePartner = await this.getFavoritePartnerStat(userId, range.from, range.to);
        return {
            dateFrom: dto.dateFrom,
            dateTo: dto.dateTo,
            workoutsCount: workouts.length,
            favoriteExercise,
            favoriteTrainingDay: favoriteDay,
            favoriteTrainingPartner: favoritePartner,
        };
    }
    async getExerciseByIdForUser(userId, commonWorkoutId, commonWorkoutExerciseId) {
        const exercise = await this.getCommonWorkoutExerciseEntityForUser(userId, commonWorkoutId, commonWorkoutExerciseId);
        return this.mapCommonWorkoutExerciseDetail(exercise);
    }
    async getBlockForUser(userId, commonWorkoutId, blockId) {
        const commonWorkout = await this.getCommonWorkoutBlockEntityForUser(userId, commonWorkoutId, blockId);
        const blocks = this.mapWorkoutBlocks(commonWorkout, true);
        const block = blocks.find((item) => item.id === blockId || item.order === blockId);
        if (!block) {
            throw new common_1.NotFoundException('Workout block not found');
        }
        return {
            workoutId: commonWorkout.id,
            ...block,
        };
    }
    async updateCommonWorkout(userId, commonWorkoutId, dto) {
        const commonWorkout = await this.getActiveCommonWorkoutEntityForUser(userId, commonWorkoutId);
        if (typeof dto.name === 'string') {
            commonWorkout.name = dto.name;
            await this.commonWorkoutRepository.save(commonWorkout);
        }
        const payload = await this.getWorkoutResponse(userId, commonWorkout.id);
        this.emitUpdatedIfSubscribed(commonWorkout.id, payload);
        return payload;
    }
    async removeActiveWorkout(userId, commonWorkoutId) {
        const commonWorkout = await this.getActiveCommonWorkoutEntityForUser(userId, commonWorkoutId);
        await this.commonWorkoutRepository.delete({
            id: commonWorkout.id,
            status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
        });
        const payload = {
            success: true,
            discarded: true,
            workoutId: commonWorkout.id,
        };
        this.emitDiscardedIfSubscribed(commonWorkout.id, payload);
        return payload;
    }
    async addExercise(userId, commonWorkoutId, dto) {
        return this.addBlock(userId, commonWorkoutId, {
            defaultExerciseId: dto.exerciseId,
            order: dto.order,
            setsCount: dto.setsCount,
        });
    }
    async addBlock(userId, commonWorkoutId, dto) {
        const commonWorkout = await this.getActiveCommonWorkoutStructureEntityForUser(userId, commonWorkoutId);
        this.getWorkoutParticipantForUser(commonWorkout, userId);
        const participants = [...(commonWorkout.participants || [])];
        const defaultExerciseId = dto.defaultExerciseId;
        const exercise = typeof defaultExerciseId === 'number'
            ? await this.getAccessibleExerciseForUser(userId, defaultExerciseId)
            : null;
        const existingOrders = [...(commonWorkout.blocks || [])].map((block) => block.order);
        const nextOrder = Math.max(-1, ...existingOrders) + 1;
        const insertOrder = Math.max(0, Math.min(dto.order ?? nextOrder, nextOrder));
        const setsCount = dto.setsCount ?? 0;
        const [existingExerciseCount, existingSetsCount] = await Promise.all([
            this.commonWorkoutExerciseRepository.count({
                where: { commonWorkoutId: commonWorkout.id },
            }),
            this.countCommonWorkoutSets(commonWorkout.id),
        ]);
        this.ensureCommonWorkoutExerciseLimit(existingExerciseCount + participants.length);
        this.ensureCommonWorkoutTotalSetsLimit(existingSetsCount + setsCount * participants.length);
        const shiftedBlocks = [...(commonWorkout.blocks || [])];
        for (const block of shiftedBlocks) {
            if (block.order >= insertOrder) {
                block.order += 1;
            }
        }
        const blocksToShift = shiftedBlocks.filter((block) => block.order > insertOrder);
        if (blocksToShift.length > 0) {
            await this.commonWorkoutBlockRepository.save(blocksToShift);
        }
        const block = await this.createCommonWorkoutBlock(commonWorkout, exercise?.id ?? null, insertOrder);
        const previousSetsByUserId = typeof exercise?.id === 'number' && setsCount > 0
            ? await this.getPreviousSetsByUserIdForExercise(participants.map((participant) => participant.userId), exercise.id)
            : new Map();
        const commonWorkoutExercises = participants.map((participant) => this.commonWorkoutExerciseRepository.create({
            commonWorkoutId: commonWorkout.id,
            participantId: participant.id,
            participant,
            blockId: block.id,
            block,
            exerciseId: exercise?.id ?? null,
            exercise,
            order: insertOrder,
            completed: false,
            completedAt: null,
            participantSets: [],
        }));
        const savedExercises = await this.commonWorkoutExerciseRepository.save(commonWorkoutExercises);
        if (setsCount > 0) {
            const participantById = new Map(participants.map((participant) => [participant.id, participant]));
            const participantSets = savedExercises.flatMap((savedExercise) => {
                if (typeof savedExercise.participantId !== 'number') {
                    return [];
                }
                const participant = participantById.get(savedExercise.participantId);
                const previousSets = participant
                    ? previousSetsByUserId.get(participant.userId)
                    : undefined;
                return Array.from({ length: setsCount }, (_, index) => {
                    const setNumber = index + 1;
                    const previousSet = previousSets?.get(setNumber);
                    return this.participantSetRepository.create({
                        participantId: savedExercise.participantId,
                        commonWorkoutExerciseId: savedExercise.id,
                        setNumber,
                        previousWeight: previousSet?.currentWeight ?? null,
                        previousReps: previousSet?.currentReps ?? null,
                        currentWeight: null,
                        currentReps: null,
                        durationSeconds: null,
                        repMax: null,
                        confirmed: false,
                    });
                });
            });
            await this.participantSetRepository.save(participantSets);
        }
        const payload = await this.getBlockResponse(userId, commonWorkout.id, block.id);
        this.emitUpdatedIfSubscribed(commonWorkout.id, payload);
        return payload;
    }
    async changeExercisePosition(userId, commonWorkoutId, exerciseOrder, dto) {
        const commonWorkout = await this.getActiveCommonWorkoutStructureEntityForUser(userId, commonWorkoutId);
        const participant = this.getWorkoutParticipantForUser(commonWorkout, userId);
        const exercises = this.getSortedParticipantExercises(commonWorkout.exercises || [], participant.id);
        const currentExercise = this.getParticipantExerciseByOrder(exercises, exerciseOrder);
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
        const payload = await this.getWorkoutExerciseResponse(userId, commonWorkout.id, currentExercise.order);
        this.emitUpdatedIfSubscribed(commonWorkout.id, payload);
        return payload;
    }
    async changeExercise(userId, commonWorkoutId, exerciseOrder, dto) {
        const currentExercise = await this.getCommonWorkoutExerciseEntityForUser(userId, commonWorkoutId, exerciseOrder);
        const exercise = await this.getAccessibleExerciseForUser(userId, dto.exerciseId);
        currentExercise.exerciseId = exercise.id;
        currentExercise.exercise = exercise;
        currentExercise.completed = false;
        currentExercise.completedAt = null;
        await this.commonWorkoutExerciseRepository.save(currentExercise);
        const previousSetsByUserId = await this.getPreviousSetsByUserIdForExercise([userId], exercise.id);
        for (const set of currentExercise.participantSets || []) {
            const previousSet = previousSetsByUserId.get(userId)?.get(set.setNumber);
            set.previousWeight = previousSet?.currentWeight ?? null;
            set.previousReps = previousSet?.currentReps ?? null;
        }
        await this.participantSetRepository.save(currentExercise.participantSets || []);
        await this.syncWorkoutExerciseCompletion(currentExercise.id);
        const payload = await this.getWorkoutExerciseResponse(userId, commonWorkoutId, currentExercise.order);
        this.emitUpdatedIfSubscribed(commonWorkoutId, payload);
        return payload;
    }
    async removeExercise(userId, commonWorkoutId, exerciseOrder) {
        const commonWorkout = await this.getActiveCommonWorkoutStructureEntityForUser(userId, commonWorkoutId);
        const participant = this.getWorkoutParticipantForUser(commonWorkout, userId);
        const participantExercises = this.getSortedParticipantExercises(commonWorkout.exercises || [], participant.id);
        const currentExercise = this.getParticipantExerciseByOrder(participantExercises, exerciseOrder);
        await this.commonWorkoutExerciseRepository.delete({
            id: currentExercise.id,
            commonWorkoutId: commonWorkout.id,
        });
        const remainingExercises = participantExercises.filter((item) => item.id !== currentExercise.id);
        for (const item of remainingExercises) {
            if (item.order > currentExercise.order) {
                item.order -= 1;
            }
        }
        await this.commonWorkoutExerciseRepository.save(remainingExercises);
        const payload = await this.getWorkoutResponse(userId, commonWorkout.id);
        this.emitUpdatedIfSubscribed(commonWorkout.id, payload);
        return payload;
    }
    async addSet(userId, exerciseOrder) {
        const commonWorkoutExercise = await this.getActiveCommonWorkoutExerciseForUser(userId, exerciseOrder);
        const existingSets = commonWorkoutExercise.participantSets || [];
        const nextSetNumber = Math.max(0, ...existingSets.map((set) => set.setNumber)) + 1;
        if (nextSetNumber > workout_constants_1.MAX_EXERCISE_SETS) {
            throw new common_1.BadRequestException(`Common workout exercise cannot have more than ${workout_constants_1.MAX_EXERCISE_SETS} sets`);
        }
        this.ensureCommonWorkoutTotalSetsLimit((await this.countCommonWorkoutSets(commonWorkoutExercise.commonWorkoutId)) + 1);
        const previousSetsByUserId = typeof commonWorkoutExercise.exerciseId === 'number'
            ? await this.getPreviousSetsByUserIdForExercise([userId], commonWorkoutExercise.exerciseId)
            : new Map();
        const previousSet = previousSetsByUserId.get(userId)?.get(nextSetNumber);
        await this.participantSetRepository.save(this.participantSetRepository.create({
            participantId: commonWorkoutExercise.participantId,
            commonWorkoutExerciseId: commonWorkoutExercise.id,
            setNumber: nextSetNumber,
            previousWeight: previousSet?.currentWeight ?? null,
            previousReps: previousSet?.currentReps ?? null,
            currentWeight: null,
            currentReps: null,
            durationSeconds: null,
            repMax: null,
            confirmed: false,
        }));
        await this.syncWorkoutExerciseCompletion(commonWorkoutExercise.id);
        const payload = await this.getWorkoutExerciseResponse(userId, commonWorkoutExercise.commonWorkoutId, commonWorkoutExercise.order);
        this.emitUpdatedIfSubscribed(commonWorkoutExercise.commonWorkoutId, payload);
        return payload;
    }
    async removeSet(userId, participantSetId) {
        const participantSet = await this.getParticipantSetForUser(userId, participantSetId);
        const commonWorkoutExerciseId = participantSet.commonWorkoutExerciseId;
        const commonWorkoutId = participantSet.commonWorkoutExercise.commonWorkoutId;
        const exerciseOrder = participantSet.commonWorkoutExercise.order;
        await this.participantSetRepository.remove(participantSet);
        const remainingSets = await this.participantSetRepository.find({
            where: { commonWorkoutExerciseId },
            relations: {
                participant: true,
                commonWorkoutExercise: true,
            },
            order: { setNumber: 'ASC' },
        });
        for (let index = 0; index < remainingSets.length; index += 1) {
            remainingSets[index].setNumber = index + 1;
        }
        await this.participantSetRepository.save(remainingSets);
        await this.syncWorkoutExerciseCompletion(commonWorkoutExerciseId);
        const payload = await this.getWorkoutExerciseResponse(userId, commonWorkoutId, exerciseOrder);
        this.emitUpdatedIfSubscribed(commonWorkoutId, payload);
        return payload;
    }
    async updateSet(userId, participantSetId, dto) {
        const participantSet = await this.getParticipantSetForUser(userId, participantSetId);
        const nextWeight = typeof dto.currentWeight === 'number'
            ? dto.currentWeight
            : participantSet.currentWeight;
        const nextReps = typeof dto.currentReps === 'number'
            ? dto.currentReps
            : participantSet.currentReps;
        const nextDuration = typeof dto.durationSeconds === 'number'
            ? dto.durationSeconds
            : participantSet.durationSeconds;
        const nextRepMax = this.calculateRepMax(nextWeight, nextReps);
        await this.participantSetRepository.update(participantSetId, {
            currentWeight: nextWeight,
            currentReps: nextReps,
            durationSeconds: nextDuration,
            repMax: nextRepMax,
            confirmed: true,
        });
        await this.syncWorkoutExerciseCompletion(participantSet.commonWorkoutExerciseId);
        const payload = await this.getWorkoutExerciseResponse(userId, participantSet.commonWorkoutExercise.commonWorkoutId, participantSet.commonWorkoutExercise.order);
        this.emitUpdatedIfSubscribed(participantSet.commonWorkoutExercise.commonWorkoutId, payload);
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
        this.emitFinishedIfSubscribed(commonWorkout.id, payload);
        return payload;
    }
    emitUpdatedIfSubscribed(commonWorkoutId, payload) {
        if (!this.gateway.hasSubscribers(commonWorkoutId)) {
            return;
        }
        this.logPayloadMetrics('commonWorkoutUpdated', commonWorkoutId, payload);
        this.gateway.emitUpdated(commonWorkoutId, payload);
    }
    emitFinishedIfSubscribed(commonWorkoutId, payload) {
        if (!this.gateway.hasSubscribers(commonWorkoutId)) {
            return;
        }
        this.logPayloadMetrics('commonWorkoutFinished', commonWorkoutId, payload);
        this.gateway.emitFinished(commonWorkoutId, payload);
    }
    emitDiscardedIfSubscribed(commonWorkoutId, payload) {
        if (!this.gateway.hasSubscribers(commonWorkoutId)) {
            return;
        }
        this.logPayloadMetrics('commonWorkoutDiscarded', commonWorkoutId, payload);
        this.gateway.emitDiscarded(commonWorkoutId, payload);
    }
    logPayloadMetrics(eventName, commonWorkoutId, payload) {
        try {
            const payloadSizeBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');
            if (payloadSizeBytes >= 100_000) {
                this.logger.warn(`${eventName} payload for common workout ${commonWorkoutId} is ${payloadSizeBytes} bytes`);
            }
        }
        catch (error) {
            this.logger.warn(`Could not measure payload size for ${eventName} in common workout ${commonWorkoutId}`);
        }
    }
    async getWorkoutResponse(userId, commonWorkoutId) {
        return {
            workout: await this.getIndexForUser(userId, commonWorkoutId),
        };
    }
    async getWorkoutExerciseResponse(userId, commonWorkoutId, exerciseOrder) {
        const workout = await this.getIndexForUser(userId, commonWorkoutId);
        const exercise = await this.getExerciseByIdForUser(userId, commonWorkoutId, exerciseOrder);
        return { workout, exercise };
    }
    async getBlockResponse(userId, commonWorkoutId, blockId) {
        const workout = await this.getIndexForUser(userId, commonWorkoutId);
        const block = await this.getBlockForUser(userId, commonWorkoutId, blockId);
        return { workout, block };
    }
    async createCommonExercise(commonWorkoutId, participant, exerciseId, order, setsCount, block) {
        const exercise = typeof exerciseId === 'number'
            ? await this.exerciseRepository.findOne({ where: { id: exerciseId } })
            : null;
        if (typeof exerciseId === 'number' && !exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        const commonWorkoutExercise = this.commonWorkoutExerciseRepository.create({
            commonWorkoutId,
            participantId: participant.id,
            participant,
            blockId: block?.id ?? null,
            block: block ?? null,
            exerciseId,
            exercise,
            order,
            completed: false,
            completedAt: null,
            participantSets: [],
        });
        const savedExercise = await this.commonWorkoutExerciseRepository.save(commonWorkoutExercise);
        if (setsCount > 0) {
            const previousSetsByUserId = typeof exerciseId === 'number'
                ? await this.getPreviousSetsByUserIdForExercise([participant.userId], exerciseId)
                : new Map();
            const participantSets = [];
            for (let i = 1; i <= setsCount; i += 1) {
                const previousSet = previousSetsByUserId
                    .get(participant.userId)
                    ?.get(i);
                participantSets.push(this.participantSetRepository.create({
                    participantId: participant.id,
                    commonWorkoutExerciseId: savedExercise.id,
                    setNumber: i,
                    previousWeight: previousSet?.currentWeight ?? null,
                    previousReps: previousSet?.currentReps ?? null,
                    currentWeight: null,
                    currentReps: null,
                    durationSeconds: null,
                    repMax: null,
                    confirmed: false,
                }));
            }
            await this.participantSetRepository.save(participantSets);
        }
        return savedExercise;
    }
    async createCommonWorkoutBlock(commonWorkout, defaultExerciseId, order) {
        const block = this.commonWorkoutBlockRepository.create({
            commonWorkoutId: commonWorkout.id,
            defaultExerciseId,
            order,
            status: common_workout_block_entity_1.CommonWorkoutBlockStatus.ACTIVE,
            completedAt: null,
            userExercises: [],
        });
        return this.commonWorkoutBlockRepository.save(block);
    }
    async getOrCreateCommonWorkoutBlock(commonWorkoutId, defaultExerciseId, order) {
        const existing = await this.commonWorkoutBlockRepository.findOne({
            where: { commonWorkoutId, order },
        });
        if (existing) {
            return existing;
        }
        return this.createCommonWorkoutBlock({ id: commonWorkoutId }, defaultExerciseId, order);
    }
    async syncWorkoutExerciseCompletion(commonWorkoutExerciseId) {
        const exercise = await this.commonWorkoutExerciseRepository.findOne({
            where: { id: commonWorkoutExerciseId },
        });
        if (!exercise) {
            return;
        }
        const sets = await this.participantSetRepository.find({
            where: { commonWorkoutExerciseId },
        });
        const completed = sets.length > 0 &&
            sets.every((set) => set.confirmed && this.hasValidTrainingValue(set));
        if (exercise.completed !== completed) {
            exercise.completed = completed;
            exercise.completedAt = completed ? new Date() : null;
            await this.commonWorkoutExerciseRepository.save(exercise);
        }
        if (exercise.blockId) {
            await this.syncWorkoutBlockCompletion(exercise.blockId);
        }
    }
    async syncWorkoutBlockCompletion(blockId) {
        const block = await this.commonWorkoutBlockRepository.findOne({
            where: { id: blockId },
        });
        if (!block) {
            return;
        }
        const userExercises = await this.commonWorkoutExerciseRepository.find({
            where: { blockId },
        });
        const completed = userExercises.length > 0 &&
            userExercises.every((exercise) => exercise.completed);
        const nextStatus = completed
            ? common_workout_block_entity_1.CommonWorkoutBlockStatus.COMPLETED
            : common_workout_block_entity_1.CommonWorkoutBlockStatus.ACTIVE;
        if (block.status !== nextStatus) {
            block.status = nextStatus;
            block.completedAt = completed ? new Date() : null;
            await this.commonWorkoutBlockRepository.save(block);
        }
    }
    hasValidTrainingValue(set) {
        return ((typeof set.currentReps === 'number' && set.currentReps > 0) ||
            (typeof set.durationSeconds === 'number' && set.durationSeconds > 0));
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
        const orderedExercises = this.getSortedParticipantExercises(commonWorkout.exercises || [], participant.id);
        if (orderedExercises.length === 0) {
            return;
        }
        for (const commonExercise of orderedExercises) {
            if (typeof commonExercise.exerciseId !== 'number') {
                continue;
            }
            const workoutExercise = this.workoutExerciseRepository.create({
                workoutId: savedWorkout.id,
                exerciseId: commonExercise.exerciseId,
                order: commonExercise.order,
            });
            const savedWorkoutExercise = await this.workoutExerciseRepository.save(workoutExercise);
            const participantSets = [...(commonExercise.participantSets || [])].sort((a, b) => a.setNumber - b.setNumber);
            if (participantSets.length === 0) {
                continue;
            }
            const workoutSets = participantSets.map((set) => this.workoutSetRepository.create({
                workoutExerciseId: savedWorkoutExercise.id,
                setNumber: set.setNumber,
                previousWeight: set.previousWeight,
                previousReps: set.previousReps,
                currentWeight: set.currentWeight,
                currentReps: set.currentReps,
                repMax: set.repMax,
                confirmed: set.confirmed,
            }));
            await this.workoutSetRepository.save(workoutSets);
            await this.syncPersonalBestForSavedWorkoutExercise(participant.userId, commonExercise.exerciseId, savedWorkout, savedWorkoutExercise, workoutSets);
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
    ensureCommonWorkoutParticipantLimit(count) {
        if (count > workout_constants_1.MAX_COMMON_WORKOUT_PARTICIPANTS) {
            throw new common_1.BadRequestException(`Common workout cannot have more than ${workout_constants_1.MAX_COMMON_WORKOUT_PARTICIPANTS} participants`);
        }
    }
    ensureCommonWorkoutExerciseLimit(count) {
        if (count > workout_constants_1.MAX_COMMON_WORKOUT_EXERCISES) {
            throw new common_1.BadRequestException(`Common workout cannot have more than ${workout_constants_1.MAX_COMMON_WORKOUT_EXERCISES} exercises`);
        }
    }
    ensureCommonWorkoutTotalSetsLimit(totalSets) {
        if (totalSets > workout_constants_1.MAX_TOTAL_SETS) {
            throw new common_1.BadRequestException(`Common workout cannot have more than ${workout_constants_1.MAX_TOTAL_SETS} total sets`);
        }
    }
    getCommonWorkoutTotalSets(exercises) {
        return exercises.reduce((sum, exercise) => {
            const setsCount = Math.max(0, ...(exercise.participantSets || []).map((set) => set.setNumber));
            return sum + (Number.isFinite(setsCount) ? setsCount : 0);
        }, 0);
    }
    countCommonWorkoutSets(commonWorkoutId) {
        return this.participantSetRepository
            .createQueryBuilder('participantSet')
            .innerJoin('participantSet.commonWorkoutExercise', 'commonWorkoutExercise')
            .where('commonWorkoutExercise.commonWorkoutId = :commonWorkoutId', {
            commonWorkoutId,
        })
            .getCount();
    }
    async getActiveCommonWorkoutEntityForUser(userId, commonWorkoutId) {
        const commonWorkout = await this.getCommonWorkoutEntityForUser(userId, commonWorkoutId);
        if (commonWorkout.status !== common_workout_entity_1.CommonWorkoutStatus.ACTIVE) {
            throw new common_1.NotFoundException('Active common workout not found');
        }
        return commonWorkout;
    }
    async getActiveCommonWorkoutStructureEntityForUser(userId, commonWorkoutId) {
        const commonWorkout = await this.getCommonWorkoutStructureEntityForUser(userId, commonWorkoutId);
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
            },
        });
        if (!commonWorkout) {
            throw new common_1.NotFoundException('Common workout not found');
        }
        await this.attachCommonWorkoutGraph(commonWorkout, true);
        this.ensureUserParticipatesInCommonWorkout(commonWorkout, userId);
        return commonWorkout;
    }
    async getCommonWorkoutIndexEntityForUser(userId, commonWorkoutId) {
        const commonWorkout = await this.commonWorkoutRepository.findOne({
            where: { id: commonWorkoutId },
            relations: {
                template: true,
            },
        });
        if (!commonWorkout) {
            throw new common_1.NotFoundException('Common workout not found');
        }
        await this.attachCommonWorkoutGraph(commonWorkout, true);
        this.ensureUserParticipatesInCommonWorkout(commonWorkout, userId);
        return commonWorkout;
    }
    async getCommonWorkoutBlockEntityForUser(userId, commonWorkoutId, blockIdentifier) {
        const commonWorkout = await this.commonWorkoutRepository.findOne({
            where: { id: commonWorkoutId },
            relations: {
                template: true,
            },
        });
        if (!commonWorkout) {
            throw new common_1.NotFoundException('Common workout not found');
        }
        const participants = await this.participantRepository.find({
            where: { commonWorkoutId },
            relations: {
                user: true,
            },
            order: { id: 'ASC' },
        });
        commonWorkout.participants = participants;
        this.ensureUserParticipatesInCommonWorkout(commonWorkout, userId);
        const block = await this.commonWorkoutBlockRepository.findOne({
            where: [
                { id: blockIdentifier, commonWorkoutId },
                { order: blockIdentifier, commonWorkoutId },
            ],
            relations: {
                defaultExercise: true,
            },
        });
        if (!block) {
            await this.attachCommonWorkoutGraph(commonWorkout, true);
            return commonWorkout;
        }
        const exercises = await this.commonWorkoutExerciseRepository.find({
            where: { commonWorkoutId, blockId: block.id },
            relations: {
                participant: {
                    user: true,
                },
                exercise: true,
                participantSets: true,
            },
            order: {
                participantId: 'ASC',
                participantSets: {
                    setNumber: 'ASC',
                },
            },
        });
        commonWorkout.blocks = [block];
        commonWorkout.exercises = exercises;
        return commonWorkout;
    }
    async getCommonWorkoutStructureEntityForUser(userId, commonWorkoutId) {
        const commonWorkout = await this.commonWorkoutRepository.findOne({
            where: { id: commonWorkoutId },
        });
        if (!commonWorkout) {
            throw new common_1.NotFoundException('Common workout not found');
        }
        await this.attachCommonWorkoutGraph(commonWorkout, false);
        this.ensureUserParticipatesInCommonWorkout(commonWorkout, userId);
        return commonWorkout;
    }
    async attachCommonWorkoutGraph(commonWorkout, includeSets) {
        const [participants, blocks, exercises] = await Promise.all([
            this.participantRepository.find({
                where: { commonWorkoutId: commonWorkout.id },
                relations: {
                    user: true,
                },
                order: { id: 'ASC' },
            }),
            this.commonWorkoutBlockRepository.find({
                where: { commonWorkoutId: commonWorkout.id },
                relations: {
                    defaultExercise: true,
                },
                order: { order: 'ASC' },
            }),
            this.commonWorkoutExerciseRepository.find({
                where: { commonWorkoutId: commonWorkout.id },
                relations: {
                    participant: {
                        user: true,
                    },
                    exercise: true,
                    ...(includeSets ? { participantSets: true } : {}),
                },
                order: {
                    order: 'ASC',
                    participantId: 'ASC',
                    ...(includeSets
                        ? {
                            participantSets: {
                                setNumber: 'ASC',
                            },
                        }
                        : {}),
                },
            }),
        ]);
        commonWorkout.participants = participants;
        commonWorkout.blocks = blocks;
        commonWorkout.exercises = exercises;
    }
    ensureUserParticipatesInCommonWorkout(commonWorkout, userId) {
        const isParticipant = (commonWorkout.participants || []).some((participant) => participant.userId === userId);
        if (!isParticipant) {
            throw new common_1.NotFoundException('Common workout not found');
        }
    }
    async getHistoricalWorkoutEntityForUser(userId, workoutId) {
        const workout = await this.workoutRepository.findOne({
            where: {
                id: workoutId,
                userId,
                status: workout_entity_1.WorkoutStatus.COMPLETED,
            },
            relations: {
                user: true,
                template: true,
                exercises: {
                    exercise: true,
                    sets: true,
                },
            },
            order: {
                exercises: {
                    order: 'ASC',
                    sets: {
                        setNumber: 'ASC',
                    },
                },
            },
        });
        if (!workout) {
            throw new common_1.NotFoundException('Workout not found');
        }
        return workout;
    }
    getWorkoutParticipantForUser(commonWorkout, userId) {
        const participant = (commonWorkout.participants || []).find((item) => item.userId === userId);
        if (!participant) {
            throw new common_1.NotFoundException('Common workout not found');
        }
        return participant;
    }
    getSortedParticipantExercises(exercises, participantId) {
        return exercises
            .filter((exercise) => exercise.participantId === participantId)
            .sort((left, right) => left.order - right.order);
    }
    getParticipantExerciseByOrder(exercises, exerciseIdentifier) {
        const commonWorkoutExercise = exercises.find((exercise) => exercise.order === exerciseIdentifier ||
            exercise.id === exerciseIdentifier ||
            exercise.exerciseId === exerciseIdentifier);
        if (!commonWorkoutExercise) {
            throw new common_1.NotFoundException('Common workout exercise not found');
        }
        return commonWorkoutExercise;
    }
    async getActiveCommonWorkoutExerciseForUser(userId, exerciseIdentifier) {
        const exercise = await this.commonWorkoutExerciseRepository
            .createQueryBuilder('commonWorkoutExercise')
            .leftJoinAndSelect('commonWorkoutExercise.exercise', 'exercise')
            .leftJoinAndSelect('commonWorkoutExercise.commonWorkout', 'commonWorkout')
            .leftJoinAndSelect('commonWorkoutExercise.participant', 'participant')
            .leftJoinAndSelect('commonWorkoutExercise.participantSets', 'participantSet')
            .where('participant.userId = :userId', { userId })
            .andWhere('(commonWorkoutExercise.order = :exerciseIdentifier OR commonWorkoutExercise.id = :exerciseIdentifier OR commonWorkoutExercise.exerciseId = :exerciseIdentifier)', { exerciseIdentifier })
            .andWhere('commonWorkout.status = :status', {
            status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
        })
            .orderBy('participantSet.setNumber', 'ASC')
            .getOne();
        if (!exercise) {
            throw new common_1.NotFoundException('Common workout exercise not found');
        }
        return exercise;
    }
    async getCommonWorkoutExerciseEntityForUser(userId, commonWorkoutId, exerciseIdentifier) {
        const exercise = await this.commonWorkoutExerciseRepository
            .createQueryBuilder('commonWorkoutExercise')
            .leftJoinAndSelect('commonWorkoutExercise.exercise', 'exercise')
            .leftJoinAndSelect('commonWorkoutExercise.commonWorkout', 'commonWorkout')
            .leftJoinAndSelect('commonWorkoutExercise.participant', 'participant')
            .leftJoinAndSelect('participant.user', 'participantUser')
            .leftJoinAndSelect('commonWorkoutExercise.participantSets', 'participantSet')
            .where('participant.userId = :userId', { userId })
            .andWhere('(commonWorkoutExercise.order = :exerciseIdentifier OR commonWorkoutExercise.id = :exerciseIdentifier OR commonWorkoutExercise.exerciseId = :exerciseIdentifier)', { exerciseIdentifier })
            .andWhere('commonWorkoutExercise.commonWorkoutId = :commonWorkoutId', {
            commonWorkoutId,
        })
            .orderBy('participantSet.setNumber', 'ASC')
            .getOne();
        if (!exercise) {
            throw new common_1.NotFoundException('Common workout exercise not found');
        }
        return exercise;
    }
    async getParticipantSetForUser(userId, participantSetId) {
        const participantSet = await this.participantSetRepository
            .createQueryBuilder('participantSet')
            .leftJoinAndSelect('participantSet.participant', 'participant')
            .leftJoinAndSelect('participant.user', 'participantUser')
            .leftJoinAndSelect('participant.commonWorkout', 'participantWorkout')
            .leftJoinAndSelect('participantSet.commonWorkoutExercise', 'commonWorkoutExercise')
            .leftJoinAndSelect('commonWorkoutExercise.commonWorkout', 'commonWorkout')
            .leftJoinAndSelect('commonWorkoutExercise.exercise', 'exercise')
            .where('participantSet.id = :participantSetId', { participantSetId })
            .andWhere('participant.userId = :userId', { userId })
            .andWhere('participantWorkout.status = :status', {
            status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
        })
            .getOne();
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
        return (previousWorkoutExercise?.sets?.find((set) => set.setNumber === setNumber) || null);
    }
    async getPreviousSetsByUserIdForExercise(userIds, exerciseId) {
        const uniqueUserIds = [...new Set(userIds)];
        const previousSets = await Promise.all(uniqueUserIds.map(async (userId) => {
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
            return [
                userId,
                new Map((previousWorkoutExercise?.sets || []).map((set) => [
                    set.setNumber,
                    set,
                ])),
            ];
        }));
        return new Map(previousSets);
    }
    async getAccessibleExerciseForUser(userId, exerciseId) {
        const exercise = await this.exerciseRepository.findOne({
            where: { id: exerciseId },
        });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        if (exercise.isGlobal) {
            return exercise;
        }
        if (exercise.createdByUserId === userId) {
            return exercise;
        }
        throw new common_1.NotFoundException('Exercise not found');
    }
    async getAccessibleWorkoutTemplateForUser(userId, templateId) {
        const template = await this.templateRepository.findOne({
            where: { id: templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException('Workout template not found');
        }
        const isOwner = template.userId === userId;
        const isMember = (template.members || []).some((member) => member.userId === userId);
        if (!isOwner && !isMember) {
            throw new common_1.NotFoundException('Workout template not found');
        }
        return template;
    }
    async syncPersonalBestForSavedWorkoutExercise(userId, exerciseId, workout, workoutExercise, sets) {
        const bestSet = [...sets]
            .filter((set) => set.confirmed &&
            typeof set.currentWeight === 'number' &&
            typeof set.currentReps === 'number' &&
            typeof set.repMax === 'number')
            .sort((left, right) => this.compareSetPerformance(right, left))[0];
        if (!bestSet) {
            return;
        }
        const existingBest = await this.personalBestRepository.findOne({
            where: {
                userId,
                exerciseId,
            },
        });
        if (existingBest &&
            this.compareSetPerformance(bestSet, {
                currentWeight: existingBest.weight,
                currentReps: existingBest.reps,
                repMax: existingBest.repMax,
            }) <= 0) {
            return;
        }
        const payload = existingBest ||
            this.personalBestRepository.create({ userId, exerciseId });
        payload.workoutId = workout.id;
        payload.workout = workout;
        payload.weight = bestSet.currentWeight;
        payload.reps = bestSet.currentReps;
        payload.repMax = bestSet.repMax;
        payload.achievedAt = workout.finishedAt ?? workout.startedAt;
        await this.personalBestRepository.save(payload);
    }
    calculateRepMax(weight, reps) {
        return (0, rep_max_util_1.calculateBrzyckiRepMax)(weight, reps);
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
    mapWorkout(commonWorkout) {
        const participantList = [...(commonWorkout.participants || [])];
        const participantSummaries = participantList.map((participant) => this.mapParticipantSummary(participant));
        const exercises = [...(commonWorkout.exercises || [])]
            .sort((left, right) => this.compareParticipantExercises(left, right))
            .map((exercise) => this.mapWorkoutExercise(exercise));
        const blocks = this.mapWorkoutBlocks(commonWorkout, false);
        return {
            ...this.mapWorkoutSummary(commonWorkout),
            participants: participantSummaries,
            blocks,
            exercises,
        };
    }
    mapWorkoutIndex(commonWorkout) {
        const participantList = [...(commonWorkout.participants || [])];
        const participantSummaries = participantList.map((participant) => this.mapParticipantSummary(participant));
        const exercises = [...(commonWorkout.exercises || [])]
            .sort((left, right) => this.compareParticipantExercises(left, right))
            .map((exercise) => this.mapWorkoutExerciseIndex(exercise));
        const blocks = this.mapWorkoutBlocks(commonWorkout, false);
        return {
            ...this.mapWorkoutSummary(commonWorkout),
            participants: participantSummaries,
            blocks,
            exercises,
        };
    }
    mapWorkoutPerformanceSummary(commonWorkout) {
        const participantList = [...(commonWorkout.participants || [])];
        const exerciseEntries = [...(commonWorkout.exercises || [])].sort((left, right) => this.compareParticipantExercises(left, right));
        const sets = exerciseEntries.flatMap((exercise) => exercise.participantSets || []);
        return {
            ...this.mapWorkoutSummary(commonWorkout),
            ...this.summarizeSetPerformance(sets),
            participants: participantList.map((participant) => this.mapCommonParticipantPerformance(participant, exerciseEntries)),
            exercises: exerciseEntries.map((exercise) => this.mapCommonExercisePerformance(exercise)),
        };
    }
    mapWorkoutSummary(commonWorkout) {
        const durationSeconds = this.getDurationSeconds(commonWorkout.startedAt, commonWorkout.finishedAt);
        const participantCount = (commonWorkout.participants || []).length;
        const isSolo = participantCount <= 1;
        const exerciseEntries = [...(commonWorkout.exercises || [])].sort((left, right) => this.compareParticipantExercises(left, right));
        const totalSets = this.getCommonWorkoutTotalSets(exerciseEntries);
        const confirmedSets = exerciseEntries.reduce((sum, exercise) => sum +
            (exercise.participantSets || []).filter((set) => set.confirmed).length, 0);
        return {
            id: commonWorkout.id,
            name: commonWorkout.name,
            status: commonWorkout.status,
            mode: isSolo ? 'solo' : 'group',
            isSolo,
            participantCount,
            startedAt: commonWorkout.startedAt,
            finishedAt: commonWorkout.finishedAt,
            durationSeconds,
            durationLabel: this.getDurationLabel(durationSeconds),
            blockCount: (commonWorkout.blocks || []).length ||
                this.getLegacyBlockOrders(exerciseEntries).length,
            exerciseCount: exerciseEntries.length,
            totalSets,
            confirmedSets,
            exerciseNames: exerciseEntries
                .map((exercise) => exercise.exercise?.name)
                .filter((name) => Boolean(name)),
            template: commonWorkout.template
                ? {
                    id: commonWorkout.template.id,
                    name: commonWorkout.template.name,
                }
                : null,
        };
    }
    mapHistoricalWorkoutSummary(workout) {
        const durationSeconds = this.getDurationSeconds(workout.startedAt, workout.finishedAt);
        const orderedExercises = [...(workout.exercises || [])].sort((a, b) => a.order - b.order);
        return {
            id: workout.id,
            name: workout.name,
            status: workout.status,
            mode: 'solo',
            isSolo: true,
            participantCount: 1,
            startedAt: workout.startedAt,
            finishedAt: workout.finishedAt,
            durationSeconds,
            durationLabel: this.getDurationLabel(durationSeconds),
            exerciseCount: orderedExercises.length,
            totalSets: orderedExercises.reduce((sum, exercise) => sum + (exercise.sets?.length || 0), 0),
            confirmedSets: orderedExercises.reduce((sum, exercise) => sum + (exercise.sets || []).filter((set) => set.confirmed).length, 0),
            exerciseNames: orderedExercises
                .map((exercise) => exercise.exercise?.name)
                .filter((name) => Boolean(name)),
            template: workout.template
                ? {
                    id: workout.template.id,
                    name: workout.template.name,
                }
                : null,
        };
    }
    mapHistoricalWorkoutPerformanceSummary(workout) {
        const user = this.mapHistoricalWorkoutUser(workout);
        const orderedExercises = [...(workout.exercises || [])].sort((a, b) => a.order - b.order);
        const sets = orderedExercises.flatMap((exercise) => exercise.sets || []);
        return {
            ...this.mapHistoricalWorkoutSummary(workout),
            ...this.summarizeSetPerformance(sets),
            participants: [
                {
                    participantId: null,
                    user,
                    ...this.summarizeSetPerformance(sets),
                    exercises: orderedExercises.map((exercise) => this.mapHistoricalParticipantExercisePerformance(exercise)),
                },
            ],
            exercises: orderedExercises.map((exercise) => this.mapHistoricalExercisePerformance(exercise, user)),
        };
    }
    mapHistoricalWorkout(workout) {
        const exercises = [...(workout.exercises || [])]
            .sort((a, b) => a.order - b.order)
            .map((exercise) => this.mapHistoricalWorkoutExercise(exercise));
        return {
            ...this.mapHistoricalWorkoutSummary(workout),
            exercises,
        };
    }
    mapCommonWorkoutExerciseDetail(commonWorkoutExercise) {
        return this.mapWorkoutExercise(commonWorkoutExercise);
    }
    mapWorkoutBlocks(commonWorkout, includeSets) {
        const participantList = [...(commonWorkout.participants || [])].sort((left, right) => left.id - right.id);
        const blocks = [...(commonWorkout.blocks || [])].sort((left, right) => left.order - right.order);
        if (blocks.length === 0) {
            return this.getLegacyBlockOrders(commonWorkout.exercises || []).map((order) => this.mapLegacyWorkoutBlock(order, participantList, commonWorkout.exercises || [], includeSets));
        }
        return blocks.map((block) => {
            const blockExercises = (commonWorkout.exercises || []).filter((exercise) => exercise.blockId === block.id);
            return {
                id: block.id,
                order: block.order,
                status: block.status,
                completedAt: block.completedAt,
                defaultExercise: this.mapExerciseSummary(block.defaultExercise),
                users: participantList.map((participant) => this.mapBlockUserExercise(participant, blockExercises.find((exercise) => exercise.participantId === participant.id) ?? null, includeSets)),
            };
        });
    }
    mapLegacyWorkoutBlock(order, participants, exercises, includeSets) {
        const blockExercises = exercises.filter((exercise) => exercise.order === order);
        const completed = blockExercises.length > 0 &&
            blockExercises.every((exercise) => exercise.completed);
        return {
            id: order,
            order,
            status: completed
                ? common_workout_block_entity_1.CommonWorkoutBlockStatus.COMPLETED
                : common_workout_block_entity_1.CommonWorkoutBlockStatus.ACTIVE,
            completedAt: null,
            defaultExercise: null,
            users: participants.map((participant) => this.mapBlockUserExercise(participant, blockExercises.find((exercise) => exercise.participantId === participant.id) ?? null, includeSets)),
        };
    }
    mapBlockUserExercise(participant, exercise, includeSets) {
        const sets = [...(exercise?.participantSets || [])].sort((left, right) => left.setNumber - right.setNumber);
        return {
            participantId: participant.id,
            user: this.mapParticipantSummary(participant).user,
            workoutExerciseId: exercise?.id ?? null,
            exercise: this.mapExerciseSummary(exercise?.exercise),
            completed: Boolean(exercise?.completed),
            completedAt: exercise?.completedAt ?? null,
            setsCount: sets.length,
            confirmedSets: sets.filter((set) => set.confirmed).length,
            ...(includeSets
                ? {
                    sets: sets.map((set) => this.mapCommonSet(set)),
                    availableActions: {
                        changeExercise: true,
                        addSet: true,
                        updateOwnSets: true,
                        removeOwnSets: true,
                    },
                }
                : {}),
        };
    }
    getLegacyBlockOrders(exercises) {
        return Array.from(new Set(exercises.map((exercise) => exercise.order))).sort((a, b) => a - b);
    }
    mapWorkoutExerciseIndex(commonWorkoutExercise) {
        const participantSets = commonWorkoutExercise.participantSets || [];
        const setsCount = Math.max(0, ...participantSets.map((set) => set.setNumber)) || 0;
        return {
            id: commonWorkoutExercise.id,
            workoutExerciseId: commonWorkoutExercise.id,
            userId: commonWorkoutExercise.participant?.userId ?? null,
            order: commonWorkoutExercise.order,
            exerciseId: commonWorkoutExercise.exercise?.id ?? commonWorkoutExercise.exerciseId,
            exerciseName: commonWorkoutExercise.exercise?.name ?? null,
            exerciseDescription: commonWorkoutExercise.exercise?.description ?? null,
            exerciseMuscleGroups: commonWorkoutExercise.exercise?.muscleGroups ?? [],
            setsCount,
            confirmedSets: participantSets.filter((set) => set.confirmed).length,
        };
    }
    mapCommonParticipantPerformance(participant, exerciseEntries) {
        const participantExercises = this.getSortedParticipantExercises(exerciseEntries, participant.id);
        const sets = participantExercises.flatMap((exercise) => exercise.participantSets || []);
        return {
            ...this.mapParticipantSummary(participant),
            ...this.summarizeSetPerformance(sets),
            exercises: participantExercises.map((exercise) => this.mapCommonParticipantExercisePerformance(exercise, participant)),
        };
    }
    mapCommonExercisePerformance(commonWorkoutExercise) {
        const participantSets = [
            ...(commonWorkoutExercise.participantSets || []),
        ].sort((a, b) => a.setNumber - b.setNumber);
        const participant = commonWorkoutExercise.participant;
        const participantSummary = participant
            ? this.mapParticipantSummary(participant)
            : null;
        return {
            id: commonWorkoutExercise.id,
            userId: participant?.userId ?? null,
            order: commonWorkoutExercise.order,
            exercise: this.mapExerciseSummary(commonWorkoutExercise.exercise),
            ...this.summarizeSetPerformance(participantSets),
            participants: participantSummary
                ? [
                    {
                        participantId: participantSummary.id,
                        user: participantSummary.user,
                        ...this.summarizeSetPerformance(participantSets),
                        sets: participantSets.map((set) => this.mapPerformanceSet(set)),
                    },
                ]
                : [],
        };
    }
    mapCommonParticipantExercisePerformance(commonWorkoutExercise, _participant) {
        const sets = (commonWorkoutExercise.participantSets || []).sort((a, b) => a.setNumber - b.setNumber);
        return {
            workoutExerciseId: commonWorkoutExercise.id,
            order: commonWorkoutExercise.order,
            exercise: this.mapExerciseSummary(commonWorkoutExercise.exercise),
            ...this.summarizeSetPerformance(sets),
            sets: sets.map((set) => this.mapPerformanceSet(set)),
        };
    }
    mapHistoricalExercisePerformance(workoutExercise, user) {
        const sets = [...(workoutExercise.sets || [])].sort((a, b) => a.setNumber - b.setNumber);
        return {
            id: workoutExercise.id,
            order: workoutExercise.order,
            exercise: this.mapExerciseSummary(workoutExercise.exercise),
            ...this.summarizeSetPerformance(sets),
            participants: [
                {
                    participantId: null,
                    user,
                    ...this.summarizeSetPerformance(sets),
                    sets: sets.map((set) => this.mapPerformanceSet(set)),
                },
            ],
        };
    }
    mapHistoricalParticipantExercisePerformance(workoutExercise) {
        const sets = [...(workoutExercise.sets || [])].sort((a, b) => a.setNumber - b.setNumber);
        return {
            workoutExerciseId: workoutExercise.id,
            order: workoutExercise.order,
            exercise: this.mapExerciseSummary(workoutExercise.exercise),
            ...this.summarizeSetPerformance(sets),
            sets: sets.map((set) => this.mapPerformanceSet(set)),
        };
    }
    summarizeSetPerformance(sets) {
        const confirmedSets = sets.filter((set) => set.confirmed);
        const totalVolume = confirmedSets.reduce((sum, set) => sum + this.getSetVolume(set.currentWeight, set.currentReps), 0);
        const totalWeight = confirmedSets.reduce((sum, set) => sum + (typeof set.currentWeight === 'number' ? set.currentWeight : 0), 0);
        const totalReps = confirmedSets.reduce((sum, set) => sum + (typeof set.currentReps === 'number' ? set.currentReps : 0), 0);
        const bestSet = [...confirmedSets]
            .filter((set) => typeof set.currentWeight === 'number' &&
            typeof set.currentReps === 'number' &&
            typeof set.repMax === 'number')
            .sort((left, right) => {
            const repMaxDifference = (right.repMax ?? 0) - (left.repMax ?? 0);
            if (repMaxDifference !== 0) {
                return repMaxDifference;
            }
            const weightDifference = (right.currentWeight ?? 0) - (left.currentWeight ?? 0);
            if (weightDifference !== 0) {
                return weightDifference;
            }
            return (right.currentReps ?? 0) - (left.currentReps ?? 0);
        })[0];
        return {
            totalSets: sets.length,
            confirmedSets: confirmedSets.length,
            totalWeight,
            totalReps,
            totalVolume,
            liftedWeight: totalVolume,
            bestSet: bestSet ? this.mapPerformanceSet(bestSet) : null,
        };
    }
    mapPerformanceSet(set) {
        const weight = typeof set.currentWeight === 'number' ? set.currentWeight : null;
        const reps = typeof set.currentReps === 'number' ? set.currentReps : null;
        return {
            id: set.id,
            setNumber: set.setNumber,
            weight,
            reps,
            volume: this.getSetVolume(weight, reps),
            repMax: set.repMax ?? null,
            confirmed: Boolean(set.confirmed),
        };
    }
    getSetVolume(weight, reps) {
        if (typeof weight !== 'number' || typeof reps !== 'number') {
            return 0;
        }
        return weight * reps;
    }
    mapHistoricalWorkoutUser(workout) {
        return {
            id: workout.user?.id ?? workout.userId,
            email: workout.user?.email ?? null,
            name: workout.user?.name ?? null,
            avatarPath: workout.user?.avatarPath ?? null,
            avatarUrl: workout.user?.avatarPath ?? null,
        };
    }
    mapExerciseSummary(exercise) {
        return exercise
            ? {
                id: exercise.id,
                name: exercise.name,
                description: exercise.description,
                muscleGroups: exercise.muscleGroups,
            }
            : null;
    }
    mapHistoricalWorkoutExercise(workoutExercise) {
        return {
            id: workoutExercise.id,
            order: workoutExercise.order,
            exercise: workoutExercise.exercise
                ? {
                    id: workoutExercise.exercise.id,
                    name: workoutExercise.exercise.name,
                    description: workoutExercise.exercise.description,
                    muscleGroups: workoutExercise.exercise.muscleGroups,
                }
                : null,
            sets: [...(workoutExercise.sets || [])]
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
            })),
        };
    }
    mapParticipantSummary(participant) {
        return {
            id: participant.id,
            user: {
                id: participant.user.id,
                email: participant.user.email,
                name: participant.user.name,
                avatarPath: participant.user.avatarPath ?? null,
                avatarUrl: participant.user.avatarPath ?? null,
            },
        };
    }
    mapWorkoutExercise(commonWorkoutExercise) {
        return {
            id: commonWorkoutExercise.id,
            workoutExerciseId: commonWorkoutExercise.id,
            userId: commonWorkoutExercise.participant?.userId ?? null,
            order: commonWorkoutExercise.order,
            exerciseId: commonWorkoutExercise.exercise?.id ?? commonWorkoutExercise.exerciseId,
            exerciseName: commonWorkoutExercise.exercise?.name ?? null,
            exerciseDescription: commonWorkoutExercise.exercise?.description ?? null,
            exerciseMuscleGroups: commonWorkoutExercise.exercise?.muscleGroups ?? [],
            sets: [...(commonWorkoutExercise.participantSets || [])]
                .sort((a, b) => a.setNumber - b.setNumber)
                .map((set) => this.mapCommonSet(set)),
        };
    }
    mapCommonSet(set) {
        return {
            id: set.id,
            setNumber: set.setNumber,
            previousWeight: set.previousWeight,
            previousReps: set.previousReps,
            currentWeight: set.currentWeight,
            currentReps: set.currentReps,
            durationSeconds: set.durationSeconds ?? null,
            repMax: set.repMax,
            confirmed: set.confirmed,
        };
    }
    compareParticipantExercises(left, right) {
        const leftUserId = left.participant?.userId ?? Number.MAX_SAFE_INTEGER;
        const rightUserId = right.participant?.userId ?? Number.MAX_SAFE_INTEGER;
        if (leftUserId !== rightUserId) {
            return leftUserId - rightUserId;
        }
        return left.order - right.order;
    }
    compareSetPerformance(left, right) {
        const repMaxDifference = (left.repMax ?? 0) - (right.repMax ?? 0);
        if (repMaxDifference !== 0) {
            return repMaxDifference;
        }
        const weightDifference = (left.currentWeight ?? 0) - (right.currentWeight ?? 0);
        if (weightDifference !== 0) {
            return weightDifference;
        }
        return (left.currentReps ?? 0) - (right.currentReps ?? 0);
    }
    formatSetLabel(weight, reps) {
        if (typeof weight !== 'number' || typeof reps !== 'number') {
            return null;
        }
        return `${weight}x${reps}`;
    }
    toDateOnly(date) {
        return new Date(date).toISOString().slice(0, 10);
    }
    normalizePage(page) {
        return typeof page === 'number' && page > 0 ? page : this.defaultPage;
    }
    normalizeLimit(limit) {
        if (typeof limit !== 'number' || limit <= 0) {
            return this.defaultLimit;
        }
        return Math.min(limit, this.maxLimit);
    }
    normalizeSearch(search) {
        const normalized = search?.trim().toLowerCase();
        return normalized ? normalized : null;
    }
    getDateRange(dateFrom, dateTo) {
        const from = new Date(`${dateFrom}T00:00:00.000Z`);
        const to = new Date(`${dateTo}T23:59:59.999Z`);
        if (Number.isNaN(from.getTime()) ||
            Number.isNaN(to.getTime()) ||
            from > to) {
            throw new common_1.BadRequestException('Invalid dashboard date range');
        }
        const rangeInDays = Math.ceil((to.getTime() - from.getTime()) / 86_400_000);
        if (rangeInDays > workout_constants_1.MAX_DASHBOARD_RANGE_DAYS) {
            throw new common_1.BadRequestException(`Dashboard date range cannot exceed ${workout_constants_1.MAX_DASHBOARD_RANGE_DAYS} days`);
        }
        return { from, to };
    }
    isDateInRange(date, from, to) {
        const timestamp = new Date(date).getTime();
        return timestamp >= from.getTime() && timestamp <= to.getTime();
    }
    async getFavoriteExerciseStat(userId, workouts) {
        const counters = new Map();
        for (const workout of workouts) {
            for (const workoutExercise of workout.exercises || []) {
                if (!workoutExercise.exercise) {
                    continue;
                }
                const current = counters.get(workoutExercise.exerciseId) || {
                    exercise: workoutExercise.exercise,
                    workoutsCount: 0,
                    setsCount: 0,
                };
                current.workoutsCount += 1;
                current.setsCount += (workoutExercise.sets || []).length;
                counters.set(workoutExercise.exerciseId, current);
            }
        }
        const favorite = [...counters.entries()].sort((left, right) => {
            const workoutCountDifference = right[1].workoutsCount - left[1].workoutsCount;
            if (workoutCountDifference !== 0) {
                return workoutCountDifference;
            }
            const setCountDifference = right[1].setsCount - left[1].setsCount;
            if (setCountDifference !== 0) {
                return setCountDifference;
            }
            return left[1].exercise.name.localeCompare(right[1].exercise.name);
        })[0];
        if (!favorite) {
            return null;
        }
        const [exerciseId, data] = favorite;
        const personalBest = (await this.personalBestRepository.findOne({
            where: {
                userId,
                exerciseId,
            },
        })) || (await this.findHistoricalBestForExercise(userId, exerciseId));
        return {
            exercise: {
                id: data.exercise.id,
                name: data.exercise.name,
            },
            workoutsCount: data.workoutsCount,
            setsCount: data.setsCount,
            personalRecord: personalBest
                ? {
                    weight: personalBest.weight,
                    reps: personalBest.reps,
                    repMax: personalBest.repMax,
                    achievedAt: personalBest.achievedAt,
                }
                : null,
        };
    }
    getFavoriteTrainingDay(workouts) {
        const counters = new Map();
        for (const workout of workouts) {
            const weekday = new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                timeZone: 'UTC',
            })
                .format(new Date(workout.startedAt))
                .toLowerCase();
            counters.set(weekday, (counters.get(weekday) || 0) + 1);
        }
        const favorite = [...counters.entries()].sort((left, right) => {
            const countDifference = right[1] - left[1];
            if (countDifference !== 0) {
                return countDifference;
            }
            return left[0].localeCompare(right[0]);
        })[0];
        if (!favorite) {
            return null;
        }
        return {
            day: favorite[0],
            workoutsCount: favorite[1],
        };
    }
    async getFavoritePartnerStat(userId, from, to) {
        const completedSessions = await this.commonWorkoutRepository.find({
            where: {
                status: common_workout_entity_1.CommonWorkoutStatus.COMPLETED,
                startedAt: (0, typeorm_2.Between)(from, to),
            },
            relations: {
                participants: {
                    user: true,
                },
            },
            order: {
                startedAt: 'DESC',
            },
        });
        const counters = new Map();
        for (const session of completedSessions) {
            const participantIds = new Set((session.participants || []).map((participant) => participant.userId));
            if (!participantIds.has(userId)) {
                continue;
            }
            for (const participant of session.participants || []) {
                if (participant.userId === userId || !participant.user) {
                    continue;
                }
                const current = counters.get(participant.userId) || {
                    user: participant.user,
                    sessionsCount: 0,
                };
                current.sessionsCount += 1;
                counters.set(participant.userId, current);
            }
        }
        const favorite = [...counters.entries()].sort((left, right) => {
            const countDifference = right[1].sessionsCount - left[1].sessionsCount;
            if (countDifference !== 0) {
                return countDifference;
            }
            return left[1].user.name.localeCompare(right[1].user.name);
        })[0];
        if (!favorite) {
            return null;
        }
        return {
            user: {
                id: favorite[1].user.id,
                name: favorite[1].user.name,
                avatarPath: favorite[1].user.avatarPath ?? null,
                avatarUrl: favorite[1].user.avatarPath ?? null,
            },
            workoutsCount: favorite[1].sessionsCount,
        };
    }
    async findHistoricalBestForExercise(userId, exerciseId) {
        const workoutExercises = await this.workoutExerciseRepository.find({
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
        const candidates = workoutExercises
            .flatMap((exercise) => (exercise.sets || [])
            .filter((set) => set.confirmed &&
            typeof set.currentWeight === 'number' &&
            typeof set.currentReps === 'number' &&
            typeof set.repMax === 'number')
            .map((set) => ({
            weight: set.currentWeight,
            reps: set.currentReps,
            repMax: set.repMax,
            achievedAt: exercise.workout.finishedAt ?? exercise.workout.startedAt,
        })))
            .sort((left, right) => this.compareSetPerformance({
            currentWeight: right.weight,
            currentReps: right.reps,
            repMax: right.repMax,
        }, {
            currentWeight: left.weight,
            currentReps: left.reps,
            repMax: left.repMax,
        }));
        return candidates[0] || null;
    }
};
exports.CommonWorkoutsService = CommonWorkoutsService;
exports.CommonWorkoutsService = CommonWorkoutsService = CommonWorkoutsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(common_workout_entity_1.CommonWorkout)),
    __param(1, (0, typeorm_1.InjectRepository)(common_workout_block_entity_1.CommonWorkoutBlock)),
    __param(2, (0, typeorm_1.InjectRepository)(common_workout_participant_entity_1.CommonWorkoutParticipant)),
    __param(3, (0, typeorm_1.InjectRepository)(common_workout_exercise_entity_1.CommonWorkoutExercise)),
    __param(4, (0, typeorm_1.InjectRepository)(common_workout_participant_set_entity_1.CommonWorkoutParticipantSet)),
    __param(5, (0, typeorm_1.InjectRepository)(workout_entity_1.Workout)),
    __param(6, (0, typeorm_1.InjectRepository)(workout_exercise_entity_1.WorkoutExercise)),
    __param(7, (0, typeorm_1.InjectRepository)(workout_set_entity_1.WorkoutSet)),
    __param(8, (0, typeorm_1.InjectRepository)(workout_template_entity_1.WorkoutTemplate)),
    __param(9, (0, typeorm_1.InjectRepository)(exercise_entity_1.Exercise)),
    __param(10, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(11, (0, typeorm_1.InjectRepository)(user_exercise_personal_best_entity_1.UserExercisePersonalBest)),
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
        typeorm_2.Repository,
        typeorm_2.Repository,
        common_workouts_gateway_1.CommonWorkoutsGateway])
], CommonWorkoutsService);
//# sourceMappingURL=common-workouts.service.js.map