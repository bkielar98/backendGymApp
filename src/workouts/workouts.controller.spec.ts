import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { WorkoutsController } from './workouts.controller';

describe('WorkoutsController', () => {
  let controller: WorkoutsController;
  let workoutsService: Record<string, jest.Mock>;

  beforeEach(() => {
    workoutsService = {
      findAll: jest.fn(),
      findHistory: jest.fn(),
      findOne: jest.fn(),
      findSummary: jest.fn(),
      updateWorkout: jest.fn(),
      removeWorkout: jest.fn(),
    };
    controller = new WorkoutsController(workoutsService as never);
  });

  it('exposes only workout history endpoints', async () => {
    workoutsService.findAll.mockResolvedValue([{ id: 2 }] as never);
    workoutsService.findHistory.mockResolvedValue([{ id: 1 }] as never);
    workoutsService.findOne.mockResolvedValue({ id: 3 } as never);
    workoutsService.findSummary.mockResolvedValue({ id: 3, exerciseCount: 4 } as never);
    workoutsService.updateWorkout.mockResolvedValue({ id: 3, name: 'Edited' } as never);
    workoutsService.removeWorkout.mockResolvedValue({ success: true } as never);

    await expect(controller.findAll({ user: { id: 14 } })).resolves.toEqual([{ id: 2 }]);
    await expect(controller.findHistory({ user: { id: 14 } })).resolves.toEqual([{ id: 1 }]);
    await expect(controller.findOne({ user: { id: 14 } }, 3)).resolves.toEqual({ id: 3 });
    await expect(controller.findSummary({ user: { id: 14 } }, 3)).resolves.toEqual({
      id: 3,
      exerciseCount: 4,
    });
    await expect(
      controller.updateWorkout({ user: { id: 14 } }, 3, { name: 'Edited' }),
    ).resolves.toEqual({ id: 3, name: 'Edited' });
    await expect(controller.removeWorkout({ user: { id: 14 } }, 3)).resolves.toEqual({
      success: true,
    });

    expect(workoutsService.findAll).toHaveBeenCalledWith(14);
    expect(workoutsService.findHistory).toHaveBeenCalledWith(14);
    expect(workoutsService.findOne).toHaveBeenCalledWith(14, 3);
    expect(workoutsService.findSummary).toHaveBeenCalledWith(14, 3);
    expect(workoutsService.updateWorkout).toHaveBeenCalledWith(14, 3, {
      name: 'Edited',
    });
    expect(workoutsService.removeWorkout).toHaveBeenCalledWith(14, 3);
  });
});
