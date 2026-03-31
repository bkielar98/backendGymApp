import { SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export class GymGateway {
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('joinGym')
  handleJoinGym(@MessageBody() data: { gymId: number }, @ConnectedSocket() client: Socket) {
    client.join(`gym-${data.gymId}`);
    return { event: 'joined', data: { gymId: data.gymId } };
  }
}
