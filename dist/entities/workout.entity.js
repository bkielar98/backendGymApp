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
exports.Workout = exports.WorkoutStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const workout_exercise_entity_1 = require("./workout-exercise.entity");
const workout_template_entity_1 = require("./workout-template.entity");
var WorkoutStatus;
(function (WorkoutStatus) {
    WorkoutStatus["ACTIVE"] = "active";
    WorkoutStatus["COMPLETED"] = "completed";
})(WorkoutStatus || (exports.WorkoutStatus = WorkoutStatus = {}));
let Workout = class Workout {
};
exports.Workout = Workout;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Workout.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Workout.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.workouts, { onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], Workout.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Workout.prototype, "templateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workout_template_entity_1.WorkoutTemplate, { nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", workout_template_entity_1.WorkoutTemplate)
], Workout.prototype, "template", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Workout.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: WorkoutStatus,
        default: WorkoutStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Workout.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Workout.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Workout.prototype, "finishedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => workout_exercise_entity_1.WorkoutExercise, (exercise) => exercise.workout, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], Workout.prototype, "exercises", void 0);
exports.Workout = Workout = __decorate([
    (0, typeorm_1.Entity)()
], Workout);
//# sourceMappingURL=workout.entity.js.map