import { User } from './user.entity';
import { WorkoutTemplateExercise } from './workout-template-exercise.entity';
import { WorkoutTemplateMember } from './workout-template-member.entity';
export declare class WorkoutTemplate {
    id: number;
    name: string;
    description: string | null;
    labels: string[];
    startDate: Date | null;
    endDate: Date | null;
    tasks: string[] | null;
    isShared: boolean;
    shareCode: string | null;
    userId: number;
    user: User;
    exercises: WorkoutTemplateExercise[];
    members: WorkoutTemplateMember[];
}
