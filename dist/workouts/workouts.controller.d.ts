import { AddWorkoutExerciseDto } from './dto/add-workout-exercise.dto';
import { ChangeWorkoutExercisePositionDto } from './dto/change-workout-exercise-position.dto';
import { ChangeWorkoutExerciseDto } from './dto/change-workout-exercise.dto';
import { ConfirmWorkoutSetDto } from './dto/confirm-workout-set.dto';
import { StartWorkoutDto } from './dto/start-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { UpdateWorkoutSetDto } from './dto/update-workout-set.dto';
import { WorkoutsService } from './workouts.service';
export declare class WorkoutsController {
    private readonly workoutsService;
    constructor(workoutsService: WorkoutsService);
    startWorkout(req: any, dto: StartWorkoutDto): Promise<{
        id: number;
        name: string;
        status: import("../entities/workout.entity").WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        exerciseNames: string[];
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
    getActiveWorkout(req: any): Promise<{
        id: number;
        name: string;
        status: import("../entities/workout.entity").WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        exerciseNames: string[];
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
    finishActiveWorkout(req: any): Promise<{
        id: number;
        name: string;
        status: import("../entities/workout.entity").WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        exerciseNames: string[];
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
    findAll(req: any): Promise<{
        id: number;
        name: string;
        status: import("../entities/workout.entity").WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        exerciseNames: string[];
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
    findHistory(req: any): Promise<{
        id: number;
        name: string;
        status: import("../entities/workout.entity").WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        exerciseNames: string[];
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
    findOne(req: any, id: number): Promise<{
        id: number;
        name: string;
        status: import("../entities/workout.entity").WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        exerciseNames: string[];
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
    updateWorkout(req: any, id: number, dto: UpdateWorkoutDto): Promise<{
        id: number;
        name: string;
        status: import("../entities/workout.entity").WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        exerciseNames: string[];
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
    removeWorkout(req: any, id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    addExercise(req: any, workoutId: number, dto: AddWorkoutExerciseDto): Promise<{
        id: number;
        name: string;
        status: import("../entities/workout.entity").WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        exerciseNames: string[];
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
    changeExercisePosition(req: any, workoutId: number, workoutExerciseId: number, dto: ChangeWorkoutExercisePositionDto): Promise<{
        id: number;
        name: string;
        status: import("../entities/workout.entity").WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        exerciseNames: string[];
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
    changeExercise(req: any, workoutId: number, workoutExerciseId: number, dto: ChangeWorkoutExerciseDto): Promise<{
        id: number;
        name: string;
        status: import("../entities/workout.entity").WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        exerciseNames: string[];
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
    removeExercise(req: any, workoutId: number, workoutExerciseId: number): Promise<{
        id: number;
        name: string;
        status: import("../entities/workout.entity").WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        exerciseNames: string[];
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
    updateSet(req: any, setId: number, dto: UpdateWorkoutSetDto): Promise<{
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
    confirmSet(req: any, setId: number, dto: ConfirmWorkoutSetDto): Promise<{
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
    addSet(req: any, workoutExerciseId: number): Promise<{
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
    addSetToExercise(req: any, workoutId: number, workoutExerciseId: number): Promise<{
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
    removeSet(req: any, setId: number): Promise<{
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
}
