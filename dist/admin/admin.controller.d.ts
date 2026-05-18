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
    updateUserStatus(req: AuthenticatedRequest, id: number, dto: AdminUpdateUserStatusDto): Promise<{
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
    resetUserPassword(id: number, dto: AdminResetUserPasswordDto): Promise<{
        success: boolean;
        id: number;
    }>;
    deleteUser(req: AuthenticatedRequest, id: number): Promise<{
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
    listActiveWorkouts(query: AdminListUserWorkoutsQueryDto): Promise<{
        workouts: ({
            source: "solo";
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
                role: import("../entities/user.entity").UserRole;
                isActive: boolean;
            };
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
        } | {
            id: number;
            name: string;
            status: import("../entities/common-workout.entity").CommonWorkoutStatus;
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
                role: import("../entities/user.entity").UserRole;
                isActive: boolean;
            };
            participants: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
                role: import("../entities/user.entity").UserRole;
                isActive: boolean;
            }[];
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    finishActiveWorkout(id: number): Promise<{
        success: boolean;
        workout: {
            source: string;
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
                role: import("../entities/user.entity").UserRole;
                isActive: boolean;
            };
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
        } | {
            id: number;
            source: string;
            status: import("../entities/workout.entity").WorkoutStatus.COMPLETED;
            finishedAt: Date;
        };
    }>;
    finishActiveCommonWorkout(id: number): Promise<{
        success: boolean;
        workout: {
            participants: {
                id: number;
                user: {
                    id: number;
                    email: string;
                    name: string;
                    avatarPath: string;
                    avatarUrl: string;
                };
            }[];
            blocks: {
                id: number;
                order: number;
                status: import("../entities/common-workout-block.entity").CommonWorkoutBlockStatus;
                completedAt: any;
                defaultExercise: any;
                users: {
                    sets?: {
                        id: number;
                        setNumber: number;
                        previousWeight: number;
                        previousReps: number;
                        currentWeight: number;
                        currentReps: number;
                        durationSeconds: number;
                        repMax: number;
                        confirmed: boolean;
                    }[];
                    availableActions?: {
                        changeExercise: boolean;
                        addSet: boolean;
                        updateOwnSets: boolean;
                        removeOwnSets: boolean;
                    };
                    participantId: number;
                    user: {
                        id: number;
                        email: string;
                        name: string;
                        avatarPath: string;
                        avatarUrl: string;
                    };
                    workoutExerciseId: number;
                    exercise: {
                        id: number;
                        name: string;
                        description: string;
                        muscleGroups: string[];
                    };
                    completed: boolean;
                    completedAt: Date;
                    setsCount: number;
                    confirmedSets: number;
                }[];
            }[];
            exercises: {
                id: number;
                workoutExerciseId: number;
                userId: number;
                order: number;
                exerciseId: number;
                exerciseName: string;
                exerciseDescription: string;
                exerciseMuscleGroups: string[];
                sets: {
                    id: number;
                    setNumber: number;
                    previousWeight: number;
                    previousReps: number;
                    currentWeight: number;
                    currentReps: number;
                    durationSeconds: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
            }[];
            id: number;
            name: string;
            status: import("../entities/common-workout.entity").CommonWorkoutStatus;
            mode: string;
            isSolo: boolean;
            participantCount: number;
            startedAt: Date;
            finishedAt: Date;
            durationSeconds: number;
            durationLabel: string;
            blockCount: number;
            exerciseCount: number;
            totalSets: number;
            confirmedSets: number;
            exerciseNames: string[];
            template: {
                id: number;
                name: string;
            };
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
                role: import("../entities/user.entity").UserRole;
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
