"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const friendship_entity_1 = require("../entities/friendship.entity");
const user_entity_1 = require("../entities/user.entity");
let FriendsService = class FriendsService {
    constructor(friendshipRepository, userRepository) {
        this.friendshipRepository = friendshipRepository;
        this.userRepository = userRepository;
    }
    async listFriends(userId) {
        const rows = await this.friendshipRepository.find({
            where: [
                { requesterUserId: userId, status: friendship_entity_1.FriendshipStatus.ACCEPTED },
                { receiverUserId: userId, status: friendship_entity_1.FriendshipStatus.ACCEPTED },
            ],
            relations: {
                requesterUser: true,
                receiverUser: true,
            },
            order: {
                updatedAt: 'DESC',
            },
        });
        return rows.map((row) => {
            const friend = row.requesterUserId === userId ? row.receiverUser : row.requesterUser;
            return {
                friendshipId: row.id,
                user: this.mapUser(friend),
                friendsSince: row.respondedAt,
                createdAt: row.createdAt,
            };
        });
    }
    async listIncomingRequests(userId) {
        const rows = await this.friendshipRepository.find({
            where: {
                receiverUserId: userId,
                status: friendship_entity_1.FriendshipStatus.PENDING,
            },
            relations: {
                requesterUser: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });
        return rows.map((row) => ({
            id: row.id,
            status: row.status,
            createdAt: row.createdAt,
            user: this.mapUser(row.requesterUser),
        }));
    }
    async listOutgoingRequests(userId) {
        const rows = await this.friendshipRepository.find({
            where: {
                requesterUserId: userId,
                status: friendship_entity_1.FriendshipStatus.PENDING,
            },
            relations: {
                receiverUser: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });
        return rows.map((row) => ({
            id: row.id,
            status: row.status,
            createdAt: row.createdAt,
            user: this.mapUser(row.receiverUser),
        }));
    }
    async createRequest(userId, dto) {
        if (userId === dto.targetUserId) {
            throw new common_1.BadRequestException('You cannot send a friend request to yourself');
        }
        const targetUser = await this.userRepository.findOne({
            where: { id: dto.targetUserId },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException('User not found');
        }
        const existing = await this.friendshipRepository.findOne({
            where: [
                {
                    requesterUserId: userId,
                    receiverUserId: dto.targetUserId,
                },
                {
                    requesterUserId: dto.targetUserId,
                    receiverUserId: userId,
                },
            ],
            order: {
                createdAt: 'DESC',
            },
        });
        if (existing?.status === friendship_entity_1.FriendshipStatus.PENDING) {
            throw new common_1.BadRequestException('Friend request already exists');
        }
        if (existing?.status === friendship_entity_1.FriendshipStatus.ACCEPTED) {
            throw new common_1.BadRequestException('Users are already friends');
        }
        const request = this.friendshipRepository.create({
            requesterUserId: userId,
            receiverUserId: dto.targetUserId,
            status: friendship_entity_1.FriendshipStatus.PENDING,
            respondedAt: null,
        });
        const saved = await this.friendshipRepository.save(request);
        return {
            id: saved.id,
            status: saved.status,
            createdAt: saved.createdAt,
            user: this.mapUser(targetUser),
        };
    }
    async acceptRequest(userId, requestId) {
        const request = await this.friendshipRepository.findOne({
            where: {
                id: requestId,
                receiverUserId: userId,
                status: friendship_entity_1.FriendshipStatus.PENDING,
            },
            relations: {
                requesterUser: true,
                receiverUser: true,
            },
        });
        if (!request) {
            throw new common_1.NotFoundException('Friend request not found');
        }
        request.status = friendship_entity_1.FriendshipStatus.ACCEPTED;
        request.respondedAt = new Date();
        await this.friendshipRepository.save(request);
        return {
            id: request.id,
            status: request.status,
            respondedAt: request.respondedAt,
            users: [
                this.mapUser(request.requesterUser),
                this.mapUser(request.receiverUser),
            ],
        };
    }
    async rejectRequest(userId, requestId) {
        const request = await this.friendshipRepository.findOne({
            where: {
                id: requestId,
                receiverUserId: userId,
                status: friendship_entity_1.FriendshipStatus.PENDING,
            },
        });
        if (!request) {
            throw new common_1.NotFoundException('Friend request not found');
        }
        request.status = friendship_entity_1.FriendshipStatus.REJECTED;
        request.respondedAt = new Date();
        await this.friendshipRepository.save(request);
        return {
            success: true,
            message: 'Friend request rejected',
            id: request.id,
            status: request.status,
        };
    }
    async cancelRequest(userId, requestId) {
        const request = await this.friendshipRepository.findOne({
            where: {
                id: requestId,
                requesterUserId: userId,
                status: friendship_entity_1.FriendshipStatus.PENDING,
            },
        });
        if (!request) {
            throw new common_1.NotFoundException('Friend request not found');
        }
        await this.friendshipRepository.delete(request.id);
        return {
            success: true,
            message: 'Friend request canceled',
            id: request.id,
        };
    }
    async removeFriend(userId, friendUserId) {
        const friendship = await this.friendshipRepository.findOne({
            where: [
                {
                    requesterUserId: userId,
                    receiverUserId: friendUserId,
                    status: friendship_entity_1.FriendshipStatus.ACCEPTED,
                },
                {
                    requesterUserId: friendUserId,
                    receiverUserId: userId,
                    status: friendship_entity_1.FriendshipStatus.ACCEPTED,
                },
            ],
        });
        if (!friendship) {
            throw new common_1.NotFoundException('Friendship not found');
        }
        await this.friendshipRepository.delete(friendship.id);
        return {
            success: true,
            message: 'Friend removed',
            id: friendship.id,
            friendUserId,
        };
    }
    mapUser(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarPath: user.avatarPath ?? null,
            avatarUrl: user.avatarPath ?? null,
        };
    }
};
exports.FriendsService = FriendsService;
exports.FriendsService = FriendsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(friendship_entity_1.Friendship)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FriendsService);
//# sourceMappingURL=friends.service.js.map