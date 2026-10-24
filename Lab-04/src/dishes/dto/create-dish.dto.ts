/**
 * DTO створення нової страви (Варіант 4)
 * Містить обов'язкові специфічні поля згідно з варіантом методички
 */
export class CreateDishDto {
  readonly title!: string;
  readonly price!: number;
  readonly weightGrams!: number;
  readonly calories!: number;
  readonly isSpicy!: boolean;
}
