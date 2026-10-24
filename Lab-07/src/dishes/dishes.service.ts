import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { DishEntity } from './entities/dish.entity.js';
import type { CreateDishDto } from './dto/create-dish.dto.js';
import type { UpdateDishDto } from './dto/update-dish.dto.js';
import type { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(DishEntity)
    private readonly resourceRepo: Repository<DishEntity>
  ) {}

  /**
   * Створення нового запису через TypeORM
   */
  async create(dto: CreateDishDto): Promise<DishEntity> {
    const dish = this.resourceRepo.create(dto);
    return await this.resourceRepo.save(dish);
  }

  /**
   * Offset-based пагінація з фільтрацією через ILike та сортуванням
   */
  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<DishEntity>> {
    const page = query.page && query.page > 0 ? Number(query.page) : 1;
    const limit = query.limit && query.limit > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where = query.search && query.search.trim() !== ''
      ? { title: ILike(`%${query.search.trim()}%`) }
      : {};

    const [items, total] = await this.resourceRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Пошук одного запису за UUID
   */
  async findOne(id: string): Promise<DishEntity> {
    const dish = await this.resourceRepo.findOneBy({ id });
    if (!dish) {
      throw new NotFoundException(`Сутність з ID ${id} не знайдена`);
    }
    return dish;
  }

  /**
   * Оновлення запису через TypeORM save
   */
  async update(id: string, dto: UpdateDishDto): Promise<DishEntity> {
    const dish = await this.findOne(id);
    Object.assign(dish, dto);
    return await this.resourceRepo.save(dish);
  }

  /**
   * М'яке видалення запису (Soft Delete)
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.resourceRepo.softDelete(id);
  }

  /**
   * Відновлення м'яко видаленого запису (Restore)
   */
  async restore(id: string): Promise<{ message: string }> {
    const result = await this.resourceRepo.restore(id);
    if (!result.affected) {
      throw new NotFoundException(`Сутність з ID ${id} не знайдена або не була видалена`);
    }
    return { message: 'Сутність успішно відновлена' };
  }
}
