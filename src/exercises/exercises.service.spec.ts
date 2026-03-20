import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Exercise } from '../entities/exercise.entity';
import { UserRole } from '../entities/user.entity';
import { ExercisesService } from './exercises.service';

describe('ExercisesService', () => {
  let service: ExercisesService;
  let exerciseRepository: {
    create: any;
    save: any;
    find: any;
    findOne: any;
    update: any;
    delete: any;
    createQueryBuilder: any;
  };

  beforeEach(() => {
    exerciseRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    service = new ExercisesService(exerciseRepository as never);
  });

  it('creates admin exercises as global', async () => {
    const created = {
      id: 1,
      name: 'Bench Press',
      isGlobal: true,
      createdByUserId: null,
    };
    exerciseRepository.create.mockReturnValue(created);
    exerciseRepository.save.mockResolvedValue(created);

    await expect(
      service.create(
        { id: 14, role: UserRole.ADMIN } as any,
        { name: 'Bench Press', description: 'desc', muscleGroups: ['chest'] },
      ),
    ).resolves.toMatchObject({
      isGlobal: true,
      createdByUserId: null,
    });
  });

  it('creates regular user exercises as private', async () => {
    const created = {
      id: 2,
      name: 'My Curl',
      isGlobal: false,
      createdByUserId: 15,
    };
    exerciseRepository.create.mockReturnValue(created);
    exerciseRepository.save.mockResolvedValue(created);

    await expect(
      service.create(
        { id: 15, role: UserRole.USER } as any,
        { name: 'My Curl', description: 'desc', muscleGroups: ['biceps'] },
      ),
    ).resolves.toMatchObject({
      isGlobal: false,
      createdByUserId: 15,
    });
  });

  it('hides private exercises from other users', async () => {
    const privateExercise = {
      id: 10,
      name: 'Private Exercise',
      isGlobal: false,
      createdByUserId: 15,
    } as Exercise;
    exerciseRepository.findOne.mockResolvedValue(privateExercise);

    await expect(
      service.findOne({ id: 16, role: UserRole.USER } as any, 10),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns custom exercises only for the owner', async () => {
    const items = [{ id: 10, name: 'Private Exercise', createdByUserId: 15 }];
    exerciseRepository.find.mockResolvedValue(items);

    await expect(
      service.findCustom({ id: 15, role: UserRole.USER } as any),
    ).resolves.toEqual(items);
    expect(exerciseRepository.find).toHaveBeenCalledWith({
      where: {
        isGlobal: false,
        createdByUserId: 15,
      },
      order: {
        name: 'ASC',
      },
    });
  });
});
