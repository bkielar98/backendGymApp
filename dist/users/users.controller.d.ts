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
        item: {
            id: number;
            email: string;
            name: string;
            gender: string;
            role: import("../entities/user.entity").UserRole;
            avatarPath: string;
            avatarUrl: string;
            currentWeight: number;
            weightHistory: {
                items: import("../entities/user-weight-entry.entity").UserWeightEntry[];
                total: number;
                chart: {
                    date: string;
                    value: number;
                }[];
            };
            bodyMeasurements: {
                items: import("../entities/user-body-measurement-entry.entity").UserBodyMeasurementEntry[];
                total: number;
                chart: Record<string, {
                    date: string;
                    value: number;
                }[]>;
            };
        };
    }>;
    updateProfile(req: any, updateUserDto: UpdateUserProfileDto): Promise<{
        item: {
            id: number;
            email: string;
            name: string;
            gender: string;
            role: import("../entities/user.entity").UserRole;
            avatarPath: string;
            avatarUrl: string;
            currentWeight: number;
            weightHistory: {
                items: import("../entities/user-weight-entry.entity").UserWeightEntry[];
                total: number;
                chart: {
                    date: string;
                    value: number;
                }[];
            };
            bodyMeasurements: {
                items: import("../entities/user-body-measurement-entry.entity").UserBodyMeasurementEntry[];
                total: number;
                chart: Record<string, {
                    date: string;
                    value: number;
                }[]>;
            };
        };
    }>;
    updateEmail(req: any, updateEmailDto: UpdateEmailDto): Promise<{
        item: {
            id: number;
            email: string;
            name: string;
            gender: string;
            role: import("../entities/user.entity").UserRole;
            avatarPath: string;
            avatarUrl: string;
            currentWeight: number;
            weightHistory: {
                items: import("../entities/user-weight-entry.entity").UserWeightEntry[];
                total: number;
                chart: {
                    date: string;
                    value: number;
                }[];
            };
            bodyMeasurements: {
                items: import("../entities/user-body-measurement-entry.entity").UserBodyMeasurementEntry[];
                total: number;
                chart: Record<string, {
                    date: string;
                    value: number;
                }[]>;
            };
        };
    }>;
    updatePassword(req: any, updatePasswordDto: UpdatePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    uploadAvatar(req: any, file: {
        filename: string;
    }): Promise<{
        item: {
            id: number;
            email: string;
            name: string;
            gender: string;
            role: import("../entities/user.entity").UserRole;
            avatarPath: string;
            avatarUrl: string;
            currentWeight: number;
            weightHistory: {
                items: import("../entities/user-weight-entry.entity").UserWeightEntry[];
                total: number;
                chart: {
                    date: string;
                    value: number;
                }[];
            };
            bodyMeasurements: {
                items: import("../entities/user-body-measurement-entry.entity").UserBodyMeasurementEntry[];
                total: number;
                chart: Record<string, {
                    date: string;
                    value: number;
                }[]>;
            };
        };
    }>;
    getWeights(req: any): Promise<{
        items: import("../entities/user-weight-entry.entity").UserWeightEntry[];
        total: number;
        chart: {
            date: string;
            value: number;
        }[];
    }>;
    createWeight(req: any, dto: CreateWeightEntryDto): Promise<{
        item: import("../entities/user-weight-entry.entity").UserWeightEntry;
    }>;
    updateWeight(req: any, id: number, dto: UpdateWeightEntryDto): Promise<{
        item: import("../entities/user-weight-entry.entity").UserWeightEntry;
    }>;
    deleteWeight(req: any, id: number): Promise<{
        success: boolean;
        message: string;
        item: {
            id: number;
            recordedOn: string;
        };
    }>;
    getBodyMeasurements(req: any): Promise<{
        items: import("../entities/user-body-measurement-entry.entity").UserBodyMeasurementEntry[];
        total: number;
        chart: Record<string, {
            date: string;
            value: number;
        }[]>;
    }>;
    createBodyMeasurement(req: any, dto: CreateBodyMeasurementEntryDto): Promise<{
        item: import("../entities/user-body-measurement-entry.entity").UserBodyMeasurementEntry;
    }>;
    updateBodyMeasurement(req: any, id: number, dto: UpdateBodyMeasurementEntryDto): Promise<{
        item: import("../entities/user-body-measurement-entry.entity").UserBodyMeasurementEntry;
    }>;
    deleteBodyMeasurement(req: any, id: number): Promise<{
        success: boolean;
        message: string;
        item: {
            id: number;
            recordedOn: string;
        };
    }>;
    deleteProfile(req: any): Promise<{
        success: boolean;
        message: string;
        item: {
            id: number;
            email: string;
        };
    }>;
}
