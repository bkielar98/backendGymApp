"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonWorkoutsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("../auth/auth.module");
const common_workout_entity_1 = require("../entities/common-workout.entity");
const common_workout_participant_entity_1 = require("../entities/common-workout-participant.entity");
const common_workout_exercise_entity_1 = require("../entities/common-workout-exercise.entity");
const common_workout_participant_set_entity_1 = require("../entities/common-workout-participant-set.entity");
const workout_entity_1 = require("../entities/workout.entity");
const workout_exercise_entity_1 = require("../entities/workout-exercise.entity");
const workout_set_entity_1 = require("../entities/workout-set.entity");
const workout_template_entity_1 = require("../entities/workout-template.entity");
const exercise_entity_1 = require("../entities/exercise.entity");
const user_entity_1 = require("../entities/user.entity");
const user_exercise_personal_best_entity_1 = require("../entities/user-exercise-personal-best.entity");
const common_workouts_controller_1 = require("./common-workouts.controller");
const common_workouts_gateway_1 = require("./common-workouts.gateway");
const common_workouts_service_1 = require("./common-workouts.service");
let CommonWorkoutsModule = class CommonWorkoutsModule {
};
exports.CommonWorkoutsModule = CommonWorkoutsModule;
exports.CommonWorkoutsModule = CommonWorkoutsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            typeorm_1.TypeOrmModule.forFeature([
                common_workout_entity_1.CommonWorkout,
                common_workout_participant_entity_1.CommonWorkoutParticipant,
                common_workout_exercise_entity_1.CommonWorkoutExercise,
                common_workout_participant_set_entity_1.CommonWorkoutParticipantSet,
                workout_entity_1.Workout,
                workout_exercise_entity_1.WorkoutExercise,
                workout_set_entity_1.WorkoutSet,
                workout_template_entity_1.WorkoutTemplate,
                exercise_entity_1.Exercise,
                user_entity_1.User,
                user_exercise_personal_best_entity_1.UserExercisePersonalBest,
            ]),
        ],
        providers: [common_workouts_service_1.CommonWorkoutsService, common_workouts_gateway_1.CommonWorkoutsGateway],
        controllers: [common_workouts_controller_1.CommonWorkoutsController],
        exports: [common_workouts_service_1.CommonWorkoutsService],
    })
], CommonWorkoutsModule);
//# sourceMappingURL=common-workouts.module.js.map