import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { WorkoutTemplatesService } from './workout-templates.service';

describe('WorkoutTemplatesService', () => {
  let service: WorkoutTemplatesService;
  let templateRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  };
  let templateExerciseRepository: {
    create: jest.Mock;
  };
  let exerciseRepository: {
    find: jest.Mock;
  };

  beforeEach(() => {
    templateRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    templateExerciseRepository = {
      create: jest.fn(),
    };
    exerciseRepository = {
      find: jest.fn(),
    };

    service = new WorkoutTemplatesService(
      templateRepository as never,
      templateExerciseRepository as never,
      exerciseRepository as never,
    );
  });

  it('creates a workout template with an empty exercise list', async () => {
    templateRepository.create.mockImplementation((value) => value);
    templateRepository.save.mockResolvedValue({ id: 11 } as never);
    templateRepository.findOne.mockResolvedValue({
      id: 11,
      name: 'Empty plan',
      exercises: [],
    } as never);

    await expect(
      service.create(7, {
        name: 'Empty plan',
        exercises: [],
      }),
    ).resolves.toEqual({
      id: 11,
      name: 'Empty plan',
      exercises: [],
    });

    expect(exerciseRepository.find).not.toHaveBeenCalled();
    expect(templateRepository.create).toHaveBeenCalledWith({
      name: 'Empty plan',
      userId: 7,
      exercises: [],
    });
  });
});
