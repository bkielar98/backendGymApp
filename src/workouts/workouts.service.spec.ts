import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { WorkoutsService } from './workouts.service';
import { WorkoutStatus } from '../entities/workout.entity';

describe('WorkoutsService', () => {
  let service: WorkoutsService;
  let workoutRepository: {
    findOne: any;
    save: any;
    create: any;
    find: any;
    delete: any;
  };
  let workoutExerciseRepository: {
    save: any;
    create: any;
    findOne: any;
    delete: any;
  };
  let workoutSetRepository: {
    save: any;
    create: any;
    findOne: any;
    find: any;
    delete: any;
  };
  let templateRepository: {
    findOne: any;
  };
  let exerciseRepository: {
    findOne: any;
  };

  beforeEach(() => {
    workoutRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };
    workoutExerciseRepository = {
      save: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };
    workoutSetRepository = {
      save: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };
    templateRepository = {
      findOne: jest.fn(),
    };
    exerciseRepository = {
      findOne: jest.fn(),
    };

    service = new WorkoutsService(
      workoutRepository as never,
      workoutExerciseRepository as never,
      workoutSetRepository as never,
      templateRepository as never,
      exerciseRepository as never,
    );
  });

  it('starts an empty workout when templateId is omitted', async () => {
    const createdWorkout = {
      userId: 15,
      templateId: null,
      template: null,
      name: 'Workout',
      status: WorkoutStatus.ACTIVE,
      startedAt: new Date('2026-03-20T10:00:00.000Z'),
      finishedAt: null,
      exercises: [],
    };
    const savedWorkout = {
      ...createdWorkout,
      id: 1,
    };

    workoutRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(savedWorkout);
    workoutRepository.create.mockReturnValue(createdWorkout);
    workoutRepository.save.mockResolvedValue(savedWorkout);

    const result = await service.startWorkout(15, {});

    expect(templateRepository.findOne).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      id: 1,
      template: null,
      exercises: [],
    });
  });

  it('returns a duration label for finished workouts', async () => {
    const workout = {
      id: 2,
      userId: 15,
      name: 'Upper A',
      status: WorkoutStatus.COMPLETED,
      startedAt: new Date('2026-03-20T10:00:00.000Z'),
      finishedAt: new Date('2026-03-20T12:15:00.000Z'),
      template: null,
      exercises: [],
    };

    workoutRepository.findOne.mockResolvedValue(workout);

    const result = await service.findOne(15, 2);

    expect(result).toMatchObject({
      durationSeconds: 8100,
      durationLabel: '2h 15min',
    });
  });

  it('returns only completed workouts in history with card summary fields', async () => {
    workoutRepository.find.mockResolvedValue([
      {
        id: 7,
        userId: 15,
        name: 'Push Day',
        status: WorkoutStatus.COMPLETED,
        startedAt: new Date('2026-03-20T10:00:00.000Z'),
        finishedAt: new Date('2026-03-20T11:00:00.000Z'),
        template: { id: 4, name: 'Upper 1' },
        exercises: [
          {
            id: 20,
            order: 0,
            exercise: {
              id: 1,
              name: 'Bench Press',
              description: 'Chest exercise',
              muscleGroups: ['chest'],
            },
            sets: [
              { id: 1, setNumber: 1 },
              { id: 2, setNumber: 2 },
            ],
          },
          {
            id: 21,
            order: 1,
            exercise: {
              id: 2,
              name: 'Shoulder Press',
              description: 'Shoulder exercise',
              muscleGroups: ['shoulders'],
            },
            sets: [{ id: 3, setNumber: 1 }],
          },
        ],
      },
    ]);

    const result = await service.findHistory(15);

    expect(workoutRepository.find).toHaveBeenCalledWith({
      where: {
        userId: 15,
        status: WorkoutStatus.COMPLETED,
      },
      order: { startedAt: 'DESC' },
      relations: {
        template: true,
      },
    });
    expect(result).toMatchObject([
      {
        id: 7,
        exerciseCount: 2,
        totalSets: 3,
        exerciseNames: ['Bench Press', 'Shoulder Press'],
      },
    ]);
  });
});
