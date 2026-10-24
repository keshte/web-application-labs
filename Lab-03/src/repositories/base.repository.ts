import type { BaseEntity, UpdateDto } from '../types/index.js';

/**
 * Контракт універсального типізованого репозиторію (Generic Repository Pattern)
 */
export interface IRepository<T extends BaseEntity> {
  create(item: T): T;
  findById(id: string): T | null;
  findAll(): T[];
  update(id: string, patch: UpdateDto<T>): T | null;
  deleteById(id: string): boolean;
}

/**
 * Базова реалізація Generic Repository в оперативній пам'яті (In-Memory)
 */
export class InMemoryRepository<T extends BaseEntity> implements IRepository<T> {
  protected items: T[] = [];

  create(item: T): T {
    this.items.push(item);
    return item;
  }

  findById(id: string): T | null {
    const found = this.items.find((entity) => entity.id === id);
    return found ? { ...found } : null;
  }

  findAll(): T[] {
    return this.items.map((entity) => ({ ...entity }));
  }

  update(id: string, patch: UpdateDto<T>): T | null {
    const index = this.items.findIndex((entity) => entity.id === id);
    if (index === -1) {
      return null;
    }

    const currentItem = this.items[index]!;
    // Оновлюємо сутність: поля з patch, обов'язкове оновлення дати updatedAt та збереження незмінного id
    const updatedItem: T = {
      ...currentItem,
      ...patch,
      id: currentItem.id, // Гарантія незмінності первинного ключа
      updatedAt: new Date(),
    };

    this.items[index] = updatedItem;
    return { ...updatedItem };
  }

  deleteById(id: string): boolean {
    const initialLength = this.items.length;
    this.items = this.items.filter((entity) => entity.id !== id);
    return this.items.length < initialLength;
  }
}
