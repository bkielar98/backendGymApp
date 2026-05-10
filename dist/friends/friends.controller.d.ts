import { CreateFriendRequestDto } from "./dto/create-friend-request.dto";
import { FriendsService } from "./friends.service";
export declare class FriendsController {
    private readonly friendsService;
    constructor(friendsService: FriendsService);
    findAll(req: any): Promise<{
        friendshipId: number;
        user: {
            id: number;
            email: string;
            name: string;
            avatarPath: string;
            avatarUrl: string;
        };
        friendsSince: Date;
        createdAt: Date;
    }[]>;
    findIncoming(req: any): Promise<{
        id: number;
        status: import("../entities/friendship.entity").FriendshipStatus;
        createdAt: Date;
        user: {
            id: number;
            email: string;
            name: string;
            avatarPath: string;
            avatarUrl: string;
        };
    }[]>;
    findOutgoing(req: any): Promise<{
        id: number;
        status: import("../entities/friendship.entity").FriendshipStatus;
        createdAt: Date;
        user: {
            id: number;
            email: string;
            name: string;
            avatarPath: string;
            avatarUrl: string;
        };
    }[]>;
    getFriendProfile(req: any, friendUserId: number): Promise<{
        user: {
            id: number;
            email: string;
            name: string;
            avatarPath: string;
            avatarUrl: string;
        };
        currentWeight: number;
        weightHistory: {
            id: number;
            recordedOn: string;
            weight: number;
        }[];
        bodyMeasurement: {
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
        };
        workoutStats: {
            workoutsCount: number;
            exerciseCount: number;
            totalSets: number;
            confirmedSets: number;
            totalWeight: number;
            totalReps: number;
            totalVolume: number;
            liftedWeight: number;
            bestSet: {
                id: number;
                setNumber: number;
                weight: number;
                reps: number;
                repMax: number;
            };
        };
        recentWorkouts: {
            id: number;
            name: string;
            status: import("../entities/workout.entity").WorkoutStatus;
            startedAt: Date;
            finishedAt: Date;
            exerciseCount: number;
            totalSets: number;
            confirmedSets: number;
            totalWeight: number;
            totalReps: number;
            totalVolume: number;
            liftedWeight: number;
            bestSet: {
                id: number;
                setNumber: number;
                weight: number;
                reps: number;
                repMax: number;
            };
            exerciseNames: string[];
            template: {
                id: number;
                name: string;
            };
        }[];
    }>;
    getFriendWorkoutHistory(req: any, friendUserId: number, page?: string, limit?: string): Promise<{
        workouts: {
            id: number;
            name: string;
            status: import("../entities/workout.entity").WorkoutStatus;
            startedAt: Date;
            finishedAt: Date;
            exerciseCount: number;
            totalSets: number;
            confirmedSets: number;
            totalWeight: number;
            totalReps: number;
            totalVolume: number;
            liftedWeight: number;
            bestSet: {
                id: number;
                setNumber: number;
                weight: number;
                reps: number;
                repMax: number;
            };
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
    getFriendWorkout(req: any, friendUserId: number, workoutId: number): Promise<{
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            sets: {
                id: number;
                setNumber: number;
                previousWeight: number;
                previousReps: number;
                currentWeight: number;
                currentReps: number;
                repMax: number;
                confirmed: boolean;
            }[];
        }[];
        id: number;
        name: string;
        status: import("../entities/workout.entity").WorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        totalWeight: number;
        totalReps: number;
        totalVolume: number;
        liftedWeight: number;
        bestSet: {
            id: number;
            setNumber: number;
            weight: number;
            reps: number;
            repMax: number;
        };
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    createRequest(req: any, dto: CreateFriendRequestDto): Promise<{
        id: number;
        status: import("../entities/friendship.entity").FriendshipStatus;
        createdAt: Date;
        user: {
            id: number;
            email: string;
            name: string;
            avatarPath: string;
            avatarUrl: string;
        };
    }>;
    acceptRequest(req: any, id: number): Promise<{
        id: number;
        status: import("../entities/friendship.entity").FriendshipStatus.ACCEPTED;
        respondedAt: Date;
        users: {
            id: number;
            email: string;
            name: string;
            avatarPath: string;
            avatarUrl: string;
        }[];
    }>;
    rejectRequest(req: any, id: number): Promise<{
        success: boolean;
        message: string;
        id: number;
        status: import("../entities/friendship.entity").FriendshipStatus.REJECTED;
    }>;
    cancelRequest(req: any, id: number): Promise<{
        success: boolean;
        message: string;
        id: number;
    }>;
    removeFriend(req: any, friendUserId: number): Promise<{
        success: boolean;
        message: string;
        id: number;
        friendUserId: number;
    }>;
}
