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
const class_validator_1 = require("class-validator");
class CreateBodyMeasurementEntryDto {
}
exports.CreateBodyMeasurementEntryDto = CreateBodyMeasurementEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-03-11' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBodyMeasurementEntryDto.prototype, "recordedOn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 37 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "neck", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 118 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "shoulders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 104 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "chest", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 33 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "leftBiceps", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 33.2 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "rightBiceps", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 29 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "leftForearm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 29.1 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "rightForearm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 90 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "upperAbs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 82 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "waist", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 86 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "lowerAbs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 98 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "hips", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 58 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "leftThigh", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 58.4 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "rightThigh", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 37 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "leftCalf", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 37.2 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBodyMeasurementEntryDto.prototype, "rightCalf", void 0);
//# sourceMappingURL=create-body-measurement-entry.dto.js.map