import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { DishesModule } from '../dishes/dishes.module.js';
import { SharedModule } from '../shared/shared.module.js';

@Module({
  imports: [DishesModule, SharedModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
