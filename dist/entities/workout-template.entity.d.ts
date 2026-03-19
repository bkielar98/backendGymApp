import { User } from './user.entity';
import { Exercise } from './exercise.entity';
export declare class WorkoutTemplate {
    id: number;
    name: string;
    userId: number;
    user: User;
    exercises: Exercise[];
}
