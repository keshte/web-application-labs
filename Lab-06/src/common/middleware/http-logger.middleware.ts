import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

/**
 * Проміжний обробник (Middleware) для наскрізного логування вхідного HTTP-трафіку
 */
@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      this.logger.log(`${method} ${originalUrl} ${statusCode} - ${duration}ms [${ip || '::1'}]`);
    });

    next();
  }
}
