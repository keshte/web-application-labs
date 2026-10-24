import { Module } from '@nestjs/common';
import { DishesModule } from './dishes/dishes.module.js';

@Module({
  imports: [DishesModule],
})
export class AppModule {}
