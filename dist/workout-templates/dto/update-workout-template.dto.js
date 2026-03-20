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
exports.UpdateWorkoutTemplateDto = exports.UpdateWorkoutTemplateExerciseDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class UpdateWorkoutTemplateExerciseDto {
}
exports.UpdateWorkoutTemplateExerciseDto = UpdateWorkoutTemplateExerciseDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 12,
        description: 'ID wpisu ćwiczenia w planie. Podaj przy edycji istniejącego elementu, pomiń przy dodawaniu nowego.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateWorkoutTemplateExerciseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 5,
        description: 'ID ćwiczenia, które ma być przypisane do planu',
    }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateWorkoutTemplateExerciseDto.prototype, "exerciseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 4,
        description: 'Liczba serii dla ćwiczenia w planie',
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateWorkoutTemplateExerciseDto.prototype, "setsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Kolejność ćwiczenia w planie',
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateWorkoutTemplateExerciseDto.prototype, "order", void 0);
class UpdateWorkoutTemplateDto {
}
exports.UpdateWorkoutTemplateDto = UpdateWorkoutTemplateDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Upper B',
        description: 'Nowa nazwa planu treningowego',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkoutTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [UpdateWorkoutTemplateExerciseDto],
        example: [
            { id: 11, exerciseId: 5, setsCount: 5, order: 0 },
            { exerciseId: 7, setsCount: 3, order: 1 },
        ],
        description: 'Pełna lista ćwiczeń po edycji. Możesz zmienić kolejność, liczbę serii, podmienić ćwiczenie, dodać nowe albo usunąć brakujące.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => UpdateWorkoutTemplateExerciseDto),
    __metadata("design:type", Array)
], UpdateWorkoutTemplateDto.prototype, "exercises", void 0);
//# sourceMappingURL=update-workout-template.dto.js.map