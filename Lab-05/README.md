# Практична робота № 5
## Тема: Модульна архітектура та ін’єкція залежностей у NestJS

**Дисципліна:** Розробка web-застосувань  
**Виконав** Студент Коштура Нікіта Богданович КН-43
**Варіант:** **4 (Доставка їжі та ресторанів — DishesModule & DishEntity)**  
**Рівень виконання:** **Рівень 3 (Просунутий — максимальний бал)**  

---

## 1. Мета роботи
- Опанувати принципи побудови масштабованої модульної архітектури серверних додатків на базі NestJS: поділ системи на ізольовані функціональні модулі (feature modules) та спільні утилітарні модулі (shared modules).
- Засвоїти фундаментальні механізми ін’єкції залежностей (Dependency Injection): експорт та імпорт сервісів між модулями через метадані `@Module({ imports, exports })`.
- Навчитися проєктувати кастомні провайдери (custom providers) із застосуванням стратегій `useValue` та `useFactory`, токенів ін’єкції (`STORE_CONFIG`, `FEE_CALCULATOR`) та декоратора `@Inject()`.
- Дослідити життєвий цикл компонентів NestJS через хук `OnModuleInit` для автоматичного заповнення сховища початковими даними (seeding).
- Опанувати керування областями видимості провайдерів (`Scope.DEFAULT` vs `Scope.REQUEST` через `RequestIdService`).

---

## 2. Предметна специфікація варіанта № 4

Згідно з таблицею варіантів методички для **Варіанта 4 ("Доставка їжі та ресторанів")** визначено:
- **Основний Feature Module:** `DishesModule`
- **Модельована сутність та сервіс:** `DishEntity`, `DishesService`
- **Другий Feature Module:** `OrdersModule` (`OrdersController`, `OrdersService`, `OrderEntity`)
- **Shared Module:** `SharedModule` (`SlugService`, `STORE_CONFIG`, `FEE_CALCULATOR`, `RequestIdService`)

---

## 3. Модульна архітектура системи

Застосунок декомпозовано на три слабко зв'язані модулі, що комунікують виключно через типізовані інтерфейси та експортовані провайдери:

```text
Lab-05/
├── package.json
├── tsconfig.json
├── requests.http                     # Колекція наскрізних запитів для тестування
├── test_endpoints.ps1                # Автоматизований PowerShell-скрипт тестування
├── dist/                             # Скомпільований код застосунку
├── src/
│   ├── shared/                       # Shared Module (Утиліти та спільні провайдери)
│   │   ├── config/
│   │   │   ├── app-config.provider.ts    # Custom Provider STORE_CONFIG (useValue)
│   │   │   └── fee-calculator.provider.ts# Custom Provider FEE_CALCULATOR (useFactory)
│   │   ├── services/
│   │   │   └── request-id.service.ts     # Request-Scoped провайдер (Scope.REQUEST)
│   │   ├── slug/
│   │   │   └── slug.service.ts           # Сервіс генерації SEO-slug рядків
│   │   └── shared.module.ts              # Модуль зі списком exports
│   ├── dishes/                       # Feature Module № 1 (Каталог страв)
│   │   ├── dto/
│   │   │   ├── create-dish.dto.ts
│   │   │   └── update-dish.dto.ts
│   │   ├── entities/
│   │   │   └── dish.entity.ts
│   │   ├── dishes.controller.ts
│   │   ├── dishes.service.ts             # Реалізує OnModuleInit (seeding даних)
│   │   └── dishes.module.ts              # Експортує DishesService
│   ├── orders/                       # Feature Module № 2 (Замовлення та білінг)
│   │   ├── dto/
│   │   │   └── create-order.dto.ts
│   │   ├── entities/
│   │   │   └── order.entity.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts             # Ін'єктує DishesService, FEE_CALCULATOR, STORE_CONFIG
│   │   └── orders.module.ts              # Імпортує DishesModule та SharedModule
│   ├── app.module.ts                 # Чистий кореневий модуль (тільки imports)
│   └── main.ts                       # Точка входу застосунку (порт 3000)
└── README.md
```

---

## 4. Опис реалізації за рівнями

### Рівень 1. Базовий: Ізоляція Feature Module та створення Shared Module
1. **Ізоляція основного ресурсу у `DishesModule`:**
   - `DishesController` та `DishesService` зареєстровані всередині `DishesModule`.
   - З кореневого модуля `AppModule` повністю видалено прямі оголошення сервісів і контролерів — там залишилися виключно імпорти модулів: `imports: [SharedModule, DishesModule, OrdersModule]`.
2. **Спільний модуль `SharedModule` та `SlugService`:**
   - Створено утилітарний сервіс `SlugService` з методом `generateSlug(title: string): string`, який транслітерує українську кирилицю в латиницю, замінює пробіли дефісами та очищує рядок (наприклад, `"Піца Пепероні Діавола"` $\rightarrow$ `"pitsa-peperoni-diavola"`).
   - `SlugService` зареєстровано в масиві `exports: [SlugService]` модуля `SharedModule`.
3. **Використання утилітарного сервісу в `DishesService`:**
   - `DishesModule` імпортує `SharedModule`.
   - `SlugService` ін'єктується через конструктор у `DishesService`. При створенні нових страв поле `slug` генерується автоматично.

---

### Рівень 2. Міжмодульна взаємодія та конфігураційні Custom Providers
1. **Feature Module замовлень (`OrdersModule`):**
   - Створено `OrdersController`, `OrdersService`, `CreateOrderDto`, `OrderEntity`.
2. **Міжмодульна залежність:**
   - `DishesModule` експортує сервіс: `exports: [DishesService]`.
   - `OrdersModule` додає `DishesModule` у свій масив `imports`.
   - `OrdersService` ін'єктує `DishesService` через конструктор і перед оформленням замовлення викликає `dishesService.findOne(dto.productId)`. Якщо страву не знайдено — генерується `NotFoundException`.
3. **Кастомний провайдер за стратегією `useValue` (`STORE_CONFIG`):**
   - Оголошено рядковий токен `STORE_CONFIG = 'STORE_CONFIG'`.
   - Зареєстровано статичний об'єкт конфігурації магазину (назва, валюта, ставка ПДВ):
     ```typescript
     export const appConfigProvider = {
       provide: STORE_CONFIG,
       useValue: {
         storeName: 'FoodExpress Restaurant & Delivery',
         defaultCurrency: 'UAH',
         taxPercent: 20,
       },
     };
     ```
4. **Кастомний провайдер за стратегією `useFactory` (`FEE_CALCULATOR`):**
   - Динамічна фабрика, що приймає `STORE_CONFIG` через масив `inject: [STORE_CONFIG]` та повертає об'єкт розрахунку податку `calculateTax(amount: number)`.
   - Впроваджено в `OrdersService` через `@Inject(FEE_CALCULATOR)` для автоматичного розрахунку ПДВ (`taxAmount`) і підсумкової вартості замовлення (`total = subtotal + taxAmount`).

---

### Рівень 3. Просунутий: Lifecycle Hooks, Scope та комплексне тестування
1. **Lifecycle Hook `OnModuleInit`:**
   - `DishesService` імплементує інтерфейс `OnModuleInit`:
     У методі `onModuleInit()` логується повідомлення:  
     `[DishesService] Ініціалізація модуля завершена. Завантажено початкові тестові дані.`  
     і автоматично наповнюється in-memory масив початковими стравами (`dish-1`, `dish-2`) зі згенерованими слагами.
   - `OrdersService` імплементує `OnModuleInit`:  
     логує: `[OrdersService] Сервіс замовлень успішно підключено до білінгу та каталогу.`
2. **Provider Scope (`Scope.REQUEST`):**
   - Створено сервіс `RequestIdService` з налаштуванням `@Injectable({ scope: Scope.REQUEST })`.
   - Для кожного нового HTTP-запиту створюється ізольований екземпляр із власним ідентифікатором запиту.
3. **Наскрізне тестування взаємодії модулів:**
   - Створено колекцію запитів `requests.http` та автоматизований PowerShell-тест `test_endpoints.ps1`.

---

## 5. Демонстрація виконання програми

### Запуск сервера NestJS:
```bash
npm start
```

**Лог ініціалізації модулів та хуків OnModuleInit:**
```text
[Nest] 7344 - 24.10.2026, 13:04:01 LOG [NestFactory] Starting Nest application...
[Nest] 7344 - 24.10.2026, 13:04:01 LOG [InstanceLoader] AppModule dependencies initialized +20ms
[Nest] 7344 - 24.10.2026, 13:04:01 LOG [InstanceLoader] SharedModule dependencies initialized +1ms
[Nest] 7344 - 24.10.2026, 13:04:01 LOG [InstanceLoader] DishesModule dependencies initialized +1ms
[Nest] 7344 - 24.10.2026, 13:04:01 LOG [InstanceLoader] OrdersModule dependencies initialized +1ms
[Nest] 7344 - 24.10.2026, 13:04:01 LOG [DishesService] Ініціалізація модуля завершена. Завантажено початкові тестові дані.
[Nest] 7344 - 24.10.2026, 13:04:01 LOG [OrdersService] Сервіс замовлень успішно підключено до білінгу та каталогу.
[Nest] 7344 - 24.10.2026, 13:04:01 LOG [RoutesResolver] DishesController {/dishes}: +5ms
[Nest] 7344 - 24.10.2026, 13:04:01 LOG [RouterExplorer] Mapped {/dishes, GET} route +2ms
[Nest] 7344 - 24.10.2026, 13:04:01 LOG [RouterExplorer] Mapped {/dishes/:id, GET} route +1ms
[Nest] 7344 - 24.10.2026, 13:04:01 LOG [RouterExplorer] Mapped {/dishes, POST} route +0ms
[Nest] 7344 - 24.10.2026, 13:04:01 LOG [RouterExplorer] Mapped {/dishes/:id, PATCH} route +1ms
[Nest] 7344 - 24.10.2026, 13:04:01 LOG [RouterExplorer] Mapped {/dishes/:id, DELETE} route +0ms
[Nest] 7344 - 24.10.2026, 13:04:01 LOG [RoutesResolver] OrdersController {/orders}: +0ms
[Nest] 7344 - 24.10.2026, 13:04:01 LOG [RouterExplorer] Mapped {/orders, POST} route +1ms
[Nest] 7344 - 24.10.2026, 13:04:01 LOG [RouterExplorer] Mapped {/orders, GET} route +0ms
[Nest] 7344 - 24.10.2026, 13:04:01 LOG [NestApplication] Nest application successfully started on port 3000
```

---

### Тестування міжмодульної взаємодії (результати викликів):

#### 1. Успішне створення замовлення (`POST /orders`):
```http
> POST /orders HTTP/1.1
> Host: localhost:3000
> Content-Type: application/json
{
  "productId": "dish-1",
  "quantity": 2,
  "customerEmail": "student@college.edu"
}

< HTTP/1.1 201 Created
< Content-Type: application/json; charset=utf-8
{
  "orderId": "ord-1792836251750",
  "productTitle": "Піца Пепероні Діавола",
  "productSlug": "pitsa-peperoni-diavola",
  "unitPrice": 340,
  "quantity": 2,
  "subtotal": 680,
  "taxAmount": 136,
  "total": 816,
  "currency": "UAH",
  "status": "confirmed",
  "createdAt": "2026-10-24T10:04:11.750Z"
}
```

#### 2. Спроба замовити неіснуючий товар (`POST /orders`):
```http
> POST /orders HTTP/1.1
> Content-Type: application/json
{
  "productId": "dish-999",
  "quantity": 1,
  "customerEmail": "student@college.edu"
}

< HTTP/1.1 404 Not Found
< Content-Type: application/json; charset=utf-8
{
  "message": "Сутність з ID dish-999 не знайдена",
  "error": "Not Found",
  "statusCode": 404
}
```

#### 3. Перевірка автогенерації slug при завантаженні каталогу (`GET /dishes`):
```http
> GET /dishes HTTP/1.1

< HTTP/1.1 200 OK
[
  {
    "id": "dish-1",
    "title": "Піца Пепероні Діавола",
    "slug": "pitsa-peperoni-diavola",
    "price": 340,
    "weightGrams": 520,
    "calories": 1180,
    "isSpicy": true,
    "createdAt": "2026-10-24T09:00:00.000Z",
    "updatedAt": "2026-10-24T09:00:00.000Z"
  },
  {
    "id": "dish-2",
    "title": "Суп Рамен із тясю",
    "slug": "sup-ramen-iz-tyasyu",
    "price": 240,
    "weightGrams": 650,
    "calories": 780,
    "isSpicy": true,
    "createdAt": "2026-10-24T09:15:00.000Z",
    "updatedAt": "2026-10-24T09:15:00.000Z"
  }
]
```

---

## 6. Відповіді на контрольні питання

### 1. Що таке функціональний модуль (Feature Module) та спільний модуль (Shared Module) у NestJS? Які задачі вирішує кожен із них?
- **Feature Module (Функціональний модуль):** модуль, який інкапсулює бізнес-логіку конкретної предметної сутності (наприклад, `DishesModule` для страв або `OrdersModule` для замовлень). Він об'єднує власний контролер, сервіс, репозиторій та моделі, відповідаючи за повний цикл роботи з цим ресурсом.
- **Shared Module (Спільний модуль):** модуль багаторазового використання (наприклад, `SharedModule` або `CommonModule`). Він не прив'язаний до бізнес-сутностей, а містить допоміжні утиліти (генератори слага, шифрування, калькулятори), кастомні глобальні провайдери конфігурацій чи бази даних і реекспортує їх для використання в усіх інших Feature-модулях застосунку.

---

### 2. Як працює інкапсуляція провайдерів у NestJS? Що станеться, якщо спробувати використати сервіс іншого модуля без додавання його до масиву `exports`?
- **Принцип інкапсуляції:** за замовчуванням усі провайдери в NestJS є **приватними (локальними)** для того модуля, в якому вони оголошені в масиві `providers`. Жоден інший модуль не має до них доступу, навіть якщо імпортує цей модуль.
- **Що станеться без `exports`:** якщо модуль `OrdersModule` імпортує `DishesModule`, але в `DishesModule` розробник забув додати `exports: [DishesService]`, під час запуску NestJS IoC-контейнер не зможе побудувати граф залежностей і впаде з критичною помилкою:  
  `Nest can't resolve dependencies of the OrdersService (?). Please make sure that the argument DishesService at index [0] is available in the OrdersModule context.`

---

### 3. У чому полягає різниця між стандартним провайдером (`useClass`), константним провайдером (`useValue`) та фабричним провайдером (`useFactory`)?
- **`useClass` (Стандартний):** `providers: [UsersService]` (скорочення від `{ provide: UsersService, useClass: UsersService }`). Контейнер сам інстанціює клас через ключове слово `new` та керує його життєвим циклом.
- **`useValue` (Константний):** дозволяє зареєструвати готовий статичний об'єкт, конфігурацію, константу або макетний сервіс (mock) під рядковим токеном: `{ provide: 'CONFIG', useValue: { port: 3000 } }`. Часто застосовується для передачі конфігурації та модульного тестування.
- **`useFactory` (Фабричний):** дозволяє створити екземпляр сервісу **динамічно** за допомогою функції. Фабрика може бути асинхронною (`async/await`) та приймати інші залежності з контейнера через масив `inject`.

---

### 4. Для чого призначений декоратор `@Inject()`? У яких випадках ін’єкція залежності не може відбутися автоматично лише за типом у конструкторі?
- **Призначення:** `@Inject(token)` вказує IoC-контейнеру точний токен (Token), за яким слід шукати залежність у контейнері.
- **Коли ін'єкція за типом неможлива:**
  1. Коли провайдер зареєстрований за **рядковим або символьним токеном** (наприклад, `@Inject('STORE_CONFIG')`, `@Inject('FEE_CALCULATOR')`), оскільки у рядків немає відповідного класу TypeScript.
  2. Коли типом параметра є **інтерфейс (`interface`)**, оскільки після компіляції інтерфейси повністю стираються з коду (Type Erasure), і у метаданих `design:paramtypes` нічого не зберігається.
  3. Коли розробник використовує нестандартні середовища компіляції (esbuild / SWC без повної підтримки `emitDecoratorMetadata`).

---

### 5. Як працює масив `inject` у конфігурації провайдера `useFactory`?
Масив `inject` містить перелік токенів або класів, які необхідно дістати з IoC-контейнера і передати як аргументи у фабричну функцію `useFactory` у суворо відповідному порядку:
```typescript
{
  provide: 'FEE_CALCULATOR',
  useFactory: (config: StoreConfig) => {
    return { calculateTax: (amt) => amt * (config.taxPercent / 100) };
  },
  inject: [STORE_CONFIG] // Передається першим аргументом у config
}
```
Якщо в `inject` вказати `[ConfigService, DatabaseService]`, функція отримає `(config, db) => ...`.

---

### 6. Що таке життєвий цикл компонента NestJS? Коли саме спрацьовує хук `OnModuleInit` і які завдання у ньому рекомендовано виконувати?
- **Життєвий цикл (Lifecycle):** послідовність етапів життя застосунку від створення модульного графа до його завершення.
- **Коли спрацьовує `OnModuleInit`:** метод `onModuleInit()` викликається одразу після того, як залежності поточного модуля успішно розв'язані, але **до того**, як HTTP-сервер почне приймати вхідні клієнтські запити.
- **Рекомендовані завдання:**
  - Первинне наповнення оперативної пам'яті тестовими записами (Data Seeding);
  - Підключення до зовнішніх шин повідомлень (RabbitMQ, Kafka);
  - Прогрів кешу (Cache Warmup);
  - Перевірка валідності обов'язкових змінних середовища.

---

### 7. Чим відрізняється поведінка провайдера з областю видимості за замовчуванням (`Scope.DEFAULT`) від `Scope.REQUEST` та `Scope.TRANSIENT`?
- **`Scope.DEFAULT` (Singleton):** провайдер створюється **один раз на весь час життя додатка**. Усі споживачі (контролери, сервіси) отримують одне й те саме спільне посилання на екземпляр. Є найбільш продуктивним і рекомендованим стандартом.
- **`Scope.REQUEST` (Request-scoped):** новий екземпляр провайдера створюється **для кожного окремого вхідного HTTP-запиту** і автоматично знищується збирачем сміття (GC) після відправки відповіді. Дозволяє безпечно зберігати контекст запиту (наприклад, `requestId`, поточного користувача), але знижує продуктивність через часте створення об'єктів.
- **`Scope.TRANSIENT` (Transient):** новий екземпляр провайдера створюється **кожен раз, коли його хтось ін'єктує**. Якщо сервіс впроваджено у два різних контролери — кожен отримає власний ізольований екземпляр.

---

### 8. Що таке циклічна залежність (circular dependency) між модулями та за допомогою якої функції (`forwardRef()`) вона вирішується у NestJS?
- **Циклічна залежність:** архітектурний глухий кут, коли Модуль A залежить від Модуля B, а Модуль B одночасно залежить від Модуля A (`A -> B -> A`). Під час старту Node.js не може визначити, який із модулів завантажувати першим, і один із них стає `undefined`.
- **Вирішення через `forwardRef()`:**
  Функція `forwardRef(() => TargetModule)` відкладає розв'язання посилання на клас модуля до того моменту, коли обидва модулі будуть проініціалізовані.
  ```typescript
  // У DishesModule:
  imports: [forwardRef(() => OrdersModule)]

  // У OrdersModule:
  imports: [forwardRef(() => DishesModule)]
  ```
  Це дозволяє NestJS успішно побудувати циклічний граф залежностей без падіння процесу.
