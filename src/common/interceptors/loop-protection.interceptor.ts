import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

type RequestEntry = {
  count: number;
  expiresAt: number;
};

@Injectable()
export class LoopProtectionInterceptor implements NestInterceptor {
  private readonly requests = new Map<string, RequestEntry>();
  private readonly ttlMs = 2000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      method?: string;
      baseUrl?: string;
      route?: { path?: string };
      originalUrl?: string;
      user?: { id?: number };
      body?: unknown;
    }>();

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
      throw new HttpException(
        {
          message:
            'Repeated request blocked. Frontend may be stuck in an update loop.',
          error: 'LOOP_PROTECTION',
          details: [
            'The same request was received multiple times in a very short time window.',
            'Retry after frontend state stabilizes.',
          ],
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.requests.set(key, {
      count: nextCount,
      expiresAt: now + this.ttlMs,
    });

    return next.handle();
  }

  private clearExpired(now: number) {
    for (const [key, entry] of this.requests.entries()) {
      if (entry.expiresAt <= now) {
        this.requests.delete(key);
      }
    }
  }

  private getAllowedBurst(method: string) {
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

  private serializeBody(body: unknown) {
    try {
      return JSON.stringify(body ?? null);
    } catch {
      return '[unserializable-body]';
    }
  }
}
