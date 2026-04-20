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
exports.UserExercisePersonalBest = void 0;
const typeorm_1 = require("typeorm");
const exercise_entity_1 = require("./exercise.entity");
const user_entity_1 = require("./user.entity");
const workout_entity_1 = require("./workout.entity");
let UserExercisePersonalBest = class UserExercisePersonalBest {
};
exports.UserExercisePersonalBest = UserExercisePersonalBest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserExercisePersonalBest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserExercisePersonalBest.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], UserExercisePersonalBest.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserExercisePersonalBest.prototype, "exerciseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => exercise_entity_1.Exercise, { onDelete: 'CASCADE' }),
    __metadata("design:type", exercise_entity_1.Exercise)
], UserExercisePersonalBest.prototype, "exercise", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], UserExercisePersonalBest.prototype, "workoutId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workout_entity_1.Workout, { nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", workout_entity_1.Workout)
], UserExercisePersonalBest.prototype, "workout", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UserExercisePersonalBest.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserExercisePersonalBest.prototype, "reps", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UserExercisePersonalBest.prototype, "repMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], UserExercisePersonalBest.prototype, "achievedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserExercisePersonalBest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserExercisePersonalBest.prototype, "updatedAt", void 0);
exports.UserExercisePersonalBest = UserExercisePersonalBest = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Index)(['userId', 'exerciseId'], { unique: true })
], UserExercisePersonalBest);
//# sourceMappingURL=user-exercise-personal-best.entity.js.map