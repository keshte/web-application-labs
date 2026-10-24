/**
 * Практична робота № 3: Узагальнення, декоратори та утиліти типів TypeScript
 * Варіант 4: Доставка їжі та ресторанів
 * Точка входу програми (src/index.ts)
 */

import {
  EntityStatus,
  type CreateDto,
  type UpdateDto,
  type EntityAnalytics,
  type ApiResponse,
} from './types/index.js';
import { FoodEntity, FoodRepository } from './repositories/index.js';

console.log('=== ІНІЦІАЛІЗАЦІЯ GENERIC SERVICE LAYER ===\n');

// 1. Створення екземпляра репозиторію
const foodRepo = new FoodRepository();

// 2. Допоміжна фабрика для створення сутностей через DTO
function createFoodFromDto(id: string, dto: CreateDto<FoodEntity>): FoodEntity {
  return new FoodEntity(
    id,
    dto.title,
    dto.price,
    dto.weightGrams,
    dto.calories,
    dto.allergens,
    dto.status,
    new Date('2026-10-24T09:44:59.000Z'),
    new Date('2026-10-24T09:44:59.000Z')
  );
}

// 3. Створення кількох сутностей через DTO (CreateDto)
const primaryId = '8f3c-1a2b';

const dish1Dto: CreateDto<FoodEntity> = {
  title: 'Піца Пепероні Преміум',
  price: 360,
  weightGrams: 550,
  calories: 1250,
  allergens: ['глютен', 'лактоза'],
  status: EntityStatus.Active,
};

const dish2Dto: CreateDto<FoodEntity> = {
  title: 'Суп Рамен із тясю',
  price: 240,
  weightGrams: 650,
  calories: 780,
  allergens: ['соя', 'яйця'],
  status: EntityStatus.Active,
};

const dish3Dto: CreateDto<FoodEntity> = {
  title: 'Сезонний десерт Тірамісу (Архівний рецепт)',
  price: 150,
  weightGrams: 180,
  calories: 420,
  allergens: ['яйця', 'лактоза'],
  status: EntityStatus.Archived,
};

// Додавання страв у репозиторій
const entity1 = foodRepo.create(createFoodFromDto(primaryId, dish1Dto));
console.log(
  `- Створено сутність ID: ${entity1.id} | Статус: ${entity1.status} | Назва: [${entity1.title}]\n`
);

foodRepo.create(createFoodFromDto('9e4d-2b3c', dish2Dto));
foodRepo.create(createFoodFromDto('7a1f-4c5d', dish3Dto));

// 4. Часткове оновлення сутності через UpdateDto (Partial<CreateDto>)
const patchData: UpdateDto<FoodEntity> = {
  price: 395,
  title: 'Піца Пепероні Преміум (XL з подвійним сиром)',
};

const updatedEntity = foodRepo.update(primaryId, patchData);
if (updatedEntity) {
  // Фіксуємо точний час оновлення для демонстрації API відповіді
  updatedEntity.updatedAt = new Date('2026-10-24T09:45:00.000Z');
  console.log(
    `- Оновлено сутність ID: ${updatedEntity.id} | Актуалізовано ціну (${updatedEntity.price} грн) та updatedAt.\n`
  );
}

// 5. Отримання всіх сутностей через findAll()
const allEntities = foodRepo.findAll();
console.log(`Отримано сутностей у репозиторії: ${allEntities.length}\n`);

// 6. Підрахунок статистики статусів за допомогою Record<EntityStatus, number>
const statusStats: EntityAnalytics = {
  [EntityStatus.Active]: 0,
  [EntityStatus.Archived]: 0,
  [EntityStatus.Draft]: 0,
};

for (const item of allEntities) {
  statusStats[item.status] = (statusStats[item.status] || 0) + 1;
}

console.log('=== СТАТИСТИКА СТАТУСІВ (RECORD) ===');
console.log(JSON.stringify(statusStats, null, 2));
console.log('\n=== СТАНДАРТИЗОВАНА ВІДПОВІДЬ API (GENERIC API RESPONSE) ===');

// 7. Формування типізованої відповіді бекенд-сервера ApiResponse<T>
if (updatedEntity) {
  const apiResponse: ApiResponse<FoodEntity> = {
    success: true,
    timestamp: new Date('2026-10-24T09:45:00.000Z'),
    data: updatedEntity,
    meta: {
      totalCount: allEntities.length,
      version: '1.0.0',
    },
  };

  console.log(JSON.stringify(apiResponse, null, 2));
}

console.log('\n======================================================');
console.log(' Всі вимоги Практичної роботи № 3 успішно виконано! ');
console.log('======================================================');
