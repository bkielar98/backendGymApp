import { Repository } from 'typeorm';
import { Workout, WorkoutStatus } from '../entities/workout.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { WorkoutSet } from '../entities/workout-set.entity';
import { WorkoutTemplate } from '../entities/workout-template.entity';
import { Exercise } from '../entities/exercise.entity';
import { StartWorkoutDto } from './dto/start-workout.dto';
import { UpdateWorkoutSetDto } from './dto/update-workout-set.dto';
import { ConfirmWorkoutSetDto } from './dto/confirm-workout-set.dto';
import { AddWorkoutExerciseDto } from './dto/add-workout-exercise.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
export declare class WorkoutsService {
    private readonly workoutRepository;
    private readonly workoutExerciseRepository;
    private readonly workoutSetRepository;
    private readonly templateRepository;
    private readonly exerciseRepository;
    private readonly workoutRelations;
    constructor(workoutRepository: Repository<Workout>, workoutExerciseRepository: Repository<WorkoutExercise>, workoutSetRepository: Repository<WorkoutSet>, templateRepository: Repository<WorkoutTemplate>, exerciseRepository: Repository<Exercise>);
    startWorkout(userId: number, dto: StartWorkoutDto): Promise<{
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            sets: {
                id: number;
                setNumber: number;
                previousWeight: number;
                previousReps: number;
                currentWeight: number;
                currentReps: number;
                repMax: number;
                confirmed: boolean;
            }[];
        }[];
        id: number;
        name: string;
        status: WorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    updateWorkout(userId: number, workoutId: number, dto: UpdateWorkoutDto): Promise<{
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            sets: {
                id: number;
                setNumber: number;
                previousWeight: number;
                previousReps: number;
                currentWeight: number;
                currentReps: number;
                repMax: number;
                confirmed: boolean;
            }[];
        }[];
        id: number;
        name: string;
        status: WorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    getActiveWorkout(userId: number): Promise<{
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            sets: {
                id: number;
                setNumber: number;
                previousWeight: number;
                previousReps: number;
                currentWeight: number;
                currentReps: number;
                repMax: number;
                confirmed: boolean;
            }[];
        }[];
        id: number;
        name: string;
        status: WorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    findAll(userId: number): Promise<{
        id: number;
        name: string;
        status: WorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }[]>;
    findHistory(userId: number): Promise<{
        id: number;
        name: string;
        status: WorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }[]>;
    findOne(userId: number, workoutId: number): Promise<{
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            sets: {
                id: number;
                setNumber: number;
                previousWeight: number;
                previousReps: number;
                currentWeight: number;
                currentReps: number;
                repMax: number;
                confirmed: boolean;
            }[];
        }[];
        id: number;
        name: string;
        status: WorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    findSummary(userId: number, workoutId: number): Promise<{
        id: number;
        name: string;
        status: WorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    removeWorkout(userId: number, workoutId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    addExercise(userId: number, workoutId: number, dto: AddWorkoutExerciseDto): Promise<{
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            sets: {
                id: number;
                setNumber: number;
                previousWeight: number;
                previousReps: number;
                currentWeight: number;
                currentReps: number;
                repMax: number;
                confirmed: boolean;
            }[];
        }[];
        id: number;
        name: string;
        status: WorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    changeExercisePosition(userId: number, workoutId: number, workoutExerciseId: number, order: number): Promise<{
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            sets: {
                id: number;
                setNumber: number;
                previousWeight: number;
                previousReps: number;
                currentWeight: number;
                currentReps: number;
                repMax: number;
                confirmed: boolean;
            }[];
        }[];
        id: number;
        name: string;
        status: WorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    changeExercise(userId: number, workoutId: number, workoutExerciseId: number, exerciseId: number): Promise<{
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            sets: {
                id: number;
                setNumber: number;
                previousWeight: number;
                previousReps: number;
                currentWeight: number;
                currentReps: number;
                repMax: number;
                confirmed: boolean;
            }[];
        }[];
        id: number;
        name: string;
        status: WorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    removeExercise(userId: number, workoutId: number, workoutExerciseId: number): Promise<{
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            sets: {
                id: number;
                setNumber: number;
                previousWeight: number;
                previousReps: number;
                currentWeight: number;
                currentReps: number;
                repMax: number;
                confirmed: boolean;
            }[];
        }[];
        id: number;
        name: string;
        status: WorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    updateSet(userId: number, setId: number, dto: UpdateWorkoutSetDto): Promise<{
        id: number;
        order: number;
        exercise: {
            id: number;
            name: string;
            description: string;
            muscleGroups: string[];
        };
        sets: {
            id: number;
            setNumber: number;
            previousWeight: number;
            previousReps: number;
            currentWeight: number;
            currentReps: number;
            repMax: number;
            confirmed: boolean;
        }[];
    }>;
    confirmSet(userId: number, setId: number, dto: ConfirmWorkoutSetDto): Promise<{
        id: number;
        order: number;
        exercise: {
            id: number;
            name: string;
            description: string;
            muscleGroups: string[];
        };
        sets: {
            id: number;
            setNumber: number;
            previousWeight: number;
            previousReps: number;
            currentWeight: number;
            currentReps: number;
            repMax: number;
            confirmed: boolean;
        }[];
    }>;
    addSet(userId: number, workoutExerciseId: number): Promise<{
        id: number;
        order: number;
        exercise: {
            id: number;
            name: string;
            description: string;
            muscleGroups: string[];
        };
        sets: {
            id: number;
            setNumber: number;
            previousWeight: number;
            previousReps: number;
            currentWeight: number;
            currentReps: number;
            repMax: number;
            confirmed: boolean;
        }[];
    }>;
    addSetToWorkoutExercise(userId: number, workoutId: number, workoutExerciseId: number): Promise<{
        id: number;
        order: number;
        exercise: {
            id: number;
            name: string;
            description: string;
            muscleGroups: string[];
        };
        sets: {
            id: number;
            setNumber: number;
            previousWeight: number;
            previousReps: number;
            currentWeight: number;
            currentReps: number;
            repMax: number;
            confirmed: boolean;
        }[];
    }>;
    removeSet(userId: number, setId: number): Promise<{
        id: number;
        order: number;
        exercise: {
            id: number;
            name: string;
            description: string;
            muscleGroups: string[];
        };
        sets: {
            id: number;
            setNumber: number;
            previousWeight: number;
            previousReps: number;
            currentWeight: number;
            currentReps: number;
            repMax: number;
            confirmed: boolean;
        }[];
    }>;
    finishActiveWorkout(userId: number): Promise<{
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            sets: {
                id: number;
                setNumber: number;
                previousWeight: number;
                previousReps: number;
                currentWeight: number;
                currentReps: number;
                repMax: number;
                confirmed: boolean;
            }[];
        }[];
        id: number;
        name: string;
        status: WorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    private getWorkoutByIdForUser;
    private getWorkoutEntityForUser;
    private getActiveWorkoutEntityForUser;
    private getWorkoutExerciseFromWorkout;
    private getWorkoutExerciseEntityForUser;
    private getWorkoutExerciseByIdForUser;
    private getSetForUser;
    private getPreviousSetsForExercise;
    private getAccessibleExerciseForUser;
    private calculateRepMax;
    private ensureWorkoutExerciseLimit;
    private ensureWorkoutTotalSetsLimit;
    private getWorkoutTotalSets;
    private getDurationSeconds;
    private getDurationLabel;
    private mapWorkout;
    private mapWorkoutSummary;
    private mapWorkoutExercise;
}
