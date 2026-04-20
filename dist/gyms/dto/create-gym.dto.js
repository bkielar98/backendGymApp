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
exports.CreateGymDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const workout_constants_1 = require("../../common/constants/workout.constants");
class CreateGymDto {
}
exports.CreateGymDto = CreateGymDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Local Gym' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateGymDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 40.7128 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(workout_constants_1.MIN_LATITUDE),
    (0, class_validator_1.Max)(workout_constants_1.MAX_LATITUDE),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateGymDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: -74.0060 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(workout_constants_1.MIN_LONGITUDE),
    (0, class_validator_1.Max)(workout_constants_1.MAX_LONGITUDE),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateGymDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(workout_constants_1.MAX_GYM_RADIUS_METERS),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateGymDto.prototype, "radius", void 0);
//# sourceMappingURL=create-gym.dto.js.map