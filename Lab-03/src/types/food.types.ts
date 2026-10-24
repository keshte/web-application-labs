import type { BaseEntity } from './base.types.js';
import { EntityStatus } from './base.types.js';

/**
 * Інтерфейс сутності для Варіанта 4: "Доставка їжі та ресторанів"
 * Поєднує базову сутність та характеристики ресторанних страв
 */
export interface IFoodEntity extends BaseEntity {
  status: EntityStatus;
  title: string;
  price: number;
  weightGrams: number;
  calories: number;
  allergens: string[];
}
