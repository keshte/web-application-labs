import { Injectable, Scope } from '@nestjs/common';

/**
 * Експериментальний провайдер лічильника та ідентифікатора запиту
 * Налаштований зі скоупом Scope.REQUEST: новий екземпляр інстанціюється для кожного окремого HTTP-запиту
 */
@Injectable({ scope: Scope.REQUEST })
export class RequestIdService {
  private readonly requestId: string;
  private readonly createdAt: number;

  constructor() {
    this.createdAt = Date.now();
    this.requestId = `req-${Math.random().toString(36).substring(2, 9)}-${this.createdAt}`;
  }

  getRequestId(): string {
    return this.requestId;
  }
}
