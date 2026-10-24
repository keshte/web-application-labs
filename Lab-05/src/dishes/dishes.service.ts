import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Logger,
  Inject,
} from '@nestjs/common';
import { DishEntity } from './entities/dish.entity.js';
import type { CreateDishDto } from './dto/create-dish.dto.js';
import type { UpdateDishDto } from './dto/update-dish.dto.js';
import { SlugService } from '../shared/slug/slug.service.js';

@Injectable()
export class DishesService implements OnModuleInit {
  private readonly logger = new Logger(DishesService.name);
  private items: DishEntity[] = [];

  constructor(
    @Inject(SlugService)
    private readonly slugService: SlugService
  ) {}

  /**
   * Життєвий цикл OnModuleInit:
   * Викликається після розв'язання всіх залежностей модуля для первинного заповнення (seeding)
   */
  onModuleInit(): void {
    this.logger.log('Ініціалізація модуля завершена. Завантажено початкові тестові дані.');

    this.items = [
      new DishEntity({
        id: 'dish-1',
        title: 'Піца Пепероні Діавола',
        slug: this.slugService.generateSlug('Піца Пепероні Діавола'),
        price: 340,
        weightGrams: 520,
        calories: 1180,
        isSpicy: true,
        createdAt: new Date('2026-10-24T09:00:00.000Z'),
        updatedAt: new Date('2026-10-24T09:00:00.000Z'),
      }),
      new DishEntity({
        id: 'dish-2',
        title: 'Суп Рамен із тясю',
        slug: this.slugService.generateSlug('Суп Рамен із тясю'),
        price: 240,
        weightGrams: 650,
        calories: 780,
        isSpicy: true,
        createdAt: new Date('2026-10-24T09:15:00.000Z'),
        updatedAt: new Date('2026-10-24T09:15:00.000Z'),
      }),
    ];
  }

  findAll(search?: string, limit?: number): DishEntity[] {
    let result = [...this.items];

    if (search && search.trim() !== '') {
      const query = search.trim().toLowerCase();
      result = result.filter((item) =>
        item.title.toLowerCase().includes(query)
      );
    }

    if (limit && limit > 0) {
      result = result.slice(0, limit);
    }

    return result;
  }

  findOne(id: string): DishEntity {
    const item = this.items.find((entity) => entity.id === id);
    if (!item) {
      throw new NotFoundException(`Сутність з ID ${id} не знайдена`);
    }
    return item;
  }

  create(dto: CreateDishDto): DishEntity {
    const now = new Date();
    const slug = this.slugService.generateSlug(dto.title);

    const newDish = new DishEntity({
      id: `dish-${Date.now()}`,
      ...dto,
      slug,
      createdAt: now,
      updatedAt: now,
    });

    this.items.push(newDish);
    return newDish;
  }

  update(id: string, dto: UpdateDishDto): DishEntity {
    const item = this.findOne(id);

    const updatedSlug = dto.title ? this.slugService.generateSlug(dto.title) : item.slug;

    Object.assign(item, dto, {
      slug: updatedSlug,
      updatedAt: new Date(),
    });

    return item;
  }

  remove(id: string): void {
    const index = this.items.findIndex((entity) => entity.id === id);
    if (index === -1) {
      throw new NotFoundException(`Сутність з ID ${id} не знайдена`);
    }
    this.items.splice(index, 1);
  }
}
