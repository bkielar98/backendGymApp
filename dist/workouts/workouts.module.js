"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const workouts_service_1 = require("./workouts.service");
const workouts_controller_1 = require("./workouts.controller");
const workout_entity_1 = require("../entities/workout.entity");
const workout_exercise_entity_1 = require("../entities/workout-exercise.entity");
const workout_set_entity_1 = require("../entities/workout-set.entity");
const workout_template_entity_1 = require("../entities/workout-template.entity");
const exercise_entity_1 = require("../entities/exercise.entity");
let WorkoutsModule = class WorkoutsModule {
};
exports.WorkoutsModule = WorkoutsModule;
exports.WorkoutsModule = WorkoutsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                workout_entity_1.Workout,
                workout_exercise_entity_1.WorkoutExercise,
                workout_set_entity_1.WorkoutSet,
                workout_template_entity_1.WorkoutTemplate,
                exercise_entity_1.Exercise,
            ]),
        ],
        providers: [workouts_service_1.WorkoutsService],
        controllers: [workouts_controller_1.WorkoutsController],
    })
], WorkoutsModule);
//# sourceMappingURL=workouts.module.js.map