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
exports.ExercisesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const exercise_entity_1 = require("../entities/exercise.entity");
const user_entity_1 = require("../entities/user.entity");
const workout_exercise_entity_1 = require("../entities/workout-exercise.entity");
const workout_entity_1 = require("../entities/workout.entity");
let ExercisesService = class ExercisesService {
    constructor(exerciseRepository, workoutExerciseRepository) {
        this.exerciseRepository = exerciseRepository;
        this.workoutExerciseRepository = workoutExerciseRepository;
    }
    async create(user, createExerciseDto) {
        const exercise = this.exerciseRepository.create({
            ...createExerciseDto,
            isGlobal: user.role === user_entity_1.UserRole.ADMIN,
            createdByUserId: user.role === user_entity_1.UserRole.ADMIN ? null : user.id,
        });
        return this.exerciseRepository.save(exercise);
    }
    async findAll(user) {
        if (user.role === user_entity_1.UserRole.ADMIN) {
            return this.exerciseRepository.find({
                order: {
                    name: 'ASC',
                },
            });
        }
        return this.exerciseRepository
            .createQueryBuilder('exercise')
            .where('exercise.isGlobal = :isGlobal', { isGlobal: true })
            .orWhere(new typeorm_2.Brackets((qb) => {
            qb.where('exercise.createdByUserId = :userId', { userId: user.id });
        }))
            .orderBy('exercise.name', 'ASC')
            .getMany();
    }
    async findCustom(user) {
        if (user.role === user_entity_1.UserRole.ADMIN) {
            return this.exerciseRepository.find({
                where: {
                    isGlobal: false,
                },
                order: {
                    name: 'ASC',
                },
            });
        }
        return this.exerciseRepository.find({
            where: {
                isGlobal: false,
                createdByUserId: user.id,
            },
            order: {
                name: 'ASC',
            },
        });
    }
    async findOne(user, id) {
        const exercise = await this.exerciseRepository.findOne({ where: { id } });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        this.ensureUserCanAccessExercise(user, exercise);
        return exercise;
    }
    async findHistory(user, id) {
        const exercise = await this.findOne(user, id);
        const workoutExercises = await this.workoutExerciseRepository.find({
            where: {
                exerciseId: exercise.id,
                workout: {
                    userId: user.id,
                    status: workout_entity_1.WorkoutStatus.COMPLETED,
                },
            },
            relations: {
                workout: true,
            },
            order: {
                workout: {
                    finishedAt: 'DESC',
                    startedAt: 'DESC',
                },
                order: 'ASC',
                sets: {
                    setNumber: 'ASC',
                },
            },
        });
        const groupedByDate = new Map();
        for (const workoutExercise of workoutExercises) {
            const workoutDate = workoutExercise.workout.finishedAt || workoutExercise.workout.startedAt;
            const dateKey = this.toDateKey(workoutDate);
            const entry = groupedByDate.get(dateKey) || {
                date: dateKey,
                sets: [],
            };
            entry.sets.push(...(workoutExercise.sets || [])
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
            })));
            groupedByDate.set(dateKey, entry);
        }
        return Array.from(groupedByDate.values()).sort((a, b) => b.date.localeCompare(a.date));
    }
    async update(user, id, updateExerciseDto) {
        const exercise = await this.findOne(user, id);
        this.ensureUserCanManageExercise(user, exercise);
        await this.exerciseRepository.update(id, updateExerciseDto);
        return this.findOne(user, id);
    }
    async remove(user, id) {
        const exercise = await this.findOne(user, id);
        this.ensureUserCanManageExercise(user, exercise);
        await this.exerciseRepository.delete(id);
        return {
            success: true,
            message: 'Exercise removed',
            id: exercise.id,
            name: exercise.name,
        };
    }
    ensureUserCanAccessExercise(user, exercise) {
        if (user.role === user_entity_1.UserRole.ADMIN) {
            return;
        }
        if (exercise.isGlobal) {
            return;
        }
        if (exercise.createdByUserId === user.id) {
            return;
        }
        throw new common_1.NotFoundException('Exercise not found');
    }
    ensureUserCanManageExercise(user, exercise) {
        if (user.role === user_entity_1.UserRole.ADMIN) {
            return;
        }
        if (!exercise.isGlobal && exercise.createdByUserId === user.id) {
            return;
        }
        throw new common_1.ForbiddenException('You cannot modify this exercise');
    }
    toDateKey(date) {
        return new Date(date).toISOString().slice(0, 10);
    }
};
exports.ExercisesService = ExercisesService;
exports.ExercisesService = ExercisesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(exercise_entity_1.Exercise)),
    __param(1, (0, typeorm_1.InjectRepository)(workout_exercise_entity_1.WorkoutExercise)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ExercisesService);
//# sourceMappingURL=exercises.service.js.map