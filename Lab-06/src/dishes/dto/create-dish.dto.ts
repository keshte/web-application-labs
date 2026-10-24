import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  IsBoolean,
} from 'class-validator';

/**
 * DTO створення страви з декларативною валідацією class-validator (Варіант 4)
 */
export class CreateDishDto {
  @IsString({ message: 'Назва має бути рядком' })
  @IsNotEmpty({ message: 'Назва є обов\'язковою' })
  readonly title!: string;

  @IsNumber({}, { message: 'Ціна має бути числом' })
  @IsPositive({ message: 'price must be a positive number' })
  readonly price!: number;

  @IsNumber({}, { message: 'Вага має бути числом' })
  @Min(10, { message: 'weightGrams must not be less than 10' })
  readonly weightGrams!: number;

  @IsNumber({}, { message: 'Калорійність має бути числом' })
  @Min(0, { message: 'calories must not be less than 0' })
  readonly calories!: number;

  @IsBoolean({ message: 'isSpicy must be a boolean value' })
  readonly isSpicy!: boolean;
}
