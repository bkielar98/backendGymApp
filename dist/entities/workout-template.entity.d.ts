import { User } from './user.entity';
import { WorkoutTemplateExercise } from './workout-template-exercise.entity';
export declare class WorkoutTemplate {
    id: number;
    name: string;
    userId: number;
    user: User;
    exercises: WorkoutTemplateExercise[];
}
