import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { WsException } from '@nestjs/websockets';
import { CommonWorkoutsGateway } from './common-workouts.gateway';

describe('CommonWorkoutsGateway', () => {
  let gateway: CommonWorkoutsGateway;
  let jwtService: {
    verify: any;
  };
  let userRepository: {
    findOne: any;
  };
  let participantRepository: {
    findOne: any;
  };

  beforeEach(() => {
    jwtService = {
      verify: jest.fn(),
    };
    userRepository = {
      findOne: jest.fn(),
    };
    participantRepository = {
      findOne: jest.fn(),
    };

    gateway = new CommonWorkoutsGateway(
      jwtService as never,
      userRepository as never,
      participantRepository as never,
    );
    gateway.server = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    } as never;
  });

  it('disconnects socket when token is missing', async () => {
    const disconnect = jest.fn();
    const client = {
      id: 'socket-1',
      handshake: {
        auth: {},
        headers: {},
        query: {},
      },
      disconnect,
      data: {},
    };

    await gateway.handleConnection(client as never);

    expect(disconnect).toHaveBeenCalled();
    expect(jwtService.verify).not.toHaveBeenCalled();
  });

  it('disconnects socket when token user does not exist', async () => {
    const disconnect = jest.fn();
    const client = {
      id: 'socket-2',
      handshake: {
        auth: {
          token: 'Bearer token-value',
        },
        headers: {},
        query: {},
      },
      disconnect,
      data: {},
    };

    jwtService.verify.mockReturnValue({ sub: 15 });
    userRepository.findOne.mockResolvedValue(null);

    await gateway.handleConnection(client as never);

    expect(disconnect).toHaveBeenCalled();
  });

  it('joins room only for workout participant', async () => {
    const join = jest.fn();
    const client = {
      data: { userId: 15 },
      join,
    };

    participantRepository.findOne.mockResolvedValue({
      id: 1,
      commonWorkoutId: 5,
      userId: 15,
    });

    const result = await gateway.handleJoinCommonWorkout(
      { commonWorkoutId: 5 },
      client as never,
    );

    expect(participantRepository.findOne).toHaveBeenCalledWith({
      where: {
        commonWorkoutId: 5,
        userId: 15,
      },
    });
    expect(join).toHaveBeenCalledWith('common-workout-5');
    expect(result).toEqual({
      event: 'joined',
      data: { commonWorkoutId: 5 },
    });
  });

  it('rejects joining room for non participant', async () => {
    const client = {
      data: { userId: 16 },
      join: jest.fn(),
    };

    participantRepository.findOne.mockResolvedValue(null);

    await expect(
      gateway.handleJoinCommonWorkout({ commonWorkoutId: 5 }, client as never),
    ).rejects.toBeInstanceOf(WsException);
    expect(client.join).not.toHaveBeenCalled();
  });

  it('reports subscribers only when room exists and has sockets', () => {
    gateway.server = {
      sockets: {
        adapter: {
          rooms: new Map([
            ['common-workout-5', new Set(['socket-1'])],
          ]),
        },
      },
    } as never;

    expect(gateway.hasSubscribers(5)).toBe(true);
    expect(gateway.hasSubscribers(6)).toBe(false);
  });
});
