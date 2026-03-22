import { User } from './user.entity';
export declare class UserBodyMeasurementEntry {
    id: number;
    recordedOn: string;
    neck: number;
    shoulders: number;
    chest: number;
    leftBiceps: number;
    rightBiceps: number;
    leftForearm: number;
    rightForearm: number;
    upperAbs: number;
    waist: number;
    lowerAbs: number;
    hips: number;
    leftThigh: number;
    rightThigh: number;
    leftCalf: number;
    rightCalf: number;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}
