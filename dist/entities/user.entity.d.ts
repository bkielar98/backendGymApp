import { WorkoutTemplate } from './workout-template.entity';
import { MuscleStatus } from './muscle-status.entity';
export declare class User {
    id: number;
    email: string;
    password: string;
    name: string;
    weight: number;
    gender: string;
    workoutTemplates: WorkoutTemplate[];
    muscleStatuses: MuscleStatus[];
}
