"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutTemplatesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const workout_templates_service_1 = require("./workout-templates.service");
const workout_templates_controller_1 = require("./workout-templates.controller");
const workout_template_entity_1 = require("../entities/workout-template.entity");
const workout_template_exercise_entity_1 = require("../entities/workout-template-exercise.entity");
const exercise_entity_1 = require("../entities/exercise.entity");
const workout_template_member_entity_1 = require("../entities/workout-template-member.entity");
const friendship_entity_1 = require("../entities/friendship.entity");
const user_entity_1 = require("../entities/user.entity");
let WorkoutTemplatesModule = class WorkoutTemplatesModule {
};
exports.WorkoutTemplatesModule = WorkoutTemplatesModule;
exports.WorkoutTemplatesModule = WorkoutTemplatesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                workout_template_entity_1.WorkoutTemplate,
                workout_template_exercise_entity_1.WorkoutTemplateExercise,
                workout_template_member_entity_1.WorkoutTemplateMember,
                exercise_entity_1.Exercise,
                friendship_entity_1.Friendship,
                user_entity_1.User,
            ]),
        ],
        providers: [workout_templates_service_1.WorkoutTemplatesService],
        controllers: [workout_templates_controller_1.WorkoutTemplatesController],
    })
], WorkoutTemplatesModule);
//# sourceMappingURL=workout-templates.module.js.map