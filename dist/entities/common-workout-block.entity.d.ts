import { CommonWorkout } from './common-workout.entity';
import { CommonWorkoutExercise } from './common-workout-exercise.entity';
import { Exercise } from './exercise.entity';
export declare enum CommonWorkoutBlockStatus {
    ACTIVE = "active",
    COMPLETED = "completed"
}
export declare class CommonWorkoutBlock {
    id: number;
    commonWorkoutId: number;
    commonWorkout: CommonWorkout;
    order: number;
    defaultExerciseId: number | null;
    defaultExercise: Exercise | null;
    status: CommonWorkoutBlockStatus;
    completedAt: Date | null;
    userExercises: CommonWorkoutExercise[];
}
