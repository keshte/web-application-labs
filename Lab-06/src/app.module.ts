import { Module, type NestModule, type MiddlewareConsumer } from '@nestjs/common';
import { DishesModule } from './dishes/dishes.module.js';
import { HttpLoggingMiddleware } from './common/middleware/http-logger.middleware.js';

@Module({
  imports: [DishesModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Реєстрація HttpLoggingMiddleware для всіх маршрутів ('*')
    consumer.apply(HttpLoggingMiddleware).forRoutes('*');
  }
}
