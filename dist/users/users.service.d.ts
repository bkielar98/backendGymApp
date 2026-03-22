import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserWeightEntry } from '../entities/user-weight-entry.entity';
import { UserBodyMeasurementEntry } from '../entities/user-body-measurement-entry.entity';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CreateWeightEntryDto } from './dto/create-weight-entry.dto';
import { UpdateWeightEntryDto } from './dto/update-weight-entry.dto';
import { CreateBodyMeasurementEntryDto } from './dto/create-body-measurement-entry.dto';
import { UpdateBodyMeasurementEntryDto } from './dto/update-body-measurement-entry.dto';
export declare class UsersService {
    private userRepository;
    private weightEntryRepository;
    private bodyMeasurementEntryRepository;
    constructor(userRepository: Repository<User>, weightEntryRepository: Repository<UserWeightEntry>, bodyMeasurementEntryRepository: Repository<UserBodyMeasurementEntry>);
    findOne(id: number): Promise<User>;
    getSessionProfile(id: number): Promise<{
        id: number;
        email: string;
        name: string;
        gender: string;
        role: import("../entities/user.entity").UserRole;
        avatarPath: string;
        avatarUrl: string;
    }>;
    getUserCard(id: number): Promise<{
        id: number;
        email: string;
        name: string;
        gender: string;
        role: import("../entities/user.entity").UserRole;
        avatarPath: string;
        avatarUrl: string;
        currentWeight: number;
        weightHistory: UserWeightEntry[];
        weightChart: {
            date: string;
            value: number;
        }[];
        bodyMeasurements: UserBodyMeasurementEntry[];
        bodyMeasurementsChart: Record<string, {
            date: string;
            value: number;
        }[]>;
    }>;
    updateProfile(id: number, updateUserDto: UpdateUserProfileDto): Promise<User>;
    updateEmail(id: number, updateEmailDto: UpdateEmailDto): Promise<User>;
    updatePassword(id: number, updatePasswordDto: UpdatePasswordDto): Promise<void>;
    updateAvatar(id: number, file: {
        filename: string;
    }): Promise<User>;
    listWeightEntries(id: number): Promise<UserWeightEntry[]>;
    createWeightEntry(id: number, dto: CreateWeightEntryDto): Promise<UserWeightEntry>;
    updateWeightEntry(id: number, entryId: number, dto: UpdateWeightEntryDto): Promise<UserWeightEntry>;
    removeWeightEntry(id: number, entryId: number): Promise<{
        success: boolean;
        message: string;
        id: number;
        recordedOn: string;
    }>;
    listBodyMeasurementEntries(id: number): Promise<UserBodyMeasurementEntry[]>;
    createBodyMeasurementEntry(id: number, dto: CreateBodyMeasurementEntryDto): Promise<UserBodyMeasurementEntry>;
    updateBodyMeasurementEntry(id: number, entryId: number, dto: UpdateBodyMeasurementEntryDto): Promise<UserBodyMeasurementEntry>;
    removeBodyMeasurementEntry(id: number, entryId: number): Promise<{
        success: boolean;
        message: string;
        id: number;
        recordedOn: string;
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
        id: number;
        email: string;
    }>;
    private mapSessionUser;
    private findWeightEntry;
    private findBodyMeasurementEntry;
    private syncLatestUserWeight;
    private buildMeasurementChart;
}
