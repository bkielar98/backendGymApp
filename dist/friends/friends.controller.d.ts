import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { FriendsService } from './friends.service';
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
