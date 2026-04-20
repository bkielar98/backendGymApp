"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoopProtectionInterceptor = void 0;
const common_1 = require("@nestjs/common");
let LoopProtectionInterceptor = class LoopProtectionInterceptor {
    constructor() {
        this.requests = new Map();
        this.ttlMs = 2000;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const now = Date.now();
        this.clearExpired(now);
        const method = request.method || 'UNKNOWN';
        const userId = request.user?.id ?? 'anonymous';
        const routePath = request.originalUrl || `${request.baseUrl || ''}${request.route?.path || ''}`;
        const bodyFingerprint = this.serializeBody(request.body);
        const key = `${userId}:${method}:${routePath}:${bodyFingerprint}`;
        const current = this.requests.get(key);
        const nextCount = current && current.expiresAt > now ? current.count + 1 : 1;
        const maxRequests = this.getAllowedBurst(method);
        if (nextCount > maxRequests) {
            throw new common_1.HttpException({
                message: 'Repeated request blocked. Frontend may be stuck in an update loop.',
                error: 'LOOP_PROTECTION',
                details: [
                    'The same request was received multiple times in a very short time window.',
                    'Retry after frontend state stabilizes.',
                ],
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        this.requests.set(key, {
            count: nextCount,
            expiresAt: now + this.ttlMs,
        });
        return next.handle();
    }
    clearExpired(now) {
        for (const [key, entry] of this.requests.entries()) {
            if (entry.expiresAt <= now) {
                this.requests.delete(key);
            }
        }
    }
    getAllowedBurst(method) {
        switch (method.toUpperCase()) {
            case 'GET':
                return 8;
            case 'POST':
            case 'PUT':
            case 'PATCH':
            case 'DELETE':
                return 3;
            default:
                return 4;
        }
    }
    serializeBody(body) {
        try {
            return JSON.stringify(body ?? null);
        }
        catch {
            return '[unserializable-body]';
        }
    }
};
exports.LoopProtectionInterceptor = LoopProtectionInterceptor;
exports.LoopProtectionInterceptor = LoopProtectionInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoopProtectionInterceptor);
//# sourceMappingURL=loop-protection.interceptor.js.map