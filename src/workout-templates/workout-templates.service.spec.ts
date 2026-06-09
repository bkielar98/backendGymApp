import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { WorkoutTemplatesService } from './workout-templates.service';

describe('WorkoutTemplatesService', () => {
  let service: WorkoutTemplatesService;
  let templateRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let templateExerciseRepository: {
    create: jest.Mock;
  };
  let templateMemberRepository: {
    delete: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
  };
  let exerciseRepository: {
    find: jest.Mock;
  };
  let friendshipRepository: {
    find: jest.Mock;
  };
  let userRepository: {
    find: jest.Mock;
  };

  beforeEach(() => {
    templateRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    templateExerciseRepository = {
      create: jest.fn(),
    };
    templateMemberRepository = {
      delete: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };
    exerciseRepository = {
      find: jest.fn(),
    };
    friendshipRepository = {
      find: jest.fn(),
    };
    userRepository = {
      find: jest.fn(),
    };

    service = new WorkoutTemplatesService(
      templateRepository as never,
      templateExerciseRepository as never,
      templateMemberRepository as never,
      exerciseRepository as never,
      friendshipRepository as never,
      userRepository as never,
    );
  });

  it('creates a workout template with an empty exercise list', async () => {
    templateRepository.create.mockImplementation((value) => value);
    templateRepository.save.mockResolvedValue({ id: 11 } as never);
    templateRepository.findOne.mockResolvedValue({
      id: 11,
      name: 'Empty plan',
      userId: 7,
      description: null,
      labels: [],
      startDate: null,
      endDate: null,
      tasks: [],
      isShared: false,
      shareCode: null,
      members: [],
      exercises: [],
    } as never);
    templateRepository.createQueryBuilder.mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id: 11,
        name: 'Empty plan',
        userId: 7,
        description: null,
        labels: [],
        startDate: null,
        endDate: null,
        tasks: [],
        isShared: false,
        shareCode: null,
        members: [],
        exercises: [],
      } as never),
    });

    await expect(
      service.create(7, {
        name: 'Empty plan',
        exercises: [],
      }),
    ).resolves.toEqual({
      id: 11,
      name: 'Empty plan',
      description: null,
      labels: [],
      startDate: null,
      endDate: null,
      tasks: [],
      isShared: false,
      shareCode: null,
      access: 'owner',
      owner: {
        id: 7,
        name: null,
        email: null,
        avatarPath: null,
      },
      members: [],
      exercises: [],
    });

    expect(exerciseRepository.find).not.toHaveBeenCalled();
    expect(templateMemberRepository.delete).not.toHaveBeenCalled();
    expect(templateRepository.create).toHaveBeenCalledWith({
      name: 'Empty plan',
      description: null,
      labels: [],
      startDate: null,
      endDate: null,
      tasks: [],
      isShared: false,
      shareCode: null,
      userId: 7,
      exercises: [],
    });
  });

  it('returns one combined templates list for owner and shared access', async () => {
    const templates = [
      {
        id: 20,
        name: 'My template',
        userId: 7,
        description: null,
        labels: [],
        startDate: null,
        endDate: null,
        tasks: [],
        isShared: false,
        shareCode: null,
        user: { id: 7, name: 'Owner', email: 'owner@example.com', avatarPath: null },
        members: [],
        exercises: [],
      },
      {
        id: 19,
        name: 'Shared template',
        userId: 11,
        description: null,
        labels: [],
        startDate: null,
        endDate: null,
        tasks: [],
        isShared: true,
        shareCode: 'abc',
        user: { id: 11, name: 'Friend', email: 'friend@example.com', avatarPath: null },
        members: [
          {
            userId: 7,
            user: { id: 7, name: 'Owner', email: 'owner@example.com', avatarPath: null },
          },
        ],
        exercises: [],
      },
    ];
    const baseQueryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(2 as never),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getRawMany: jest
        .fn()
        .mockResolvedValue([{ id: 20 }, { id: 19 }] as never),
    };
    const fullQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(templates as never),
    };

    templateRepository.createQueryBuilder
      .mockReturnValueOnce(baseQueryBuilder as never)
      .mockReturnValueOnce(fullQueryBuilder as never);

    await expect(service.findAll(7)).resolves.toEqual({
      templates: [
        {
          id: 20,
          name: 'My template',
          description: null,
          labels: [],
          startDate: null,
          endDate: null,
          tasks: [],
          isShared: false,
          shareCode: null,
          access: 'owner',
          owner: {
            id: 7,
            name: 'Owner',
            email: 'owner@example.com',
            avatarPath: null,
          },
          members: [],
          exercises: [],
        },
        {
          id: 19,
          name: 'Shared template',
          description: null,
          labels: [],
          startDate: null,
          endDate: null,
          tasks: [],
          isShared: true,
          shareCode: null,
          access: 'member',
          owner: {
            id: 11,
            name: 'Friend',
            email: 'friend@example.com',
            avatarPath: null,
          },
          members: [
            {
              id: 7,
              name: 'Owner',
              email: 'owner@example.com',
              avatarPath: null,
            },
          ],
          exercises: [],
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
    });
  });

  it('keeps shared-with-me as a filtered member-only list', async () => {
    const sharedTemplates = [
      {
        id: 19,
        name: 'Shared template',
        userId: 11,
        description: null,
        labels: [],
        startDate: null,
        endDate: null,
        tasks: [],
        isShared: true,
        shareCode: 'abc',
        user: { id: 11, name: 'Friend', email: 'friend@example.com', avatarPath: null },
        members: [
          {
            userId: 7,
            user: { id: 7, name: 'Owner', email: 'owner@example.com', avatarPath: null },
          },
        ],
        exercises: [],
      },
    ];
    const baseQueryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1 as never),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([{ id: 19 }] as never),
    };
    const fullQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(sharedTemplates as never),
    };

    templateRepository.createQueryBuilder
      .mockReturnValueOnce(baseQueryBuilder as never)
      .mockReturnValueOnce(fullQueryBuilder as never);

    await expect(service.findSharedWithMe(7)).resolves.toEqual({
      templates: [
        {
          id: 19,
          name: 'Shared template',
          description: null,
          labels: [],
          startDate: null,
          endDate: null,
          tasks: [],
          isShared: true,
          shareCode: null,
          access: 'member',
          owner: {
            id: 11,
            name: 'Friend',
            email: 'friend@example.com',
            avatarPath: null,
          },
          members: [
            {
              id: 7,
              name: 'Owner',
              email: 'owner@example.com',
              avatarPath: null,
            },
          ],
          exercises: [],
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    });
  });
});
