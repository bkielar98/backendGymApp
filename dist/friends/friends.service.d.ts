import { Repository } from "typeorm";
import { Friendship, FriendshipStatus } from "../entities/friendship.entity";
import { User } from "../entities/user.entity";
import { UserBodyMeasurementEntry } from "../entities/user-body-measurement-entry.entity";
import { UserWeightEntry } from "../entities/user-weight-entry.entity";
import { Workout, WorkoutStatus } from "../entities/workout.entity";
import { CreateFriendRequestDto } from "./dto/create-friend-request.dto";
export declare class FriendsService {
    private friendshipRepository;
    private userRepository;
    private weightEntryRepository;
    private bodyMeasurementEntryRepository;
    private workoutRepository;
    constructor(friendshipRepository: Repository<Friendship>, userRepository: Repository<User>, weightEntryRepository: Repository<UserWeightEntry>, bodyMeasurementEntryRepository: Repository<UserBodyMeasurementEntry>, workoutRepository: Repository<Workout>);
    listFriends(userId: number): Promise<{
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
    listIncomingRequests(userId: number): Promise<{
        id: number;
        status: FriendshipStatus;
        createdAt: Date;
        user: {
            id: number;
            email: string;
            name: string;
            avatarPath: string;
            avatarUrl: string;
        };
    }[]>;
    listOutgoingRequests(userId: number): Promise<{
        id: number;
        status: FriendshipStatus;
        createdAt: Date;
        user: {
            id: number;
            email: string;
            name: string;
            avatarPath: string;
            avatarUrl: string;
        };
    }[]>;
    createRequest(userId: number, dto: CreateFriendRequestDto): Promise<{
        id: number;
        status: FriendshipStatus;
        createdAt: Date;
        user: {
            id: number;
            email: string;
            name: string;
            avatarPath: string;
            avatarUrl: string;
        };
    }>;
    getFriendProfile(userId: number, friendUserId: number): Promise<{
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
            status: WorkoutStatus;
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
    getFriendWorkoutHistory(userId: number, friendUserId: number, page?: number, limit?: number): Promise<{
        workouts: {
            id: number;
            name: string;
            status: WorkoutStatus;
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
    getFriendWorkout(userId: number, friendUserId: number, workoutId: number): Promise<{
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
        status: WorkoutStatus;
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
    acceptRequest(userId: number, requestId: number): Promise<{
        id: number;
        status: FriendshipStatus.ACCEPTED;
        respondedAt: Date;
        users: {
            id: number;
            email: string;
            name: string;
            avatarPath: string;
            avatarUrl: string;
        }[];
    }>;
    rejectRequest(userId: number, requestId: number): Promise<{
        success: boolean;
        message: string;
        id: number;
        status: FriendshipStatus.REJECTED;
    }>;
    cancelRequest(userId: number, requestId: number): Promise<{
        success: boolean;
        message: string;
        id: number;
    }>;
    removeFriend(userId: number, friendUserId: number): Promise<{
        success: boolean;
        message: string;
        id: number;
        friendUserId: number;
    }>;
    private mapUser;
    private getAcceptedFriendOrThrow;
    private mapBodyMeasurement;
    private mapWorkoutSummary;
    private mapWorkoutExercise;
    private mapWorkoutStats;
    private summarizeSets;
}
