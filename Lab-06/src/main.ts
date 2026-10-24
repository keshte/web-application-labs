import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { TrimPipe } from './common/pipes/trim.pipe.js';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter.js';
import { TimingInterceptor } from './common/interceptors/timing.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Глобальні пайпи: спочатку санітизація пробілів (TrimPipe), потім валідація (ValidationPipe)
  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({
      whitelist: true, // Видаляє з payload поля, не описані в DTO
      forbidNonWhitelisted: true, // Викидає 400 Bad Request, якщо передано невідомі поля
      transform: true, // Автоматичний кастинг типів (наприклад, string -> number для query)
    })
  );

  // 2. Глобальний кастомний фільтр виключень
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 3. Глобальний інтерцептор моніторингу часу відповіді
  app.useGlobalInterceptors(new TimingInterceptor());

  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  console.log(`[NestApplication] Nest application successfully started on port ${port}`);
}

bootstrap();
