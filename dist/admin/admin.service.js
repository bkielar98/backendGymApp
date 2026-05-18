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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../entities/user.entity");
const workout_entity_1 = require("../entities/workout.entity");
const common_workout_entity_1 = require("../entities/common-workout.entity");
const workout_exercise_entity_1 = require("../entities/workout-exercise.entity");
const workout_set_entity_1 = require("../entities/workout-set.entity");
const exercise_entity_1 = require("../entities/exercise.entity");
const users_service_1 = require("../users/users.service");
let AdminService = class AdminService {
    constructor(userRepository, workoutRepository, commonWorkoutRepository, exerciseRepository, usersService) {
        this.userRepository = userRepository;
        this.workoutRepository = workoutRepository;
        this.commonWorkoutRepository = commonWorkoutRepository;
        this.exerciseRepository = exerciseRepository;
        this.usersService = usersService;
        this.defaultPage = 1;
        this.defaultLimit = 20;
        this.maxLimit = 100;
        this.warsawTimeZone = 'Europe/Warsaw';
        this.profanityWords = [
            'chuj',
            'chuja',
            'chujem',
            'chujowy',
            'chujowa',
            'chujowe',
            'cipa',
            'cipe',
            'cipy',
            'dupa',
            'dupe',
            'dupy',
            'dziwka',
            'dziwko',
            'dziwki',
            'huj',
            'hujowy',
            'jebac',
            'jebany',
            'jebana',
            'jebane',
            'kurwa',
            'kurwo',
            'kurwy',
            'pierdolic',
            'pierdolony',
            'pierdolona',
            'pierdolone',
            'spierdalaj',
            'suka',
            'suko',
            'sukinsyn',
            'fuck',
            'fucking',
            'shit',
            'bitch',
            'asshole',
        ];
    }
    async listUsers(query) {
        const page = this.normalizePage(query.page);
        const limit = this.normalizeLimit(query.limit);
        const search = query.search?.trim().toLowerCase();
        const sortBy = query.sortBy ?? 'createdAt';
        const sortOrder = query.sortOrder ?? 'DESC';
        const builder = this.userRepository.createQueryBuilder('user');
        if (search) {
            builder.where('(LOWER(user.name) LIKE :search OR LOWER(user.email) LIKE :search)', { search: `%${search}%` });
        }
        builder
            .orderBy(`user.${sortBy}`, sortOrder)
            .addOrderBy('user.id', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        const [users, total] = await builder.getManyAndCount();
        return {
            users: users.map((user) => this.mapAdminUser(user)),
            total,
            page,
            limit,
        };
    }
    async getUserById(userId) {
        const user = await this.findUserOrThrow(userId);
        return this.mapAdminUser(user);
    }
    async updateUserAvatar(userId, file) {
        await this.usersService.updateAvatar(userId, file);
        return this.getUserById(userId);
    }
    async updateUserRole(actingUserId, userId, dto) {
        await this.findUserOrThrow(userId);
        if (actingUserId === userId && dto.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Admin cannot remove their own admin role');
        }
        await this.userRepository.update(userId, {
            role: dto.role,
        });
        return this.getUserById(userId);
    }
    async updateUserStatus(actingUserId, userId, dto) {
        const user = await this.findUserOrThrow(userId);
        if (actingUserId === userId &&
            user.role === user_entity_1.UserRole.ADMIN &&
            !dto.isActive) {
            throw new common_1.ForbiddenException('Admin cannot deactivate their own account');
        }
        await this.userRepository.update(userId, {
            isActive: dto.isActive,
            ...(dto.isActive ? {} : { refreshTokenHash: null }),
        });
        return this.getUserById(userId);
    }
    async resetUserPassword(userId, dto) {
        await this.findUserOrThrow(userId);
        const password = await bcrypt.hash(dto.password, 10);
        await this.userRepository.update(userId, {
            password,
            refreshTokenHash: null,
        });
        return {
            success: true,
            id: userId,
        };
    }
    async softDeleteUser(actingUserId, userId) {
        const user = await this.findUserOrThrow(userId);
        if (actingUserId === userId && user.role === user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Admin cannot deactivate their own account');
        }
        await this.userRepository.update(userId, {
            isActive: false,
            refreshTokenHash: null,
        });
        return {
            success: true,
            id: userId,
            isActive: false,
        };
    }
    async getStats() {
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const monthRange = this.getCurrentWarsawMonthRange();
        const [totalUsers, activeUsersLast30Days, totalExercises, totalWorkouts, newUsersThisMonth,] = await Promise.all([
            this.userRepository.count(),
            this.userRepository.count({
                where: {
                    isActive: true,
                    lastLoginAt: (0, typeorm_2.MoreThanOrEqual)(last30Days),
                },
            }),
            this.exerciseRepository.count(),
            this.workoutRepository.count({
                where: {
                    status: workout_entity_1.WorkoutStatus.COMPLETED,
                },
            }),
            this.userRepository
                .createQueryBuilder('user')
                .where('user.createdAt >= :start AND user.createdAt < :end', {
                start: monthRange.start,
                end: monthRange.end,
            })
                .getCount(),
        ]);
        return {
            totalUsers,
            activeUsersLast30Days,
            totalExercises,
            totalWorkouts,
            newUsersThisMonth,
        };
    }
    async listUserWorkouts(userId, query) {
        await this.findUserOrThrow(userId);
        const page = this.normalizePage(query.page);
        const limit = this.normalizeLimit(query.limit);
        const [workouts, total] = await this.workoutRepository.findAndCount({
            where: {
                userId,
                status: workout_entity_1.WorkoutStatus.COMPLETED,
            },
            order: { startedAt: 'DESC' },
            relations: {
                template: true,
                exercises: {
                    exercise: true,
                    sets: true,
                },
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            workouts: workouts.map((workout) => this.mapWorkoutSummary(workout)),
            total,
            page,
            limit,
        };
    }
    async listActiveWorkouts(query) {
        const page = this.normalizePage(query.page);
        const limit = this.normalizeLimit(query.limit);
        const offset = (page - 1) * limit;
        const [soloWorkouts, soloTotal, commonWorkouts, commonTotal] = await Promise.all([
            this.workoutRepository.find({
                where: {
                    status: workout_entity_1.WorkoutStatus.ACTIVE,
                },
                order: { startedAt: 'DESC' },
                relations: {
                    user: true,
                    template: true,
                    exercises: {
                        exercise: true,
                        sets: true,
                    },
                },
            }),
            this.workoutRepository.count({
                where: {
                    status: workout_entity_1.WorkoutStatus.ACTIVE,
                },
            }),
            this.commonWorkoutRepository.find({
                where: {
                    status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
                },
                order: { startedAt: 'DESC' },
                relations: {
                    createdByUser: true,
                    template: true,
                    participants: {
                        user: true,
                    },
                    exercises: {
                        exercise: true,
                        participantSets: true,
                    },
                },
            }),
            this.commonWorkoutRepository.count({
                where: {
                    status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
                },
            }),
        ]);
        const workouts = [
            ...soloWorkouts.map((workout) => ({
                ...this.mapWorkoutSummary(workout),
                source: 'solo',
                user: this.mapWorkoutUser(workout.user),
            })),
            ...commonWorkouts.map((workout) => this.mapCommonWorkoutSummary(workout)),
        ]
            .sort((left, right) => new Date(right.startedAt).getTime() -
            new Date(left.startedAt).getTime())
            .slice(offset, offset + limit);
        return {
            workouts,
            total: soloTotal + commonTotal,
            page,
            limit,
        };
    }
    async finishActiveWorkout(workoutId) {
        const workout = await this.workoutRepository.findOne({
            where: {
                id: workoutId,
                status: workout_entity_1.WorkoutStatus.ACTIVE,
            },
        });
        if (!workout) {
            throw new common_1.NotFoundException('Active workout not found');
        }
        workout.status = workout_entity_1.WorkoutStatus.COMPLETED;
        workout.finishedAt = new Date();
        await this.workoutRepository.save(workout);
        const completedWorkout = await this.workoutRepository.findOne({
            where: { id: workout.id },
            relations: {
                user: true,
                template: true,
                exercises: {
                    exercise: true,
                    sets: true,
                },
            },
        });
        return {
            success: true,
            workout: completedWorkout
                ? {
                    ...this.mapWorkoutSummary(completedWorkout),
                    source: 'solo',
                    user: this.mapWorkoutUser(completedWorkout.user),
                }
                : {
                    id: workout.id,
                    source: 'solo',
                    status: workout.status,
                    finishedAt: workout.finishedAt,
                },
        };
    }
    async finishActiveCommonWorkout(commonWorkoutId) {
        const commonWorkout = await this.commonWorkoutRepository.findOne({
            where: {
                id: commonWorkoutId,
                status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
            },
        });
        if (!commonWorkout) {
            throw new common_1.NotFoundException('Active common workout not found');
        }
        commonWorkout.status = common_workout_entity_1.CommonWorkoutStatus.COMPLETED;
        commonWorkout.finishedAt = new Date();
        await this.commonWorkoutRepository.save(commonWorkout);
        const completedWorkout = await this.commonWorkoutRepository.findOne({
            where: { id: commonWorkout.id },
            relations: {
                createdByUser: true,
                template: true,
                participants: {
                    user: true,
                },
                exercises: {
                    exercise: true,
                    participantSets: true,
                },
            },
        });
        return {
            success: true,
            workout: completedWorkout
                ? this.mapCommonWorkoutSummary(completedWorkout)
                : {
                    id: commonWorkout.id,
                    source: 'common',
                    status: commonWorkout.status,
                    finishedAt: commonWorkout.finishedAt,
                },
        };
    }
    async getExerciseStats(query) {
        const limit = this.normalizeLimit(query.limit);
        const rows = await this.exerciseRepository
            .createQueryBuilder('exercise')
            .innerJoin(workout_exercise_entity_1.WorkoutExercise, 'workoutExercise', 'workoutExercise.exerciseId = exercise.id')
            .innerJoin(workout_entity_1.Workout, 'workout', 'workout.id = workoutExercise.workoutId AND workout.status = :status', { status: workout_entity_1.WorkoutStatus.COMPLETED })
            .leftJoin(workout_set_entity_1.WorkoutSet, 'workoutSet', 'workoutSet.workoutExerciseId = workoutExercise.id AND workoutSet.confirmed = :confirmed', { confirmed: true })
            .select('exercise.id', 'exerciseId')
            .addSelect('exercise.name', 'exerciseName')
            .addSelect('COUNT(DISTINCT workoutExercise.id)', 'workoutsCount')
            .addSelect('COUNT(workoutSet.id)', 'setsCount')
            .addSelect('AVG(workoutSet.currentWeight)', 'averageWeight')
            .addSelect('AVG(workoutSet.currentReps)', 'averageReps')
            .groupBy('exercise.id')
            .addGroupBy('exercise.name')
            .orderBy('COUNT(DISTINCT workoutExercise.id)', 'DESC')
            .addOrderBy('COUNT(workoutSet.id)', 'DESC')
            .addOrderBy('exercise.name', 'ASC')
            .limit(limit)
            .getRawMany();
        return {
            exercises: rows.map((row) => ({
                exercise: {
                    id: Number(row.exerciseId),
                    name: row.exerciseName,
                },
                workoutsCount: Number(row.workoutsCount),
                setsCount: Number(row.setsCount),
                averageWeight: this.roundNullable(row.averageWeight),
                averageReps: this.roundNullable(row.averageReps),
            })),
            limit,
        };
    }
    async listProfaneExercises() {
        const exercises = await this.exerciseRepository.find({
            relations: {
                createdByUser: true,
            },
            order: {
                name: 'ASC',
            },
        });
        const flaggedExercises = exercises
            .map((exercise) => this.mapProfaneExercise(exercise))
            .filter((exercise) => Boolean(exercise));
        return {
            exercises: flaggedExercises,
            total: flaggedExercises.length,
        };
    }
    async findUserOrThrow(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
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
    mapAdminUser(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarPath: user.avatarPath ?? null,
            avatarUrl: user.avatarPath ?? null,
            role: user.role,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt ?? null,
            isActive: user.isActive,
        };
    }
    mapWorkoutSummary(workout) {
        const orderedExercises = [...(workout.exercises || [])].sort((a, b) => a.order - b.order);
        const durationSeconds = this.getDurationSeconds(workout.startedAt, workout.finishedAt);
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
    mapWorkoutUser(user) {
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarPath: user.avatarPath ?? null,
            avatarUrl: user.avatarPath ?? null,
            role: user.role,
            isActive: user.isActive,
        };
    }
    mapCommonWorkoutSummary(workout) {
        const exercises = workout.exercises || [];
        const sets = exercises.flatMap((exercise) => exercise.participantSets || []);
        const participants = workout.participants || [];
        const durationSeconds = this.getDurationSeconds(workout.startedAt, workout.finishedAt);
        return {
            id: workout.id,
            name: workout.name,
            status: workout.status,
            source: 'common',
            mode: 'common',
            isSolo: false,
            participantCount: participants.length,
            startedAt: workout.startedAt,
            finishedAt: workout.finishedAt,
            durationSeconds,
            durationLabel: this.getDurationLabel(durationSeconds),
            exerciseCount: exercises.length,
            totalSets: sets.length,
            confirmedSets: sets.filter((set) => set.confirmed).length,
            exerciseNames: Array.from(new Set(exercises
                .map((exercise) => exercise.exercise?.name)
                .filter((name) => Boolean(name)))),
            template: workout.template
                ? {
                    id: workout.template.id,
                    name: workout.template.name,
                }
                : null,
            createdByUser: this.mapWorkoutUser(workout.createdByUser),
            participants: participants.map((participant) => this.mapWorkoutUser(participant.user)),
        };
    }
    roundNullable(value) {
        if (value === null) {
            return null;
        }
        const numberValue = Number(value);
        if (!Number.isFinite(numberValue)) {
            return null;
        }
        return Math.round(numberValue * 100) / 100;
    }
    mapProfaneExercise(exercise) {
        const fields = [
            { name: 'name', value: exercise.name },
            { name: 'description', value: exercise.description ?? '' },
        ];
        const matches = fields.flatMap((field) => this.findProfanityMatches(field.value).map((word) => ({
            field: field.name,
            word,
        })));
        if (matches.length === 0) {
            return null;
        }
        return {
            id: exercise.id,
            name: exercise.name,
            description: exercise.description,
            isGlobal: exercise.isGlobal,
            createdByUserId: exercise.createdByUserId,
            createdByUser: exercise.createdByUser
                ? this.mapWorkoutUser(exercise.createdByUser)
                : null,
            matches,
            matchedWords: Array.from(new Set(matches.map((match) => match.word))),
        };
    }
    findProfanityMatches(value) {
        const normalized = value.toLowerCase();
        return this.profanityWords.filter((word) => {
            const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, 'iu').test(normalized);
        });
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
    getCurrentWarsawMonthRange(now = new Date()) {
        const currentParts = this.getTimeZoneParts(now, this.warsawTimeZone);
        const nextMonth = currentParts.month === 12
            ? { year: currentParts.year + 1, month: 1 }
            : { year: currentParts.year, month: currentParts.month + 1 };
        return {
            start: this.zonedDateToUtc(this.warsawTimeZone, currentParts.year, currentParts.month, 1),
            end: this.zonedDateToUtc(this.warsawTimeZone, nextMonth.year, nextMonth.month, 1),
        };
    }
    zonedDateToUtc(timeZone, year, month, day, hour = 0, minute = 0, second = 0) {
        const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
        const offset = this.getTimeZoneOffsetMs(utcGuess, timeZone);
        return new Date(Date.UTC(year, month - 1, day, hour, minute, second) - offset);
    }
    getTimeZoneOffsetMs(date, timeZone) {
        const parts = this.getTimeZoneParts(date, timeZone);
        const asUtcTimestamp = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
        return asUtcTimestamp - date.getTime();
    }
    getTimeZoneParts(date, timeZone) {
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23',
        });
        const values = formatter
            .formatToParts(date)
            .filter((part) => part.type !== 'literal')
            .reduce((parts, part) => {
            parts[part.type] = Number(part.value);
            return parts;
        }, {});
        return {
            year: values.year,
            month: values.month,
            day: values.day,
            hour: values.hour,
            minute: values.minute,
            second: values.second,
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(workout_entity_1.Workout)),
    __param(2, (0, typeorm_1.InjectRepository)(common_workout_entity_1.CommonWorkout)),
    __param(3, (0, typeorm_1.InjectRepository)(exercise_entity_1.Exercise)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], AdminService);
//# sourceMappingURL=admin.service.js.map