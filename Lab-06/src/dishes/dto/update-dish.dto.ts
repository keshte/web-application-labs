import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  IsBoolean,
  IsOptional,
} from 'class-validator';

/**
 * DTO часткового оновлення страви (PATCH /dishes/:id)
 * Усі поля позначені @IsOptional() зі збереженням правил валідації
 */
export class UpdateDishDto {
  @IsOptional()
  @IsString({ message: 'Назва має бути рядком' })
  @IsNotEmpty({ message: 'Назва не може бути порожньою' })
  readonly title?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Ціна має бути числом' })
  @IsPositive({ message: 'price must be a positive number' })
  readonly price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Вага має бути числом' })
  @Min(10, { message: 'weightGrams must not be less than 10' })
  readonly weightGrams?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Калорійність має бути числом' })
  @Min(0, { message: 'calories must not be less than 0' })
  readonly calories?: number;

  @IsOptional()
  @IsBoolean({ message: 'isSpicy must be a boolean value' })
  readonly isSpicy?: boolean;
}
