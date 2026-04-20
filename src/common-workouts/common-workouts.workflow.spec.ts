import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CommonWorkoutsService } from './common-workouts.service';
import { CommonWorkoutStatus } from '../entities/common-workout.entity';

describe('CommonWorkoutsService workflow', () => {
  let service: CommonWorkoutsService;
  let commonWorkoutRepository: {
    create: jest.Mock;
    save: jest.Mock;
  };
  let participantRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
  };
  let commonWorkoutExerciseRepository: {
    create: jest.Mock;
    save: jest.Mock;
  };
  let participantSetRepository: {
    create: jest.Mock;
    save: jest.Mock;
  };
  let workoutRepository: {
    find: jest.Mock;
  };
  let templateRepository: {
    findOne: jest.Mock;
  };
  let exerciseRepository: {
    findOne: jest.Mock;
  };
  let userRepository: {
    findBy: jest.Mock;
  };
  let personalBestRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(() => {
    commonWorkoutRepository = {
      create: jest.fn((value) => value),
      save: jest.fn(),
    };
    participantRepository = {
      create: jest.fn((value) => value),
      save: jest.fn(),
      find: jest.fn(),
    };
    commonWorkoutExerciseRepository = {
      create: jest.fn((value) => value),
      save: jest.fn(),
    };
    participantSetRepository = {
      create: jest.fn((value) => value),
      save: jest.fn(),
    };
    workoutRepository = {
      find: jest.fn(),
    };
    templateRepository = {
      findOne: jest.fn(),
    };
    exerciseRepository = {
      findOne: jest.fn(),
    };
    userRepository = {
      findBy: jest.fn(),
    };
    personalBestRepository = {
      findOne: jest.fn(),
      create: jest.fn((value) => value),
      save: jest.fn(),
    };

    service = new CommonWorkoutsService(
      commonWorkoutRepository as never,
      participantRepository as never,
      commonWorkoutExerciseRepository as never,
      participantSetRepository as never,
      workoutRepository as never,
      { create: jest.fn(), save: jest.fn() } as never,
      { create: jest.fn(), save: jest.fn() } as never,
      templateRepository as never,
      exerciseRepository as never,
      userRepository as never,
      personalBestRepository as never,
      {
        hasSubscribers: jest.fn().mockReturnValue(false),
        emitUpdated: jest.fn(),
        emitFinished: jest.fn(),
      } as never,
    );
  });

  it('starts solo workout session from legacy common-workouts flow', async () => {
    const startedAt = new Date('2026-04-20T10:00:00.000Z');
    const savedWorkout = {
      id: 33,
      createdByUserId: 14,
      templateId: 5,
      name: 'Workout',
      status: CommonWorkoutStatus.ACTIVE,
      startedAt,
      finishedAt: null,
      participants: [],
      exercises: [],
    };
    const soloUser = { id: 14, email: 'solo@example.com', name: 'Solo', avatarPath: null };

    commonWorkoutRepository.save.mockResolvedValue(savedWorkout as never);
    templateRepository.findOne.mockResolvedValue({
      id: 5,
      userId: 14,
      name: 'Solo plan',
      exercises: [{ exerciseId: 71, order: 0, setsCount: 2 }],
    } as never);
    userRepository.findBy.mockResolvedValue([soloUser] as never);
    participantRepository.save.mockResolvedValue([
      {
        id: 101,
        commonWorkoutId: 33,
        userId: 14,
        user: soloUser,
      },
    ] as never);
    participantRepository.find
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([
        {
          id: 101,
          commonWorkoutId: 33,
          userId: 14,
        },
      ] as never);
    workoutRepository.find.mockResolvedValue([] as never);
    exerciseRepository.findOne.mockResolvedValue({
      id: 71,
      name: 'Bench Press',
    } as never);
    commonWorkoutExerciseRepository.save.mockResolvedValue({ id: 444 } as never);
    participantSetRepository.save.mockResolvedValue([] as never);
    jest
      .spyOn(service as any, 'getByIdForUser')
      .mockResolvedValue({
        id: 33,
        name: 'Workout',
        mode: 'solo',
        isSolo: true,
        participantCount: 1,
        participants: [{ id: 101, user: { id: 14 } }],
        exercises: [{ id: 444, setsCount: 2 }],
      } as never);
    jest
      .spyOn(service as any, 'getPreviousSetsByUserIdForExercise')
      .mockResolvedValue(new Map([[14, new Map()]]) as never);

    const result = await service.start(14, { templateId: 5 });

    expect(userRepository.findBy).toHaveBeenCalledWith({ id: expect.anything() });
    expect(participantRepository.save).toHaveBeenCalledWith([
      expect.objectContaining({
        commonWorkoutId: 33,
        userId: 14,
      }),
    ]);
    expect(result).toMatchObject({
      id: 33,
      mode: 'solo',
      isSolo: true,
      participantCount: 1,
    });
  });

  it('finishes workout session and creates history for every participant', async () => {
    const commonWorkout = {
      id: 45,
      status: CommonWorkoutStatus.ACTIVE,
      startedAt: new Date('2026-04-20T10:00:00.000Z'),
      finishedAt: null,
      participants: [
        { id: 201, userId: 14 },
        { id: 202, userId: 19 },
      ],
      exercises: [],
    };

    commonWorkoutRepository.save.mockResolvedValue({
      ...commonWorkout,
      status: CommonWorkoutStatus.COMPLETED,
      finishedAt: expect.any(Date),
    } as never);
    jest
      .spyOn(service as any, 'getActiveCommonWorkoutEntityForUser')
      .mockResolvedValue(commonWorkout as never);
    const createHistorySpy = jest
      .spyOn(service as any, 'createIndividualWorkoutFromCommonWorkout')
      .mockResolvedValue(undefined as never);
    jest
      .spyOn(service as any, 'getByIdForUser')
      .mockResolvedValue({ id: 45, status: 'completed' } as never);

    const result = await service.finish(14, 45);

    expect(createHistorySpy).toHaveBeenCalledTimes(2);
    expect(createHistorySpy).toHaveBeenNthCalledWith(1, expect.any(Object), {
      id: 201,
      userId: 14,
    });
    expect(createHistorySpy).toHaveBeenNthCalledWith(2, expect.any(Object), {
      id: 202,
      userId: 19,
    });
    expect(result).toEqual({ id: 45, status: 'completed' });
  });
});
