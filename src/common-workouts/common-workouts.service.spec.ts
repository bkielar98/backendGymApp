import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CommonWorkoutsService } from './common-workouts.service';

describe('CommonWorkoutsService', () => {
  let service: CommonWorkoutsService;
  let gateway: {
    hasSubscribers: jest.Mock;
    emitUpdated: jest.Mock;
    emitFinished: jest.Mock;
  };

  beforeEach(() => {
    gateway = {
      hasSubscribers: jest.fn(),
      emitUpdated: jest.fn(),
      emitFinished: jest.fn(),
    };

    service = new CommonWorkoutsService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      gateway as never,
    );
  });

  it('does not emit update when room has no subscribers', () => {
    gateway.hasSubscribers.mockReturnValue(false);

    (service as any).emitUpdatedIfSubscribed(14, { id: 14 });

    expect(gateway.hasSubscribers).toHaveBeenCalledWith(14);
    expect(gateway.emitUpdated).not.toHaveBeenCalled();
  });

  it('emits update when room has subscribers', () => {
    gateway.hasSubscribers.mockReturnValue(true);

    (service as any).emitUpdatedIfSubscribed(15, { id: 15, name: 'Leg day' });

    expect(gateway.hasSubscribers).toHaveBeenCalledWith(15);
    expect(gateway.emitUpdated).toHaveBeenCalledWith(15, {
      id: 15,
      name: 'Leg day',
    });
  });

  it('maps lightweight common workout summary', () => {
    const payload = (service as any).mapCommonWorkoutSummary({
      commonWorkout: {
        id: 9,
        name: 'Common workout',
        status: 'active',
        startedAt: new Date('2026-03-31T10:00:00.000Z'),
        finishedAt: null,
        template: null,
        participants: [
          {
            id: 101,
            user: {
              id: 1,
              email: 'user@example.com',
              name: 'User',
              avatarPath: '/uploads/avatars/u.jpg',
            },
          },
        ],
        exercises: [
          {
            id: 201,
            order: 0,
            exercise: {
              id: 44,
              name: 'Bench Press',
              description: 'Chest',
              muscleGroups: ['chest'],
            },
          },
        ],
      },
      setsCountByExerciseId: new Map([[201, 1]]),
    });

    expect(payload.participants).toEqual([
      {
        id: 101,
        user: {
          id: 1,
          email: 'user@example.com',
          name: 'User',
          avatarPath: '/uploads/avatars/u.jpg',
          avatarUrl: '/uploads/avatars/u.jpg',
        },
      },
    ]);
    expect(payload.exercises).toEqual([
      {
        id: 201,
        order: 0,
        exercise: {
          id: 44,
          name: 'Bench Press',
          description: 'Chest',
          muscleGroups: ['chest'],
        },
        setsCount: 1,
      },
    ]);
  });

  it('maps common workout exercise detail separately', () => {
    const payload = (service as any).mapCommonWorkoutExerciseDetail({
      id: 201,
      order: 0,
      exercise: {
        id: 44,
        name: 'Bench Press',
        description: 'Chest',
        muscleGroups: ['chest'],
      },
      commonWorkout: {
        participants: [
          {
            id: 101,
            user: {
              id: 1,
              email: 'user@example.com',
              name: 'User',
              avatarPath: '/uploads/avatars/u.jpg',
            },
          },
        ],
      },
      participantSets: [
        {
          id: 301,
          participantId: 101,
          setNumber: 1,
          previousWeight: 80,
          previousReps: 8,
          currentWeight: 85,
          currentReps: 6,
          repMax: 102,
          confirmed: true,
        },
      ],
    });

    expect(payload).toEqual({
      id: 201,
      order: 0,
      exercise: {
        id: 44,
        name: 'Bench Press',
        description: 'Chest',
        muscleGroups: ['chest'],
      },
      setsCount: 1,
      participants: [
        {
          participantId: 101,
          user: {
            id: 1,
            email: 'user@example.com',
            name: 'User',
            avatarPath: '/uploads/avatars/u.jpg',
            avatarUrl: '/uploads/avatars/u.jpg',
          },
          sets: [
            {
              id: 301,
              setNumber: 1,
              previousWeight: 80,
              previousReps: 8,
              currentWeight: 85,
              currentReps: 6,
              repMax: 102,
              confirmed: true,
            },
          ],
        },
      ],
    });
  });
});
