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

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('limit') limit?: string
  ): DishEntity[] {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.dishesService.findAll(search, parsedLimit);
  }

  @Get(':id')
  findOne(@Param('id') id: string): DishEntity {
    return this.dishesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDishDto: CreateDishDto): DishEntity {
    return this.dishesService.create(createDishDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDishDto: UpdateDishDto
  ): DishEntity {
    return this.dishesService.update(id, updateDishDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    this.dishesService.remove(id);
  }
}
