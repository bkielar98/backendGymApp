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
exports.WorkoutTemplateExercise = void 0;
const typeorm_1 = require("typeorm");
const workout_template_entity_1 = require("./workout-template.entity");
const exercise_entity_1 = require("./exercise.entity");
let WorkoutTemplateExercise = class WorkoutTemplateExercise {
};
exports.WorkoutTemplateExercise = WorkoutTemplateExercise;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WorkoutTemplateExercise.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], WorkoutTemplateExercise.prototype, "templateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workout_template_entity_1.WorkoutTemplate, (template) => template.exercises, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", workout_template_entity_1.WorkoutTemplate)
], WorkoutTemplateExercise.prototype, "template", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], WorkoutTemplateExercise.prototype, "exerciseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => exercise_entity_1.Exercise, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", exercise_entity_1.Exercise)
], WorkoutTemplateExercise.prototype, "exercise", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], WorkoutTemplateExercise.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], WorkoutTemplateExercise.prototype, "setsCount", void 0);
exports.WorkoutTemplateExercise = WorkoutTemplateExercise = __decorate([
    (0, typeorm_1.Entity)()
], WorkoutTemplateExercise);
//# sourceMappingURL=workout-template-exercise.entity.js.map