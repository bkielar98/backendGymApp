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
exports.CommonWorkoutsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const common_workouts_service_1 = require("./common-workouts.service");
const start_common_workout_dto_1 = require("./dto/start-common-workout.dto");
const update_common_workout_dto_1 = require("./dto/update-common-workout.dto");
const add_common_workout_exercise_dto_1 = require("./dto/add-common-workout-exercise.dto");
const change_common_workout_exercise_position_dto_1 = require("./dto/change-common-workout-exercise-position.dto");
const change_common_workout_exercise_dto_1 = require("./dto/change-common-workout-exercise.dto");
const update_common_workout_set_dto_1 = require("./dto/update-common-workout-set.dto");
const confirm_common_workout_set_dto_1 = require("./dto/confirm-common-workout-set.dto");
let CommonWorkoutsController = class CommonWorkoutsController {
    constructor(commonWorkoutsService) {
        this.commonWorkoutsService = commonWorkoutsService;
    }
    async start(req, dto) {
        return this.commonWorkoutsService.start(req.user.id, dto);
    }
    async getActive(req) {
        return this.commonWorkoutsService.getActive(req.user.id);
    }
    async findOne(req, id) {
        return this.commonWorkoutsService.getByIdForUser(req.user.id, id);
    }
    async update(req, id, dto) {
        return this.commonWorkoutsService.updateCommonWorkout(req.user.id, id, dto);
    }
    async addExercise(req, id, dto) {
        return this.commonWorkoutsService.addExercise(req.user.id, id, dto);
    }
    async changeExercisePosition(req, id, exerciseId, dto) {
        return this.commonWorkoutsService.changeExercisePosition(req.user.id, id, exerciseId, dto);
    }
    async changeExercise(req, id, exerciseId, dto) {
        return this.commonWorkoutsService.changeExercise(req.user.id, id, exerciseId, dto);
    }
    async removeExercise(req, id, exerciseId) {
        return this.commonWorkoutsService.removeExercise(req.user.id, id, exerciseId);
    }
    async addSet(req, exerciseId) {
        return this.commonWorkoutsService.addSet(req.user.id, exerciseId);
    }
    async removeSet(req, setId) {
        return this.commonWorkoutsService.removeSet(req.user.id, setId);
    }
    async updateSet(req, setId, dto) {
        return this.commonWorkoutsService.updateSet(req.user.id, setId, dto);
    }
    async confirmSet(req, setId, dto) {
        return this.commonWorkoutsService.confirmSet(req.user.id, setId, dto);
    }
    async finish(req, id) {
        return this.commonWorkoutsService.finish(req.user.id, id);
    }
};
exports.CommonWorkoutsController = CommonWorkoutsController;
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, start_common_workout_dto_1.StartCommonWorkoutDto]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "start", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "getActive", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_common_workout_dto_1.UpdateCommonWorkoutDto]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/exercises'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, add_common_workout_exercise_dto_1.AddCommonWorkoutExerciseDto]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "addExercise", null);
__decorate([
    (0, common_1.Patch)(':id/exercises/:exerciseId/position'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('exerciseId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, change_common_workout_exercise_position_dto_1.ChangeCommonWorkoutExercisePositionDto]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "changeExercisePosition", null);
__decorate([
    (0, common_1.Patch)(':id/exercises/:exerciseId/exercise'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('exerciseId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, change_common_workout_exercise_dto_1.ChangeCommonWorkoutExerciseDto]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "changeExercise", null);
__decorate([
    (0, common_1.Delete)(':id/exercises/:exerciseId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('exerciseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "removeExercise", null);
__decorate([
    (0, common_1.Post)('exercises/:exerciseId/add-set'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('exerciseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "addSet", null);
__decorate([
    (0, common_1.Delete)('sets/:setId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('setId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "removeSet", null);
__decorate([
    (0, common_1.Patch)('sets/:setId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('setId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_common_workout_set_dto_1.UpdateCommonWorkoutSetDto]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "updateSet", null);
__decorate([
    (0, common_1.Patch)('sets/:setId/confirm'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('setId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, confirm_common_workout_set_dto_1.ConfirmCommonWorkoutSetDto]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "confirmSet", null);
__decorate([
    (0, common_1.Post)(':id/finish'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "finish", null);
exports.CommonWorkoutsController = CommonWorkoutsController = __decorate([
    (0, swagger_1.ApiTags)('common-workouts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('common-workouts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [common_workouts_service_1.CommonWorkoutsService])
], CommonWorkoutsController);
//# sourceMappingURL=common-workouts.controller.js.map