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
exports.CommonWorkoutBlock = exports.CommonWorkoutBlockStatus = void 0;
const typeorm_1 = require("typeorm");
const common_workout_entity_1 = require("./common-workout.entity");
const common_workout_exercise_entity_1 = require("./common-workout-exercise.entity");
const exercise_entity_1 = require("./exercise.entity");
var CommonWorkoutBlockStatus;
(function (CommonWorkoutBlockStatus) {
    CommonWorkoutBlockStatus["ACTIVE"] = "active";
    CommonWorkoutBlockStatus["COMPLETED"] = "completed";
})(CommonWorkoutBlockStatus || (exports.CommonWorkoutBlockStatus = CommonWorkoutBlockStatus = {}));
let CommonWorkoutBlock = class CommonWorkoutBlock {
};
exports.CommonWorkoutBlock = CommonWorkoutBlock;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CommonWorkoutBlock.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CommonWorkoutBlock.prototype, "commonWorkoutId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => common_workout_entity_1.CommonWorkout, (workout) => workout.blocks, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", common_workout_entity_1.CommonWorkout)
], CommonWorkoutBlock.prototype, "commonWorkout", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], CommonWorkoutBlock.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CommonWorkoutBlock.prototype, "defaultExerciseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => exercise_entity_1.Exercise, { nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", exercise_entity_1.Exercise)
], CommonWorkoutBlock.prototype, "defaultExercise", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CommonWorkoutBlockStatus,
        default: CommonWorkoutBlockStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], CommonWorkoutBlock.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CommonWorkoutBlock.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => common_workout_exercise_entity_1.CommonWorkoutExercise, (exercise) => exercise.block, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], CommonWorkoutBlock.prototype, "userExercises", void 0);
exports.CommonWorkoutBlock = CommonWorkoutBlock = __decorate([
    (0, typeorm_1.Entity)()
], CommonWorkoutBlock);
//# sourceMappingURL=common-workout-block.entity.js.map