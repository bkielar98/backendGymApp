import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommonWorkoutsService } from './common-workouts.service';

describe('CommonWorkoutsService', () => {
  let service: CommonWorkoutsService;
  let commonWorkoutRepository: {
    delete: jest.Mock;
  };
  let participantSetRepository: {
    update: jest.Mock;
  };
  let workoutRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
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
    emitDiscarded: jest.Mock;
  };
  let personalBestRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(() => {
    commonWorkoutRepository = {
      delete: jest.fn(),
    };
    participantSetRepository = {
      update: jest.fn(),
    };
    workoutRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
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
      emitDiscarded: jest.fn(),
    };
    personalBestRepository = {
      findOne: jest.fn(),
      create: jest.fn((value) => value),
      save: jest.fn(),
    };

    service = new CommonWorkoutsService(
      commonWorkoutRepository as never,
      {} as never,
      {} as never,
      participantSetRepository as never,
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

  it('discards active workout and emits event when room has subscribers', async () => {
    gateway.hasSubscribers.mockReturnValue(true);
    commonWorkoutRepository.delete.mockResolvedValue({ affected: 1 } as never);
    jest.spyOn(service as any, 'getActiveCommonWorkoutEntityForUser').mockResolvedValue({
      id: 44,
      status: 'active',
    } as never);

    await expect(service.removeActiveWorkout(14, 44)).resolves.toEqual({
      success: true,
      discarded: true,
      workoutId: 44,
    });

    expect(commonWorkoutRepository.delete).toHaveBeenCalledWith({
      id: 44,
      status: 'active',
    });
    expect(gateway.emitDiscarded).toHaveBeenCalledWith(44, {
      success: true,
      discarded: true,
      workoutId: 44,
    });
  });

  it('updates workout set and marks it as confirmed', async () => {
    jest.spyOn(service as any, 'getParticipantSetForUser').mockResolvedValue({
      id: 301,
      currentWeight: 80,
      currentReps: 8,
      commonWorkoutExerciseId: 201,
      commonWorkoutExercise: {
        commonWorkoutId: 44,
      },
    } as never);
    jest.spyOn(service as any, 'getWorkoutExerciseResponse').mockResolvedValue({
      workout: { id: 44 },
      exercise: { id: 201 },
    } as never);

    await expect(
      service.updateSet(14, 301, {
        currentWeight: 85,
        currentReps: 6,
      }),
    ).resolves.toEqual({
      workout: { id: 44 },
      exercise: { id: 201 },
    });

    expect(participantSetRepository.update).toHaveBeenCalledWith(301, {
      currentWeight: 85,
      currentReps: 6,
      repMax: expect.any(Number),
      confirmed: true,
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

  it('maps workout index without inline participant set details', () => {
    const payload = (service as any).mapWorkoutIndex({
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
            avatarPath: null,
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
              confirmed: true,
            },
            {
              id: 302,
              participantId: 101,
              setNumber: 2,
              confirmed: false,
            },
          ],
        },
      ],
    });

    expect(payload.totalSets).toBe(2);
    expect(payload.confirmedSets).toBe(1);
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
        setsCount: 2,
        confirmedSets: 1,
      },
    ]);
    expect(payload.exercises[0]).not.toHaveProperty('participants');
  });

  it('builds exercise mutation response with workout index and exercise detail', async () => {
    jest
      .spyOn(service, 'getIndexForUser')
      .mockResolvedValue({ id: 9, exercises: [{ id: 201 }] } as never);
    jest
      .spyOn(service, 'getExerciseByIdForUser')
      .mockResolvedValue({ id: 201, setsCount: 2 } as never);

    await expect((service as any).getWorkoutExerciseResponse(14, 9, 201)).resolves.toEqual({
      workout: { id: 9, exercises: [{ id: 201 }] },
      exercise: { id: 201, setsCount: 2 },
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
      participants: [
        {
          id: 1,
          userId: 15,
          user: { id: 15, email: 'adam@example.com', name: 'Adam', avatarPath: null },
        },
        {
          id: 2,
          userId: 16,
          user: { id: 16, email: 'ewa@example.com', name: 'Ewa', avatarPath: null },
        },
      ],
      exercises: [
        {
          id: 101,
          order: 0,
          exercise: { id: 7, name: 'Bench Press', description: null, muscleGroups: ['chest'] },
          participantSets: [
            {
              id: 1001,
              participantId: 1,
              setNumber: 1,
              currentWeight: 100,
              currentReps: 5,
              repMax: 116,
              confirmed: true,
            },
            {
              id: 1002,
              participantId: 2,
              setNumber: 1,
              currentWeight: 80,
              currentReps: 10,
              repMax: 107,
              confirmed: true,
            },
          ],
        },
      ],
    } as never);

    await expect(service.getSummaryForUser(15, 12)).resolves.toMatchObject({
      id: 12,
      source: 'session',
      mode: 'group',
      exerciseCount: 1,
      totalSets: 2,
      confirmedSets: 2,
      totalVolume: 1300,
      liftedWeight: 1300,
      participants: [
        expect.objectContaining({
          id: 1,
          totalVolume: 500,
          liftedWeight: 500,
        }),
        expect.objectContaining({
          id: 2,
          totalVolume: 800,
          liftedWeight: 800,
        }),
      ],
      exercises: [
        expect.objectContaining({
          id: 101,
          totalVolume: 1300,
          participants: [
            expect.objectContaining({ participantId: 1, totalVolume: 500 }),
            expect.objectContaining({ participantId: 2, totalVolume: 800 }),
          ],
        }),
      ],
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
            {
              id: 2001,
              setNumber: 1,
              currentWeight: 120,
              currentReps: 5,
              repMax: 140,
              confirmed: true,
            },
            {
              id: 2002,
              setNumber: 2,
              currentWeight: 100,
              currentReps: 8,
              repMax: 127,
              confirmed: true,
            },
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
      totalVolume: 1400,
      participants: [
        expect.objectContaining({
          user: expect.objectContaining({ id: 15 }),
          totalVolume: 1400,
        }),
      ],
    });
  });

  it('serves historical workouts under the common workouts service', async () => {
    const historyWorkout = {
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
          exercise: { id: 77, name: 'Squat', description: null, muscleGroups: ['legs'] },
          sets: [
            {
              id: 301,
              setNumber: 1,
              previousWeight: 100,
              previousReps: 5,
              currentWeight: 110,
              currentReps: 5,
              repMax: 128,
              confirmed: true,
            },
          ],
        },
      ],
    };

    workoutRepository.find.mockResolvedValue([historyWorkout] as never);
    workoutRepository.findOne.mockResolvedValue(historyWorkout as never);
    workoutRepository.save.mockResolvedValue({ ...historyWorkout, name: 'Edited' } as never);
    workoutRepository.delete.mockResolvedValue({ affected: 1 } as never);

    await expect(service.getHistoryForUser(15)).resolves.toMatchObject([
      {
        id: 55,
        exerciseCount: 1,
        totalSets: 1,
      },
    ]);
    await expect(service.getHistoricalByIdForUser(15, 55)).resolves.toMatchObject({
      id: 55,
      exercises: [
        {
          id: 201,
          sets: [
            {
              id: 301,
              currentWeight: 110,
            },
          ],
        },
      ],
    });
    await expect(
      service.updateHistoricalWorkout(15, 55, { name: 'Edited' }),
    ).resolves.toMatchObject({
      id: 55,
      exercises: expect.any(Array),
    });
    await expect(service.removeHistoricalWorkout(15, 55)).resolves.toEqual({
      success: true,
      message: 'Workout removed',
    });

    expect(workoutRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 15,
          status: 'completed',
        },
      }),
    );
    expect(workoutRepository.delete).toHaveBeenCalledWith({
      id: 55,
      userId: 15,
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
