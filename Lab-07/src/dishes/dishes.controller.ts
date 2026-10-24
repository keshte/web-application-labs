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
import { DishesService, type PaginatedResult } from './dishes.service.js';
import { CreateDishDto } from './dto/create-dish.dto.js';
import { UpdateDishDto } from './dto/update-dish.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import type { DishEntity } from './entities/dish.entity.js';

@Controller('dishes')
export class DishesController {
  constructor(
    @Inject(DishesService)
    private readonly dishesService: DishesService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDishDto: CreateDishDto): Promise<DishEntity> {
    return await this.dishesService.create(createDishDto);
  }

  @Get()
  async findAll(
    @Query() query: PaginationQueryDto
  ): Promise<PaginatedResult<DishEntity>> {
    return await this.dishesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<DishEntity> {
    return await this.dishesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDishDto: UpdateDishDto
  ): Promise<DishEntity> {
    return await this.dishesService.update(id, updateDishDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.dishesService.remove(id);
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id') id: string): Promise<{ message: string }> {
    return await this.dishesService.restore(id);
  }
}
