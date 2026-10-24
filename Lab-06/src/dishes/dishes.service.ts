import { Injectable, NotFoundException } from '@nestjs/common';
import { DishEntity } from './entities/dish.entity.js';
import type { CreateDishDto } from './dto/create-dish.dto.js';
import type { UpdateDishDto } from './dto/update-dish.dto.js';

@Injectable()
export class DishesService {
  private items: DishEntity[] = [
    new DishEntity({
      id: '1',
      title: 'Піца Маргарита Класична',
      price: 260,
      weightGrams: 480,
      calories: 950,
      isSpicy: false,
      createdAt: new Date('2026-10-24T08:00:00.000Z'),
      updatedAt: new Date('2026-10-24T08:00:00.000Z'),
    }),
    new DishEntity({
      id: '2',
      title: 'Суп Рамен із тясю',
      price: 240,
      weightGrams: 650,
      calories: 780,
      isSpicy: true,
      createdAt: new Date('2026-10-24T08:15:00.000Z'),
      updatedAt: new Date('2026-10-24T08:15:00.000Z'),
    }),
  ];

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
    const newDish = new DishEntity({
      id: Date.now().toString(),
      ...dto,
      createdAt: now,
      updatedAt: now,
    });

    this.items.push(newDish);
    return newDish;
  }

  update(id: string, dto: UpdateDishDto): DishEntity {
    const item = this.findOne(id);

    Object.assign(item, dto, {
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
