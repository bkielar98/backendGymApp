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
exports.WorkoutsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const workout_entity_1 = require("../entities/workout.entity");
const workout_exercise_entity_1 = require("../entities/workout-exercise.entity");
const workout_set_entity_1 = require("../entities/workout-set.entity");
const workout_template_entity_1 = require("../entities/workout-template.entity");
let WorkoutsService = class WorkoutsService {
    constructor(workoutRepository, workoutExerciseRepository, workoutSetRepository, templateRepository) {
        this.workoutRepository = workoutRepository;
        this.workoutExerciseRepository = workoutExerciseRepository;
        this.workoutSetRepository = workoutSetRepository;
        this.templateRepository = templateRepository;
    }
    async startWorkout(userId, dto) {
        const activeWorkout = await this.workoutRepository.findOne({
            where: { userId, status: workout_entity_1.WorkoutStatus.ACTIVE },
        });
        if (activeWorkout) {
            throw new common_1.BadRequestException('User already has an active workout');
        }
        const template = await this.templateRepository.findOne({
            where: { id: dto.templateId, userId },
        });
        if (!template) {
            throw new common_1.NotFoundException('Workout template not found');
        }
        const workout = this.workoutRepository.create({
            userId,
            templateId: template.id,
            template,
            name: template.name,
            status: workout_entity_1.WorkoutStatus.ACTIVE,
            startedAt: new Date(),
            finishedAt: null,
            exercises: [],
        });
        const savedWorkout = await this.workoutRepository.save(workout);
        const sortedTemplateExercises = [...(template.exercises || [])].sort((a, b) => a.order - b.order);
        for (const templateExercise of sortedTemplateExercises) {
            const workoutExercise = this.workoutExerciseRepository.create({
                workoutId: savedWorkout.id,
                exerciseId: templateExercise.exerciseId,
                exercise: templateExercise.exercise,
                order: templateExercise.order,
                sets: [],
            });
            const savedWorkoutExercise = await this.workoutExerciseRepository.save(workoutExercise);
            const previousSets = await this.getPreviousSetsForExercise(userId, templateExercise.exerciseId);
            const setsToCreate = [];
            for (let i = 1; i <= templateExercise.setsCount; i += 1) {
                const previousSet = previousSets.find((set) => set.setNumber === i);
                setsToCreate.push(this.workoutSetRepository.create({
                    workoutExerciseId: savedWorkoutExercise.id,
                    setNumber: i,
                    previousWeight: previousSet?.currentWeight ?? null,
                    previousReps: previousSet?.currentReps ?? null,
                    currentWeight: null,
                    currentReps: null,
                    repMax: null,
                    confirmed: false,
                }));
            }
            await this.workoutSetRepository.save(setsToCreate);
        }
        return this.getWorkoutByIdForUser(userId, savedWorkout.id);
    }
    async getActiveWorkout(userId) {
        const workout = await this.workoutRepository.findOne({
            where: { userId, status: workout_entity_1.WorkoutStatus.ACTIVE },
            relations: {
                template: true,
            },
        });
        if (!workout) {
            throw new common_1.NotFoundException('Active workout not found');
        }
        return this.mapWorkout(workout);
    }
    async findAll(userId) {
        const workouts = await this.workoutRepository.find({
            where: { userId },
            order: { startedAt: 'DESC' },
            relations: {
                template: true,
            },
        });
        return workouts.map((workout) => this.mapWorkout(workout));
    }
    async findOne(userId, workoutId) {
        return this.getWorkoutByIdForUser(userId, workoutId);
    }
    async updateSet(userId, setId, dto) {
        const set = await this.getSetForUser(userId, setId);
        if (typeof dto.currentWeight === 'number') {
            set.currentWeight = dto.currentWeight;
        }
        if (typeof dto.currentReps === 'number') {
            set.currentReps = dto.currentReps;
        }
        set.repMax = this.calculateRepMax(set.currentWeight, set.currentReps);
        await this.workoutSetRepository.save(set);
        return this.getWorkoutExerciseByIdForUser(userId, set.workoutExercise.id);
    }
    async confirmSet(userId, setId, dto) {
        const set = await this.getSetForUser(userId, setId);
        set.currentWeight = dto.currentWeight;
        set.currentReps = dto.currentReps;
        set.repMax = this.calculateRepMax(set.currentWeight, set.currentReps);
        set.confirmed = true;
        await this.workoutSetRepository.save(set);
        return this.getWorkoutExerciseByIdForUser(userId, set.workoutExercise.id);
    }
    async addSet(userId, workoutExerciseId) {
        const workoutExercise = await this.getWorkoutExerciseEntityForUser(userId, workoutExerciseId);
        const nextSetNumber = Math.max(0, ...workoutExercise.sets.map((set) => set.setNumber)) + 1;
        const previousSets = await this.getPreviousSetsForExercise(userId, workoutExercise.exercise.id);
        const previousSet = previousSets.find((set) => set.setNumber === nextSetNumber);
        const newSet = this.workoutSetRepository.create({
            workoutExerciseId: workoutExercise.id,
            workoutExercise,
            setNumber: nextSetNumber,
            previousWeight: previousSet?.currentWeight ?? null,
            previousReps: previousSet?.currentReps ?? null,
            currentWeight: null,
            currentReps: null,
            repMax: null,
            confirmed: false,
        });
        await this.workoutSetRepository.save(newSet);
        return this.getWorkoutExerciseByIdForUser(userId, workoutExercise.id);
    }
    async removeSet(userId, setId) {
        const set = await this.getSetForUser(userId, setId);
        const workoutExerciseId = set.workoutExercise.id;
        await this.workoutSetRepository.delete(set.id);
        const remainingSets = await this.workoutSetRepository.find({
            where: { workoutExerciseId },
            order: { setNumber: 'ASC' },
        });
        for (let index = 0; index < remainingSets.length; index += 1) {
            remainingSets[index].setNumber = index + 1;
        }
        await this.workoutSetRepository.save(remainingSets);
        return this.getWorkoutExerciseByIdForUser(userId, workoutExerciseId);
    }
    async finishActiveWorkout(userId) {
        const workout = await this.workoutRepository.findOne({
            where: { userId, status: workout_entity_1.WorkoutStatus.ACTIVE },
        });
        if (!workout) {
            throw new common_1.NotFoundException('Active workout not found');
        }
        workout.status = workout_entity_1.WorkoutStatus.COMPLETED;
        workout.finishedAt = new Date();
        await this.workoutRepository.save(workout);
        return this.getWorkoutByIdForUser(userId, workout.id);
    }
    async getWorkoutByIdForUser(userId, workoutId) {
        const workout = await this.workoutRepository.findOne({
            where: { id: workoutId, userId },
            relations: {
                template: true,
            },
        });
        if (!workout) {
            throw new common_1.NotFoundException('Workout not found');
        }
        return this.mapWorkout(workout);
    }
    async getWorkoutExerciseEntityForUser(userId, workoutExerciseId) {
        const workoutExercise = await this.workoutExerciseRepository.findOne({
            where: {
                id: workoutExerciseId,
                workout: {
                    userId,
                    status: workout_entity_1.WorkoutStatus.ACTIVE,
                },
            },
            relations: {
                workout: true,
                exercise: true,
                sets: true,
            },
            order: {
                sets: {
                    setNumber: 'ASC',
                },
            },
        });
        if (!workoutExercise) {
            throw new common_1.NotFoundException('Workout exercise not found');
        }
        return workoutExercise;
    }
    async getWorkoutExerciseByIdForUser(userId, workoutExerciseId) {
        const workoutExercise = await this.getWorkoutExerciseEntityForUser(userId, workoutExerciseId);
        return this.mapWorkoutExercise(workoutExercise);
    }
    async getSetForUser(userId, setId) {
        const set = await this.workoutSetRepository.findOne({
            where: {
                id: setId,
                workoutExercise: {
                    workout: {
                        userId,
                        status: workout_entity_1.WorkoutStatus.ACTIVE,
                    },
                },
            },
            relations: {
                workoutExercise: {
                    workout: true,
                    exercise: true,
                    sets: true,
                },
            },
            order: {
                workoutExercise: {
                    sets: {
                        setNumber: 'ASC',
                    },
                },
            },
        });
        if (!set) {
            throw new common_1.NotFoundException('Workout set not found');
        }
        return set;
    }
    async getPreviousSetsForExercise(userId, exerciseId) {
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
        return previousWorkoutExercise?.sets || [];
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
    mapWorkout(workout) {
        return {
            id: workout.id,
            name: workout.name,
            status: workout.status,
            startedAt: workout.startedAt,
            finishedAt: workout.finishedAt,
            durationSeconds: this.getDurationSeconds(workout.startedAt, workout.finishedAt),
            template: workout.template
                ? {
                    id: workout.template.id,
                    name: workout.template.name,
                }
                : null,
            exercises: [...(workout.exercises || [])]
                .sort((a, b) => a.order - b.order)
                .map((exercise) => this.mapWorkoutExercise(exercise)),
        };
    }
    mapWorkoutExercise(workoutExercise) {
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
};
exports.WorkoutsService = WorkoutsService;
exports.WorkoutsService = WorkoutsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(workout_entity_1.Workout)),
    __param(1, (0, typeorm_1.InjectRepository)(workout_exercise_entity_1.WorkoutExercise)),
    __param(2, (0, typeorm_1.InjectRepository)(workout_set_entity_1.WorkoutSet)),
    __param(3, (0, typeorm_1.InjectRepository)(workout_template_entity_1.WorkoutTemplate)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], WorkoutsService);
//# sourceMappingURL=workouts.service.js.map