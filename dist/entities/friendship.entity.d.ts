import { User } from './user.entity';
export declare enum FriendshipStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected"
}
export declare class Friendship {
    id: number;
    requesterUserId: number;
    requesterUser: User;
    receiverUserId: number;
    receiverUser: User;
    status: FriendshipStatus;
    respondedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
