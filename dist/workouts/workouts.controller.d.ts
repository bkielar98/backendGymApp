import { WorkoutsService } from './workouts.service';
import { StartWorkoutDto } from './dto/start-workout.dto';
import { UpdateWorkoutSetDto } from './dto/update-workout-set.dto';
import { ConfirmWorkoutSetDto } from './dto/confirm-workout-set.dto';
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
