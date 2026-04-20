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
exports.ConfirmWorkoutSetDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const workout_constants_1 = require("../../common/constants/workout.constants");
class ConfirmWorkoutSetDto {
}
exports.ConfirmWorkoutSetDto = ConfirmWorkoutSetDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 80,
        description: 'Końcowy ciężar zatwierdzonej serii',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_WEIGHT_KG),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ConfirmWorkoutSetDto.prototype, "currentWeight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 8,
        description: 'Końcowa liczba powtórzeń zatwierdzonej serii',
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_REPS_PER_SET),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ConfirmWorkoutSetDto.prototype, "currentReps", void 0);
//# sourceMappingURL=confirm-workout-set.dto.js.map