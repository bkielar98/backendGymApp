import { Repository } from 'typeorm';
import { Friendship, FriendshipStatus } from '../entities/friendship.entity';
import { User } from '../entities/user.entity';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
export declare class FriendsService {
    private friendshipRepository;
    private userRepository;
    constructor(friendshipRepository: Repository<Friendship>, userRepository: Repository<User>);
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
}
