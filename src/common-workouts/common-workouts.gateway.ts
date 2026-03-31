import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { CommonWorkoutParticipant } from '../entities/common-workout-participant.entity';
import { User } from '../entities/user.entity';

export class CommonWorkoutsGateway
{
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CommonWorkoutParticipant)
    private readonly participantRepository: Repository<CommonWorkoutParticipant>,
  ) {}

  server: Server;

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        client.disconnect();
        return;
      }

      client.data.userId = user.id;
      console.log('Common workout client connected:', client.id);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Common workout client disconnected:', client.id);
  }

  @SubscribeMessage('joinCommonWorkout')
  async handleJoinCommonWorkout(
    @MessageBody() data: { commonWorkoutId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    if (typeof userId !== 'number') {
      throw new WsException('Unauthorized');
    }

    const participant = await this.participantRepository.findOne({
      where: {
        commonWorkoutId: data.commonWorkoutId,
        userId,
      },
    });

    if (!participant) {
      throw new WsException('Common workout not found');
    }

    client.join(`common-workout-${data.commonWorkoutId}`);
    return { event: 'joined', data: { commonWorkoutId: data.commonWorkoutId } };
  }

  emitUpdated(commonWorkoutId: number, payload: unknown) {
    this.server
      .to(`common-workout-${commonWorkoutId}`)
      .emit('commonWorkoutUpdated', payload);
  }

  emitFinished(commonWorkoutId: number, payload: unknown) {
    this.server
      .to(`common-workout-${commonWorkoutId}`)
      .emit('commonWorkoutFinished', payload);
  }

  hasSubscribers(commonWorkoutId: number) {
    const room = this.server?.sockets?.adapter?.rooms?.get(
      `common-workout-${commonWorkoutId}`,
    );

    return (room?.size ?? 0) > 0;
  }

  private extractToken(client: Socket) {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken.startsWith('Bearer ') ? authToken.slice(7) : authToken;
    }

    const headerToken = client.handshake.headers?.authorization;
    if (typeof headerToken === 'string' && headerToken.startsWith('Bearer ')) {
      return headerToken.slice(7);
    }

    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string' && queryToken.length > 0) {
      return queryToken.startsWith('Bearer ') ? queryToken.slice(7) : queryToken;
    }

    throw new WsException('Missing bearer token');
  }
}
