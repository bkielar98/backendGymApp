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
exports.CommonWorkout = exports.CommonWorkoutStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const workout_template_entity_1 = require("./workout-template.entity");
const common_workout_participant_entity_1 = require("./common-workout-participant.entity");
const common_workout_exercise_entity_1 = require("./common-workout-exercise.entity");
var CommonWorkoutStatus;
(function (CommonWorkoutStatus) {
    CommonWorkoutStatus["ACTIVE"] = "active";
    CommonWorkoutStatus["COMPLETED"] = "completed";
})(CommonWorkoutStatus || (exports.CommonWorkoutStatus = CommonWorkoutStatus = {}));
let CommonWorkout = class CommonWorkout {
};
exports.CommonWorkout = CommonWorkout;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CommonWorkout.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CommonWorkout.prototype, "createdByUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], CommonWorkout.prototype, "createdByUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CommonWorkout.prototype, "templateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workout_template_entity_1.WorkoutTemplate, { nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", workout_template_entity_1.WorkoutTemplate)
], CommonWorkout.prototype, "template", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CommonWorkout.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CommonWorkoutStatus,
        default: CommonWorkoutStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], CommonWorkout.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], CommonWorkout.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CommonWorkout.prototype, "finishedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => common_workout_participant_entity_1.CommonWorkoutParticipant, (participant) => participant.commonWorkout, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], CommonWorkout.prototype, "participants", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => common_workout_exercise_entity_1.CommonWorkoutExercise, (exercise) => exercise.commonWorkout, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], CommonWorkout.prototype, "exercises", void 0);
exports.CommonWorkout = CommonWorkout = __decorate([
    (0, typeorm_1.Entity)()
], CommonWorkout);
//# sourceMappingURL=common-workout.entity.js.map