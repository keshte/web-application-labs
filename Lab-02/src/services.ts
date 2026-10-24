/**
 * Практична робота № 2: Базові засоби системи типів TypeScript
 * Варіант 4: Доставка їжі та ресторанів
 * Модуль функцій обробки, валідації та бізнес-логіки
 */

import type {
  Product,
  Order,
  OrderStatus,
  PaymentDetails,
  CreditCardPayment,
} from './types.js';

// =============================================================================
// РІВЕНЬ 1. Базові функції обробки каталогу
// =============================================================================

/**
 * Створює типізовану сутність товару з повною валідацією полів
 */
export function createProduct(productData: Product): Product {
  if (productData.price < 0) {
    throw new Error(`Ціна товару не може бути від'ємною: ${productData.price}`);
  }
  if (productData.weightGrams < 0) {
    throw new Error(`Вага страви не може бути від'ємною: ${productData.weightGrams}`);
  }
  if (productData.calories < 0) {
    throw new Error(`Калорійність не може бути від'ємною: ${productData.calories}`);
  }

  return {
    ...productData,
    tags: [...productData.tags],
    allergens: [...productData.allergens],
  };
}

/**
 * Розраховує загальну вартість товарної позиції з урахуванням знижки
 * @param price Ціна одиниці товару
 * @param quantity Кількість одиниць
 * @param discountPercent Відсоток знижки (дефолтне значення: 0)
 */
export function calculateLineTotal(
  price: number,
  quantity: number,
  discountPercent: number = 0
): number {
  if (price < 0) {
    throw new Error(`Ціна не може бути від'ємною: ${price}`);
  }
  if (quantity < 0) {
    throw new Error(`Кількість не може бути від'ємною: ${quantity}`);
  }
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error(`Знижка повинна бути в діапазоні від 0 до 100%: ${discountPercent}`);
  }

  const rawTotal = price * quantity;
  const discountMultiplier = (100 - discountPercent) / 100;
  return Math.round(rawTotal * discountMultiplier * 100) / 100;
}

// =============================================================================
// РІВЕНЬ 2. Гнучка типізація та операції зі зміною стану
// =============================================================================

/**
 * Чиста функція переходу життєвого циклу замовлення.
 * Повертає новий незмінний об'єкт Order із оновленим статусом та актуалізованою датою.
 * Забороняє будь-які переходи з фінальних статусів 'cancelled' або 'delivered'.
 */
export function updateOrderStatus(order: Order, newStatus: OrderStatus): Order {
  if (order.status === 'cancelled' || order.status === 'delivered') {
    throw new Error(
      `Неможливо змінити статус замовлення #${order.orderId}: замовлення вже у фінальному стані '${order.status}'`
    );
  }

  return {
    ...order,
    status: newStatus,
    updatedAt: new Date(),
  };
}

/**
 * Безпечна валідація невідомих зовнішніх даних (Type Narrowing)
 * Захищає від передачі нерядкових або некоректних email-адрес
 */
export function validateCustomerInput(input: unknown): string {
  // Звуження типу (type narrowing) за допомогою typeof
  if (typeof input !== 'string') {
    throw new TypeError(
      `Очікувався рядок (string), але отримано тип '${typeof input}'`
    );
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    throw new Error('Email клієнта не може бути порожнім рядком');
  }

  if (!trimmed.includes('@') || !trimmed.includes('.')) {
    throw new Error(`Некоректний формат email адреси: "${trimmed}"`);
  }

  return trimmed;
}

// =============================================================================
// РІВЕНЬ 3. Custom Type Guards та вичерпна перевірка (never)
// =============================================================================

/**
 * Користувацький захисник типу (Custom Type Guard) із предикатом `payment is CreditCardPayment`
 * Перевіряє поле-дискримінатор `type === 'card'`
 */
export function isCreditCardPayment(
  payment: PaymentDetails
): payment is CreditCardPayment {
  return payment.type === 'card';
}

/**
 * Безпечне маскування номера банківської картки.
 * Для карт повертає маскований формат "**** **** **** 1234",
 * для готівки та онлайн-гаманців повертає повідомлення "Не вимагає маскування".
 */
export function maskCardNumber(payment: PaymentDetails): string {
  if (isCreditCardPayment(payment)) {
    const rawNumber = payment.cardNumber.replace(/\s+/g, '');
    const lastDigits = rawNumber.slice(-4) || '0000';
    return `**** **** **** ${lastDigits}`;
  }
  return 'Не вимагає маскування';
}

/**
 * Процесинг платежу з вичерпною перевіркою всіх гілок (Exhaustiveness checking)
 * Завдяки типу `never` у default блоці компілятор не дозволить додати новий спосіб
 * оплати без написання гілки його обробки.
 */
export function processPayment(payment: PaymentDetails, amount: number): string {
  switch (payment.type) {
    case 'card': {
      return `Успішно списано ${amount} грн з картки платника ${payment.cardHolder}.`;
    }

    case 'cash': {
      if (payment.cashAmountToPay > amount) {
        const change = Math.round((payment.cashAmountToPay - amount) * 100) / 100;
        return `Оплата готівкою при отриманні: сума ${amount} грн. Підготувати решту ${change} грн з ${payment.cashAmountToPay} грн.`;
      }
      return `Оплата готівкою при отриманні: точна сума ${amount} грн без решти.`;
    }

    case 'online_service': {
      return `Успішно авторизовано платіж на суму ${amount} грн через ${payment.serviceName} (Транзакція: ${payment.transactionRef}).`;
    }

    default: {
      // Компілятор TypeScript гарантує, що payment має тип never.
      // Якщо додати новий тип у PaymentDetails, tsc кине помилку під час збірки!
      const _exhaustiveCheck: never = payment;
      throw new Error(`Невідомий тип платежу: ${JSON.stringify(_exhaustiveCheck)}`);
    }
  }
}
