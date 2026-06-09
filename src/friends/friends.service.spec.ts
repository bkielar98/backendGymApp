import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import { FriendsService } from "./friends.service";

describe("FriendsService privacy workout visibility", () => {
  let service: FriendsService;
  let friendshipRepository: { find: jest.Mock };
  let workoutRepository: { findAndCount: jest.Mock };
  let commonWorkoutParticipantRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
  };
  let commonWorkoutsService: {
    getBlockForUser: jest.Mock;
    getIndexForUser: jest.Mock;
  };

  beforeEach(() => {
    friendshipRepository = {
      find: jest.fn(),
    };
    workoutRepository = {
      findAndCount: jest.fn(),
    };
    commonWorkoutParticipantRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };
    commonWorkoutsService = {
      getBlockForUser: jest.fn(),
      getIndexForUser: jest.fn(),
    };

    service = new FriendsService(
      friendshipRepository as never,
      {} as never,
      {} as never,
      {} as never,
      workoutRepository as never,
      commonWorkoutParticipantRepository as never,
      commonWorkoutsService as never,
    );
  });

  it("adds visible active workout summaries to the friends list", async () => {
    const friend = {
      id: 2,
      email: "friend@example.com",
      name: "Friend",
      avatarPath: null,
      hideActiveWorkout: false,
    };
    friendshipRepository.find.mockResolvedValue([
      {
        id: 10,
        requesterUserId: 1,
        receiverUserId: 2,
        receiverUser: friend,
        respondedAt: new Date("2026-06-01T10:00:00.000Z"),
        createdAt: new Date("2026-05-01T10:00:00.000Z"),
      },
    ] as never);
    commonWorkoutParticipantRepository.find.mockResolvedValue([
      {
        userId: 2,
        commonWorkout: {
          id: 44,
          name: "Push",
          status: "active",
          startedAt: new Date("2026-06-09T10:00:00.000Z"),
          finishedAt: null,
          template: null,
          participants: [{ id: 101 }],
          blocks: [{ id: 301 }],
          exercises: [
            {
              exercise: { name: "Bench" },
              participantSets: [{ confirmed: true }, { confirmed: false }],
            },
          ],
        },
      },
    ] as never);

    const result = await service.listFriends(1);

    expect(result[0].activeWorkout).toEqual(
      expect.objectContaining({
        id: 44,
        name: "Push",
        status: "active",
        blockCount: 1,
        totalSets: 2,
        confirmedSets: 1,
        exerciseNames: ["Bench"],
      }),
    );
  });

  it("does not query active workouts for friends who hide active workouts", async () => {
    friendshipRepository.find.mockResolvedValue([
      {
        id: 10,
        requesterUserId: 1,
        receiverUserId: 2,
        receiverUser: {
          id: 2,
          email: "friend@example.com",
          name: "Friend",
          avatarPath: null,
          hideActiveWorkout: true,
        },
        respondedAt: null,
        createdAt: new Date("2026-05-01T10:00:00.000Z"),
      },
    ] as never);

    const result = await service.listFriends(1);

    expect(commonWorkoutParticipantRepository.find).not.toHaveBeenCalled();
    expect(result[0].activeWorkout).toBeNull();
  });

  it("returns friend workout blocks as read-only", async () => {
    jest.spyOn(service as any, "getAcceptedFriendOrThrow").mockResolvedValue({
      id: 2,
      hideActiveWorkout: false,
    } as never);
    commonWorkoutParticipantRepository.findOne.mockResolvedValue({
      userId: 2,
      commonWorkoutId: 44,
    } as never);
    commonWorkoutsService.getBlockForUser.mockResolvedValue({
      workoutId: 44,
      users: [
        {
          availableActions: {
            changeExercise: true,
            addSet: true,
            updateOwnSets: true,
            removeOwnSets: true,
          },
        },
      ],
    } as never);

    const result = await service.getFriendWorkoutBlock(1, 2, 44, 301);

    expect(result.users[0].availableActions).toEqual({
      changeExercise: false,
      addSet: false,
      updateOwnSets: false,
      removeOwnSets: false,
    });
  });

  it("blocks active workout details when the friend hides active workouts", async () => {
    jest.spyOn(service as any, "getAcceptedFriendOrThrow").mockResolvedValue({
      id: 2,
      hideActiveWorkout: true,
    } as never);
    commonWorkoutParticipantRepository.findOne.mockResolvedValue({
      userId: 2,
      commonWorkoutId: 44,
    } as never);

    await expect(
      service.getFriendWorkoutBlock(1, 2, 44, 301),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("returns an empty history when the friend hides workout history", async () => {
    jest.spyOn(service as any, "getAcceptedFriendOrThrow").mockResolvedValue({
      id: 2,
      hideWorkoutHistory: true,
    } as never);

    const result = await service.getFriendWorkoutHistory(1, 2, 1, 20);

    expect(workoutRepository.findAndCount).not.toHaveBeenCalled();
    expect(result).toEqual({
      workouts: [],
      total: 0,
      page: 1,
      limit: 20,
    });
  });
});
