import { IsOptional, IsPositive, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO для керування offset-based пагінацією та пошуком
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;
}
