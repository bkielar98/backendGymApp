import { WorkoutTemplate } from './workout-template.entity';
import { MuscleStatus } from './muscle-status.entity';
import { Workout } from './workout.entity';
import { UserWeightEntry } from './user-weight-entry.entity';
import { UserBodyMeasurementEntry } from './user-body-measurement-entry.entity';
import { WorkoutTemplateMember } from './workout-template-member.entity';
export declare enum UserRole {
    ADMIN = "admin",
    USER = "user"
}
export declare class User {
    id: number;
    email: string;
    password: string;
    refreshTokenHash: string | null;
    createdAt: Date;
    name: string;
    weight: number | null;
    gender: string | null;
    avatarPath: string | null;
    role: UserRole;
    isActive: boolean;
    lastLoginAt: Date | null;
    workoutTemplates: WorkoutTemplate[];
    sharedWorkoutTemplates: WorkoutTemplateMember[];
    muscleStatuses: MuscleStatus[];
    workouts: Workout[];
    weightEntries: UserWeightEntry[];
    bodyMeasurementEntries: UserBodyMeasurementEntry[];
}
