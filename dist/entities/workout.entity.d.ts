import { User } from './user.entity';
import { WorkoutExercise } from './workout-exercise.entity';
import { WorkoutTemplate } from './workout-template.entity';
export declare enum WorkoutStatus {
    ACTIVE = "active",
    COMPLETED = "completed"
}
export declare class Workout {
    id: number;
    userId: number;
    user: User;
    templateId: number | null;
    template: WorkoutTemplate | null;
    name: string;
    status: WorkoutStatus;
    startedAt: Date;
    finishedAt: Date | null;
    exercises: WorkoutExercise[];
}
