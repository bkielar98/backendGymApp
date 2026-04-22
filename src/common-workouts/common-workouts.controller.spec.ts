import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CommonWorkoutsController } from './common-workouts.controller';

describe('CommonWorkoutsController', () => {
  let controller: CommonWorkoutsController;
  let service: Record<string, jest.Mock>;

  beforeEach(() => {
    service = {
      getActive: jest.fn(),
      getHistoryForUser: jest.fn(),
      getHistoricalByIdForUser: jest.fn(),
      getHistoricalSummaryForUser: jest.fn(),
      updateHistoricalWorkout: jest.fn(),
      removeHistoricalWorkout: jest.fn(),
      getSummaryForUser: jest.fn(),
      getIndexForUser: jest.fn(),
      getExerciseHistoryForUser: jest.fn(),
      getDashboardStatsForUser: jest.fn(),
    };

    controller = new CommonWorkoutsController(service as never);
  });

  it('exposes summary, exercise history and dashboard stats on workouts api', async () => {
    service.getHistoryForUser.mockResolvedValue([{ id: 11 }] as never);
    service.getHistoricalByIdForUser.mockResolvedValue({ id: 11, exercises: [] } as never);
    service.getHistoricalSummaryForUser.mockResolvedValue({ id: 11, exerciseCount: 2 } as never);
    service.updateHistoricalWorkout.mockResolvedValue({ id: 11, name: 'Edited' } as never);
    service.removeHistoricalWorkout.mockResolvedValue({ success: true } as never);
    service.getSummaryForUser.mockResolvedValue({ id: 12, source: 'history' } as never);
    service.getIndexForUser.mockResolvedValue({ id: 12, exercises: [] } as never);
    service.getExerciseHistoryForUser.mockResolvedValue({
      exercise: { id: 7, name: 'Bench Press' },
      history: [],
    } as never);
    service.getDashboardStatsForUser.mockResolvedValue({
      workoutsCount: 8,
    } as never);

    await expect(controller.findHistory({ user: { id: 14 } })).resolves.toEqual([{ id: 11 }]);
    await expect(controller.findHistoryOne({ user: { id: 14 } }, 11)).resolves.toEqual({
      id: 11,
      exercises: [],
    });
    await expect(controller.findHistorySummary({ user: { id: 14 } }, 11)).resolves.toEqual({
      id: 11,
      exerciseCount: 2,
    });
    await expect(
      controller.updateHistory({ user: { id: 14 } }, 11, { name: 'Edited' }),
    ).resolves.toEqual({
      id: 11,
      name: 'Edited',
    });
    await expect(controller.removeHistory({ user: { id: 14 } }, 11)).resolves.toEqual({
      success: true,
    });
    await expect(controller.findSummary({ user: { id: 14 } }, 12)).resolves.toEqual({
      id: 12,
      source: 'history',
    });
    await expect(controller.findIndex({ user: { id: 14 } }, 12)).resolves.toEqual({
      id: 12,
      exercises: [],
    });
    await expect(controller.findOne({ user: { id: 14 } }, 12)).resolves.toEqual({
      id: 12,
      exercises: [],
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

    expect(service.getHistoryForUser).toHaveBeenCalledWith(14);
    expect(service.getHistoricalByIdForUser).toHaveBeenCalledWith(14, 11);
    expect(service.getHistoricalSummaryForUser).toHaveBeenCalledWith(14, 11);
    expect(service.updateHistoricalWorkout).toHaveBeenCalledWith(14, 11, {
      name: 'Edited',
    });
    expect(service.removeHistoricalWorkout).toHaveBeenCalledWith(14, 11);
    expect(service.getSummaryForUser).toHaveBeenCalledWith(14, 12);
    expect(service.getIndexForUser).toHaveBeenCalledWith(14, 12);
    expect(service.getExerciseHistoryForUser).toHaveBeenCalledWith(14, 7);
    expect(service.getDashboardStatsForUser).toHaveBeenCalledWith(14, {
      dateFrom: '2026-04-01',
      dateTo: '2026-04-30',
    });
  });
});
