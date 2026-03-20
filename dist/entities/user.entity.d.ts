import { WorkoutTemplate } from './workout-template.entity';
import { MuscleStatus } from './muscle-status.entity';
import { Workout } from './workout.entity';
export declare enum UserRole {
    ADMIN = "admin",
    USER = "user"
}
export declare class User {
    id: number;
    email: string;
    password: string;
    name: string;
    weight: number;
    gender: string;
    role: UserRole;
    workoutTemplates: WorkoutTemplate[];
    muscleStatuses: MuscleStatus[];
    workouts: Workout[];
}
