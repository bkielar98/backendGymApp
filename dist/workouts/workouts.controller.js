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
const workouts_service_1 = require("./workouts.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const start_workout_dto_1 = require("./dto/start-workout.dto");
const update_workout_set_dto_1 = require("./dto/update-workout-set.dto");
const confirm_workout_set_dto_1 = require("./dto/confirm-workout-set.dto");
const swagger_1 = require("@nestjs/swagger");
let WorkoutsController = class WorkoutsController {
    constructor(workoutsService) {
        this.workoutsService = workoutsService;
    }
    startWorkout(req, dto) {
        return this.workoutsService.startWorkout(req.user.id, dto);
    }
    getActiveWorkout(req) {
        return this.workoutsService.getActiveWorkout(req.user.id);
    }
    finishActiveWorkout(req) {
        return this.workoutsService.finishActiveWorkout(req.user.id);
    }
    findAll(req) {
        return this.workoutsService.findAll(req.user.id);
    }
    findOne(req, id) {
        return this.workoutsService.findOne(req.user.id, id);
    }
    updateSet(req, setId, dto) {
        return this.workoutsService.updateSet(req.user.id, setId, dto);
    }
    confirmSet(req, setId, dto) {
        return this.workoutsService.confirmSet(req.user.id, setId, dto);
    }
    addSet(req, workoutExerciseId) {
        return this.workoutsService.addSet(req.user.id, workoutExerciseId);
    }
    removeSet(req, setId) {
        return this.workoutsService.removeSet(req.user.id, setId);
    }
};
exports.WorkoutsController = WorkoutsController;
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, start_workout_dto_1.StartWorkoutDto]),
    __metadata("design:returntype", void 0)
], WorkoutsController.prototype, "startWorkout", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkoutsController.prototype, "getActiveWorkout", null);
__decorate([
    (0, common_1.Post)('finish'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkoutsController.prototype, "finishActiveWorkout", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkoutsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], WorkoutsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('sets/:setId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('setId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_workout_set_dto_1.UpdateWorkoutSetDto]),
    __metadata("design:returntype", void 0)
], WorkoutsController.prototype, "updateSet", null);
__decorate([
    (0, common_1.Patch)('sets/:setId/confirm'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('setId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, confirm_workout_set_dto_1.ConfirmWorkoutSetDto]),
    __metadata("design:returntype", void 0)
], WorkoutsController.prototype, "confirmSet", null);
__decorate([
    (0, common_1.Post)('exercises/:workoutExerciseId/add-set'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('workoutExerciseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], WorkoutsController.prototype, "addSet", null);
__decorate([
    (0, common_1.Delete)('sets/:setId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('setId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], WorkoutsController.prototype, "removeSet", null);
exports.WorkoutsController = WorkoutsController = __decorate([
    (0, swagger_1.ApiTags)('workouts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('workouts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [workouts_service_1.WorkoutsService])
], WorkoutsController);
//# sourceMappingURL=workouts.controller.js.map