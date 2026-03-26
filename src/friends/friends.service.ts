import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship, FriendshipStatus } from '../entities/friendship.entity';
import { User } from '../entities/user.entity';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async listFriends(userId: number) {
    const rows = await this.friendshipRepository.find({
      where: [
        { requesterUserId: userId, status: FriendshipStatus.ACCEPTED },
        { receiverUserId: userId, status: FriendshipStatus.ACCEPTED },
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
      const friend =
        row.requesterUserId === userId ? row.receiverUser : row.requesterUser;

      return {
        friendshipId: row.id,
        user: this.mapUser(friend),
        friendsSince: row.respondedAt,
        createdAt: row.createdAt,
      };
    });
  }

  async listIncomingRequests(userId: number) {
    const rows = await this.friendshipRepository.find({
      where: {
        receiverUserId: userId,
        status: FriendshipStatus.PENDING,
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

  async listOutgoingRequests(userId: number) {
    const rows = await this.friendshipRepository.find({
      where: {
        requesterUserId: userId,
        status: FriendshipStatus.PENDING,
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

  async createRequest(userId: number, dto: CreateFriendRequestDto) {
    if (userId === dto.targetUserId) {
      throw new BadRequestException('You cannot send a friend request to yourself');
    }

    const targetUser = await this.userRepository.findOne({
      where: { id: dto.targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
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

    if (existing?.status === FriendshipStatus.PENDING) {
      throw new BadRequestException('Friend request already exists');
    }

    if (existing?.status === FriendshipStatus.ACCEPTED) {
      throw new BadRequestException('Users are already friends');
    }

    const request = this.friendshipRepository.create({
      requesterUserId: userId,
      receiverUserId: dto.targetUserId,
      status: FriendshipStatus.PENDING,
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

  async acceptRequest(userId: number, requestId: number) {
    const request = await this.friendshipRepository.findOne({
      where: {
        id: requestId,
        receiverUserId: userId,
        status: FriendshipStatus.PENDING,
      },
      relations: {
        requesterUser: true,
        receiverUser: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    request.status = FriendshipStatus.ACCEPTED;
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

  async rejectRequest(userId: number, requestId: number) {
    const request = await this.friendshipRepository.findOne({
      where: {
        id: requestId,
        receiverUserId: userId,
        status: FriendshipStatus.PENDING,
      },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    request.status = FriendshipStatus.REJECTED;
    request.respondedAt = new Date();
    await this.friendshipRepository.save(request);

    return {
      success: true,
      message: 'Friend request rejected',
      id: request.id,
      status: request.status,
    };
  }

  async cancelRequest(userId: number, requestId: number) {
    const request = await this.friendshipRepository.findOne({
      where: {
        id: requestId,
        requesterUserId: userId,
        status: FriendshipStatus.PENDING,
      },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    await this.friendshipRepository.delete(request.id);

    return {
      success: true,
      message: 'Friend request canceled',
      id: request.id,
    };
  }

  async removeFriend(userId: number, friendUserId: number) {
    const friendship = await this.friendshipRepository.findOne({
      where: [
        {
          requesterUserId: userId,
          receiverUserId: friendUserId,
          status: FriendshipStatus.ACCEPTED,
        },
        {
          requesterUserId: friendUserId,
          receiverUserId: userId,
          status: FriendshipStatus.ACCEPTED,
        },
      ],
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    await this.friendshipRepository.delete(friendship.id);

    return {
      success: true,
      message: 'Friend removed',
      id: friendship.id,
      friendUserId,
    };
  }

  private mapUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarPath: user.avatarPath ?? null,
      avatarUrl: user.avatarPath ?? null,
    };
  }
}
