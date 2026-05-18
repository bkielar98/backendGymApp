import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Workout, WorkoutStatus } from '../entities/workout.entity';
import { CommonWorkout, CommonWorkoutStatus } from '../entities/common-workout.entity';
import { Exercise } from '../entities/exercise.entity';
import { UsersService } from '../users/users.service';
import { AdminListUsersQueryDto } from './dto/admin-list-users-query.dto';
import { AdminUpdateUserRoleDto } from './dto/admin-update-user-role.dto';
import { AdminUpdateUserStatusDto } from './dto/admin-update-user-status.dto';
import { AdminListUserWorkoutsQueryDto } from './dto/admin-list-user-workouts-query.dto';
import { AdminResetUserPasswordDto } from './dto/admin-reset-user-password.dto';
import { AdminExerciseStatsQueryDto } from './dto/admin-exercise-stats-query.dto';
export declare class AdminService {
    private readonly userRepository;
    private readonly workoutRepository;
    private readonly commonWorkoutRepository;
    private readonly exerciseRepository;
    private readonly usersService;
    private readonly defaultPage;
    private readonly defaultLimit;
    private readonly maxLimit;
    private readonly warsawTimeZone;
    private readonly profanityWords;
    constructor(userRepository: Repository<User>, workoutRepository: Repository<Workout>, commonWorkoutRepository: Repository<CommonWorkout>, exerciseRepository: Repository<Exercise>, usersService: UsersService);
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
    updateUserStatus(actingUserId: number, userId: number, dto: AdminUpdateUserStatusDto): Promise<{
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
    resetUserPassword(userId: number, dto: AdminResetUserPasswordDto): Promise<{
        success: boolean;
        id: number;
    }>;
    softDeleteUser(actingUserId: number, userId: number): Promise<{
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
    listActiveWorkouts(query: AdminListUserWorkoutsQueryDto): Promise<{
        workouts: ({
            source: "solo";
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
                role: UserRole;
                isActive: boolean;
            };
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
        } | {
            id: number;
            name: string;
            status: CommonWorkoutStatus;
            source: "common";
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
            createdByUser: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
                role: UserRole;
                isActive: boolean;
            };
            participants: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
                role: UserRole;
                isActive: boolean;
            }[];
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    finishActiveWorkout(workoutId: number): Promise<{
        success: boolean;
        workout: {
            source: string;
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
                role: UserRole;
                isActive: boolean;
            };
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
        } | {
            id: number;
            source: string;
            status: WorkoutStatus.COMPLETED;
            finishedAt: Date;
        };
    }>;
    finishActiveCommonWorkout(commonWorkoutId: number): Promise<{
        success: boolean;
        workout: {
            id: number;
            name: string;
            status: CommonWorkoutStatus;
            source: "common";
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
            createdByUser: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
                role: UserRole;
                isActive: boolean;
            };
            participants: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
                role: UserRole;
                isActive: boolean;
            }[];
        } | {
            id: number;
            source: string;
            status: CommonWorkoutStatus.COMPLETED;
            finishedAt: Date;
        };
    }>;
    getExerciseStats(query: AdminExerciseStatsQueryDto): Promise<{
        exercises: {
            exercise: {
                id: number;
                name: string;
            };
            workoutsCount: number;
            setsCount: number;
            averageWeight: number;
            averageReps: number;
        }[];
        limit: number;
    }>;
    listProfaneExercises(): Promise<{
        exercises: {
            id: number;
            name: string;
            description: string;
            isGlobal: boolean;
            createdByUserId: number;
            createdByUser: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
                role: UserRole;
                isActive: boolean;
            };
            matches: {
                field: string;
                word: string;
            }[];
            matchedWords: string[];
        }[];
        total: number;
    }>;
    private findUserOrThrow;
    private normalizePage;
    private normalizeLimit;
    private mapAdminUser;
    private mapWorkoutSummary;
    private mapWorkoutUser;
    private mapCommonWorkoutSummary;
    private roundNullable;
    private mapProfaneExercise;
    private findProfanityMatches;
    private getDurationSeconds;
    private getDurationLabel;
    private getCurrentWarsawMonthRange;
    private zonedDateToUtc;
    private getTimeZoneOffsetMs;
    private getTimeZoneParts;
}
