"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const loop_protection_interceptor_1 = require("./loop-protection.interceptor");
(0, globals_1.describe)('LoopProtectionInterceptor', () => {
    let interceptor;
    (0, globals_1.beforeEach)(() => {
        interceptor = new loop_protection_interceptor_1.LoopProtectionInterceptor();
    });
    const createContext = (method = 'POST') => ({
        switchToHttp: () => ({
            getRequest: () => ({
                method,
                baseUrl: '/workout-templates',
                route: { path: '/:id/exercises' },
                originalUrl: '/workout-templates/11/exercises',
                user: { id: 14 },
                body: [{ exerciseId: 5, order: 0, setsCount: 4 }],
            }),
        }),
    });
    (0, globals_1.it)('allows the first request', (done) => {
        interceptor
            .intercept(createContext(), { handle: () => (0, rxjs_1.of)('ok') })
            .subscribe((value) => {
            (0, globals_1.expect)(value).toBe('ok');
            done();
        });
    });
    (0, globals_1.it)('allows short bursts for mutating requests and blocks the fourth one', () => {
        interceptor.intercept(createContext('POST'), { handle: () => (0, rxjs_1.of)('ok') });
        interceptor.intercept(createContext('POST'), { handle: () => (0, rxjs_1.of)('ok') });
        interceptor.intercept(createContext('POST'), { handle: () => (0, rxjs_1.of)('ok') });
        (0, globals_1.expect)(() => interceptor.intercept(createContext('POST'), { handle: () => (0, rxjs_1.of)('ok') })).toThrow(common_1.HttpException);
    });
    (0, globals_1.it)('allows a larger burst for get requests and blocks the ninth one', () => {
        for (let index = 0; index < 8; index += 1) {
            interceptor.intercept(createContext('GET'), { handle: () => (0, rxjs_1.of)('ok') });
        }
        (0, globals_1.expect)(() => interceptor.intercept(createContext('GET'), { handle: () => (0, rxjs_1.of)('ok') })).toThrow(common_1.HttpException);
    });
});
//# sourceMappingURL=loop-protection.interceptor.spec.js.map