import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ExercisesController } from './exercises.controller';

describe('ExercisesController', () => {
  let controller: ExercisesController;
  let exercisesService: {
    create: any;
    findAll: any;
    findCustom: any;
    findOne: any;
    update: any;
    remove: any;
  };

  beforeEach(() => {
    exercisesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findCustom: jest.fn(),
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
});
