import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  IsBoolean,
} from 'class-validator';

export class CreateDishDto {
  @IsString({ message: 'Назва має бути рядком' })
  @IsNotEmpty({ message: 'Назва є обов\'язковою' })
  readonly title!: string;

  @IsNumber({}, { message: 'Ціна має бути числом' })
  @IsPositive({ message: 'Ціна має бути додатною' })
  readonly price!: number;

  @IsNumber({}, { message: 'Вага має бути числом' })
  @Min(10, { message: 'Вага повинна бути не менше 10 грамів' })
  readonly weightGrams!: number;

  @IsNumber({}, { message: 'Калорійність має бути числом' })
  @Min(0, { message: 'Калорійність не може бути від\'ємною' })
  readonly calories!: number;

  @IsBoolean({ message: 'Поле isSpicy має бути булевим (true/false)' })
  readonly isSpicy!: boolean;
}
