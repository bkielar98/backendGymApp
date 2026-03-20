import { WorkoutExercise } from './workout-exercise.entity';
export declare class WorkoutSet {
    id: number;
    workoutExerciseId: number;
    workoutExercise: WorkoutExercise;
    setNumber: number;
    previousWeight: number | null;
    previousReps: number | null;
    currentWeight: number | null;
    currentReps: number | null;
    repMax: number | null;
    confirmed: boolean;
}
