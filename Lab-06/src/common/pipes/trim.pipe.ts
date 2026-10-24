import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

/**
 * Кастомний пайп для санітизації тексту (видалення зайвих пробілів на початку та в кінці)
 */
@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (typeof value === 'object' && value !== null) {
      this.trimObjectProperties(value as Record<string, unknown>);
    }

    return value;
  }

  private trimObjectProperties(obj: Record<string, unknown>): void {
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'string') {
        obj[key] = val.trim();
      } else if (typeof val === 'object' && val !== null) {
        this.trimObjectProperties(val as Record<string, unknown>);
      }
    }
  }
}
