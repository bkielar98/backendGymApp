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
exports.CommonWorkoutExercise = void 0;
const typeorm_1 = require("typeorm");
const common_workout_entity_1 = require("./common-workout.entity");
const exercise_entity_1 = require("./exercise.entity");
const common_workout_participant_set_entity_1 = require("./common-workout-participant-set.entity");
let CommonWorkoutExercise = class CommonWorkoutExercise {
};
exports.CommonWorkoutExercise = CommonWorkoutExercise;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CommonWorkoutExercise.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CommonWorkoutExercise.prototype, "commonWorkoutId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => common_workout_entity_1.CommonWorkout, (commonWorkout) => commonWorkout.exercises, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", common_workout_entity_1.CommonWorkout)
], CommonWorkoutExercise.prototype, "commonWorkout", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CommonWorkoutExercise.prototype, "exerciseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => exercise_entity_1.Exercise, { onDelete: 'CASCADE' }),
    __metadata("design:type", exercise_entity_1.Exercise)
], CommonWorkoutExercise.prototype, "exercise", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], CommonWorkoutExercise.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => common_workout_participant_set_entity_1.CommonWorkoutParticipantSet, (set) => set.commonWorkoutExercise, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], CommonWorkoutExercise.prototype, "participantSets", void 0);
exports.CommonWorkoutExercise = CommonWorkoutExercise = __decorate([
    (0, typeorm_1.Entity)()
], CommonWorkoutExercise);
//# sourceMappingURL=common-workout-exercise.entity.js.map