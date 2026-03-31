import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { HttpException } from '@nestjs/common';
import { of } from 'rxjs';
import { LoopProtectionInterceptor } from './loop-protection.interceptor';

describe('LoopProtectionInterceptor', () => {
  let interceptor: LoopProtectionInterceptor;

  beforeEach(() => {
    interceptor = new LoopProtectionInterceptor();
  });

  const createContext = (method = 'POST') =>
    ({
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
    }) as never;

  it('allows the first request', (done) => {
    interceptor
      .intercept(createContext(), { handle: () => of('ok') } as never)
      .subscribe((value) => {
        expect(value).toBe('ok');
        done();
      });
  });

  it('allows short bursts for mutating requests and blocks the fourth one', () => {
    interceptor.intercept(createContext('POST'), { handle: () => of('ok') } as never);
    interceptor.intercept(createContext('POST'), { handle: () => of('ok') } as never);
    interceptor.intercept(createContext('POST'), { handle: () => of('ok') } as never);

    expect(() =>
      interceptor.intercept(createContext('POST'), { handle: () => of('ok') } as never),
    ).toThrow(HttpException);
  });

  it('allows a larger burst for get requests and blocks the ninth one', () => {
    for (let index = 0; index < 8; index += 1) {
      interceptor.intercept(createContext('GET'), { handle: () => of('ok') } as never);
    }

    expect(() =>
      interceptor.intercept(createContext('GET'), { handle: () => of('ok') } as never),
    ).toThrow(HttpException);
  });
});
