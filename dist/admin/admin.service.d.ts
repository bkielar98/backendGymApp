import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Workout, WorkoutStatus } from '../entities/workout.entity';
import { Exercise } from '../entities/exercise.entity';
import { UsersService } from '../users/users.service';
import { AdminListUsersQueryDto } from './dto/admin-list-users-query.dto';
import { AdminUpdateUserRoleDto } from './dto/admin-update-user-role.dto';
import { AdminUpdateUserStatusDto } from './dto/admin-update-user-status.dto';
import { AdminListUserWorkoutsQueryDto } from './dto/admin-list-user-workouts-query.dto';
export declare class AdminService {
    private readonly userRepository;
    private readonly workoutRepository;
    private readonly exerciseRepository;
    private readonly usersService;
    private readonly defaultPage;
    private readonly defaultLimit;
    private readonly maxLimit;
    private readonly warsawTimeZone;
    constructor(userRepository: Repository<User>, workoutRepository: Repository<Workout>, exerciseRepository: Repository<Exercise>, usersService: UsersService);
    listUsers(query: AdminListUsersQueryDto): Promise<{
        users: {
            id: number;
            email: string;
            name: string;
            avatarPath: string;
            avatarUrl: string;
            role: UserRole;
            createdAt: Date;
            lastLoginAt: Date;
            isActive: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUserById(userId: number): Promise<{
        id: number;
        email: string;
        name: string;
        avatarPath: string;
        avatarUrl: string;
        role: UserRole;
        createdAt: Date;
        lastLoginAt: Date;
        isActive: boolean;
    }>;
    updateUserAvatar(userId: number, file: {
        filename: string;
    }): Promise<{
        id: number;
        email: string;
        name: string;
        avatarPath: string;
        avatarUrl: string;
        role: UserRole;
        createdAt: Date;
        lastLoginAt: Date;
        isActive: boolean;
    }>;
    updateUserRole(actingUserId: number, userId: number, dto: AdminUpdateUserRoleDto): Promise<{
        id: number;
        email: string;
        name: string;
        avatarPath: string;
        avatarUrl: string;
        role: UserRole;
        createdAt: Date;
        lastLoginAt: Date;
        isActive: boolean;
    }>;
    updateUserStatus(userId: number, dto: AdminUpdateUserStatusDto): Promise<{
        id: number;
        email: string;
        name: string;
        avatarPath: string;
        avatarUrl: string;
        role: UserRole;
        createdAt: Date;
        lastLoginAt: Date;
        isActive: boolean;
    }>;
    softDeleteUser(userId: number): Promise<{
        success: boolean;
        id: number;
        isActive: boolean;
    }>;
    getStats(): Promise<{
        totalUsers: number;
        activeUsersLast30Days: number;
        totalExercises: number;
        totalWorkouts: number;
        newUsersThisMonth: number;
    }>;
    listUserWorkouts(userId: number, query: AdminListUserWorkoutsQueryDto): Promise<{
        workouts: {
            id: number;
            name: string;
            status: WorkoutStatus;
            mode: string;
            isSolo: boolean;
            participantCount: number;
            startedAt: Date;
            finishedAt: Date;
            durationSeconds: number;
            durationLabel: string;
            exerciseCount: number;
            totalSets: number;
            confirmedSets: number;
            exerciseNames: string[];
            template: {
                id: number;
                name: string;
            };
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    private findUserOrThrow;
    private normalizePage;
    private normalizeLimit;
    private mapAdminUser;
    private mapWorkoutSummary;
    private getDurationSeconds;
    private getDurationLabel;
    private getCurrentWarsawMonthRange;
    private zonedDateToUtc;
    private getTimeZoneOffsetMs;
    private getTimeZoneParts;
}
