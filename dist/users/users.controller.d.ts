import { UsersService } from './users.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CreateWeightEntryDto } from './dto/create-weight-entry.dto';
import { UpdateWeightEntryDto } from './dto/update-weight-entry.dto';
import { CreateBodyMeasurementEntryDto } from './dto/create-body-measurement-entry.dto';
import { UpdateBodyMeasurementEntryDto } from './dto/update-body-measurement-entry.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        id: number;
        email: string;
        name: string;
        gender: string;
        role: import("../entities/user.entity").UserRole;
        avatarPath: string;
        avatarUrl: string;
        currentWeight: number;
        weightHistory: import("../entities/user-weight-entry.entity").UserWeightEntry[];
        weightChart: {
            date: string;
            value: number;
        }[];
        bodyMeasurements: import("../entities/user-body-measurement-entry.entity").UserBodyMeasurementEntry[];
        bodyMeasurementsChart: Record<string, {
            date: string;
            value: number;
        }[]>;
    }>;
    getUserCard(req: any): Promise<{
        id: number;
        email: string;
        name: string;
        gender: string;
        role: import("../entities/user.entity").UserRole;
        avatarPath: string;
        avatarUrl: string;
        currentWeight: number;
        weightHistory: import("../entities/user-weight-entry.entity").UserWeightEntry[];
        weightChart: {
            date: string;
            value: number;
        }[];
        bodyMeasurements: import("../entities/user-body-measurement-entry.entity").UserBodyMeasurementEntry[];
        bodyMeasurementsChart: Record<string, {
            date: string;
            value: number;
        }[]>;
    }>;
    updateProfile(req: any, updateUserDto: UpdateUserProfileDto): Promise<{
        id: number;
        email: string;
        name: string;
        gender: string;
        role: import("../entities/user.entity").UserRole;
        avatarPath: string;
        avatarUrl: string;
        currentWeight: number;
        weightHistory: import("../entities/user-weight-entry.entity").UserWeightEntry[];
        weightChart: {
            date: string;
            value: number;
        }[];
        bodyMeasurements: import("../entities/user-body-measurement-entry.entity").UserBodyMeasurementEntry[];
        bodyMeasurementsChart: Record<string, {
            date: string;
            value: number;
        }[]>;
    }>;
    updateEmail(req: any, updateEmailDto: UpdateEmailDto): Promise<{
        id: number;
        email: string;
        name: string;
        gender: string;
        role: import("../entities/user.entity").UserRole;
        avatarPath: string;
        avatarUrl: string;
        currentWeight: number;
        weightHistory: import("../entities/user-weight-entry.entity").UserWeightEntry[];
        weightChart: {
            date: string;
            value: number;
        }[];
        bodyMeasurements: import("../entities/user-body-measurement-entry.entity").UserBodyMeasurementEntry[];
        bodyMeasurementsChart: Record<string, {
            date: string;
            value: number;
        }[]>;
    }>;
    updatePassword(req: any, updatePasswordDto: UpdatePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    uploadAvatar(req: any, file: {
        filename: string;
    }): Promise<{
        id: number;
        email: string;
        name: string;
        gender: string;
        role: import("../entities/user.entity").UserRole;
        avatarPath: string;
        avatarUrl: string;
        currentWeight: number;
        weightHistory: import("../entities/user-weight-entry.entity").UserWeightEntry[];
        weightChart: {
            date: string;
            value: number;
        }[];
        bodyMeasurements: import("../entities/user-body-measurement-entry.entity").UserBodyMeasurementEntry[];
        bodyMeasurementsChart: Record<string, {
            date: string;
            value: number;
        }[]>;
    }>;
    getWeights(req: any): Promise<import("../entities/user-weight-entry.entity").UserWeightEntry[]>;
    createWeight(req: any, dto: CreateWeightEntryDto): Promise<import("../entities/user-weight-entry.entity").UserWeightEntry>;
    updateWeight(req: any, id: number, dto: UpdateWeightEntryDto): Promise<import("../entities/user-weight-entry.entity").UserWeightEntry>;
    deleteWeight(req: any, id: number): Promise<{
        success: boolean;
        message: string;
        id: number;
        recordedOn: string;
    }>;
    getBodyMeasurements(req: any): Promise<import("../entities/user-body-measurement-entry.entity").UserBodyMeasurementEntry[]>;
    createBodyMeasurement(req: any, dto: CreateBodyMeasurementEntryDto): Promise<import("../entities/user-body-measurement-entry.entity").UserBodyMeasurementEntry>;
    updateBodyMeasurement(req: any, id: number, dto: UpdateBodyMeasurementEntryDto): Promise<import("../entities/user-body-measurement-entry.entity").UserBodyMeasurementEntry>;
    deleteBodyMeasurement(req: any, id: number): Promise<{
        success: boolean;
        message: string;
        id: number;
        recordedOn: string;
    }>;
    deleteProfile(req: any): Promise<{
        success: boolean;
        message: string;
        id: number;
        email: string;
    }>;
}
