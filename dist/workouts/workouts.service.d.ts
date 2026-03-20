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
    constructor(workoutRepository: Repository<Workout>, workoutExerciseRepository: Repository<WorkoutExercise>, workoutSetRepository: Repository<WorkoutSet>, templateRepository: Repository<WorkoutTemplate>, exerciseRepository: Repository<Exercise>);
    startWorkout(userId: number, dto: StartWorkoutDto): Promise<{
        id: number;
        name: string;
        status: WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
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
    }>;
    updateWorkout(userId: number, workoutId: number, dto: UpdateWorkoutDto): Promise<{
        id: number;
        name: string;
        status: WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
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
    }>;
    getActiveWorkout(userId: number): Promise<{
        id: number;
        name: string;
        status: WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
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
    }>;
    findAll(userId: number): Promise<{
        id: number;
        name: string;
        status: WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
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
    }[]>;
    findOne(userId: number, workoutId: number): Promise<{
        id: number;
        name: string;
        status: WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
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
    }>;
    removeWorkout(userId: number, workoutId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    addExercise(userId: number, workoutId: number, dto: AddWorkoutExerciseDto): Promise<{
        id: number;
        name: string;
        status: WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
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
    }>;
    changeExercisePosition(userId: number, workoutId: number, workoutExerciseId: number, order: number): Promise<{
        id: number;
        name: string;
        status: WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
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
    }>;
    changeExercise(userId: number, workoutId: number, workoutExerciseId: number, exerciseId: number): Promise<{
        id: number;
        name: string;
        status: WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
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
    }>;
    removeExercise(userId: number, workoutId: number, workoutExerciseId: number): Promise<{
        id: number;
        name: string;
        status: WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
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
        id: number;
        name: string;
        status: WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
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
    private getDurationSeconds;
    private getDurationLabel;
    private mapWorkout;
    private mapWorkoutExercise;
}
