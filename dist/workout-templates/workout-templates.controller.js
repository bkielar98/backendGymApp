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
const workout_templates_service_1 = require("./workout-templates.service");
const create_workout_template_dto_1 = require("./dto/create-workout-template.dto");
const update_workout_template_dto_1 = require("./dto/update-workout-template.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let WorkoutTemplatesController = class WorkoutTemplatesController {
    constructor(workoutTemplatesService) {
        this.workoutTemplatesService = workoutTemplatesService;
    }
    create(req, createDto) {
        return this.workoutTemplatesService.create(req.user.id, createDto);
    }
    findAll(req) {
        return this.workoutTemplatesService.findAll(req.user.id);
    }
    findOne(id) {
        return this.workoutTemplatesService.findOne(+id);
    }
    update(id, updateDto) {
        return this.workoutTemplatesService.update(+id, updateDto);
    }
    remove(id) {
        return this.workoutTemplatesService.remove(+id);
    }
};
exports.WorkoutTemplatesController = WorkoutTemplatesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_workout_template_dto_1.CreateWorkoutTemplateDto]),
    __metadata("design:returntype", void 0)
], WorkoutTemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkoutTemplatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkoutTemplatesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_workout_template_dto_1.UpdateWorkoutTemplateDto]),
    __metadata("design:returntype", void 0)
], WorkoutTemplatesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkoutTemplatesController.prototype, "remove", null);
exports.WorkoutTemplatesController = WorkoutTemplatesController = __decorate([
    (0, common_1.Controller)('workout-templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [workout_templates_service_1.WorkoutTemplatesService])
], WorkoutTemplatesController);
//# sourceMappingURL=workout-templates.controller.js.map