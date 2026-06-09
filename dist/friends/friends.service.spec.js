"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const common_1 = require("@nestjs/common");
const friends_service_1 = require("./friends.service");
(0, globals_1.describe)("FriendsService privacy workout visibility", () => {
    let service;
    let friendshipRepository;
    let workoutRepository;
    let commonWorkoutParticipantRepository;
    let commonWorkoutsService;
    (0, globals_1.beforeEach)(() => {
        friendshipRepository = {
            find: globals_1.jest.fn(),
        };
        workoutRepository = {
            findAndCount: globals_1.jest.fn(),
        };
        commonWorkoutParticipantRepository = {
            find: globals_1.jest.fn(),
            findOne: globals_1.jest.fn(),
        };
        commonWorkoutsService = {
            getBlockForUser: globals_1.jest.fn(),
            getIndexForUser: globals_1.jest.fn(),
        };
        service = new friends_service_1.FriendsService(friendshipRepository, {}, {}, {}, workoutRepository, commonWorkoutParticipantRepository, commonWorkoutsService);
    });
    (0, globals_1.it)("adds visible active workout summaries to the friends list", async () => {
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
        ]);
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
        ]);
        const result = await service.listFriends(1);
        (0, globals_1.expect)(result[0].activeWorkout).toEqual(globals_1.expect.objectContaining({
            id: 44,
            name: "Push",
            status: "active",
            blockCount: 1,
            totalSets: 2,
            confirmedSets: 1,
            exerciseNames: ["Bench"],
        }));
    });
    (0, globals_1.it)("does not query active workouts for friends who hide active workouts", async () => {
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
        ]);
        const result = await service.listFriends(1);
        (0, globals_1.expect)(commonWorkoutParticipantRepository.find).not.toHaveBeenCalled();
        (0, globals_1.expect)(result[0].activeWorkout).toBeNull();
    });
    (0, globals_1.it)("returns friend workout blocks as read-only", async () => {
        globals_1.jest.spyOn(service, "getAcceptedFriendOrThrow").mockResolvedValue({
            id: 2,
            hideActiveWorkout: false,
        });
        commonWorkoutParticipantRepository.findOne.mockResolvedValue({
            userId: 2,
            commonWorkoutId: 44,
        });
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
        });
        const result = await service.getFriendWorkoutBlock(1, 2, 44, 301);
        (0, globals_1.expect)(result.users[0].availableActions).toEqual({
            changeExercise: false,
            addSet: false,
            updateOwnSets: false,
            removeOwnSets: false,
        });
    });
    (0, globals_1.it)("blocks active workout details when the friend hides active workouts", async () => {
        globals_1.jest.spyOn(service, "getAcceptedFriendOrThrow").mockResolvedValue({
            id: 2,
            hideActiveWorkout: true,
        });
        commonWorkoutParticipantRepository.findOne.mockResolvedValue({
            userId: 2,
            commonWorkoutId: 44,
        });
        await (0, globals_1.expect)(service.getFriendWorkoutBlock(1, 2, 44, 301)).rejects.toBeInstanceOf(common_1.NotFoundException);
    });
    (0, globals_1.it)("returns an empty history when the friend hides workout history", async () => {
        globals_1.jest.spyOn(service, "getAcceptedFriendOrThrow").mockResolvedValue({
            id: 2,
            hideWorkoutHistory: true,
        });
        const result = await service.getFriendWorkoutHistory(1, 2, 1, 20);
        (0, globals_1.expect)(workoutRepository.findAndCount).not.toHaveBeenCalled();
        (0, globals_1.expect)(result).toEqual({
            workouts: [],
            total: 0,
            page: 1,
            limit: 20,
        });
    });
});
//# sourceMappingURL=friends.service.spec.js.map