import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  Header,
  Inject,
} from '@nestjs/common';
import { DishesService } from './dishes.service.js';
import { CreateDishDto } from './dto/create-dish.dto.js';
import { UpdateDishDto } from './dto/update-dish.dto.js';
import type { DishEntity } from './entities/dish.entity.js';

@Controller('dishes')
export class DishesController {
  constructor(
    @Inject(DishesService)
    private readonly dishesService: DishesService
  ) {}

  /**
   * Отримання списку всіх страв із підтримкою пошуку, пагінації та кастомними заголовками
   */
  @Get()
  @Header('X-API-Version', '1.0')
  @Header('X-Service-Status', 'operational')
  findAll(
    @Query('search') search?: string,
    @Query('limit') limit?: string
  ): DishEntity[] {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.dishesService.findAll(search, parsedLimit);
  }

  /**
   * Отримання страви за ID
   */
  @Get(':id')
  findOne(@Param('id') id: string): DishEntity {
    return this.dishesService.findOne(id);
  }

  /**
   * Створення нової страви (HTTP 201 Created)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDishDto: CreateDishDto): DishEntity {
    return this.dishesService.create(createDishDto);
  }

  /**
   * Часткове оновлення страви (HTTP 200 OK)
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDishDto: UpdateDishDto
  ): DishEntity {
    return this.dishesService.update(id, updateDishDto);
  }

  /**
   * Видалення страви за ID (HTTP 204 No Content)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    this.dishesService.remove(id);
  }
}
