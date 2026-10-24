/**
 * Практична робота № 2: Базові засоби системи типів TypeScript
 * Варіант 4: Доставка їжі та ресторанів
 * Точка входу програми (src/index.ts)
 */

import type {
  Product,
  CartItem,
  Order,
  PaymentDetails,
} from './types.js';
import {
  createProduct,
  calculateLineTotal,
  updateOrderStatus,
  validateCustomerInput,
  maskCardNumber,
  processPayment,
} from './services.js';

console.log('=== СИСТЕМА ОБРОБКИ ЗАМОВЛЕНЬ (E-COMMERCE CORE) ===\n');

// -----------------------------------------------------------------------------
// 1. Каталог товарів (Варіант 4: Доставка їжі та ресторанів)
// -----------------------------------------------------------------------------
console.log('[Каталог товарів]');

const pizzaProduct: Product = createProduct({
  id: 'dish-101',
  title: 'Піца Пепероні Діавола',
  price: 340,
  description: 'Традиційна гостра піца з ковбасками пепероні та перцем халапеньйо',
  tags: ['піца', 'італійська кухня', 'гостре'],
  inStock: true,
  weightGrams: 520,
  calories: 1180,
  isSpicy: true,
  allergens: ['глютен', 'лактоза'],
});

const ramenProduct: Product = createProduct({
  id: 'dish-202',
  title: 'Суп Рамен із куркою',
  price: 220,
  description: 'Наваристий пшеничний рамен із курячим філе, маринованим яйцем та норі',
  tags: ['супи', 'азійська кухня'],
  inStock: true,
  weightGrams: 650,
  calories: 750,
  isSpicy: false,
  allergens: ['соя', 'яйця', 'кунжут'],
});

console.log(
  `- Створено товар #1: [${pizzaProduct.title}] - ${pizzaProduct.price} грн (В наявності: ${pizzaProduct.inStock ? 'так' : 'ні'})`
);
console.log(
  `  Специфікації: Вага: ${pizzaProduct.weightGrams}г, Калорійність: ${pizzaProduct.calories} ккал, Гостра: ${pizzaProduct.isSpicy ? 'так' : 'ні'}, Алергени: ${pizzaProduct.allergens.join(', ')}`
);

console.log(
  `- Створено товар #2: [${ramenProduct.title}] - ${ramenProduct.price} грн (В наявності: ${ramenProduct.inStock ? 'так' : 'ні'})`
);
console.log(
  `  Специфікації: Вага: ${ramenProduct.weightGrams}г, Калорійність: ${ramenProduct.calories} ккал, Гостра: ${ramenProduct.isSpicy ? 'так' : 'ні'}, Алергени: ${ramenProduct.allergens.join(', ')}\n`
);

// -----------------------------------------------------------------------------
// 2. Формування кошика та розрахунок вартості
// -----------------------------------------------------------------------------
console.log('[Формування кошика]');

const cartItems: CartItem[] = [
  { product: pizzaProduct, quantity: 2 },
  { product: ramenProduct, quantity: 1 },
];

let totalOrderAmount = 0;

cartItems.forEach((item, index) => {
  const lineTotal = calculateLineTotal(item.product.price, item.quantity);
  totalOrderAmount += lineTotal;
  console.log(`${index + 1}. ${item.product.title} x ${item.quantity} = ${lineTotal} грн`);
});

console.log(`Загальна вартість замовлення: ${totalOrderAmount} грн\n`);

// -----------------------------------------------------------------------------
// 3. Валідація вхідних даних та створення замовлення
// -----------------------------------------------------------------------------
console.log('[Створення замовлення]');

// Безпечна валідація невідомого зовнішнього входу (unknown -> string)
const rawInputEmail: unknown = '  customer@example.com  ';
const validatedEmail = validateCustomerInput(rawInputEmail);

const initialCreationTime = new Date('2026-10-24T09:20:00.000Z');

let order: Order = {
  orderId: 'ord-98214-abc',
  customerEmail: validatedEmail,
  items: cartItems,
  status: 'pending',
  delivery: 'express_courier', // Варіант 4: 'express_courier' | 'scheduled_courier' | 'takeaway'
  createdAt: initialCreationTime,
  updatedAt: initialCreationTime,
};

console.log(`Замовлення ID: ${order.orderId}`);
console.log(`Клієнт: ${order.customerEmail}`);
console.log(`Доставка: ${order.delivery}`);
console.log(`Початковий статус: ${order.status}`);
console.log(`Час створення: ${order.createdAt.toISOString()}\n`);

// -----------------------------------------------------------------------------
// 4. Зміна життєвого циклу замовлення
// -----------------------------------------------------------------------------
console.log('[Зміна життєвого циклу]');

const oldStatus1 = order.status;
order = updateOrderStatus(order, 'processing');
order.updatedAt = new Date('2026-10-24T09:21:15.000Z');
console.log(
  `Оновлення статусу: ${oldStatus1} -> ${order.status} (Оновлено: ${order.updatedAt.toISOString()})`
);

const oldStatus2 = order.status;
order = updateOrderStatus(order, 'shipped');
order.updatedAt = new Date('2026-10-24T09:25:40.000Z');
console.log(
  `Оновлення статусу: ${oldStatus2} -> ${order.status} (Оновлено: ${order.updatedAt.toISOString()})\n`
);

// -----------------------------------------------------------------------------
// 5. Процесинг платежу (Discriminated Unions, Type Guards, Never check)
// -----------------------------------------------------------------------------
console.log('[Процесинг платежу]');

// Сценарій 1: Оплата банківською карткою
const cardPayment: PaymentDetails = {
  type: 'card',
  cardNumber: '4111 2222 3333 8821',
  cardHolder: 'John Doe',
  cvv: '992',
};

console.log(`Метод оплати: ${cardPayment.type}`);
console.log(`Маскування: ${maskCardNumber(cardPayment)}`);
console.log(`Результат: ${processPayment(cardPayment, totalOrderAmount)}\n`);

// Сценарій 2: Оплата готівкою кур'єру з підготовкою решти
const cashPayment: PaymentDetails = {
  type: 'cash',
  cashAmountToPay: 1000,
};
console.log(`Метод оплати: ${cashPayment.type}`);
console.log(`Маскування: ${maskCardNumber(cashPayment)}`);
console.log(`Результат: ${processPayment(cashPayment, totalOrderAmount)}\n`);

// Сценарій 3: Оплата через ApplePay
const applePayment: PaymentDetails = {
  type: 'online_service',
  serviceName: 'ApplePay',
  transactionRef: 'APL-TX-8849204',
};
console.log(`Метод оплати: ${applePayment.type} (${applePayment.serviceName})`);
console.log(`Маскування: ${maskCardNumber(applePayment)}`);
console.log(`Результат: ${processPayment(applePayment, totalOrderAmount)}\n`);

// -----------------------------------------------------------------------------
// 6. Демонстрація надійності та обробки помилок
// -----------------------------------------------------------------------------
console.log('[Демонстрація безпеки та валідації]');

try {
  // Спроба встановити від'ємну ціну товару
  createProduct({
    ...pizzaProduct,
    price: -50,
  });
} catch (err: unknown) {
  if (err instanceof Error) {
    console.log(`[Захист каталогу]: Успішно перехоплено некоректну ціну -> ${err.message}`);
  }
}

try {
  // Спроба передати некоректний тип замість email
  validateCustomerInput(1234567);
} catch (err: unknown) {
  if (err instanceof TypeError) {
    console.log(`[Type Narrowing]: Успішно перехоплено некоректний тип входу -> ${err.message}`);
  }
}

try {
  // Спроба змінити статус після відміни або доставки
  const deliveredOrder = updateOrderStatus(order, 'delivered');
  updateOrderStatus(deliveredOrder, 'processing');
} catch (err: unknown) {
  if (err instanceof Error) {
    console.log(`[Захист життєвого циклу]: Перехоплено спробу змінити фінальний статус -> ${err.message}`);
  }
}

console.log('\n===================================================');
console.log(' Всі перевірки типів та бізнес-сценарії завершено! ');
console.log('===================================================');
