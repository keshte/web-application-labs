import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Інтерцептор моніторингу швидкодії та додавання заголовка X-Response-Time
 */
@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('TIMING');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startTime = performance.now();
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    return next.handle().pipe(
      tap(() => {
        const duration = (performance.now() - startTime).toFixed(2);
        if (response && typeof response.setHeader === 'function') {
          response.setHeader('X-Response-Time', `${duration}ms`);
        }
        this.logger.log(`Маршрут ${request.method} ${request.url} виконано за ${duration}ms`);
      })
    );
  }
}
