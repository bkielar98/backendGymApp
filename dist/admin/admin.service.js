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
const user_entity_1 = require("../entities/user.entity");
const workout_entity_1 = require("../entities/workout.entity");
const exercise_entity_1 = require("../entities/exercise.entity");
const users_service_1 = require("../users/users.service");
let AdminService = class AdminService {
    constructor(userRepository, workoutRepository, exerciseRepository, usersService) {
        this.userRepository = userRepository;
        this.workoutRepository = workoutRepository;
        this.exerciseRepository = exerciseRepository;
        this.usersService = usersService;
        this.defaultPage = 1;
        this.defaultLimit = 20;
        this.maxLimit = 100;
        this.warsawTimeZone = 'Europe/Warsaw';
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
    async updateUserStatus(userId, dto) {
        await this.findUserOrThrow(userId);
        await this.userRepository.update(userId, {
            isActive: dto.isActive,
            ...(dto.isActive ? {} : { refreshTokenHash: null }),
        });
        return this.getUserById(userId);
    }
    async softDeleteUser(userId) {
        await this.findUserOrThrow(userId);
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
    __param(2, (0, typeorm_1.InjectRepository)(exercise_entity_1.Exercise)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], AdminService);
//# sourceMappingURL=admin.service.js.map