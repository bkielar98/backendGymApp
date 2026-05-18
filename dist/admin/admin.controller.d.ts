import { Request } from 'express';
import { AdminService } from './admin.service';
import { AdminListUsersQueryDto } from './dto/admin-list-users-query.dto';
import { AdminUpdateUserRoleDto } from './dto/admin-update-user-role.dto';
import { AdminUpdateUserStatusDto } from './dto/admin-update-user-status.dto';
import { AdminListUserWorkoutsQueryDto } from './dto/admin-list-user-workouts-query.dto';
import { AdminResetUserPasswordDto } from './dto/admin-reset-user-password.dto';
import { AdminExerciseStatsQueryDto } from './dto/admin-exercise-stats-query.dto';
import { User } from '../entities/user.entity';
type AuthenticatedRequest = Request & {
    user: User;
};
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    listUsers(query: AdminListUsersQueryDto): Promise<{
        [x: string]: unknown;
    }>;
    getUser(id: number): Promise<{
        [x: string]: unknown;
    }>;
    updateUserAvatar(id: number, file: {
        filename: string;
    }): Promise<{
        [x: string]: unknown;
    }>;
    updateUserRole(req: AuthenticatedRequest, id: number, dto: AdminUpdateUserRoleDto): Promise<{
        [x: string]: unknown;
    }>;
    updateUserStatus(req: AuthenticatedRequest, id: number, dto: AdminUpdateUserStatusDto): Promise<{
        [x: string]: unknown;
    }>;
    resetUserPassword(id: number, dto: AdminResetUserPasswordDto): Promise<Record<string, unknown>>;
    deleteUser(req: AuthenticatedRequest, id: number): Promise<{
        [x: string]: unknown;
    }>;
    getStats(): Promise<{
        [x: string]: unknown;
    }>;
    listActiveWorkouts(query: AdminListUserWorkoutsQueryDto): Promise<Record<string, unknown>>;
    finishActiveWorkout(id: number): Promise<Record<string, unknown>>;
    finishActiveCommonWorkout(id: number): Promise<Record<string, unknown>>;
    getExerciseStats(query: AdminExerciseStatsQueryDto): Promise<Record<string, unknown>>;
    listProfaneExercises(): Promise<Record<string, unknown>>;
    listUserWorkouts(id: number, query: AdminListUserWorkoutsQueryDto): Promise<{
        [x: string]: unknown;
    }>;
}
export {};
