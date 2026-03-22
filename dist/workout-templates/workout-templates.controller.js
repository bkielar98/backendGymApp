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
exports.WorkoutTemplatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const add_workout_template_exercise_dto_1 = require("./dto/add-workout-template-exercise.dto");
const change_workout_template_exercise_position_dto_1 = require("./dto/change-workout-template-exercise-position.dto");
const change_workout_template_exercise_sets_dto_1 = require("./dto/change-workout-template-exercise-sets.dto");
const change_workout_template_exercise_dto_1 = require("./dto/change-workout-template-exercise.dto");
const create_workout_template_dto_1 = require("./dto/create-workout-template.dto");
const update_workout_template_dto_1 = require("./dto/update-workout-template.dto");
const workout_templates_service_1 = require("./workout-templates.service");
let WorkoutTemplatesController = class WorkoutTemplatesController {
    constructor(workoutTemplatesService) {
        this.workoutTemplatesService = workoutTemplatesService;
    }
    async create(req, createDto) {
        return this.workoutTemplatesService.create(req.user.id, createDto);
    }
    async findAll(req) {
        return this.workoutTemplatesService.findAll(req.user.id);
    }
    async findOne(req, id) {
        return this.workoutTemplatesService.findOne(req.user.id, id);
    }
    async update(req, id, updateDto) {
        return this.workoutTemplatesService.update(req.user.id, id, updateDto);
    }
    async patch(req, id, updateDto) {
        return this.workoutTemplatesService.update(req.user.id, id, updateDto);
    }
    async addExercise(req, id, dto) {
        return this.workoutTemplatesService.addExercise(req.user.id, id, dto);
    }
    async changeExercisePosition(req, id, exerciseEntryId, dto) {
        return this.workoutTemplatesService.changeExercisePosition(req.user.id, id, exerciseEntryId, dto.order);
    }
    async changeExercise(req, id, exerciseEntryId, dto) {
        return this.workoutTemplatesService.changeExercise(req.user.id, id, exerciseEntryId, dto.exerciseId);
    }
    async changeExerciseSetsCount(req, id, exerciseEntryId, dto) {
        return this.workoutTemplatesService.changeExerciseSetsCount(req.user.id, id, exerciseEntryId, dto.setsCount);
    }
    async removeExercise(req, id, exerciseEntryId) {
        return this.workoutTemplatesService.removeExercise(req.user.id, id, exerciseEntryId);
    }
    remove(req, id) {
        return this.workoutTemplatesService.remove(req.user.id, id);
    }
};
exports.WorkoutTemplatesController = WorkoutTemplatesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_workout_template_dto_1.CreateWorkoutTemplateDto]),
    __metadata("design:returntype", Promise)
], WorkoutTemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkoutTemplatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], WorkoutTemplatesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_workout_template_dto_1.UpdateWorkoutTemplateDto]),
    __metadata("design:returntype", Promise)
], WorkoutTemplatesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_workout_template_dto_1.UpdateWorkoutTemplateDto]),
    __metadata("design:returntype", Promise)
], WorkoutTemplatesController.prototype, "patch", null);
__decorate([
    (0, common_1.Post)(':id/exercises'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, add_workout_template_exercise_dto_1.AddWorkoutTemplateExerciseDto]),
    __metadata("design:returntype", Promise)
], WorkoutTemplatesController.prototype, "addExercise", null);
__decorate([
    (0, common_1.Patch)(':id/exercises/:exerciseEntryId/position'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('exerciseEntryId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, change_workout_template_exercise_position_dto_1.ChangeWorkoutTemplateExercisePositionDto]),
    __metadata("design:returntype", Promise)
], WorkoutTemplatesController.prototype, "changeExercisePosition", null);
__decorate([
    (0, common_1.Patch)(':id/exercises/:exerciseEntryId/exercise'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('exerciseEntryId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, change_workout_template_exercise_dto_1.ChangeWorkoutTemplateExerciseDto]),
    __metadata("design:returntype", Promise)
], WorkoutTemplatesController.prototype, "changeExercise", null);
__decorate([
    (0, common_1.Patch)(':id/exercises/:exerciseEntryId/sets-count'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('exerciseEntryId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, change_workout_template_exercise_sets_dto_1.ChangeWorkoutTemplateExerciseSetsDto]),
    __metadata("design:returntype", Promise)
], WorkoutTemplatesController.prototype, "changeExerciseSetsCount", null);
__decorate([
    (0, common_1.Delete)(':id/exercises/:exerciseEntryId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('exerciseEntryId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], WorkoutTemplatesController.prototype, "removeExercise", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], WorkoutTemplatesController.prototype, "remove", null);
exports.WorkoutTemplatesController = WorkoutTemplatesController = __decorate([
    (0, swagger_1.ApiTags)('workout-templates'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('workout-templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [workout_templates_service_1.WorkoutTemplatesService])
], WorkoutTemplatesController);
//# sourceMappingURL=workout-templates.controller.js.map