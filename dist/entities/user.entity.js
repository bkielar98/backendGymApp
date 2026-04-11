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
exports.User = exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const workout_template_entity_1 = require("./workout-template.entity");
const muscle_status_entity_1 = require("./muscle-status.entity");
const workout_entity_1 = require("./workout.entity");
const user_weight_entry_entity_1 = require("./user-weight-entry.entity");
const user_body_measurement_entry_entity_1 = require("./user-body-measurement-entry.entity");
const workout_template_member_entity_1 = require("./workout-template-member.entity");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], User.prototype, "refreshTokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "avatarPath", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => workout_template_entity_1.WorkoutTemplate, (template) => template.user),
    __metadata("design:type", Array)
], User.prototype, "workoutTemplates", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => workout_template_member_entity_1.WorkoutTemplateMember, (member) => member.user),
    __metadata("design:type", Array)
], User.prototype, "sharedWorkoutTemplates", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => muscle_status_entity_1.MuscleStatus, (status) => status.user),
    __metadata("design:type", Array)
], User.prototype, "muscleStatuses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => workout_entity_1.Workout, (workout) => workout.user),
    __metadata("design:type", Array)
], User.prototype, "workouts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_weight_entry_entity_1.UserWeightEntry, (entry) => entry.user),
    __metadata("design:type", Array)
], User.prototype, "weightEntries", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_body_measurement_entry_entity_1.UserBodyMeasurementEntry, (entry) => entry.user),
    __metadata("design:type", Array)
], User.prototype, "bodyMeasurementEntries", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
], User);
//# sourceMappingURL=user.entity.js.map