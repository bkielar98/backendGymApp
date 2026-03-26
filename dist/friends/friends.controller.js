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
exports.FriendsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_friend_request_dto_1 = require("./dto/create-friend-request.dto");
const friends_service_1 = require("./friends.service");
let FriendsController = class FriendsController {
    constructor(friendsService) {
        this.friendsService = friendsService;
    }
    async findAll(req) {
        return this.friendsService.listFriends(req.user.id);
    }
    async findIncoming(req) {
        return this.friendsService.listIncomingRequests(req.user.id);
    }
    async findOutgoing(req) {
        return this.friendsService.listOutgoingRequests(req.user.id);
    }
    async createRequest(req, dto) {
        return this.friendsService.createRequest(req.user.id, dto);
    }
    async acceptRequest(req, id) {
        return this.friendsService.acceptRequest(req.user.id, id);
    }
    async rejectRequest(req, id) {
        return this.friendsService.rejectRequest(req.user.id, id);
    }
    async cancelRequest(req, id) {
        return this.friendsService.cancelRequest(req.user.id, id);
    }
    async removeFriend(req, friendUserId) {
        return this.friendsService.removeFriend(req.user.id, friendUserId);
    }
};
exports.FriendsController = FriendsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Friends retrieved' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('requests/incoming'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Incoming friend requests retrieved' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "findIncoming", null);
__decorate([
    (0, common_1.Get)('requests/outgoing'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Outgoing friend requests retrieved' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "findOutgoing", null);
__decorate([
    (0, common_1.Post)('requests'),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Friend request created' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_friend_request_dto_1.CreateFriendRequestDto]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Patch)('requests/:id/accept'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Friend request accepted' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "acceptRequest", null);
__decorate([
    (0, common_1.Patch)('requests/:id/reject'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Friend request rejected' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "rejectRequest", null);
__decorate([
    (0, common_1.Patch)('requests/:id/cancel'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Friend request canceled' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "cancelRequest", null);
__decorate([
    (0, common_1.Delete)(':friendUserId'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Friend removed' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('friendUserId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "removeFriend", null);
exports.FriendsController = FriendsController = __decorate([
    (0, swagger_1.ApiTags)('friends'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('friends'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [friends_service_1.FriendsService])
], FriendsController);
//# sourceMappingURL=friends.controller.js.map