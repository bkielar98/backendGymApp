import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CommonWorkoutsController } from './common-workouts.controller';

describe('CommonWorkoutsController', () => {
  let controller: CommonWorkoutsController;
  let service: Record<string, jest.Mock>;

  beforeEach(() => {
    service = {
      getActive: jest.fn(),
      getSummaryForUser: jest.fn(),
      getExerciseHistoryForUser: jest.fn(),
      getDashboardStatsForUser: jest.fn(),
    };

    controller = new CommonWorkoutsController(service as never);
  });

  it('exposes summary, exercise history and dashboard stats on workouts api', async () => {
    service.getSummaryForUser.mockResolvedValue({ id: 12, source: 'history' } as never);
    service.getExerciseHistoryForUser.mockResolvedValue({
      exercise: { id: 7, name: 'Bench Press' },
      history: [],
    } as never);
    service.getDashboardStatsForUser.mockResolvedValue({
      workoutsCount: 8,
    } as never);

    await expect(controller.findSummary({ user: { id: 14 } }, 12)).resolves.toEqual({
      id: 12,
      source: 'history',
    });
    await expect(controller.getExerciseHistory({ user: { id: 14 } }, 7)).resolves.toEqual({
      exercise: { id: 7, name: 'Bench Press' },
      history: [],
    });
    await expect(
      controller.getDashboardStats(
        { user: { id: 14 } },
        { dateFrom: '2026-04-01', dateTo: '2026-04-30' },
      ),
    ).resolves.toEqual({
      workoutsCount: 8,
    });

    expect(service.getSummaryForUser).toHaveBeenCalledWith(14, 12);
    expect(service.getExerciseHistoryForUser).toHaveBeenCalledWith(14, 7);
    expect(service.getDashboardStatsForUser).toHaveBeenCalledWith(14, {
      dateFrom: '2026-04-01',
      dateTo: '2026-04-30',
    });
  });
});
