"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const friendship_entity_1 = require("../entities/friendship.entity");
const user_entity_1 = require("../entities/user.entity");
const user_body_measurement_entry_entity_1 = require("../entities/user-body-measurement-entry.entity");
const user_weight_entry_entity_1 = require("../entities/user-weight-entry.entity");
const workout_entity_1 = require("../entities/workout.entity");
const common_workout_entity_1 = require("../entities/common-workout.entity");
const common_workout_participant_entity_1 = require("../entities/common-workout-participant.entity");
const common_workouts_service_1 = require("../common-workouts/common-workouts.service");
let FriendsService = class FriendsService {
    constructor(friendshipRepository, userRepository, weightEntryRepository, bodyMeasurementEntryRepository, workoutRepository, commonWorkoutParticipantRepository, commonWorkoutsService) {
        this.friendshipRepository = friendshipRepository;
        this.userRepository = userRepository;
        this.weightEntryRepository = weightEntryRepository;
        this.bodyMeasurementEntryRepository = bodyMeasurementEntryRepository;
        this.workoutRepository = workoutRepository;
        this.commonWorkoutParticipantRepository = commonWorkoutParticipantRepository;
        this.commonWorkoutsService = commonWorkoutsService;
    }
    async listFriends(userId) {
        const rows = await this.friendshipRepository.find({
            where: [
                { requesterUserId: userId, status: friendship_entity_1.FriendshipStatus.ACCEPTED },
                { receiverUserId: userId, status: friendship_entity_1.FriendshipStatus.ACCEPTED },
            ],
            relations: {
                requesterUser: true,
                receiverUser: true,
            },
            order: {
                updatedAt: "DESC",
            },
        });
        const friendUsers = rows.map((row) => row.requesterUserId === userId ? row.receiverUser : row.requesterUser);
        const activeWorkoutByFriendId = await this.getVisibleActiveWorkoutSummariesForFriends(friendUsers);
        return rows.map((row) => {
            const friend = row.requesterUserId === userId ? row.receiverUser : row.requesterUser;
            return {
                friendshipId: row.id,
                user: this.mapUser(friend),
                friendsSince: row.respondedAt,
                createdAt: row.createdAt,
                activeWorkout: activeWorkoutByFriendId.get(friend.id) ?? null,
            };
        });
    }
    async listIncomingRequests(userId) {
        const rows = await this.friendshipRepository.find({
            where: {
                receiverUserId: userId,
                status: friendship_entity_1.FriendshipStatus.PENDING,
            },
            relations: {
                requesterUser: true,
            },
            order: {
                createdAt: "DESC",
            },
        });
        return rows.map((row) => ({
            id: row.id,
            status: row.status,
            createdAt: row.createdAt,
            user: this.mapUser(row.requesterUser),
        }));
    }
    async listOutgoingRequests(userId) {
        const rows = await this.friendshipRepository.find({
            where: {
                requesterUserId: userId,
                status: friendship_entity_1.FriendshipStatus.PENDING,
            },
            relations: {
                receiverUser: true,
            },
            order: {
                createdAt: "DESC",
            },
        });
        return rows.map((row) => ({
            id: row.id,
            status: row.status,
            createdAt: row.createdAt,
            user: this.mapUser(row.receiverUser),
        }));
    }
    async createRequest(userId, dto) {
        if (userId === dto.targetUserId) {
            throw new common_1.BadRequestException("You cannot send a friend request to yourself");
        }
        const targetUser = await this.userRepository.findOne({
            where: { id: dto.targetUserId },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException("User not found");
        }
        const existing = await this.friendshipRepository.findOne({
            where: [
                {
                    requesterUserId: userId,
                    receiverUserId: dto.targetUserId,
                },
                {
                    requesterUserId: dto.targetUserId,
                    receiverUserId: userId,
                },
            ],
            order: {
                createdAt: "DESC",
            },
        });
        if (existing?.status === friendship_entity_1.FriendshipStatus.PENDING) {
            throw new common_1.BadRequestException("Friend request already exists");
        }
        if (existing?.status === friendship_entity_1.FriendshipStatus.ACCEPTED) {
            throw new common_1.BadRequestException("Users are already friends");
        }
        const request = this.friendshipRepository.create({
            requesterUserId: userId,
            receiverUserId: dto.targetUserId,
            status: friendship_entity_1.FriendshipStatus.PENDING,
            respondedAt: null,
        });
        const saved = await this.friendshipRepository.save(request);
        return {
            id: saved.id,
            status: saved.status,
            createdAt: saved.createdAt,
            user: this.mapUser(targetUser),
        };
    }
    async getFriendProfile(userId, friendUserId) {
        const friend = await this.getAcceptedFriendOrThrow(userId, friendUserId);
        const canShowHistory = !friend.hideWorkoutHistory;
        const [weightEntries, latestBodyMeasurement, workouts] = await Promise.all([
            this.weightEntryRepository.find({
                where: { user: { id: friendUserId } },
                order: { recordedOn: "DESC", id: "DESC" },
            }),
            this.bodyMeasurementEntryRepository.findOne({
                where: { user: { id: friendUserId } },
                order: { recordedOn: "DESC", id: "DESC" },
            }),
            canShowHistory
                ? this.workoutRepository.find({
                    where: {
                        userId: friendUserId,
                        status: workout_entity_1.WorkoutStatus.COMPLETED,
                    },
                    relations: {
                        exercises: {
                            exercise: true,
                            sets: true,
                        },
                    },
                    order: { startedAt: "DESC" },
                })
                : Promise.resolve([]),
        ]);
        const latestWeight = weightEntries[0]?.weight ?? friend.weight ?? null;
        return {
            user: this.mapUser(friend),
            currentWeight: latestWeight,
            weightHistory: weightEntries.map((entry) => ({
                id: entry.id,
                recordedOn: entry.recordedOn,
                weight: entry.weight,
            })),
            bodyMeasurement: latestBodyMeasurement
                ? this.mapBodyMeasurement(latestBodyMeasurement)
                : null,
            workoutStats: this.mapWorkoutStats(workouts),
            recentWorkouts: workouts
                .slice(0, 5)
                .map((workout) => this.mapWorkoutSummary(workout)),
        };
    }
    async getFriendWorkoutHistory(userId, friendUserId, page, limit) {
        const friend = await this.getAcceptedFriendOrThrow(userId, friendUserId);
        if (friend.hideWorkoutHistory) {
            return {
                workouts: [],
                total: 0,
                page: Number.isFinite(page) && page && page > 0 ? page : 1,
                limit: Math.min(Number.isFinite(limit) && limit && limit > 0 ? limit : 20, 100),
            };
        }
        const normalizedPage = Number.isFinite(page) && page && page > 0 ? page : 1;
        const normalizedLimit = Math.min(Number.isFinite(limit) && limit && limit > 0 ? limit : 20, 100);
        const [workouts, total] = await this.workoutRepository.findAndCount({
            where: {
                userId: friendUserId,
                status: workout_entity_1.WorkoutStatus.COMPLETED,
            },
            relations: {
                template: true,
                exercises: {
                    exercise: true,
                    sets: true,
                },
            },
            order: { startedAt: "DESC" },
            skip: (normalizedPage - 1) * normalizedLimit,
            take: normalizedLimit,
        });
        return {
            workouts: workouts.map((workout) => this.mapWorkoutSummary(workout)),
            total,
            page: normalizedPage,
            limit: normalizedLimit,
        };
    }
    async getFriendWorkout(userId, friendUserId, workoutId) {
        const friend = await this.getAcceptedFriendOrThrow(userId, friendUserId);
        const activeParticipant = await this.getFriendActiveCommonWorkoutParticipant(friendUserId, workoutId);
        if (activeParticipant) {
            if (friend.hideActiveWorkout) {
                throw new common_1.NotFoundException("Workout not found");
            }
            return this.markReadOnly(await this.commonWorkoutsService.getIndexForUser(friendUserId, workoutId));
        }
        if (friend.hideWorkoutHistory) {
            throw new common_1.NotFoundException("Workout not found");
        }
        const workout = await this.workoutRepository.findOne({
            where: {
                id: workoutId,
                userId: friendUserId,
                status: workout_entity_1.WorkoutStatus.COMPLETED,
            },
            relations: {
                template: true,
                exercises: {
                    exercise: true,
                    sets: true,
                },
            },
            order: {
                exercises: {
                    order: "ASC",
                    sets: {
                        setNumber: "ASC",
                    },
                },
            },
        });
        if (!workout) {
            throw new common_1.NotFoundException("Workout not found");
        }
        return {
            ...this.mapWorkoutSummary(workout),
            exercises: [...(workout.exercises || [])]
                .sort((left, right) => left.order - right.order)
                .map((exercise) => this.mapWorkoutExercise(exercise)),
        };
    }
    async getFriendWorkoutBlock(userId, friendUserId, workoutId, blockId) {
        const friend = await this.getAcceptedFriendOrThrow(userId, friendUserId);
        const activeParticipant = await this.getFriendActiveCommonWorkoutParticipant(friendUserId, workoutId);
        if (!activeParticipant || friend.hideActiveWorkout) {
            throw new common_1.NotFoundException("Workout block not found");
        }
        return this.markReadOnly(await this.commonWorkoutsService.getBlockForUser(friendUserId, workoutId, blockId));
    }
    async acceptRequest(userId, requestId) {
        const request = await this.friendshipRepository.findOne({
            where: {
                id: requestId,
                receiverUserId: userId,
                status: friendship_entity_1.FriendshipStatus.PENDING,
            },
            relations: {
                requesterUser: true,
                receiverUser: true,
            },
        });
        if (!request) {
            throw new common_1.NotFoundException("Friend request not found");
        }
        request.status = friendship_entity_1.FriendshipStatus.ACCEPTED;
        request.respondedAt = new Date();
        await this.friendshipRepository.save(request);
        return {
            id: request.id,
            status: request.status,
            respondedAt: request.respondedAt,
            users: [
                this.mapUser(request.requesterUser),
                this.mapUser(request.receiverUser),
            ],
        };
    }
    async rejectRequest(userId, requestId) {
        const request = await this.friendshipRepository.findOne({
            where: {
                id: requestId,
                receiverUserId: userId,
                status: friendship_entity_1.FriendshipStatus.PENDING,
            },
        });
        if (!request) {
            throw new common_1.NotFoundException("Friend request not found");
        }
        request.status = friendship_entity_1.FriendshipStatus.REJECTED;
        request.respondedAt = new Date();
        await this.friendshipRepository.save(request);
        return {
            success: true,
            message: "Friend request rejected",
            id: request.id,
            status: request.status,
        };
    }
    async cancelRequest(userId, requestId) {
        const request = await this.friendshipRepository.findOne({
            where: {
                id: requestId,
                requesterUserId: userId,
                status: friendship_entity_1.FriendshipStatus.PENDING,
            },
        });
        if (!request) {
            throw new common_1.NotFoundException("Friend request not found");
        }
        await this.friendshipRepository.delete(request.id);
        return {
            success: true,
            message: "Friend request canceled",
            id: request.id,
        };
    }
    async removeFriend(userId, friendUserId) {
        const friendship = await this.friendshipRepository.findOne({
            where: [
                {
                    requesterUserId: userId,
                    receiverUserId: friendUserId,
                    status: friendship_entity_1.FriendshipStatus.ACCEPTED,
                },
                {
                    requesterUserId: friendUserId,
                    receiverUserId: userId,
                    status: friendship_entity_1.FriendshipStatus.ACCEPTED,
                },
            ],
        });
        if (!friendship) {
            throw new common_1.NotFoundException("Friendship not found");
        }
        await this.friendshipRepository.delete(friendship.id);
        return {
            success: true,
            message: "Friend removed",
            id: friendship.id,
            friendUserId,
        };
    }
    mapUser(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarPath: user.avatarPath ?? null,
            avatarUrl: user.avatarPath ?? null,
        };
    }
    async getVisibleActiveWorkoutSummariesForFriends(friends) {
        const visibleFriendIds = friends
            .filter((friend) => !friend.hideActiveWorkout)
            .map((friend) => friend.id);
        const activeWorkoutByFriendId = new Map();
        if (visibleFriendIds.length === 0) {
            return activeWorkoutByFriendId;
        }
        const participants = await this.commonWorkoutParticipantRepository.find({
            where: {
                userId: (0, typeorm_2.In)(visibleFriendIds),
                commonWorkout: {
                    status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
                },
            },
            relations: {
                commonWorkout: {
                    template: true,
                    participants: true,
                    blocks: {
                        defaultExercise: true,
                    },
                    exercises: {
                        exercise: true,
                        participantSets: true,
                    },
                },
            },
            order: {
                commonWorkout: {
                    startedAt: "DESC",
                },
            },
        });
        for (const participant of participants) {
            if (activeWorkoutByFriendId.has(participant.userId)) {
                continue;
            }
            activeWorkoutByFriendId.set(participant.userId, this.mapActiveCommonWorkoutSummary(participant.commonWorkout));
        }
        return activeWorkoutByFriendId;
    }
    async getFriendActiveCommonWorkoutParticipant(friendUserId, workoutId) {
        return this.commonWorkoutParticipantRepository.findOne({
            where: {
                userId: friendUserId,
                commonWorkoutId: workoutId,
                commonWorkout: {
                    status: common_workout_entity_1.CommonWorkoutStatus.ACTIVE,
                },
            },
            relations: {
                commonWorkout: true,
            },
        });
    }
    async getAcceptedFriendOrThrow(userId, friendUserId) {
        const friendship = await this.friendshipRepository.findOne({
            where: [
                {
                    requesterUserId: userId,
                    receiverUserId: friendUserId,
                    status: friendship_entity_1.FriendshipStatus.ACCEPTED,
                },
                {
                    requesterUserId: friendUserId,
                    receiverUserId: userId,
                    status: friendship_entity_1.FriendshipStatus.ACCEPTED,
                },
            ],
            relations: {
                requesterUser: true,
                receiverUser: true,
            },
        });
        if (!friendship) {
            throw new common_1.NotFoundException("Friendship not found");
        }
        return friendship.requesterUserId === userId
            ? friendship.receiverUser
            : friendship.requesterUser;
    }
    mapBodyMeasurement(entry) {
        return {
            id: entry.id,
            recordedOn: entry.recordedOn,
            neck: entry.neck,
            shoulders: entry.shoulders,
            chest: entry.chest,
            leftBiceps: entry.leftBiceps,
            rightBiceps: entry.rightBiceps,
            leftForearm: entry.leftForearm,
            rightForearm: entry.rightForearm,
            upperAbs: entry.upperAbs,
            waist: entry.waist,
            lowerAbs: entry.lowerAbs,
            hips: entry.hips,
            leftThigh: entry.leftThigh,
            rightThigh: entry.rightThigh,
            leftCalf: entry.leftCalf,
            rightCalf: entry.rightCalf,
        };
    }
    mapWorkoutSummary(workout) {
        const exercises = [...(workout.exercises || [])].sort((left, right) => left.order - right.order);
        const sets = exercises.flatMap((exercise) => exercise.sets || []);
        const performance = this.summarizeSets(sets);
        return {
            id: workout.id,
            name: workout.name,
            status: workout.status,
            startedAt: workout.startedAt,
            finishedAt: workout.finishedAt,
            exerciseCount: exercises.length,
            totalSets: sets.length,
            confirmedSets: sets.filter((set) => set.confirmed).length,
            totalWeight: performance.totalWeight,
            totalReps: performance.totalReps,
            totalVolume: performance.totalVolume,
            liftedWeight: performance.totalVolume,
            bestSet: performance.bestSet,
            exerciseNames: exercises
                .map((exercise) => exercise.exercise?.name)
                .filter((name) => Boolean(name)),
            template: workout.template
                ? {
                    id: workout.template.id,
                    name: workout.template.name,
                }
                : null,
        };
    }
    mapActiveCommonWorkoutSummary(workout) {
        const durationSeconds = this.getDurationSeconds(workout.startedAt, null);
        const exercises = workout.exercises || [];
        const sets = exercises.flatMap((exercise) => exercise.participantSets || []);
        return {
            id: workout.id,
            name: workout.name,
            status: workout.status,
            mode: (workout.participants || []).length <= 1 ? "solo" : "group",
            isSolo: (workout.participants || []).length <= 1,
            participantCount: (workout.participants || []).length,
            startedAt: workout.startedAt,
            finishedAt: workout.finishedAt,
            durationSeconds,
            durationLabel: this.getDurationLabel(durationSeconds),
            blockCount: (workout.blocks || []).length,
            exerciseCount: exercises.length,
            totalSets: sets.length,
            confirmedSets: sets.filter((set) => set.confirmed).length,
            exerciseNames: exercises
                .map((exercise) => exercise.exercise?.name)
                .filter((name) => Boolean(name)),
            template: workout.template
                ? {
                    id: workout.template.id,
                    name: workout.template.name,
                }
                : null,
        };
    }
    getDurationSeconds(startedAt, finishedAt) {
        const start = new Date(startedAt).getTime();
        const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
        return Math.max(0, Math.floor((end - start) / 1000));
    }
    getDurationLabel(durationSeconds) {
        const hours = Math.floor(durationSeconds / 3600);
        const minutes = Math.floor((durationSeconds % 3600) / 60);
        const seconds = durationSeconds % 60;
        if (hours > 0) {
            return `${hours}h ${minutes}min`;
        }
        if (minutes > 0) {
            return `${minutes}min ${seconds}s`;
        }
        return `${seconds}s`;
    }
    mapWorkoutExercise(workoutExercise) {
        const sets = [...(workoutExercise.sets || [])].sort((left, right) => left.setNumber - right.setNumber);
        return {
            id: workoutExercise.id,
            order: workoutExercise.order,
            exercise: workoutExercise.exercise
                ? {
                    id: workoutExercise.exercise.id,
                    name: workoutExercise.exercise.name,
                    description: workoutExercise.exercise.description,
                    muscleGroups: workoutExercise.exercise.muscleGroups,
                }
                : null,
            sets: sets.map((set) => ({
                id: set.id,
                setNumber: set.setNumber,
                previousWeight: set.previousWeight,
                previousReps: set.previousReps,
                currentWeight: set.currentWeight,
                currentReps: set.currentReps,
                repMax: set.repMax,
                confirmed: set.confirmed,
            })),
        };
    }
    mapWorkoutStats(workouts) {
        const exercises = workouts.flatMap((workout) => workout.exercises || []);
        const sets = exercises.flatMap((exercise) => exercise.sets || []);
        const performance = this.summarizeSets(sets);
        return {
            workoutsCount: workouts.length,
            exerciseCount: exercises.length,
            totalSets: sets.length,
            confirmedSets: sets.filter((set) => set.confirmed).length,
            totalWeight: performance.totalWeight,
            totalReps: performance.totalReps,
            totalVolume: performance.totalVolume,
            liftedWeight: performance.totalVolume,
            bestSet: performance.bestSet,
        };
    }
    summarizeSets(sets) {
        const confirmedSets = sets.filter((set) => set.confirmed);
        const totalWeight = confirmedSets.reduce((sum, set) => sum + (typeof set.currentWeight === "number" ? set.currentWeight : 0), 0);
        const totalReps = confirmedSets.reduce((sum, set) => sum + (typeof set.currentReps === "number" ? set.currentReps : 0), 0);
        const totalVolume = confirmedSets.reduce((sum, set) => sum +
            (typeof set.currentWeight === "number" &&
                typeof set.currentReps === "number"
                ? set.currentWeight * set.currentReps
                : 0), 0);
        const bestSet = [...confirmedSets]
            .filter((set) => typeof set.currentWeight === "number" &&
            typeof set.currentReps === "number" &&
            typeof set.repMax === "number")
            .sort((left, right) => {
            const repMaxDifference = (right.repMax ?? 0) - (left.repMax ?? 0);
            if (repMaxDifference !== 0) {
                return repMaxDifference;
            }
            const weightDifference = (right.currentWeight ?? 0) - (left.currentWeight ?? 0);
            if (weightDifference !== 0) {
                return weightDifference;
            }
            return (right.currentReps ?? 0) - (left.currentReps ?? 0);
        })[0];
        return {
            totalWeight,
            totalReps,
            totalVolume,
            bestSet: bestSet
                ? {
                    id: bestSet.id,
                    setNumber: bestSet.setNumber,
                    weight: bestSet.currentWeight,
                    reps: bestSet.currentReps,
                    repMax: bestSet.repMax,
                }
                : null,
        };
    }
    markReadOnly(payload) {
        if (Array.isArray(payload)) {
            return payload.map((item) => this.markReadOnly(item));
        }
        if (!payload || typeof payload !== "object") {
            return payload;
        }
        const result = {};
        for (const [key, value] of Object.entries(payload)) {
            result[key] = this.markReadOnly(value);
        }
        if ("availableActions" in result) {
            result.availableActions = {
                changeExercise: false,
                addSet: false,
                updateOwnSets: false,
                removeOwnSets: false,
            };
        }
        return result;
    }
};
exports.FriendsService = FriendsService;
exports.FriendsService = FriendsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(friendship_entity_1.Friendship)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(user_weight_entry_entity_1.UserWeightEntry)),
    __param(3, (0, typeorm_1.InjectRepository)(user_body_measurement_entry_entity_1.UserBodyMeasurementEntry)),
    __param(4, (0, typeorm_1.InjectRepository)(workout_entity_1.Workout)),
    __param(5, (0, typeorm_1.InjectRepository)(common_workout_participant_entity_1.CommonWorkoutParticipant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        common_workouts_service_1.CommonWorkoutsService])
], FriendsService);
//# sourceMappingURL=friends.service.js.map