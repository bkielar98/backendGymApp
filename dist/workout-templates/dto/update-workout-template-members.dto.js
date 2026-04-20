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
exports.UpdateWorkoutTemplateMembersDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const workout_constants_1 = require("../../common/constants/workout.constants");
class UpdateWorkoutTemplateMembersDto {
}
exports.UpdateWorkoutTemplateMembersDto = UpdateWorkoutTemplateMembersDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [2, 7],
        description: 'Pelna lista ID uzytkownikow, ktorzy maja miec dostep do planu',
        type: [Number],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(workout_constants_1.MAX_TEMPLATE_MEMBERS),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsInt)({ each: true }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Array)
], UpdateWorkoutTemplateMembersDto.prototype, "memberUserIds", void 0);
//# sourceMappingURL=update-workout-template-members.dto.js.map