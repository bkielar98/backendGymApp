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
exports.WorkoutTemplate = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const workout_template_exercise_entity_1 = require("./workout-template-exercise.entity");
const workout_template_member_entity_1 = require("./workout-template-member.entity");
let WorkoutTemplate = class WorkoutTemplate {
};
exports.WorkoutTemplate = WorkoutTemplate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WorkoutTemplate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], WorkoutTemplate.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], WorkoutTemplate.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { default: '' }),
    __metadata("design:type", Array)
], WorkoutTemplate.prototype, "labels", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WorkoutTemplate.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WorkoutTemplate.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Array)
], WorkoutTemplate.prototype, "tasks", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], WorkoutTemplate.prototype, "isShared", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], WorkoutTemplate.prototype, "shareCode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], WorkoutTemplate.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.workoutTemplates, {
        onDelete: 'CASCADE',
        eager: true,
    }),
    __metadata("design:type", user_entity_1.User)
], WorkoutTemplate.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => workout_template_exercise_entity_1.WorkoutTemplateExercise, (exercise) => exercise.template, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], WorkoutTemplate.prototype, "exercises", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => workout_template_member_entity_1.WorkoutTemplateMember, (member) => member.template, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], WorkoutTemplate.prototype, "members", void 0);
exports.WorkoutTemplate = WorkoutTemplate = __decorate([
    (0, typeorm_1.Entity)()
], WorkoutTemplate);
//# sourceMappingURL=workout-template.entity.js.map