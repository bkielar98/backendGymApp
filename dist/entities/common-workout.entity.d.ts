import { User } from './user.entity';
import { WorkoutTemplate } from './workout-template.entity';
import { CommonWorkoutParticipant } from './common-workout-participant.entity';
import { CommonWorkoutExercise } from './common-workout-exercise.entity';
export declare enum CommonWorkoutStatus {
    ACTIVE = "active",
    COMPLETED = "completed"
}
export declare class CommonWorkout {
    id: number;
    createdByUserId: number;
    createdByUser: User;
    templateId: number | null;
    template: WorkoutTemplate | null;
    name: string;
    status: CommonWorkoutStatus;
    startedAt: Date;
    finishedAt: Date | null;
    participants: CommonWorkoutParticipant[];
    exercises: CommonWorkoutExercise[];
}
