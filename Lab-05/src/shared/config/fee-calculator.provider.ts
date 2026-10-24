import { STORE_CONFIG, type StoreConfig } from './app-config.provider.js';

export const FEE_CALCULATOR = 'FEE_CALCULATOR';

export interface FeeCalculator {
  calculateTax(amount: number): number;
}

/**
 * Динамічний кастомний провайдер розрахунку податку / комісії (стратегія useFactory)
 * Приймає STORE_CONFIG через масив inject
 */
export const feeCalculatorProvider = {
  provide: FEE_CALCULATOR,
  useFactory: (config: StoreConfig): FeeCalculator => {
    return {
      calculateTax: (amount: number): number => {
        const rate = (config.taxPercent || 20) / 100;
        return Math.round(amount * rate * 100) / 100;
      },
    };
  },
  inject: [STORE_CONFIG],
};
