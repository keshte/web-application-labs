import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module.js';
import { DishesModule } from './dishes/dishes.module.js';
import { OrdersModule } from './orders/orders.module.js';

@Module({
  imports: [
    SharedModule,
    DishesModule,
    OrdersModule,
  ],
})
export class AppModule {}
