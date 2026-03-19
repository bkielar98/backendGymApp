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
const exercise_entity_1 = require("../entities/exercise.entity");
const muscle_status_module_1 = require("../muscle-status/muscle-status.module");
const gym_module_1 = require("../gym/gym.module");
let WorkoutsModule = class WorkoutsModule {
};
exports.WorkoutsModule = WorkoutsModule;
exports.WorkoutsModule = WorkoutsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([exercise_entity_1.Exercise]), muscle_status_module_1.MuscleStatusModule, gym_module_1.GymModule],
        providers: [workouts_service_1.WorkoutsService],
        controllers: [workouts_controller_1.WorkoutsController],
    })
], WorkoutsModule);
//# sourceMappingURL=workouts.module.js.map