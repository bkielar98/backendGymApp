import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CommonWorkoutsService } from './common-workouts.service';

describe('CommonWorkoutsService active state', () => {
  let service: CommonWorkoutsService;
  let participantRepository: {
    findOne: jest.Mock;
  };

  beforeEach(() => {
    participantRepository = {
      findOne: jest.fn(),
    };

    service = new CommonWorkoutsService(
      {} as never,
      participantRepository as never,
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
    );
  });

  it('returns null when there is no active common workout', async () => {
    participantRepository.findOne.mockResolvedValue(null as never);

    await expect(service.getActive(14)).resolves.toBeNull();
  });
});
