import { Exercise } from './exercise.entity';
import { User } from './user.entity';
import { Workout } from './workout.entity';
export declare class UserExercisePersonalBest {
    id: number;
    userId: number;
    user: User;
    exerciseId: number;
    exercise: Exercise;
    workoutId: number | null;
    workout: Workout | null;
    weight: number;
    reps: number;
    repMax: number;
    achievedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
