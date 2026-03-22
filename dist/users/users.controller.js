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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const path_1 = require("path");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const update_user_profile_dto_1 = require("./dto/update-user-profile.dto");
const update_email_dto_1 = require("./dto/update-email.dto");
const update_password_dto_1 = require("./dto/update-password.dto");
const create_weight_entry_dto_1 = require("./dto/create-weight-entry.dto");
const update_weight_entry_dto_1 = require("./dto/update-weight-entry.dto");
const create_body_measurement_entry_dto_1 = require("./dto/create-body-measurement-entry.dto");
const update_body_measurement_entry_dto_1 = require("./dto/update-body-measurement-entry.dto");
const avatarStorage = (0, multer_1.diskStorage)({
    destination: './uploads/avatars',
    filename: (_, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1_000_000_000)}`;
        callback(null, `${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
    },
});
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(req) {
        return this.usersService.getUserCard(req.user.id);
    }
    async getUserCard(req) {
        return this.usersService.getUserCard(req.user.id);
    }
    async updateProfile(req, updateUserDto) {
        await this.usersService.updateProfile(req.user.id, updateUserDto);
        return this.usersService.getUserCard(req.user.id);
    }
    async updateEmail(req, updateEmailDto) {
        await this.usersService.updateEmail(req.user.id, updateEmailDto);
        return this.usersService.getUserCard(req.user.id);
    }
    async updatePassword(req, updatePasswordDto) {
        await this.usersService.updatePassword(req.user.id, updatePasswordDto);
        return {
            success: true,
            message: 'Password updated',
        };
    }
    async uploadAvatar(req, file) {
        await this.usersService.updateAvatar(req.user.id, file);
        return this.usersService.getUserCard(req.user.id);
    }
    async getWeights(req) {
        return this.usersService.listWeightEntries(req.user.id);
    }
    async createWeight(req, dto) {
        return this.usersService.createWeightEntry(req.user.id, dto);
    }
    async updateWeight(req, id, dto) {
        return this.usersService.updateWeightEntry(req.user.id, id, dto);
    }
    deleteWeight(req, id) {
        return this.usersService.removeWeightEntry(req.user.id, id);
    }
    getBodyMeasurements(req) {
        return this.usersService.listBodyMeasurementEntries(req.user.id);
    }
    async createBodyMeasurement(req, dto) {
        return this.usersService.createBodyMeasurementEntry(req.user.id, dto);
    }
    async updateBodyMeasurement(req, id, dto) {
        return this.usersService.updateBodyMeasurementEntry(req.user.id, id, dto);
    }
    deleteBodyMeasurement(req, id) {
        return this.usersService.removeBodyMeasurementEntry(req.user.id, id);
    }
    deleteProfile(req) {
        return this.usersService.remove(req.user.id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile retrieved' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('card'),
    (0, swagger_1.ApiOperation)({ summary: 'Get full user card data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User card retrieved' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserCard", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_profile_dto_1.UpdateUserProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)('email'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email updated' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_email_dto_1.UpdateEmailDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateEmail", null);
__decorate([
    (0, common_1.Patch)('password'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password updated' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_password_dto_1.UpdatePasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updatePassword", null);
__decorate([
    (0, common_1.Post)('avatar'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload user avatar' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                avatar: {
                    type: 'string',
                    format: 'binary',
                },
            },
            required: ['avatar'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Avatar uploaded' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', { storage: avatarStorage })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Get)('weights'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user weight history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Weight history retrieved' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getWeights", null);
__decorate([
    (0, common_1.Post)('weights'),
    (0, swagger_1.ApiOperation)({ summary: 'Create weight entry' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Weight entry created' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_weight_entry_dto_1.CreateWeightEntryDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createWeight", null);
__decorate([
    (0, common_1.Put)('weights/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update weight entry' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Weight entry updated' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_weight_entry_dto_1.UpdateWeightEntryDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateWeight", null);
__decorate([
    (0, common_1.Delete)('weights/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete weight entry' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Weight entry deleted' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteWeight", null);
__decorate([
    (0, common_1.Get)('body-measurements'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user body measurement history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Body measurement history retrieved' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getBodyMeasurements", null);
__decorate([
    (0, common_1.Post)('body-measurements'),
    (0, swagger_1.ApiOperation)({ summary: 'Create body measurement entry' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Body measurement entry created' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_body_measurement_entry_dto_1.CreateBodyMeasurementEntryDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createBodyMeasurement", null);
__decorate([
    (0, common_1.Put)('body-measurements/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update body measurement entry' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Body measurement entry updated' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_body_measurement_entry_dto_1.UpdateBodyMeasurementEntryDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateBodyMeasurement", null);
__decorate([
    (0, common_1.Delete)('body-measurements/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete body measurement entry' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Body measurement entry deleted' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteBodyMeasurement", null);
__decorate([
    (0, common_1.Delete)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account deleted' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteProfile", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map