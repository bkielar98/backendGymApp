import { Request } from 'express';
import { AdminService } from './admin.service';
import { AdminListUsersQueryDto } from './dto/admin-list-users-query.dto';
import { AdminUpdateUserRoleDto } from './dto/admin-update-user-role.dto';
import { AdminUpdateUserStatusDto } from './dto/admin-update-user-status.dto';
import { AdminListUserWorkoutsQueryDto } from './dto/admin-list-user-workouts-query.dto';
import { User } from '../entities/user.entity';
type AuthenticatedRequest = Request & {
    user: User;
};
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    listUsers(query: AdminListUsersQueryDto): Promise<{
        users: {
            id: number;
            email: string;
            name: string;
            avatarPath: string;
            avatarUrl: string;
            role: import("../entities/user.entity").UserRole;
            createdAt: Date;
            lastLoginAt: Date;
            isActive: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUser(id: number): Promise<{
        id: number;
        email: string;
        name: string;
        avatarPath: string;
        avatarUrl: string;
        role: import("../entities/user.entity").UserRole;
        createdAt: Date;
        lastLoginAt: Date;
        isActive: boolean;
    }>;
    updateUserAvatar(id: number, file: {
        filename: string;
    }): Promise<{
        id: number;
        email: string;
        name: string;
        avatarPath: string;
        avatarUrl: string;
        role: import("../entities/user.entity").UserRole;
        createdAt: Date;
        lastLoginAt: Date;
        isActive: boolean;
    }>;
    updateUserRole(req: AuthenticatedRequest, id: number, dto: AdminUpdateUserRoleDto): Promise<{
        id: number;
        email: string;
        name: string;
        avatarPath: string;
        avatarUrl: string;
        role: import("../entities/user.entity").UserRole;
        createdAt: Date;
        lastLoginAt: Date;
        isActive: boolean;
    }>;
    updateUserStatus(id: number, dto: AdminUpdateUserStatusDto): Promise<{
        id: number;
        email: string;
        name: string;
        avatarPath: string;
        avatarUrl: string;
        role: import("../entities/user.entity").UserRole;
        createdAt: Date;
        lastLoginAt: Date;
        isActive: boolean;
    }>;
    deleteUser(id: number): Promise<{
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
    listUserWorkouts(id: number, query: AdminListUserWorkoutsQueryDto): Promise<{
        workouts: {
            id: number;
            name: string;
            status: import("../entities/workout.entity").WorkoutStatus;
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
}
export {};
