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
exports.UserBodyMeasurementEntry = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let UserBodyMeasurementEntry = class UserBodyMeasurementEntry {
};
exports.UserBodyMeasurementEntry = UserBodyMeasurementEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserBodyMeasurementEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('date'),
    __metadata("design:type", String)
], UserBodyMeasurementEntry.prototype, "recordedOn", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UserBodyMeasurementEntry.prototype, "neck", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UserBodyMeasurementEntry.prototype, "shoulders", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UserBodyMeasurementEntry.prototype, "chest", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UserBodyMeasurementEntry.prototype, "leftBiceps", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UserBodyMeasurementEntry.prototype, "rightBiceps", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UserBodyMeasurementEntry.prototype, "leftForearm", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UserBodyMeasurementEntry.prototype, "rightForearm", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UserBodyMeasurementEntry.prototype, "upperAbs", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UserBodyMeasurementEntry.prototype, "waist", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UserBodyMeasurementEntry.prototype, "lowerAbs", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UserBodyMeasurementEntry.prototype, "hips", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UserBodyMeasurementEntry.prototype, "leftThigh", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UserBodyMeasurementEntry.prototype, "rightThigh", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UserBodyMeasurementEntry.prototype, "leftCalf", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UserBodyMeasurementEntry.prototype, "rightCalf", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.bodyMeasurementEntries, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", user_entity_1.User)
], UserBodyMeasurementEntry.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserBodyMeasurementEntry.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserBodyMeasurementEntry.prototype, "updatedAt", void 0);
exports.UserBodyMeasurementEntry = UserBodyMeasurementEntry = __decorate([
    (0, typeorm_1.Entity)()
], UserBodyMeasurementEntry);
//# sourceMappingURL=user-body-measurement-entry.entity.js.map