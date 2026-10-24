/**
 * Токен ін'єкції та інтерфейс конфігурації магазину (стратегія useValue)
 */
export const STORE_CONFIG = 'STORE_CONFIG';

export interface StoreConfig {
  storeName: string;
  defaultCurrency: string;
  taxPercent: number;
}

export const appConfigProvider = {
  provide: STORE_CONFIG,
  useValue: {
    storeName: 'FoodExpress Restaurant & Delivery',
    defaultCurrency: 'UAH',
    taxPercent: 20,
  } as StoreConfig,
};
