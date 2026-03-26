import { WorkoutTemplate } from './workout-template.entity';
import { MuscleStatus } from './muscle-status.entity';
import { Workout } from './workout.entity';
import { UserWeightEntry } from './user-weight-entry.entity';
import { UserBodyMeasurementEntry } from './user-body-measurement-entry.entity';
export declare enum UserRole {
    ADMIN = "admin",
    USER = "user"
}
export declare class User {
    id: number;
    email: string;
    password: string;
    refreshTokenHash: string | null;
    name: string;
    weight: number;
    gender: string;
    avatarPath: string;
    role: UserRole;
    workoutTemplates: WorkoutTemplate[];
    muscleStatuses: MuscleStatus[];
    workouts: Workout[];
    weightEntries: UserWeightEntry[];
    bodyMeasurementEntries: UserBodyMeasurementEntry[];
}
