import type { BaseEntity, EntityStatus } from './base.types.js';

/**
 * DTO створення сутності:
 * Виключає з моделі сутності системні поля id, createdAt, updatedAt за допомогою утилітарного типу Omit
 */
export type CreateDto<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * DTO оновлення сутності:
 * Робить усі поля DTO створення опціональними за допомогою комбінації Partial<CreateDto<T>>
 * Дозволяє передавати будь-яку підмножину змінюваних полів для PATCH-запитів
 */
export type UpdateDto<T extends BaseEntity> = Partial<CreateDto<T>>;

/**
 * Легковажна модель попереднього перегляду (Summary):
 * За допомогою Pick формує зріз полів лише для швидкого перегляду в списку
 */
export type EntitySummary<T extends BaseEntity & { title: string; price: number }> = Pick<
  T,
  'id' | 'title' | 'price'
>;

/**
 * Словник аналітики статусів:
 * Типізує об'єкт-лічильник кількості сутностей за їхніми статусами через Record<EntityStatus, number>
 */
export type EntityAnalytics = Record<EntityStatus, number>;
