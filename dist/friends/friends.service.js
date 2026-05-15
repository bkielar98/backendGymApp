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
let FriendsService = class FriendsService {
    constructor(friendshipRepository, userRepository, weightEntryRepository, bodyMeasurementEntryRepository, workoutRepository) {
        this.friendshipRepository = friendshipRepository;
        this.userRepository = userRepository;
        this.weightEntryRepository = weightEntryRepository;
        this.bodyMeasurementEntryRepository = bodyMeasurementEntryRepository;
        this.workoutRepository = workoutRepository;
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
                updatedAt: 'DESC',
            },
        });
        return rows.map((row) => {
            const friend = row.requesterUserId === userId ? row.receiverUser : row.requesterUser;
            return {
                friendshipId: row.id,
                user: this.mapUser(friend),
                friendsSince: row.respondedAt,
                createdAt: row.createdAt,
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
                createdAt: 'DESC',
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
                createdAt: 'DESC',
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
            throw new common_1.BadRequestException('You cannot send a friend request to yourself');
        }
        const targetUser = await this.userRepository.findOne({
            where: { id: dto.targetUserId },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException('User not found');
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
                createdAt: 'DESC',
            },
        });
        if (existing?.status === friendship_entity_1.FriendshipStatus.PENDING) {
            throw new common_1.BadRequestException('Friend request already exists');
        }
        if (existing?.status === friendship_entity_1.FriendshipStatus.ACCEPTED) {
            throw new common_1.BadRequestException('Users are already friends');
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
        const [weightEntries, latestBodyMeasurement, workouts] = await Promise.all([
            this.weightEntryRepository.find({
                where: { user: { id: friendUserId } },
                order: { recordedOn: 'DESC', id: 'DESC' },
            }),
            this.bodyMeasurementEntryRepository.findOne({
                where: { user: { id: friendUserId } },
                order: { recordedOn: 'DESC', id: 'DESC' },
            }),
            this.workoutRepository.find({
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
                order: { startedAt: 'DESC' },
            }),
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
        await this.getAcceptedFriendOrThrow(userId, friendUserId);
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
            order: { startedAt: 'DESC' },
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
        await this.getAcceptedFriendOrThrow(userId, friendUserId);
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
                    order: 'ASC',
                    sets: {
                        setNumber: 'ASC',
                    },
                },
            },
        });
        if (!workout) {
            throw new common_1.NotFoundException('Workout not found');
        }
        return {
            ...this.mapWorkoutSummary(workout),
            exercises: [...(workout.exercises || [])]
                .sort((left, right) => left.order - right.order)
                .map((exercise) => this.mapWorkoutExercise(exercise)),
        };
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
            throw new common_1.NotFoundException('Friend request not found');
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
            throw new common_1.NotFoundException('Friend request not found');
        }
        request.status = friendship_entity_1.FriendshipStatus.REJECTED;
        request.respondedAt = new Date();
        await this.friendshipRepository.save(request);
        return {
            success: true,
            message: 'Friend request rejected',
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
            throw new common_1.NotFoundException('Friend request not found');
        }
        await this.friendshipRepository.delete(request.id);
        return {
            success: true,
            message: 'Friend request canceled',
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
            throw new common_1.NotFoundException('Friendship not found');
        }
        await this.friendshipRepository.delete(friendship.id);
        return {
            success: true,
            message: 'Friend removed',
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
            throw new common_1.NotFoundException('Friendship not found');
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
        const totalWeight = confirmedSets.reduce((sum, set) => sum + (typeof set.currentWeight === 'number' ? set.currentWeight : 0), 0);
        const totalReps = confirmedSets.reduce((sum, set) => sum + (typeof set.currentReps === 'number' ? set.currentReps : 0), 0);
        const totalVolume = confirmedSets.reduce((sum, set) => sum +
            (typeof set.currentWeight === 'number' &&
                typeof set.currentReps === 'number'
                ? set.currentWeight * set.currentReps
                : 0), 0);
        const bestSet = [...confirmedSets]
            .filter((set) => typeof set.currentWeight === 'number' &&
            typeof set.currentReps === 'number' &&
            typeof set.repMax === 'number')
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
};
exports.FriendsService = FriendsService;
exports.FriendsService = FriendsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(friendship_entity_1.Friendship)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(user_weight_entry_entity_1.UserWeightEntry)),
    __param(3, (0, typeorm_1.InjectRepository)(user_body_measurement_entry_entity_1.UserBodyMeasurementEntry)),
    __param(4, (0, typeorm_1.InjectRepository)(workout_entity_1.Workout)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FriendsService);
//# sourceMappingURL=friends.service.js.map