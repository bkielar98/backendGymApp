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
exports.CreateWorkoutTemplateDto = exports.CreateWorkoutTemplateExerciseDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const workout_constants_1 = require("../../common/constants/workout.constants");
class CreateWorkoutTemplateExerciseDto {
}
exports.CreateWorkoutTemplateExerciseDto = CreateWorkoutTemplateExerciseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'ID ćwiczenia',
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateWorkoutTemplateExerciseDto.prototype, "exerciseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 4,
        description: 'Startowa liczba serii dla ćwiczenia',
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(workout_constants_1.MAX_EXERCISE_SETS),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateWorkoutTemplateExerciseDto.prototype, "setsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Kolejność ćwiczenia w planie',
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateWorkoutTemplateExerciseDto.prototype, "order", void 0);
class CreateWorkoutTemplateDto {
}
exports.CreateWorkoutTemplateDto = CreateWorkoutTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Upper A',
        description: 'Nazwa planu treningowego',
    }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateWorkoutTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Np znajomemu poprzez link lub system znajomych',
        description: 'Opis planu treningowego',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateWorkoutTemplateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['push', 'klatka', '4 dni'],
        description: 'Etykiety planu treningowego',
        required: false,
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(workout_constants_1.MAX_TEMPLATE_LABELS),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(30, { each: true }),
    __metadata("design:type", Array)
], CreateWorkoutTemplateDto.prototype, "labels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-04-11T10:00:00.000Z',
        description: 'Data rozpoczecia planu',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateWorkoutTemplateDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-05-11T10:00:00.000Z',
        description: 'Data zakonczenia planu',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateWorkoutTemplateDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['Dodaj progresje ciezaru', 'Sprawdz regeneracje barkow'],
        description: 'Lista zadan powiazanych z planem',
        required: false,
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(workout_constants_1.MAX_TEMPLATE_TASKS),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(120, { each: true }),
    __metadata("design:type", Array)
], CreateWorkoutTemplateDto.prototype, "tasks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [2, 7],
        description: 'ID znajomych, ktorzy od razu maja otrzymac dostep do planu',
        required: false,
        type: [Number],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(workout_constants_1.MAX_TEMPLATE_MEMBERS),
    (0, class_validator_1.IsInt)({ each: true }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Array)
], CreateWorkoutTemplateDto.prototype, "memberUserIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [CreateWorkoutTemplateExerciseDto],
        example: [
            { exerciseId: 1, setsCount: 4, order: 1 },
            { exerciseId: 2, setsCount: 3, order: 2 },
        ],
        description: 'Lista ćwiczeń w planie',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(workout_constants_1.MAX_TEMPLATE_EXERCISES),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateWorkoutTemplateExerciseDto),
    __metadata("design:type", Array)
], CreateWorkoutTemplateDto.prototype, "exercises", void 0);
//# sourceMappingURL=create-workout-template.dto.js.map