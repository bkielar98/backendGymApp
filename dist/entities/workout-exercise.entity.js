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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutExercise = void 0;
const typeorm_1 = require("typeorm");
const workout_entity_1 = require("./workout.entity");
const exercise_entity_1 = require("./exercise.entity");
const workout_set_entity_1 = require("./workout-set.entity");
let WorkoutExercise = class WorkoutExercise {
};
exports.WorkoutExercise = WorkoutExercise;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WorkoutExercise.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], WorkoutExercise.prototype, "workoutId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workout_entity_1.Workout, (workout) => workout.exercises, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", workout_entity_1.Workout)
], WorkoutExercise.prototype, "workout", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], WorkoutExercise.prototype, "exerciseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => exercise_entity_1.Exercise, { onDelete: 'CASCADE' }),
    __metadata("design:type", exercise_entity_1.Exercise)
], WorkoutExercise.prototype, "exercise", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], WorkoutExercise.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => workout_set_entity_1.WorkoutSet, (set) => set.workoutExercise, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], WorkoutExercise.prototype, "sets", void 0);
exports.WorkoutExercise = WorkoutExercise = __decorate([
    (0, typeorm_1.Entity)()
], WorkoutExercise);
//# sourceMappingURL=workout-exercise.entity.js.map