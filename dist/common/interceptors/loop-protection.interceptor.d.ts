import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class LoopProtectionInterceptor implements NestInterceptor {
    private readonly requests;
    private readonly ttlMs;
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
    private clearExpired;
    private getAllowedBurst;
    private serializeBody;
}
