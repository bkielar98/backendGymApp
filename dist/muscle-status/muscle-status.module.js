"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuscleStatusModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const muscle_status_service_1 = require("./muscle-status.service");
const muscle_status_controller_1 = require("./muscle-status.controller");
const muscle_status_entity_1 = require("../entities/muscle-status.entity");
let MuscleStatusModule = class MuscleStatusModule {
};
exports.MuscleStatusModule = MuscleStatusModule;
exports.MuscleStatusModule = MuscleStatusModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([muscle_status_entity_1.MuscleStatus])],
        providers: [muscle_status_service_1.MuscleStatusService],
        controllers: [muscle_status_controller_1.MuscleStatusController],
        exports: [muscle_status_service_1.MuscleStatusService],
    })
], MuscleStatusModule);
//# sourceMappingURL=muscle-status.module.js.map