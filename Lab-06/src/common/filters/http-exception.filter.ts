import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Глобальний фільтр виключень для уніфікації формату відповідей на помилки
 */
@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    let errorMessage: string | string[] = exception.message;
    let errorTitle = exception.name;

    if (typeof errorResponse === 'object' && errorResponse !== null) {
      const respObj = errorResponse as Record<string, unknown>;
      if (respObj['message']) {
        errorMessage = respObj['message'] as string | string[];
      }
      if (respObj['error']) {
        errorTitle = respObj['error'] as string;
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: errorTitle,
      message: errorMessage,
    });
  }
}
