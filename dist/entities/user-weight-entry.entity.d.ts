import { User } from './user.entity';
export declare class UserWeightEntry {
    id: number;
    recordedOn: string;
    weight: number;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}
