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
exports.CreateBodyMeasurementEntryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const workout_constants_1 = require("../../common/constants/workout.constants");
class CreateBodyMeasurementEntryDto {
}
exports.CreateBodyMeasurementEntryDto = CreateBodyMeasurementEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-03-11' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBodyMeasurementEntryDto.prototype, "recordedOn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 37, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_BODY_MEASUREMENT_CM),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "neck", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 118, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_BODY_MEASUREMENT_CM),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "shoulders", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 104, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_BODY_MEASUREMENT_CM),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "chest", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 33, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_BODY_MEASUREMENT_CM),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "leftBiceps", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 33.2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_BODY_MEASUREMENT_CM),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "rightBiceps", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 29, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_BODY_MEASUREMENT_CM),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "leftForearm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 29.1, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_BODY_MEASUREMENT_CM),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "rightForearm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 90, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_BODY_MEASUREMENT_CM),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "upperAbs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 82, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_BODY_MEASUREMENT_CM),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "waist", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 86, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_BODY_MEASUREMENT_CM),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "lowerAbs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 98, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_BODY_MEASUREMENT_CM),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "hips", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 58, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_BODY_MEASUREMENT_CM),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "leftThigh", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 58.4, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_BODY_MEASUREMENT_CM),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "rightThigh", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 37, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_BODY_MEASUREMENT_CM),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "leftCalf", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 37.2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_BODY_MEASUREMENT_CM),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "rightCalf", void 0);
//# sourceMappingURL=create-body-measurement-entry.dto.js.map