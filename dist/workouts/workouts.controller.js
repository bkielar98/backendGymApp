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
exports.WorkoutsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const add_workout_exercise_dto_1 = require("./dto/add-workout-exercise.dto");
const change_workout_exercise_position_dto_1 = require("./dto/change-workout-exercise-position.dto");
const change_workout_exercise_dto_1 = require("./dto/change-workout-exercise.dto");
const confirm_workout_set_dto_1 = require("./dto/confirm-workout-set.dto");
const start_workout_dto_1 = require("./dto/start-workout.dto");
const update_workout_dto_1 = require("./dto/update-workout.dto");
const update_workout_set_dto_1 = require("./dto/update-workout-set.dto");
const workouts_service_1 = require("./workouts.service");
let WorkoutsController = class WorkoutsController {
    constructor(workoutsService) {
        this.workoutsService = workoutsService;
    }
    async startWorkout(req, dto) {
        const item = await this.workoutsService.startWorkout(req.user.id, dto);
        return {
            item,
        };
    }
    async getActiveWorkout(req) {
        const item = await this.workoutsService.getActiveWorkout(req.user.id);
        return {
            item,
        };
    }
    async finishActiveWorkout(req) {
        const item = await this.workoutsService.finishActiveWorkout(req.user.id);
        return {
            item,
        };
    }
    async findAll(req) {
        const items = await this.workoutsService.findAll(req.user.id);
        return {
            items,
            total: items.length,
        };
    }
    async findHistory(req) {
        const items = await this.workoutsService.findHistory(req.user.id);
        return {
            items,
            total: items.length,
        };
    }
    async findOne(req, id) {
        const item = await this.workoutsService.findOne(req.user.id, id);
        return {
            item,
        };
    }
    async updateWorkout(req, id, dto) {
        const item = await this.workoutsService.updateWorkout(req.user.id, id, dto);
        return {
            item,
        };
    }
    removeWorkout(req, id) {
        return this.workoutsService.removeWorkout(req.user.id, id);
    }
    async addExercise(req, workoutId, dto) {
        const item = await this.workoutsService.addExercise(req.user.id, workoutId, dto);
        return {
            item,
        };
    }
    async changeExercisePosition(req, workoutId, workoutExerciseId, dto) {
        const item = await this.workoutsService.changeExercisePosition(req.user.id, workoutId, workoutExerciseId, dto.order);
        return {
            item,
        };
    }
    async changeExercise(req, workoutId, workoutExerciseId, dto) {
        const item = await this.workoutsService.changeExercise(req.user.id, workoutId, workoutExerciseId, dto.exerciseId);
        return {
            item,
        };
    }
    async removeExercise(req, workoutId, workoutExerciseId) {
        const item = await this.workoutsService.removeExercise(req.user.id, workoutId, workoutExerciseId);
        return {
            item,
        };
    }
    async updateSet(req, setId, dto) {
        const item = await this.workoutsService.updateSet(req.user.id, setId, dto);
        return {
            item,
        };
    }
    async confirmSet(req, setId, dto) {
        const item = await this.workoutsService.confirmSet(req.user.id, setId, dto);
        return {
            item,
        };
    }
    async addSet(req, workoutExerciseId) {
        const item = await this.workoutsService.addSet(req.user.id, workoutExerciseId);
        return {
            item,
        };
    }
    async addSetToExercise(req, workoutId, workoutExerciseId) {
        const item = await this.workoutsService.addSetToWorkoutExercise(req.user.id, workoutId, workoutExerciseId);
        return {
            item,
        };
    }
    async removeSet(req, setId) {
        const item = await this.workoutsService.removeSet(req.user.id, setId);
        return {
            item,
        };
    }
};
exports.WorkoutsController = WorkoutsController;
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, start_workout_dto_1.StartWorkoutDto]),
    __metadata("design:returntype", Promise)
], WorkoutsController.prototype, "startWorkout", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkoutsController.prototype, "getActiveWorkout", null);
__decorate([
    (0, common_1.Post)('finish'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkoutsController.prototype, "finishActiveWorkout", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkoutsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkoutsController.prototype, "findHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], WorkoutsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_workout_dto_1.UpdateWorkoutDto]),
    __metadata("design:returntype", Promise)
], WorkoutsController.prototype, "updateWorkout", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], WorkoutsController.prototype, "removeWorkout", null);
__decorate([
    (0, common_1.Post)(':workoutId/exercises'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('workoutId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, add_workout_exercise_dto_1.AddWorkoutExerciseDto]),
    __metadata("design:returntype", Promise)
], WorkoutsController.prototype, "addExercise", null);
__decorate([
    (0, common_1.Patch)(':workoutId/exercises/:workoutExerciseId/position'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('workoutId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('workoutExerciseId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, change_workout_exercise_position_dto_1.ChangeWorkoutExercisePositionDto]),
    __metadata("design:returntype", Promise)
], WorkoutsController.prototype, "changeExercisePosition", null);
__decorate([
    (0, common_1.Patch)(':workoutId/exercises/:workoutExerciseId/exercise'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('workoutId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('workoutExerciseId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, change_workout_exercise_dto_1.ChangeWorkoutExerciseDto]),
    __metadata("design:returntype", Promise)
], WorkoutsController.prototype, "changeExercise", null);
__decorate([
    (0, common_1.Delete)(':workoutId/exercises/:workoutExerciseId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('workoutId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('workoutExerciseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], WorkoutsController.prototype, "removeExercise", null);
__decorate([
    (0, common_1.Patch)('sets/:setId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('setId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_workout_set_dto_1.UpdateWorkoutSetDto]),
    __metadata("design:returntype", Promise)
], WorkoutsController.prototype, "updateSet", null);
__decorate([
    (0, common_1.Patch)('sets/:setId/confirm'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('setId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, confirm_workout_set_dto_1.ConfirmWorkoutSetDto]),
    __metadata("design:returntype", Promise)
], WorkoutsController.prototype, "confirmSet", null);
__decorate([
    (0, common_1.Post)('exercises/:workoutExerciseId/add-set'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('workoutExerciseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], WorkoutsController.prototype, "addSet", null);
__decorate([
    (0, common_1.Post)(':workoutId/exercises/:workoutExerciseId/sets'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('workoutId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('workoutExerciseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], WorkoutsController.prototype, "addSetToExercise", null);
__decorate([
    (0, common_1.Delete)('sets/:setId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('setId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], WorkoutsController.prototype, "removeSet", null);
exports.WorkoutsController = WorkoutsController = __decorate([
    (0, swagger_1.ApiTags)('workouts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('workouts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [workouts_service_1.WorkoutsService])
], WorkoutsController);
//# sourceMappingURL=workouts.controller.js.map