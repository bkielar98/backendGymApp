import { Repository } from "typeorm";
import { Friendship, FriendshipStatus } from "../entities/friendship.entity";
import { User } from "../entities/user.entity";
import { UserBodyMeasurementEntry } from "../entities/user-body-measurement-entry.entity";
import { UserWeightEntry } from "../entities/user-weight-entry.entity";
import { Workout, WorkoutStatus } from "../entities/workout.entity";
import { CommonWorkoutStatus } from "../entities/common-workout.entity";
import { CommonWorkoutParticipant } from "../entities/common-workout-participant.entity";
import { CommonWorkoutsService } from "../common-workouts/common-workouts.service";
import { CreateFriendRequestDto } from "./dto/create-friend-request.dto";
export declare class FriendsService {
    private friendshipRepository;
    private userRepository;
    private weightEntryRepository;
    private bodyMeasurementEntryRepository;
    private workoutRepository;
    private commonWorkoutParticipantRepository;
    private commonWorkoutsService;
    constructor(friendshipRepository: Repository<Friendship>, userRepository: Repository<User>, weightEntryRepository: Repository<UserWeightEntry>, bodyMeasurementEntryRepository: Repository<UserBodyMeasurementEntry>, workoutRepository: Repository<Workout>, commonWorkoutParticipantRepository: Repository<CommonWorkoutParticipant>, commonWorkoutsService: CommonWorkoutsService);
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
        activeWorkout: unknown;
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
            setsCount: number;
            confirmedSets: number;
        }[];
        id: number;
        name: string;
        status: CommonWorkoutStatus;
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
    } | {
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
    getFriendWorkoutBlock(userId: number, friendUserId: number, workoutId: number, blockId: number): Promise<{
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
        workoutId: number;
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
    private getVisibleActiveWorkoutSummariesForFriends;
    private getFriendActiveCommonWorkoutParticipant;
    private getAcceptedFriendOrThrow;
    private mapBodyMeasurement;
    private mapWorkoutSummary;
    private mapActiveCommonWorkoutSummary;
    private getDurationSeconds;
    private getDurationLabel;
    private mapWorkoutExercise;
    private mapWorkoutStats;
    private summarizeSets;
    private markReadOnly;
}
