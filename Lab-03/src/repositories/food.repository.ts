import { LogExecutionTime, FrozenEntity } from '../decorators/index.js';
import type { IFoodEntity, UpdateDto } from '../types/index.js';
import { EntityStatus } from '../types/index.js';
import { InMemoryRepository } from './base.repository.js';

/**
 * Клас моделі сутності ресторанної страви (Варіант 4)
 * Захищений декоратором @FrozenEntity() від мутацій прототипу в runtime
 */
@FrozenEntity()
export class FoodEntity implements IFoodEntity {
  constructor(
    public readonly id: string,
    public title: string,
    public price: number,
    public weightGrams: number,
    public calories: number,
    public allergens: string[],
    public status: EntityStatus = EntityStatus.Active,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}

/**
 * Предметний репозиторій страв FoodRepository
 * Методи анотовані декоратором @LogExecutionTime() для заміру продуктивності
 */
export class FoodRepository extends InMemoryRepository<FoodEntity> {
  @LogExecutionTime()
  override create(item: FoodEntity): FoodEntity {
    return super.create(item);
  }

  @LogExecutionTime()
  override update(id: string, patch: UpdateDto<FoodEntity>): FoodEntity | null {
    return super.update(id, patch);
  }

  @LogExecutionTime()
  override findAll(): FoodEntity[] {
    return super.findAll();
  }
}
