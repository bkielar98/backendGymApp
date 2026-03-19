import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/gym' })
export class GymGateway implements OnGatewayConnection, OnGatewayDisconnect {
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