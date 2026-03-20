import { Repository } from 'typeorm';
import { Workout, WorkoutStatus } from '../entities/workout.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { WorkoutSet } from '../entities/workout-set.entity';
import { WorkoutTemplate } from '../entities/workout-template.entity';
import { StartWorkoutDto } from './dto/start-workout.dto';
import { UpdateWorkoutSetDto } from './dto/update-workout-set.dto';
import { ConfirmWorkoutSetDto } from './dto/confirm-workout-set.dto';
export declare class WorkoutsService {
    private readonly workoutRepository;
    private readonly workoutExerciseRepository;
    private readonly workoutSetRepository;
    private readonly templateRepository;
    constructor(workoutRepository: Repository<Workout>, workoutExerciseRepository: Repository<WorkoutExercise>, workoutSetRepository: Repository<WorkoutSet>, templateRepository: Repository<WorkoutTemplate>);
    startWorkout(userId: number, dto: StartWorkoutDto): Promise<{
        id: number;
        name: string;
        status: WorkoutStatus;
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
    getActiveWorkout(userId: number): Promise<{
        id: number;
        name: string;
        status: WorkoutStatus;
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
    findAll(userId: number): Promise<{
        id: number;
        name: string;
        status: WorkoutStatus;
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
    findOne(userId: number, workoutId: number): Promise<{
        id: number;
        name: string;
        status: WorkoutStatus;
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
    private getWorkoutExerciseEntityForUser;
    private getWorkoutExerciseByIdForUser;
    private getSetForUser;
    private getPreviousSetsForExercise;
    private calculateRepMax;
    private getDurationSeconds;
    private mapWorkout;
    private mapWorkoutExercise;
}
