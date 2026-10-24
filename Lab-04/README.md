# Практична робота № 4
## Тема: Розроблення REST-ендпоінтів засобами NestJS

**Дисципліна:** Розробка web-застосувань  
**Номер у журналі:** 24  
**Розрахунок варіанта:** `((24 - 1) % 10) + 1 = 4`  
**Варіант:** **4 (Доставка їжі та ресторанів — ендпоінт /dishes)**  
**Рівень виконання:** **Рівень 3 (Просунутий — максимальний бал)**  

---

## 1. Мета роботи
- Опанувати архітектурні засади сучасного фреймворку NestJS: модульну організацію, інверсію керування (Inversion of Control, IoC) та ін’єкцію залежностей (Dependency Injection, DI).
- Навчитися створювати та конфігурувати проєкт NestJS, дослідити призначення точки входу `main.ts` та кореневого модуля `AppModule`.
- Опанувати розробку REST-контролерів із маршрутизацією через декларативні декоратори методів (`@Get`, `@Post`, `@Patch`, `@Delete`).
- Навчитися витягувати дані з HTTP-запитів за допомогою декораторів параметрів (`@Param`, `@Query`, `@Body`, `@Headers`) та формувати типізовані контракти DTO (Data Transfer Objects).
- Реалізувати інкапсуляцію бізнес-логіки в сервісному провайдері (`DishesService`) з in-memory сховищем та налаштувати коректні HTTP-статуси (`201 Created`, `204 No Content`) і стандартні виключення (`NotFoundException`).
- Дослідити керування службовими HTTP-заголовками відповіді (`@Header`) та реалізувати query-фільтрацію з пагінацією.

---

## 2. Предметна специфікація варіанта № 4

Згідно з таблицею варіантів методички для **Варіанта 4 ("Доставка їжі та ресторанів")** визначено:
- **Базовий префікс маршруту:** `/dishes`
- **Модельована сутність:** `DishEntity`
- **Специфічні поля DTO створення (`CreateDishDto`):**
  - `title: string` — назва страви;
  - `price: number` — вартість у гривнях;
  - `weightGrams: number` — вага порції у грамах;
  - `calories: number` — енергетична цінність (ккал);
  - `isSpicy: boolean` — ознака пікантності / гостроти.

---

## 3. Архітектура та структура проєкту

Застосунок побудовано відповідно до стандартів чистої архітектури NestJS:

```text
Lab-04/
├── package.json              # Залежності (@nestjs/core, @nestjs/common, express, reflect-metadata)
├── tsconfig.json             # Конфігурація з підтримкою декораторів
├── requests.http             # Колекція запитів для тестування ендпоінтів у VS Code
├── test_endpoints.ps1        # Скрипт автоматизованого тестування всіх маршрутів
├── dist/                     # Скомпільований код
├── src/
│   ├── dishes/
│   │   ├── dto/
│   │   │   ├── create-dish.dto.ts  # Контракт створення страви
│   │   │   └── update-dish.dto.ts  # Контракт часткового оновлення страви
│   │   ├── entities/
│   │   │   └── dish.entity.ts      # Модель ресторанної страви в базі даних
│   │   ├── dishes.controller.ts    # REST-контролер з декораторами маршрутизації
│   │   ├── dishes.service.ts       # Сервісний провайдер бізнес-логіки (In-Memory)
│   │   └── dishes.module.ts        # Ресурсний модуль
│   ├── app.module.ts         # Кореневий модуль застосунку
│   └── main.ts               # Точка входу: ініціалізація NestFactory та запуск на порті 3000
└── README.md                 # Повний звіт та відповіді на контрольні питання
```

---

## 4. Опис реалізації за рівнями

### Рівень 1. Базовий: Створення NestJS проєкту та оголошення ендпоінтів
1. **Ініціалізація та налаштування середовища:**
   - Налаштовано `tsconfig.json` з увімкненими прапорцями:
     `"experimentalDecorators": true`, `"emitDecoratorMetadata": true`.
   - Точка входу `src/main.ts` створює екземпляр застосунку за допомогою `NestFactory.create(AppModule)` та запускає HTTP-сервер на порті `3000`.
2. **Контролер `DishesController`:**
   - Зареєстровано базовий префікс шляху `@Controller('dishes')`.
   - Контролер автоматично зареєстровано в модулі `DishesModule`, який підключено в кореневий `AppModule`.
3. **Контракти DTO:**
   - Створено клас `CreateDishDto` з обов'язковими полями згідно з Варіантом 4 (`title`, `price`, `weightGrams`, `calories`, `isSpicy`).
   - Створено клас `UpdateDishDto`, де всі поля оголошені опціональними (`?`) для підтримки PATCH-оновлень.

---

### Рівень 2. Повний REST CRUD, HTTP-статуси та In-Memory Service
1. **Сервісний провайдер `DishesService` (`@Injectable`):**
   - Реалізовано приватне in-memory сховище `private items: DishEntity[]`, попередньо заповнене початковими стравами (Маргарита, Рамен, Цезар).
2. **Реалізація методів із генерацією стандартних виключень:**
   - `findAll()` — повертає список сутностей.
   - `findOne(id: string)` — здійснює пошук за `id`. Якщо елемент відсутній — викидає стандартне виключення NestJS:
     ```typescript
     throw new NotFoundException(`Сутність з ID ${id} не знайдена`);
     ```
     що автоматично транслюється у клієнтську відповідь `404 Not Found`.
   - `create(dto: CreateDishDto)` — генерує унікальний ідентифікатор `id: Date.now().toString()`, створює сутність та додає до сховища.
   - `update(id: string, dto: UpdateDishDto)` — знаходить страву або кидає `NotFoundException`, оновлює лише передані поля та актуалізує `updatedAt: new Date()`.
   - `remove(id: string)` — видаляє страву або кидає `NotFoundException`.
3. **Dependency Injection та керування HTTP-статусами:**
   - Сервіс впроваджено в контролер через параметризований конструктор (Constructor Injection).
   - Для методу `@Post()` встановлено явний статус `201 Created` через декоратор `@HttpCode(HttpStatus.CREATED)`.
   - Для методу `@Delete(':id')` налаштовано повернення статусу `204 No Content` через декоратор `@HttpCode(HttpStatus.NO_CONTENT)`.

---

### Рівень 3. Просунутий: Query-фільтрація, кастомні Headers та API-тестування
1. **Пошук та пагінація через Query Params:**
   - Метод `@Get()` контролера зчитує параметри запиту:
     - `@Query('search') search?: string` — пошук за підрядком у назві страви (без урахування регістру `toLowerCase()`).
     - `@Query('limit') limit?: string` — обмеження кількості результатів у видачі.
2. **Керування HTTP-заголовками відповіді:**
   - До методу `@Get()` додано декларативні декоратори заголовків:
     ```typescript
     @Header('X-API-Version', '1.0')
     @Header('X-Service-Status', 'operational')
     ```
3. **Тестування API:**
   - Створено файл `requests.http` для інтерактивного тестування через розширення VS Code REST Client.
   - Створено PowerShell-скрипт `test_endpoints.ps1`, який автоматично перевіряє повний цикл роботи REST API.

---

## 5. Демонстрація виконання програми

### Крок 1. Запуск сервера NestJS:
```bash
npm start
```
**Лог старту сервера в консолі:**
```text
[Nest] 12228 - 24.10.2026, 12:50:39 LOG [NestFactory] Starting Nest application...
[Nest] 12228 - 24.10.2026, 12:50:39 LOG [InstanceLoader] AppModule dependencies initialized +21ms
[Nest] 12228 - 24.10.2026, 12:50:39 LOG [InstanceLoader] DishesModule dependencies initialized +0ms
[Nest] 12228 - 24.10.2026, 12:50:39 LOG [RoutesResolver] DishesController {/dishes}: +10ms
[Nest] 12228 - 24.10.2026, 12:50:39 LOG [RouterExplorer] Mapped {/dishes, GET} route +4ms
[Nest] 12228 - 24.10.2026, 12:50:39 LOG [RouterExplorer] Mapped {/dishes/:id, GET} route +0ms
[Nest] 12228 - 24.10.2026, 12:50:39 LOG [RouterExplorer] Mapped {/dishes, POST} route +1ms
[Nest] 12228 - 24.10.2026, 12:50:39 LOG [RouterExplorer] Mapped {/dishes/:id, PATCH} route +1ms
[Nest] 12228 - 24.10.2026, 12:50:39 LOG [RouterExplorer] Mapped {/dishes/:id, DELETE} route +1ms
[Nest] 12228 - 24.10.2026, 12:50:39 LOG [NestApplication] Nest application successfully started +3ms
[NestApplication] Nest application successfully started on port 3000
```

---

### Крок 2. Тестування ендпоінтів через HTTP-клієнт:

#### 1. Створення страви (`POST /dishes`):
```http
> POST /dishes HTTP/1.1
> Host: localhost:3000
> Content-Type: application/json
{
  "title": "Піца Пепероні Діавола",
  "price": 340,
  "weightGrams": 520,
  "calories": 1180,
  "isSpicy": true
}

< HTTP/1.1 201 Created
< Content-Type: application/json; charset=utf-8
{
  "id": "1792835453686",
  "title": "Піца Пепероні Діавола",
  "price": 340,
  "weightGrams": 520,
  "calories": 1180,
  "isSpicy": true,
  "createdAt": "2026-10-24T09:50:53.686Z",
  "updatedAt": "2026-10-24T09:50:53.686Z"
}
```

#### 2. Запит неіснуючої страви (`GET /dishes/non-existent-id`):
```http
> GET /dishes/non-existent-id HTTP/1.1
> Host: localhost:3000

< HTTP/1.1 404 Not Found
< Content-Type: application/json; charset=utf-8
{
  "message": "Сутність з ID non-existent-id не знайдена",
  "error": "Not Found",
  "statusCode": 404
}
```

#### 3. Отримання списку з кастомними заголовками (`GET /dishes`):
```http
> GET /dishes HTTP/1.1

< HTTP/1.1 200 OK
< X-API-Version: 1.0
< X-Service-Status: operational
< Content-Type: application/json; charset=utf-8
[ ...масив страв... ]
```

#### 4. Часткове оновлення (`PATCH /dishes/1`):
```http
> PATCH /dishes/1 HTTP/1.1
> Content-Type: application/json
{
  "price": 285
}

< HTTP/1.1 200 OK
{
  "id": "1",
  "title": "Піца Маргарита Класична",
  "price": 285,
  "weightGrams": 480,
  "calories": 950,
  "isSpicy": false,
  "createdAt": "2026-10-24T08:00:00.000Z",
  "updatedAt": "2026-10-24T09:50:53.704Z"
}
```

#### 5. Видалення страви (`DELETE /dishes/3`):
```http
> DELETE /dishes/3 HTTP/1.1

< HTTP/1.1 204 No Content
```

---

## 6. Відповіді на контрольні питання

### 1. Що таке інверсія керування (Inversion of Control) та як принцип Dependency Injection реалізований у NestJS?
- **Inversion of Control (IoC):** це архітектурний принцип, за якого керування створенням об'єктів та життєвим циклом компонентів передається від самого класу до зовнішнього механізму (фреймворку / контейнеру). Клас більше сам не створює свої залежності через `new Service()`.
- **Dependency Injection (DI) у NestJS:** це конкретна реалізація IoC.
  1. Розробник позначає сервіс декоратором `@Injectable()`.
  2. У конструкторі контролера вказується залежність: `constructor(private readonly dishesService: DishesService) {}`.
  3. Під час старту застосунку IoC-контейнер NestJS самостійно створює екземпляр `DishesService` і передає (ін'єктує) його в конструктор `DishesController`. Це забезпечує слабку зв'язаність (loose coupling) та легке модульне тестування.

---

### 2. Яка різниця між модулем (`@Module`), контролером (`@Controller`) та провайдером (`@Injectable`)?
- **`@Module` (Модуль):** організаційна одиниця застосунку. Об'єднує пов'язані контролери та провайдери у функціональний блок, керує областю видимості (експортом та імпортом залежностей).
- **`@Controller` (Контролер):** шар обробки HTTP-запитів. Приймає вхідний запит від клієнта (URL, метод, заголовки, тіло), валідує параметри, викликає відповідні методи сервісу та повертає HTTP-відповідь. Контролер **не повинен містити бізнес-логіки**.
- **`@Injectable` (Провайдер / Сервіс):** шар бізнес-логіки. Інкапсулює обчислення, валідацію, звернення до бази даних або сторонніх API. Створюється та керується IoC-контейнером і може впроваджуватися в інші сервіси або контролери.

---

### 3. Чому для створення DTO у NestJS використовуються класи TypeScript, а не інтерфейси (`interfaces`)?
- **Головна причина — збереження в середовищі виконання (Runtime):**
  - **Інтерфейси (`interface`)** у TypeScript існують **виключно на етапі компіляції**. Під час компіляції в JavaScript відбувається стирання типів (Type Erasure), тому в runtime інтерфейси повністю зникають.
  - **Класи (`class`)** є повноцінними сутностями стандарту ECMAScript і **зберігаються в JavaScript після компіляції**.
- Завдяки збереженню класів у runtime такі бібліотеки NestJS, як `class-validator`, `class-transformer` та механізм `ValidationPipe`, можуть зчитувати метадані декораторів і автоматично валідувати вхідні JSON-дані від клієнта.

---

### 4. Які декоратори надає NestJS для витягування параметрів запиту (`route params`, `query params`, `body payload`)? Наведіть приклади їх застосування.
NestJS надає зручний набір декларативних декораторів аргументів:
1. **`@Param(key?: string)`:** витягує динамічні параметри шляху маршруту (наприклад `:id`).
   - *Приклад:* `@Get(':id') findOne(@Param('id') id: string)`
2. **`@Query(key?: string)`:** витягує параметри рядка запиту (Query String після знака `?`).
   - *Приклад:* `@Get() findAll(@Query('search') search?: string, @Query('limit') limit?: string)`
3. **`@Body(key?: string)`:** витягує та десеріалізує тіло запиту (Request Payload / DTO).
   - *Приклад:* `@Post() create(@Body() createDto: CreateDishDto)`
4. **`@Headers(key?: string)`:** отримує HTTP-заголовки запиту.
   - *Приклад:* `@Get() checkHeader(@Headers('authorization') auth: string)`

---

### 5. Який HTTP-статус за замовчуванням повертає метод контролера NestJS для операцій GET, POST та DELETE? Як змінити статус відповіді за допомогою декоратора `@HttpCode()`?
- **Статуси за замовчуванням:**
  - `GET`, `PUT`, `PATCH`, `DELETE` — повертають статус **`200 OK`**.
  - `POST` — повертає статус **`201 Created`**.
- **Зміна статусу через `@HttpCode()`:**
  Для дотримання стандартів REST (наприклад, коли операція видалення або створення потребує специфічного статусу) використовується декоратор `@HttpCode(status: number)`:
  ```typescript
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Повертає 204 No Content
  remove(@Param('id') id: string) {
    this.dishesService.remove(id);
  }
  ```

---

### 6. Як працює вбудована система обробки виключень NestJS? Що повертає фреймворк клієнту при виклику `throw new NotFoundException()`?
- **Як працює:** NestJS має глобальний шар фільтрації виключень (**Global Exception Filter**). Коли в коді виникає виключення, що наслідує базовий клас `HttpException`, глобальний фільтр автоматично перехоплює його, зупиняє подальше виконання і формує стандартизовану JSON-відповідь із відповідним HTTP-кодом.
- **Що повертається при `throw new NotFoundException('Сутність з ID ... не знайдена')`:**
  Фреймворк повертає HTTP-статус **`404 Not Found`** і тіло:
  ```json
  {
    "message": "Сутність з ID non-existent-id не знайдена",
    "error": "Not Found",
    "statusCode": 404
  }
  ```

---

### 7. Як за допомогою декоратора `@Header()` додати кастомний HTTP-заголовок до відповіді сервера?
Декоратор `@Header(name: string, value: string)` дозволяє декларативно прикріпити до відповіді конкретного методу контролера будь-який заголовок:
```typescript
@Get()
@Header('X-API-Version', '1.0')
@Header('X-Service-Status', 'operational')
findAll() {
  return this.dishesService.findAll();
}
```
При отриманні запиту клієнт побачить у блоці заголовків відповіді `X-API-Version: 1.0` та `X-Service-Status: operational`.

---

### 8. У чому полягає відмінність між HTTP-методами PUT та PATCH під час проєктування RESTful API?
- **`PUT` (Повне оновлення / Заміна):**
  - Метод призначений для **повної заміни** ресурсу. Клієнт зобов'язаний надіслати повний об'єкт із усіма полями. Якщо якесь поле не передане, воно повинно бути видалене або скинуте до значення за замовчуванням.
  - Є **ідемпотентним**.
- **`PATCH` (Часткове оновлення):**
  - Метод призначений для **часткової модифікації** ресурсу. Клієнт надсилає лише ті поля, які необхідно змінити (наприклад, тільки оновлену ціну `{ "price": 285 }`), а всі інші властивості об'єкта залишаються недоторканими.
  - У NestJS для `PATCH` створюються DTO з опціональними полями (`UpdateDishDto`), де всі поля позначені знаком `?`.
