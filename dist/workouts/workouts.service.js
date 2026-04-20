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
const exercise_entity_1 = require("../entities/exercise.entity");
const workout_constants_1 = require("../common/constants/workout.constants");
const rep_max_util_1 = require("../common/utils/rep-max.util");
let WorkoutsService = class WorkoutsService {
    constructor(workoutRepository, workoutExerciseRepository, workoutSetRepository, templateRepository, exerciseRepository) {
        this.workoutRepository = workoutRepository;
        this.workoutExerciseRepository = workoutExerciseRepository;
        this.workoutSetRepository = workoutSetRepository;
        this.templateRepository = templateRepository;
        this.exerciseRepository = exerciseRepository;
        this.workoutRelations = {
            template: true,
            exercises: {
                exercise: true,
                sets: true,
            },
        };
    }
    async startWorkout(userId, dto) {
        const activeWorkout = await this.workoutRepository.findOne({
            where: { userId, status: workout_entity_1.WorkoutStatus.ACTIVE },
        });
        if (activeWorkout) {
            throw new common_1.BadRequestException('User already has an active workout');
        }
        let template = null;
        if (typeof dto.templateId === 'number') {
            template = await this.templateRepository.findOne({
                where: { id: dto.templateId, userId },
            });
            if (!template) {
                throw new common_1.NotFoundException('Workout template not found');
            }
        }
        const workout = this.workoutRepository.create({
            userId,
            templateId: template?.id ?? null,
            template,
            name: dto.name || template?.name || 'Workout',
            status: workout_entity_1.WorkoutStatus.ACTIVE,
            startedAt: new Date(),
            finishedAt: null,
            exercises: [],
        });
        const savedWorkout = await this.workoutRepository.save(workout);
        const sortedTemplateExercises = [...(template?.exercises || [])].sort((a, b) => a.order - b.order);
        this.ensureWorkoutExerciseLimit(sortedTemplateExercises.length);
        this.ensureWorkoutTotalSetsLimit(sortedTemplateExercises.reduce((sum, exercise) => sum + exercise.setsCount, 0));
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
    async updateWorkout(userId, workoutId, dto) {
        const workout = await this.getWorkoutEntityForUser(userId, workoutId);
        if (typeof dto.name === 'string') {
            workout.name = dto.name;
            await this.workoutRepository.save(workout);
        }
        return this.getWorkoutByIdForUser(userId, workout.id);
    }
    async getActiveWorkout(userId) {
        const workout = await this.workoutRepository.findOne({
            where: { userId, status: workout_entity_1.WorkoutStatus.ACTIVE },
            relations: this.workoutRelations,
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
            return null;
        }
        return this.mapWorkout(workout);
    }
    async findAll(userId) {
        const workouts = await this.workoutRepository.find({
            where: { userId },
            order: { startedAt: 'DESC' },
            relations: this.workoutRelations,
        });
        return workouts.map((workout) => this.mapWorkout(workout));
    }
    async findHistory(userId) {
        const workouts = await this.workoutRepository.find({
            where: {
                userId,
                status: workout_entity_1.WorkoutStatus.COMPLETED,
            },
            order: { startedAt: 'DESC' },
            relations: this.workoutRelations,
        });
        return workouts.map((workout) => this.mapWorkout(workout));
    }
    async findOne(userId, workoutId) {
        return this.getWorkoutByIdForUser(userId, workoutId);
    }
    async findSummary(userId, workoutId) {
        const workout = await this.getWorkoutEntityForUser(userId, workoutId);
        return this.mapWorkoutSummary(workout);
    }
    async removeWorkout(userId, workoutId) {
        await this.getWorkoutEntityForUser(userId, workoutId);
        await this.workoutRepository.delete({
            id: workoutId,
            userId,
        });
        return { success: true, message: 'Workout removed' };
    }
    async addExercise(userId, workoutId, dto) {
        const workout = await this.getActiveWorkoutEntityForUser(userId, workoutId);
        const exercise = await this.getAccessibleExerciseForUser(userId, dto.exerciseId);
        const workoutExercises = [...(workout.exercises || [])];
        this.ensureWorkoutExerciseLimit(workoutExercises.length + 1);
        this.ensureWorkoutTotalSetsLimit(this.getWorkoutTotalSets(workoutExercises) + (dto.setsCount ?? 0));
        const insertOrder = Math.min(dto.order ?? workoutExercises.length, workoutExercises.length);
        for (const item of workoutExercises) {
            if (item.order >= insertOrder) {
                item.order += 1;
            }
        }
        await this.workoutExerciseRepository.save(workoutExercises);
        const workoutExercise = this.workoutExerciseRepository.create({
            workoutId: workout.id,
            workout,
            exerciseId: exercise.id,
            exercise,
            order: insertOrder,
            sets: [],
        });
        const savedWorkoutExercise = await this.workoutExerciseRepository.save(workoutExercise);
        if ((dto.setsCount ?? 0) > 0) {
            const previousSets = await this.getPreviousSetsForExercise(userId, exercise.id);
            const setsToCreate = [];
            for (let i = 1; i <= (dto.setsCount ?? 0); i += 1) {
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
        return this.getWorkoutByIdForUser(userId, workout.id);
    }
    async changeExercisePosition(userId, workoutId, workoutExerciseId, order) {
        const workout = await this.getActiveWorkoutEntityForUser(userId, workoutId);
        const workoutExercises = [...(workout.exercises || [])];
        const workoutExercise = this.getWorkoutExerciseFromWorkout(workout, workoutExerciseId);
        const maxOrder = Math.max(0, workoutExercises.length - 1);
        const targetOrder = Math.max(0, Math.min(order, maxOrder));
        const currentOrder = workoutExercise.order;
        if (currentOrder === targetOrder) {
            return this.getWorkoutByIdForUser(userId, workout.id);
        }
        for (const item of workoutExercises) {
            if (item.id === workoutExercise.id) {
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
        workoutExercise.order = targetOrder;
        await this.workoutExerciseRepository.save(workoutExercises);
        return this.getWorkoutByIdForUser(userId, workout.id);
    }
    async changeExercise(userId, workoutId, workoutExerciseId, exerciseId) {
        const workout = await this.getActiveWorkoutEntityForUser(userId, workoutId);
        const workoutExercise = this.getWorkoutExerciseFromWorkout(workout, workoutExerciseId);
        const exercise = await this.getAccessibleExerciseForUser(userId, exerciseId);
        workoutExercise.exerciseId = exercise.id;
        workoutExercise.exercise = exercise;
        await this.workoutExerciseRepository.save(workoutExercise);
        return this.getWorkoutByIdForUser(userId, workout.id);
    }
    async removeExercise(userId, workoutId, workoutExerciseId) {
        const workout = await this.getActiveWorkoutEntityForUser(userId, workoutId);
        const workoutExercise = this.getWorkoutExerciseFromWorkout(workout, workoutExerciseId);
        await this.workoutExerciseRepository.delete({
            id: workoutExerciseId,
            workoutId: workout.id,
        });
        const remainingExercises = (workout.exercises || []).filter((item) => item.id !== workoutExerciseId);
        for (const item of remainingExercises) {
            if (item.order > workoutExercise.order) {
                item.order -= 1;
            }
        }
        await this.workoutExerciseRepository.save(remainingExercises);
        return this.getWorkoutByIdForUser(userId, workout.id);
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
        if (nextSetNumber > workout_constants_1.MAX_EXERCISE_SETS) {
            throw new common_1.BadRequestException(`Workout exercise cannot have more than ${workout_constants_1.MAX_EXERCISE_SETS} sets`);
        }
        this.ensureWorkoutTotalSetsLimit(this.getWorkoutTotalSets(workoutExercise.workout.exercises || []) + 1);
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
    async addSetToWorkoutExercise(userId, workoutId, workoutExerciseId) {
        const workout = await this.getActiveWorkoutEntityForUser(userId, workoutId);
        const workoutExercise = this.getWorkoutExerciseFromWorkout(workout, workoutExerciseId);
        return this.addSet(userId, workoutExercise.id);
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
            relations: this.workoutRelations,
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
        return this.mapWorkout(workout);
    }
    async getWorkoutEntityForUser(userId, workoutId) {
        const workout = await this.workoutRepository.findOne({
            where: { id: workoutId, userId },
            relations: this.workoutRelations,
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
    async getActiveWorkoutEntityForUser(userId, workoutId) {
        const workout = await this.workoutRepository.findOne({
            where: {
                id: workoutId,
                userId,
                status: workout_entity_1.WorkoutStatus.ACTIVE,
            },
            relations: this.workoutRelations,
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
            throw new common_1.NotFoundException('Active workout not found');
        }
        return workout;
    }
    getWorkoutExerciseFromWorkout(workout, workoutExerciseId) {
        const workoutExercise = (workout.exercises || []).find((item) => item.id === workoutExerciseId);
        if (!workoutExercise) {
            throw new common_1.NotFoundException('Workout exercise not found');
        }
        return workoutExercise;
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
    async getAccessibleExerciseForUser(userId, exerciseId) {
        const exercise = await this.exerciseRepository.findOne({
            where: { id: exerciseId },
        });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        if (exercise.isGlobal || exercise.createdByUserId === userId) {
            return exercise;
        }
        throw new common_1.NotFoundException('Exercise not found');
    }
    calculateRepMax(weight, reps) {
        return (0, rep_max_util_1.calculateBrzyckiRepMax)(weight, reps);
    }
    ensureWorkoutExerciseLimit(count) {
        if (count > workout_constants_1.MAX_ACTIVE_WORKOUT_EXERCISES) {
            throw new common_1.BadRequestException(`Workout cannot have more than ${workout_constants_1.MAX_ACTIVE_WORKOUT_EXERCISES} exercises`);
        }
    }
    ensureWorkoutTotalSetsLimit(totalSets) {
        if (totalSets > workout_constants_1.MAX_TOTAL_SETS) {
            throw new common_1.BadRequestException(`Workout cannot have more than ${workout_constants_1.MAX_TOTAL_SETS} total sets`);
        }
    }
    getWorkoutTotalSets(exercises) {
        return exercises.reduce((sum, exercise) => sum + (exercise.sets?.length || 0), 0);
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
    mapWorkout(workout) {
        const exercises = [...(workout.exercises || [])]
            .sort((a, b) => a.order - b.order)
            .map((exercise) => this.mapWorkoutExercise(exercise));
        return {
            ...this.mapWorkoutSummary(workout),
            exercises,
        };
    }
    mapWorkoutSummary(workout) {
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
    __param(4, (0, typeorm_1.InjectRepository)(exercise_entity_1.Exercise)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], WorkoutsService);
//# sourceMappingURL=workouts.service.js.map