import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import type { OrderEntity } from './entities/order.entity.js';
import { RequestIdService } from '../shared/services/request-id.service.js';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(OrdersService)
    private readonly ordersService: OrdersService,
    @Inject(RequestIdService)
    private readonly requestIdService: RequestIdService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOrderDto: CreateOrderDto): OrderEntity {
    // Демонстрація Scope.REQUEST
    const currentRequestId = this.requestIdService.getRequestId();
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get()
  findAll(): OrderEntity[] {
    return this.ordersService.findAll();
  }
}
