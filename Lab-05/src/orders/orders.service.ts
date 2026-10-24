import {
  Injectable,
  Inject,
  OnModuleInit,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { DishesService } from '../dishes/dishes.service.js';
import {
  FEE_CALCULATOR,
  type FeeCalculator,
} from '../shared/config/fee-calculator.provider.js';
import {
  STORE_CONFIG,
  type StoreConfig,
} from '../shared/config/app-config.provider.js';
import { OrderEntity } from './entities/order.entity.js';
import type { CreateOrderDto } from './dto/create-order.dto.js';

@Injectable()
export class OrdersService implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);
  private orders: OrderEntity[] = [];

  constructor(
    @Inject(DishesService)
    private readonly dishesService: DishesService,
    @Inject(FEE_CALCULATOR)
    private readonly feeCalculator: FeeCalculator,
    @Inject(STORE_CONFIG)
    private readonly config: StoreConfig
  ) {}

  onModuleInit(): void {
    this.logger.log('Сервіс замовлень успішно підключено до білінгу та каталогу.');
  }

  createOrder(dto: CreateOrderDto): OrderEntity {
    if (dto.quantity <= 0) {
      throw new BadRequestException('Кількість товару повинна бути більшою за 0');
    }

    // 1. Перевірка наявності товару через DishesService
    const dish = this.dishesService.findOne(dto.productId);

    // 2. Розрахунок вартості
    const subtotal = dish.price * dto.quantity;
    const taxAmount = this.feeCalculator.calculateTax(subtotal);
    const total = subtotal + taxAmount;

    // 3. Створення сутності замовлення
    const newOrder = new OrderEntity({
      orderId: `ord-${Date.now()}`,
      productTitle: dish.title,
      productSlug: dish.slug,
      unitPrice: dish.price,
      quantity: dto.quantity,
      subtotal,
      taxAmount,
      total,
      currency: this.config.defaultCurrency || 'UAH',
      status: 'confirmed',
      createdAt: new Date(),
    });

    this.orders.push(newOrder);
    return newOrder;
  }

  findAll(): OrderEntity[] {
    return [...this.orders];
  }
}
