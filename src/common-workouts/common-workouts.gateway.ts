import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/common-workouts' })
export class CommonWorkoutsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Common workout client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Common workout client disconnected:', client.id);
  }

  @SubscribeMessage('joinCommonWorkout')
  handleJoinCommonWorkout(
    @MessageBody() data: { commonWorkoutId: number },
    @ConnectedSocket() client: Socket,
  ) {
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
}
