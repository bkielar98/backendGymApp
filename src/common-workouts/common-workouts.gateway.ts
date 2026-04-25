import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { CommonWorkoutParticipant } from '../entities/common-workout-participant.entity';
import { User } from '../entities/user.entity';

@WebSocketGateway({ namespace: '/common-workouts' })
export class CommonWorkoutsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CommonWorkoutParticipant)
    private readonly participantRepository: Repository<CommonWorkoutParticipant>,
  ) {}

  @WebSocketServer()
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
    return this.joinWorkoutRoom(data.commonWorkoutId, client);
  }

  @SubscribeMessage('joinWorkout')
  async handleJoinWorkout(
    @MessageBody() data: { workoutId?: number; commonWorkoutId?: number },
    @ConnectedSocket() client: Socket,
  ) {
    return this.joinWorkoutRoom(data.workoutId ?? data.commonWorkoutId, client);
  }

  emitUpdated(commonWorkoutId: number, payload: unknown) {
    this.server
      .to(`common-workout-${commonWorkoutId}`)
      .emit('commonWorkoutUpdated', payload);
    this.server.to(`common-workout-${commonWorkoutId}`).emit('workoutUpdated', payload);
  }

  emitFinished(commonWorkoutId: number, payload: unknown) {
    this.server
      .to(`common-workout-${commonWorkoutId}`)
      .emit('commonWorkoutFinished', payload);
    this.server.to(`common-workout-${commonWorkoutId}`).emit('workoutFinished', payload);
  }

  emitDiscarded(commonWorkoutId: number, payload: unknown) {
    this.server
      .to(`common-workout-${commonWorkoutId}`)
      .emit('commonWorkoutDiscarded', payload);
    this.server.to(`common-workout-${commonWorkoutId}`).emit('workoutDiscarded', payload);
  }

  hasSubscribers(commonWorkoutId: number) {
    const room = this.server?.sockets?.adapter?.rooms?.get(
      `common-workout-${commonWorkoutId}`,
    );

    return (room?.size ?? 0) > 0;
  }

  private async joinWorkoutRoom(commonWorkoutId: number | undefined, client: Socket) {
    const userId = client.data.userId;

    if (typeof userId !== 'number') {
      throw new WsException('Unauthorized');
    }

    if (typeof commonWorkoutId !== 'number') {
      throw new WsException('Common workout not found');
    }

    const participant = await this.participantRepository.findOne({
      where: {
        commonWorkoutId,
        userId,
      },
    });

    if (!participant) {
      throw new WsException('Common workout not found');
    }

    client.join(`common-workout-${commonWorkoutId}`);
    return { event: 'joined', data: { commonWorkoutId, workoutId: commonWorkoutId } };
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
