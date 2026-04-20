import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommonWorkoutsService } from './common-workouts.service';

describe('CommonWorkoutsService', () => {
  let service: CommonWorkoutsService;
  let workoutRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
  };
  let workoutExerciseRepository: {
    create: jest.Mock;
    save: jest.Mock;
  };
  let workoutSetRepository: {
    create: jest.Mock;
    save: jest.Mock;
  };
  let gateway: {
    hasSubscribers: jest.Mock;
    emitUpdated: jest.Mock;
    emitFinished: jest.Mock;
  };
  let personalBestRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(() => {
    workoutRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    workoutExerciseRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    workoutSetRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    gateway = {
      hasSubscribers: jest.fn(),
      emitUpdated: jest.fn(),
      emitFinished: jest.fn(),
    };
    personalBestRepository = {
      findOne: jest.fn(),
      create: jest.fn((value) => value),
      save: jest.fn(),
    };

    service = new CommonWorkoutsService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      workoutRepository as never,
      workoutExerciseRepository as never,
      workoutSetRepository as never,
      {} as never,
      {} as never,
      {} as never,
      personalBestRepository as never,
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

  it('maps common workout as a workout with solo metadata and inline exercise details', () => {
    const payload = (service as any).mapWorkout({
      id: 9,
      name: 'Workout',
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
        },
      ],
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
    expect(payload.mode).toBe('solo');
    expect(payload.isSolo).toBe(true);
    expect(payload.participantCount).toBe(1);
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

  it('copies completed common workout exercises into history deterministically', async () => {
    workoutRepository.create.mockImplementation((value) => value);
    workoutRepository.save.mockResolvedValue({
      id: 900,
      userId: 15,
      templateId: null,
      name: 'Workout',
      status: 'completed',
      startedAt: new Date('2026-04-20T10:00:00.000Z'),
      finishedAt: new Date('2026-04-20T11:00:00.000Z'),
      exercises: [],
    } as never);
    workoutExerciseRepository.create.mockImplementation((value) => value);
    workoutExerciseRepository.save
      .mockResolvedValueOnce({ id: 1001 } as never)
      .mockResolvedValueOnce({ id: 1002 } as never);
    workoutSetRepository.create.mockImplementation((value) => value);
    workoutSetRepository.save.mockResolvedValue(undefined as never);
    personalBestRepository.findOne.mockResolvedValue(null as never);
    personalBestRepository.save.mockResolvedValue(undefined as never);

    await (service as any).createIndividualWorkoutFromCommonWorkout(
      {
        templateId: null,
        name: 'Workout',
        startedAt: new Date('2026-04-20T10:00:00.000Z'),
        finishedAt: new Date('2026-04-20T11:00:00.000Z'),
        exercises: [
          {
            exerciseId: 11,
            order: 0,
            participantSets: [
              {
                participantId: 501,
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
          {
            exerciseId: 12,
            order: 1,
            participantSets: [
              {
                participantId: 501,
                setNumber: 1,
                previousWeight: 40,
                previousReps: 10,
                currentWeight: 45,
                currentReps: 8,
                repMax: 57,
                confirmed: true,
              },
            ],
          },
        ],
      },
      {
        id: 501,
        userId: 15,
      },
    );

    expect(workoutExerciseRepository.save).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        workoutId: 900,
        exerciseId: 11,
        order: 0,
      }),
    );
    expect(workoutExerciseRepository.save).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        workoutId: 900,
        exerciseId: 12,
        order: 1,
      }),
    );
    expect(workoutSetRepository.save).toHaveBeenNthCalledWith(1, [
      expect.objectContaining({
        workoutExerciseId: 1001,
        currentWeight: 85,
        currentReps: 6,
      }),
    ]);
    expect(workoutSetRepository.save).toHaveBeenNthCalledWith(2, [
      expect.objectContaining({
        workoutExerciseId: 1002,
        currentWeight: 45,
        currentReps: 8,
      }),
    ]);
    expect(personalBestRepository.save).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        userId: 15,
        exerciseId: 11,
        weight: 85,
        reps: 6,
        repMax: 102,
      }),
    );
  });

  it('builds workout summary for active and historical workout ids', async () => {
    jest.spyOn(service as any, 'getCommonWorkoutEntityForUser').mockResolvedValue({
      id: 12,
      name: 'Workout',
      status: 'active',
      startedAt: new Date('2026-04-20T10:00:00.000Z'),
      finishedAt: null,
      template: null,
      participants: [{ id: 1, userId: 15 }],
      exercises: [
        {
          id: 101,
          order: 0,
          exercise: { name: 'Bench Press' },
          participantSets: [
            { setNumber: 1, confirmed: true },
            { setNumber: 2, confirmed: false },
          ],
        },
      ],
    } as never);

    await expect(service.getSummaryForUser(15, 12)).resolves.toMatchObject({
      id: 12,
      source: 'session',
      mode: 'solo',
      exerciseCount: 1,
      totalSets: 2,
      confirmedSets: 1,
    });

    (service as any).getCommonWorkoutEntityForUser.mockRejectedValueOnce(
      new NotFoundException('Workout not found'),
    );
    workoutRepository.findOne.mockResolvedValue({
      id: 55,
      userId: 15,
      name: 'History workout',
      status: 'completed',
      startedAt: new Date('2026-04-18T10:00:00.000Z'),
      finishedAt: new Date('2026-04-18T11:00:00.000Z'),
      template: null,
      exercises: [
        {
          id: 201,
          order: 0,
          exercise: { id: 77, name: 'Squat' },
          sets: [
            { confirmed: true },
            { confirmed: true },
          ],
        },
      ],
    } as never);

    await expect(service.getSummaryForUser(15, 55)).resolves.toMatchObject({
      id: 55,
      source: 'history',
      mode: 'solo',
      exerciseCount: 1,
      totalSets: 2,
      confirmedSets: 2,
    });
  });

  it('returns dashboard stats with favorite exercise, day and partner', async () => {
    const completedWorkout = {
      id: 400,
      userId: 15,
      status: 'completed',
      startedAt: new Date('2026-04-07T10:00:00.000Z'),
      finishedAt: new Date('2026-04-07T11:00:00.000Z'),
      exercises: [
        {
          exerciseId: 11,
          exercise: { id: 11, name: 'Bench Press' },
          sets: [{ confirmed: true }, { confirmed: true }],
        },
      ],
    };

    workoutRepository.find.mockResolvedValue([completedWorkout] as never);
    const commonWorkoutRepository = (service as any).commonWorkoutRepository;
    commonWorkoutRepository.find = jest.fn().mockResolvedValue([
      {
        startedAt: new Date('2026-04-07T10:00:00.000Z'),
        participants: [
          { userId: 15, user: { id: 15, name: 'Adam' } },
          { userId: 18, user: { id: 18, name: 'Kyzn', avatarPath: '/a.png' } },
        ],
      },
    ] as never);
    personalBestRepository.findOne.mockResolvedValue({
      weight: 90,
      reps: 8,
      repMax: 114,
      achievedAt: new Date('2026-04-07T11:00:00.000Z'),
    } as never);

    await expect(
      service.getDashboardStatsForUser(15, {
        dateFrom: '2026-04-01',
        dateTo: '2026-04-30',
      }),
    ).resolves.toMatchObject({
      workoutsCount: 1,
      favoriteExercise: {
        exercise: {
          id: 11,
          name: 'Bench Press',
        },
      },
      favoriteTrainingDay: {
        day: 'tuesday',
        workoutsCount: 1,
      },
      favoriteTrainingPartner: {
        user: {
          id: 18,
          name: 'Kyzn',
        },
      },
    });
  });

  it('rejects absurdly wide dashboard ranges before hitting repositories', async () => {
    await expect(
      service.getDashboardStatsForUser(15, {
        dateFrom: '2010-01-01',
        dateTo: '2026-04-30',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(workoutRepository.find).not.toHaveBeenCalled();
  });
});
