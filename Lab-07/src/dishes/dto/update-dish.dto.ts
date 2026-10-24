import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class UpdateDishDto {
  @IsOptional()
  @IsString({ message: 'Назва має бути рядком' })
  @IsNotEmpty({ message: 'Назва не може бути порожньою' })
  readonly title?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Ціна має бути числом' })
  @IsPositive({ message: 'Ціна має бути додатною' })
  readonly price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Вага має бути числом' })
  @Min(10, { message: 'Вага повинна бути не менше 10 грамів' })
  readonly weightGrams?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Калорійність має бути числом' })
  @Min(0, { message: 'Калорійність не може бути від\'ємною' })
  readonly calories?: number;

  @IsOptional()
  @IsBoolean({ message: 'Поле isSpicy має бути булевим (true/false)' })
  readonly isSpicy?: boolean;
}
