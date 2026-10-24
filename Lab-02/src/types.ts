/**
 * Практична робота № 2: Базові засоби системи типів TypeScript
 * Варіант 4: Доставка їжі та ресторанів
 * Модуль моделей та типів предметної області
 */

// --- РІВЕНЬ 1. Базові типи та інтерфейси ---

/** Універсальний ідентифікатор сутності */
export type EntityId = string | number;

/** Базовий інтерфейс товару каталогу */
export interface BaseProduct {
  readonly id: EntityId;
  title: string;
  price: number;
  description?: string;
  tags: string[];
  inStock: boolean;
}

/**
 * Специфічний товар для Варіанта 4: "Доставка їжі та ресторанів"
 * Розширює базову сутність параметрами ваги, калорійності, гостроти та алергенів
 */
export interface Product extends BaseProduct {
  weightGrams: number;
  calories: number;
  isSpicy: boolean;
  allergens: string[];
}

// --- РІВЕНЬ 2. Гнучка типізація (unions, intersections) ---

/** Життєвий цикл статусу замовлення (String Literal Union) */
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/** Варіанти доставки для Варіанта 4 (Доставка їжі) */
export type DeliveryMethod = 'express_courier' | 'scheduled_courier' | 'takeaway';

/** Позиція в кошику покупця */
export interface CartItem {
  product: Product;
  quantity: number;
}

/** Аудит-мітки для фіксації часових рамок сутності */
export type TimestampMetadata = {
  readonly createdAt: Date;
  updatedAt: Date;
};

/** Базова структура даних замовлення */
export interface OrderData {
  readonly orderId: string;
  customerEmail: string;
  items: CartItem[];
  status: OrderStatus;
  delivery: DeliveryMethod;
}

/**
 * Повна модель замовлення через перетин типів (Intersection Type: &)
 * Об'єднує дані замовлення та аудит-мітки
 */
export type Order = OrderData & TimestampMetadata;

// --- РІВЕНЬ 3. Discriminated Unions (Розпізнавані об'єднання способів оплати) ---

/** Оплата банківською карткою */
export interface CreditCardPayment {
  type: 'card';
  cardNumber: string;
  cardHolder: string;
  cvv: string;
}

/** Оплата готівкою при отриманні кур'єру */
export interface CashOnDeliveryPayment {
  type: 'cash';
  cashAmountToPay: number;
}

/** Оплата через онлайн-гаманець / платіжний сервіс */
export interface OnlineServicePayment {
  type: 'online_service';
  serviceName: 'ApplePay' | 'GooglePay';
  transactionRef: string;
}

/** Розпізнаване об'єднання способів оплати з полем-дискримінатором 'type' */
export type PaymentDetails =
  | CreditCardPayment
  | CashOnDeliveryPayment
  | OnlineServicePayment;
