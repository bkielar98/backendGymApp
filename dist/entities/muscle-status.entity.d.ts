import { User } from './user.entity';
export declare class MuscleStatus {
    id: number;
    userId: number;
    user: User;
    muscleGroup: string;
    lastTrainedAt: Date;
}
