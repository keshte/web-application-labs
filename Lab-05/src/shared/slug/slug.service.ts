import { Injectable } from '@nestjs/common';

@Injectable()
export class SlugService {
  /**
   * Транслітерація українських символів у латиницю
   */
  private readonly cyrillicMap: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ye', ж: 'zh',
    з: 'z', и: 'y', і: 'i', ї: 'yi', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n',
    о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'shch', ь: '', ю: 'yu', я: 'ya',
  };

  /**
   * Генерує SEO-friendly URL slug із рядка назви
   * Наприклад: "Піца Пепероні Діавола" -> "pitsa-peperoni-diavola"
   */
  generateSlug(title: string): string {
    const lower = title.trim().toLowerCase();

    // Транслітерація
    let transliterated = '';
    for (const char of lower) {
      transliterated += this.cyrillicMap[char] !== undefined ? this.cyrillicMap[char] : char;
    }

    // Заміна пробілів та некоректних символів дефісами
    return transliterated
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
