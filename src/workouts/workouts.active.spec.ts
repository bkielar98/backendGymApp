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
});
