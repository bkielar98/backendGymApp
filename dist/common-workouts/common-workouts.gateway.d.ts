import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { CommonWorkoutParticipant } from '../entities/common-workout-participant.entity';
import { User } from '../entities/user.entity';
export declare class CommonWorkoutsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly userRepository;
    private readonly participantRepository;
    constructor(jwtService: JwtService, userRepository: Repository<User>, participantRepository: Repository<CommonWorkoutParticipant>);
    server: Server;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinCommonWorkout(data: {
        commonWorkoutId: number;
    }, client: Socket): Promise<{
        event: string;
        data: {
            commonWorkoutId: number;
            workoutId: number;
        };
    }>;
    handleJoinWorkout(data: {
        workoutId?: number;
        commonWorkoutId?: number;
    }, client: Socket): Promise<{
        event: string;
        data: {
            commonWorkoutId: number;
            workoutId: number;
        };
    }>;
    emitUpdated(commonWorkoutId: number, payload: unknown): void;
    emitFinished(commonWorkoutId: number, payload: unknown): void;
    emitDiscarded(commonWorkoutId: number, payload: unknown): void;
    hasSubscribers(commonWorkoutId: number): boolean;
    private joinWorkoutRoom;
    private extractToken;
}
