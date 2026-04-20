import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { WorkoutsService } from './workouts.service';

describe('WorkoutsService active state', () => {
  let service: WorkoutsService;
  let workoutRepository: {
    findOne: jest.Mock;
  };

  beforeEach(() => {
    workoutRepository = {
      findOne: jest.fn(),
    };

    service = new WorkoutsService(
      workoutRepository as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
  });

  it('returns null when there is no active workout', async () => {
    workoutRepository.findOne.mockResolvedValue(null as never);

    await expect(service.getActiveWorkout(14)).resolves.toBeNull();
  });

  it('loads exercises and sets for the active workout response', async () => {
    workoutRepository.findOne.mockResolvedValue({
      id: 9,
      name: 'Solo',
      status: 'active',
      startedAt: new Date('2026-04-14T10:00:00.000Z'),
      finishedAt: null,
      template: null,
      exercises: [
        {
          id: 4,
          order: 0,
          exercise: {
            id: 7,
            name: 'Bench Press',
            description: 'Chest',
            muscleGroups: ['chest'],
          },
          sets: [
            {
              id: 11,
              setNumber: 1,
              previousWeight: 80,
              previousReps: 8,
              currentWeight: null,
              currentReps: null,
              repMax: null,
              confirmed: false,
            },
          ],
        },
      ],
    } as never);

    const result = await service.getActiveWorkout(14);

    expect(workoutRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 14, status: 'active' },
        relations: {
          template: true,
          exercises: {
            exercise: true,
            sets: true,
          },
        },
      }),
    );
    expect(result?.exerciseCount).toBe(1);
    expect(result?.exercises).toHaveLength(1);
    expect(result?.exercises[0].sets).toHaveLength(1);
  });
});
