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
exports.WorkoutSet = void 0;
const typeorm_1 = require("typeorm");
const workout_exercise_entity_1 = require("./workout-exercise.entity");
let WorkoutSet = class WorkoutSet {
};
exports.WorkoutSet = WorkoutSet;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WorkoutSet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], WorkoutSet.prototype, "workoutExerciseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workout_exercise_entity_1.WorkoutExercise, (workoutExercise) => workoutExercise.sets, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", workout_exercise_entity_1.WorkoutExercise)
], WorkoutSet.prototype, "workoutExercise", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], WorkoutSet.prototype, "setNumber", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], WorkoutSet.prototype, "previousWeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], WorkoutSet.prototype, "previousReps", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], WorkoutSet.prototype, "currentWeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], WorkoutSet.prototype, "currentReps", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], WorkoutSet.prototype, "repMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], WorkoutSet.prototype, "confirmed", void 0);
exports.WorkoutSet = WorkoutSet = __decorate([
    (0, typeorm_1.Entity)()
], WorkoutSet);
//# sourceMappingURL=workout-set.entity.js.map