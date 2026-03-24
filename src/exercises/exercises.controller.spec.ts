import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ExercisesController } from './exercises.controller';

describe('ExercisesController', () => {
  let controller: ExercisesController;
  let exercisesService: {
    create: any;
    findAll: any;
    findCustom: any;
    findHistory: any;
    findOne: any;
    update: any;
    remove: any;
  };

  beforeEach(() => {
    exercisesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findCustom: jest.fn(),
      findHistory: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    controller = new ExercisesController(exercisesService as never);
  });

  it('returns list responses as plain arrays', async () => {
    const items = [{ id: 1, name: 'Bench Press' }];
    exercisesService.findAll.mockResolvedValue(items);

    await expect(controller.findAll({ user: { id: 15 } })).resolves.toEqual(items);
  });

  it('returns custom list responses as plain arrays', async () => {
    const items = [{ id: 2, name: 'My Custom Row' }];
    exercisesService.findCustom.mockResolvedValue(items);

    await expect(controller.findCustom({ user: { id: 15 } })).resolves.toEqual(items);
  });

  it('returns create response directly', async () => {
    const item = { id: 3, name: 'Lat Pulldown' };
    exercisesService.create.mockResolvedValue(item);

    await expect(
      controller.create(
        { user: { id: 15 } },
        { name: 'Lat Pulldown', muscleGroups: ['back'] },
      ),
    ).resolves.toEqual(item);
  });

  it('returns exercise history directly', async () => {
    const history = [
      {
        date: '2026-03-23',
        sets: [{ id: 10, setNumber: 1, currentWeight: 80, currentReps: 8 }],
      },
    ];
    exercisesService.findHistory.mockResolvedValue(history);

    await expect(
      controller.findHistory({ user: { id: 15 } }, '1'),
    ).resolves.toEqual(history);
  });
});
