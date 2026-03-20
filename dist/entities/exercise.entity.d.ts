import { User } from './user.entity';
export declare class Exercise {
    id: number;
    name: string;
    description: string;
    muscleGroups: string[];
    isGlobal: boolean;
    createdByUserId: number | null;
    createdByUser: User | null;
}
