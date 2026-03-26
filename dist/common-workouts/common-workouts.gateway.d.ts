import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class CommonWorkoutsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinCommonWorkout(data: {
        commonWorkoutId: number;
    }, client: Socket): {
        event: string;
        data: {
            commonWorkoutId: number;
        };
    };
    emitUpdated(commonWorkoutId: number, payload: unknown): void;
    emitFinished(commonWorkoutId: number, payload: unknown): void;
}
