import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Exercise } from '../entities/exercise.entity';
import { UserRole } from '../entities/user.entity';
import { ExercisesService } from './exercises.service';
import { WorkoutStatus } from '../entities/workout.entity';

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
  let workoutExerciseRepository: {
    find: any;
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
    workoutExerciseRepository = {
      find: jest.fn(),
    };

    service = new ExercisesService(
      exerciseRepository as never,
      workoutExerciseRepository as never,
    );
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

  it('returns exercise history grouped by date', async () => {
    exerciseRepository.findOne.mockResolvedValue({
      id: 1,
      name: 'Bench Press',
      isGlobal: true,
      createdByUserId: null,
    });
    workoutExerciseRepository.find.mockResolvedValue([
      {
        id: 30,
        exerciseId: 1,
        workout: {
          id: 6,
          userId: 15,
          status: WorkoutStatus.COMPLETED,
          startedAt: new Date('2026-03-23T09:00:00.000Z'),
          finishedAt: new Date('2026-03-23T10:00:00.000Z'),
        },
        sets: [
          {
            id: 300,
            setNumber: 1,
            previousWeight: 75,
            previousReps: 8,
            currentWeight: 80,
            currentReps: 8,
            repMax: 101.33,
            confirmed: true,
          },
        ],
      },
      {
        id: 29,
        exerciseId: 1,
        workout: {
          id: 5,
          userId: 15,
          status: WorkoutStatus.COMPLETED,
          startedAt: new Date('2026-03-17T09:00:00.000Z'),
          finishedAt: new Date('2026-03-17T10:00:00.000Z'),
        },
        sets: [
          {
            id: 290,
            setNumber: 1,
            previousWeight: 72.5,
            previousReps: 8,
            currentWeight: 77.5,
            currentReps: 8,
            repMax: 98.17,
            confirmed: true,
          },
        ],
      },
    ]);

    await expect(
      service.findHistory({ id: 15, role: UserRole.USER } as any, 1),
    ).resolves.toEqual([
      {
        date: '2026-03-23',
        sets: [
          {
            id: 300,
            setNumber: 1,
            previousWeight: 75,
            previousReps: 8,
            currentWeight: 80,
            currentReps: 8,
            repMax: 101.33,
            confirmed: true,
          },
        ],
      },
      {
        date: '2026-03-17',
        sets: [
          {
            id: 290,
            setNumber: 1,
            previousWeight: 72.5,
            previousReps: 8,
            currentWeight: 77.5,
            currentReps: 8,
            repMax: 98.17,
            confirmed: true,
          },
        ],
      },
    ]);
    expect(workoutExerciseRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        relations: {
          workout: true,
          sets: true,
        },
      }),
    );
  });
});
