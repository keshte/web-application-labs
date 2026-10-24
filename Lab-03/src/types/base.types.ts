/**
 * Базові типи та контракти сутностей (Рівень 1 та Рівень 2)
 */

/** Базовий інтерфейс сутності із системними полями первинного ключа та аудиту */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Строковий перелік статусів життєвого циклу сутності */
export enum EntityStatus {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
  Draft = 'DRAFT',
}

/**
 * Універсальний generic-контракт стандартизованої відповіді бекенд API
 * @template TData Тип корисного навантаження (payload) відповіді
 */
export interface ApiResponse<TData> {
  success: boolean;
  data: TData;
  timestamp: Date;
  meta?: Record<string, unknown>;
}
