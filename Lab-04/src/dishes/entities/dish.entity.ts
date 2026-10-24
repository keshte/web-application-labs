/**
 * Модель сутності ресторанної страви для Варіанта 4: "Доставка їжі та ресторанів"
 */
export class DishEntity {
  id!: string;
  title!: string;
  price!: number;
  weightGrams!: number;
  calories!: number;
  isSpicy!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<DishEntity>) {
    Object.assign(this, partial);
  }
}
