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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseImportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const database_import_service_1 = require("./database-import.service");
let DatabaseImportController = class DatabaseImportController {
    constructor(databaseImportService) {
        this.databaseImportService = databaseImportService;
    }
    importJson(body, importSecret) {
        return this.databaseImportService.importFromJson(body, importSecret);
    }
};
exports.DatabaseImportController = DatabaseImportController;
__decorate([
    (0, common_1.Post)('import-json'),
    (0, swagger_1.ApiOperation)({ summary: 'Import database backup JSON into the current database' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-import-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DatabaseImportController.prototype, "importJson", null);
exports.DatabaseImportController = DatabaseImportController = __decorate([
    (0, swagger_1.ApiTags)('database'),
    (0, common_1.Controller)('database'),
    __metadata("design:paramtypes", [database_import_service_1.DatabaseImportService])
], DatabaseImportController);
//# sourceMappingURL=database-import.controller.js.map