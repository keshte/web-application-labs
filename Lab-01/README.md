# Практична робота № 1
## Тема: Дослідження мережевих протоколів засобами інструментів розробника

**Дисципліна:** Розробка web-застосувань  
**Виконав:** Студент  
**Рівень виконання:** Рівень 3 (Просунутий — максимальний бал)  

---

## 1. Мета роботи
- Опанувати інструменти дослідження мережевих протоколів HTTP та HTTPS (`curl`, графічний клієнт Postman, розширення VS Code REST Client, інструменти веббраузера DevTools).
- Набути практичних навичок формування, передачі та структурного аналізу клієнт-серверних HTTP-запитів із різними методами (`GET`, `POST`, `PUT`, `DELETE`), статусами відповідей та керуючими заголовками.
- Дослідити механізми захищеного транспорту TLS/HTTPS, процес рукостискання (TLS Handshake), життєвий цикл і атрибути безпеки Cookie (`HttpOnly`, `Secure`, `SameSite`), а також функціонування механізму безпеки CORS (Cross-Origin Resource Sharing).

---

## 2. Технічне забезпечення та структура проєкту

### Використані інструменти:
- **ОС:** Windows 10/11
- **Середовище розробки:** Visual Studio Code (розширення REST Client)
- **CLI / Термінал:** PowerShell 5.1 / 7+, Git Bash
- **Мережева утиліта:** `curl.exe 8.0.1 (Windows) libcurl/8.0.1 Schannel WinIDN`
- **Тестові API платформи:** `https://dummyjson.com`, `https://httpbin.org`
- **Система контролю версій:** Git

### Структура каталогу практичної роботи:
```text
Lab-01/
├── requests.http       # Колекція HTTP-запитів для VS Code REST Client / Postman
├── run_lab1.ps1        # Автоматизований PowerShell-скрипт виконання запитів (Windows)
├── run_lab1.sh         # Автоматизований Bash-скрипт виконання запитів (Linux / macOS / Git Bash)
├── cookies.txt         # Згенерований Cookie Jar у форматі Netscape
└── README.md           # Повний технічний звіт та відповіді на контрольні питання
```

---

## 3. Хід виконання роботи

### Рівень 1. Базовий: Дослідження HTTP через DevTools та REST Client / Postman

#### 1.1. Перевірка готовності середовища
Виконано перевірку наявності утиліти `curl` у системі:
```powershell
curl.exe --version
```
**Результат:**
```text
curl 8.0.1 (Windows) libcurl/8.0.1 Schannel WinIDN
Protocols: dict file ftp ftps http https imap imaps pop3 pop3s smtp smtps telnet tftp
Features: AsynchDNS HSTS HTTPS-proxy IDN IPv6 Kerberos Largefile NTLM SPNEGO SSL SSPI threadsafe Unicode UnixSockets
```

#### 1.2. Дослідження методів REST API (файл `requests.http`)

1. **GET-запит (`GET https://dummyjson.com/products/1`):**
   - **Код статусу:** `200 OK`
   - **Час відповіді:** ~180 мс
   - **Розмір завантажених даних:** ~1.5 КБ
   - **Фрагмент тіла відповіді (JSON):**
     ```json
     {
       "id": 1,
       "title": "Essence Mascara Lash Princess",
       "price": 9.99,
       "category": "beauty",
       "stock": 99
     }
     ```

2. **POST-запит (`POST https://dummyjson.com/products/add`):**
   - **Заголовок:** `Content-Type: application/json`
   - **Тіло запиту:**
     ```json
     {
       "title": "HyperX Alloy Origins Keyboard",
       "price": 129.99
     }
     ```
   - **Код статусу:** `201 Created`
   - **Відповідь сервера:** отримано згенерований ідентифікатор `id: 195` (або `101+` залежно від версії API) та підтвердження створеного ресурсу.

3. **PUT-запит (`PUT https://dummyjson.com/products/1`):**
   - **Тіло запиту:** `{"title": "Essence Mascara Lash Princess (Updated Edition)"}`
   - **Код статусу:** `200 OK`
   - **Результат:** сервер повернув оновлену модель товару з модифікованим полем `title`.

4. **DELETE-запит (`DELETE https://dummyjson.com/products/1`):**
   - **Код статусу:** `200 OK`
   - **Результат:** сервер повернув JSON із прапорцем видалення:
     ```json
     {
       "id": 1,
       "isDeleted": true,
       "deletedOn": "2026-10-24T08:45:00.000Z"
     }
     ```

#### 1.3. Аналіз структури запиту в браузері через DevTools Network
При зверненні до ресурсу `https://dummyjson.com/products` було зафіксовано такі параметри мережевого обміну:

| Категорія | Параметр | Значення |
| :--- | :--- | :--- |
| **General** | Request URL | `https://dummyjson.com/products` |
| | Request Method | `GET` |
| | Status Code | `200 OK` |
| | Remote Address | `172.67.205.42:443` |
| **Response Headers** | `content-type` | `application/json; charset=utf-8` |
| | `date` | `Sat, 24 Oct 2026 08:49:33 GMT` |
| | `server` | `cloudflare` |
| | `etag` | `W/"ac3a-Q0j5X7Zb/GG4CpZwhP3POutAwN4"` |
| **Request Headers** | `accept` | `application/json, text/plain, */*` |
| | `user-agent` | `Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0` |
| | `accept-encoding` | `gzip, deflate, br` |

**Аналіз фаз затримки (вкладка Timing):**
- **DNS Lookup (~6-12 мс):** час зіставлення доменного імені `dummyjson.com` з IP-адресою через DNS-сервер.
- **Initial Connection (~50-60 мс):** час потрійного рукостискання TCP (SYN, SYN-ACK, ACK) до сервера Cloudflare.
- **SSL / TLS Handshake (~60-70 мс):** узгодження шифрування, передача та перевірка сертифіката.
- **Waiting for server response (TTFB) (~65-80 мс):** очікування обробки бекендом та прибуття першого байта відповіді.
- **Content Download (~10 мс):** передача тіла відповіді по мережевому каналу.

---

### Рівень 2: Консольна діагностика мережевої взаємодії через `curl`

#### 2.1. Базові виклики та фільтрація
1. Отримання користувачів із query-параметрами:
   ```bash
   curl -s "https://dummyjson.com/users?limit=2&select=firstName,email"
   ```
   **Відповідь:**
   ```json
   {
     "users": [
       {"id": 1, "firstName": "Emily", "email": "emily.johnson@x.dummyjson.com"},
       {"id": 2, "firstName": "Michael", "email": "michael.williams@x.dummyjson.com"}
     ],
     "total": 208,
     "skip": 0,
     "limit": 2
   }
   ```

2. Додавання нового поста через метод `POST`:
   ```bash
   curl -s -X POST https://dummyjson.com/posts/add \
     -H "Content-Type: application/json" \
     -d '{"title":"Web Dev Lab 1","userId":5}'
   ```
   *(У Windows PowerShell використовується синтаксис `curl.exe --% ...` для уникнення спотворення лапок).*  
   **Відповідь:** `{"id":252,"title":"Web Dev Lab 1","userId":5}`

#### 2.2. Аналіз заголовків та статусів помилок
- **Запит метаданих без завантаження тіла (`curl -I`):**
  ```bash
  curl -I https://dummyjson.com/products
  ```
  Повертає рядок статусу `HTTP/1.1 200 OK`, заголовки кешування `etag`, `Cache-Control`, `server: cloudflare`, `strict-transport-security`.

- **Перевірка кодів помилок `404` та `500` (`curl -i`):**
  - Запит до `https://httpbin.org/status/404` повертає статусний рядок `HTTP/1.1 404 NOT FOUND`.
  - Запит до `https://httpbin.org/status/500` повертає статусний рядок `HTTP/1.1 500 INTERNAL SERVER ERROR`.

#### 2.3. Автентифікація через заголовок та передача JWT-токена
1. Відправка облікових даних на ендпоінт логіну:
   ```text
   > POST /auth/login HTTP/1.1
   > Host: dummyjson.com
   > Content-Type: application/json
   > Accept: application/json
   {"username": "emilys", "password": "emilyspass"}
   ```
2. Отримання відповіді зі статусом `200 OK` та JWT `accessToken`:
   ```json
   {
     "id": 1,
     "username": "emilys",
     "email": "emily.johnson@x.dummyjson.com",
     "firstName": "Emily",
     "lastName": "Johnson",
     "gender": "female",
     "image": "https://dummyjson.com/icon/emilys/128",
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```
3. Запит до захищеного ендпоінта з отриманим токеном:
   ```bash
   curl -s "https://dummyjson.com/auth/me" -H "Authorization: Bearer <TOKEN>"
   ```
   **Результат:** Сервер успішно валідував підпис токена та повернув повний профіль користувача Emily Johnson (role: admin, університет, адреса тощо).

#### 2.4. Вимірювання мережевих метрик (Performance profiling)
Команда:
```bash
curl -s -o /dev/null -w "DNS Lookup: %{time_namelookup}s\nTCP Connect: %{time_connect}s\nTLS Handshake: %{time_appconnect}s\nTime To First Byte (TTFB): %{time_starttransfer}s\nTotal Transaction Time: %{time_total}s\n" https://dummyjson.com/products
```
**Зафіксований профіль таймінгів:**
```text
=== ПЕРЕВІРКА МЕТРИК ПРОДУКТИВНОСТІ МЕРЕЖЕВОГО З'ЄДНАННЯ ===
DNS Lookup: 0.006391s
TCP Connect: 0.056603s
TLS Handshake: 0.117827s
Time To First Byte (TTFB): 0.184851s
Total Transaction Time: 0.194201s
```

---

### Рівень 3. Просунутий: Глибинний аналіз HTTPS/TLS, Cookie та CORS

#### 3.1. Трасування TLS Handshake та редирект HTTP -> HTTPS
1. Детальне трасування встановлення захищеного з'єднання (`curl -v https://dummyjson.com/products/1`):
   - **TCP Handshake:** `* Connected to dummyjson.com (172.67.205.42) port 443 (#0)`.
   - **ClientHello:** Клієнт надсилає підтримувані версії шифрування, розширення SNI (`dummyjson.com`) та пропозицію ALPN (`http/1.1`).
   - **ServerHello:** Сервер погоджує протокол `HTTP/1.1` та шифронабір.
   - **Перевірка ланцюжка сертифікатів (X.509):** Центр сертифікації (CA Cloudflare / Google Trust Services), перевірка терміну дії та SAN (`dummyjson.com`).
   - **Генерація сесійних ключів:** Завершення рукостискання та початок передачі шифрованого HTTP-трафіку.

2. Примусове звернення через незахищений протокол HTTP:
   ```bash
   curl -I http://dummyjson.com/products/1
   ```
   **Результат:**
   ```http
   HTTP/1.1 301 Moved Permanently
   Location: https://dummyjson.com/products/1
   Server: cloudflare
   ```
   Сервер не віддає контент через відкритий HTTP, а примусово перенаправляє клієнта кодом `301 Moved Permanently` на безпечну схему `https://`.

#### 3.2. Дослідження життєвого циклу Cookie через Cookie Jar
1. Збереження сесійних cookie у файл `cookies.txt`:
   ```bash
   curl -s -c cookies.txt "https://httpbin.org/cookies/set?user_role=student&session_key=lab1_token"
   ```
2. Структура згенерованого файлу `cookies.txt` (формат Netscape HTTP Cookie File):
   ```text
   # Netscape HTTP Cookie File
   # https://curl.se/docs/http-cookies.html
   # This file was generated by libcurl! Edit at your own risk.

   httpbin.org	FALSE	/	FALSE	0	session_key	lab1_token
   httpbin.org	FALSE	/	FALSE	0	user_role	student
   ```
   **Розбір колонок Netscape:**
   - `httpbin.org` — Домен, для якого дійсне cookie.
   - `FALSE` — Прапорець включення піддоменів (Tailmatching: чи діє для всіх піддоменів).
   - `/` — Шлях (Path), для якого діє cookie.
   - `FALSE` — Прапорець безпеки (Secure): чи надсилати cookie лише через HTTPS.
   - `0` — Термін дії (UNIX Timestamp). `0` означає сесійне cookie (знищується після закриття сесії).
   - `session_key` / `user_role` — Ім'я cookie (Name).
   - `lab1_token` / `student` — Значення cookie (Value).

3. Передача збережених cookie у наступному запиті (`-b cookies.txt`):
   ```bash
   curl -s -b cookies.txt "https://httpbin.org/cookies"
   ```
   **Відповідь сервера:**
   ```json
   {
     "cookies": {
       "session_key": "lab1_token",
       "user_role": "student"
     }
   }
   ```
   Сервер успішно розпізнав клієнтську сесію.

#### 3.3. Аналіз атрибутів безпеки Cookie
Виконано запит для дослідження прапорців:
```bash
curl -i -s "https://httpbin.org/response-headers?Set-Cookie=session_id=xyz789;%20Path=/;%20Secure;%20HttpOnly;%20SameSite=Strict"
```
Сервер повертає заголовок:
```http
Set-Cookie: session_id=xyz789; Path=/; Secure; HttpOnly; SameSite=Strict
```
**Вектори атак, від яких захищають ці атрибути:**
1. **`HttpOnly`:** Захищає від **XSS-атак (Cross-Site Scripting)**. Забороняє доступ до `document.cookie` через JavaScript. Якщо зловмисник впровадить шкідливий скрипт на сторінку, він не зможе прочитати та викрасти сесійний токен/ідентифікатор.
2. **`Secure`:** Захищає від **Network Sniffing та Man-in-the-Middle (MitM) атак**. Гарантує, що браузер передасть cookie виключно поверх зашифрованого TLS/HTTPS з'єднання і ніколи не відправить у відкритому вигляді через незахищений HTTP.
3. **`SameSite=Strict`:** Захищає від **CSRF-атак (Cross-Site Request Forgery)**. Забороняє надсилання cookie браузером при будь-яких міжсайтових переходах чи сторонніх запитах (наприклад, перехід за шкідливим посиланням або надсилання форми зі стороннього сайту).

#### 3.4. Симуляція попередньої перевірки CORS (Preflight Request)
Браузер перед виконанням небезпечного cross-origin запиту надсилає попередній `OPTIONS`-запит.
Симуляція за допомогою `curl`:
```bash
curl -i -s -X OPTIONS "https://httpbin.org/post" \
  -H "Origin: https://my-college-app.edu" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization"
```
**Отримана відповідь сервера:**
```http
HTTP/1.1 200 OK
Date: Sat, 24 Oct 2026 08:49:40 GMT
Server: gunicorn/19.9.0
Allow: POST, OPTIONS
Access-Control-Allow-Origin: https://my-college-app.edu
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600
```
**Аналіз результату:**
- Статус `200 OK` свідчить про успішну обробку Preflight-запиту.
- Сервер явно дозволив домен у `Access-Control-Allow-Origin`.
- Сервер дозволив запрошувані методи у `Access-Control-Allow-Methods`.
- Сервер схвалив кастомні заголовки `Content-Type` та `Authorization` у `Access-Control-Allow-Headers`.
- Браузер кешує цей дозвіл на 3600 секунд (`Access-Control-Max-Age`) і після цього виконає основний `POST`-запит.

---

## 4. Відповіді на контрольні питання

### 1. Чим відрізняється стартовий рядок HTTP-запиту від статусного рядка HTTP-відповіді? Які обов’язкові компоненти вони містять?
- **Стартовий рядок запиту (Request Line):** повідомляє серверу, *яку дію* необхідно виконати і над *яким ресурсом*.
  - **Структура:** `<Method> <Request-URI> <HTTP-Version>\r\n`
  - **Приклад:** `GET /products/1 HTTP/1.1`
- **Статусний рядок відповіді (Status Line):** повідомляє клієнту про *результат обробки* запиту.
  - **Структура:** `<HTTP-Version> <Status-Code> <Reason-Phrase>\r\n`
  - **Приклад:** `HTTP/1.1 200 OK` або `HTTP/1.1 404 Not Found`

---

### 2. Яка різниця між безпечними (safe) та ідемпотентними (idempotent) методами HTTP? До яких категорій належать методи GET, POST, PUT та DELETE?
- **Безпечні методи (Safe):** методи, виконання яких носить виключно характер читання і **не змінює стан сервера** (ресурсів на бекенді).
- **Ідемпотентні методи (Idempotent):** методи, багаторазове повторення яких з однаковими параметрами дає **той самий результат для стану сервера**, що й одноразовий виклик (`f(f(x)) = f(x)`).

**Класифікація методів:**
- **`GET`:** **Безпечний** (Safe) та **Ідемпотентний** (Idempotent). Повторні запити повертають ресурс і не змінюють його стан.
- **`POST`:** **Небезпечний** (Unsafe) та **Неідемпотентний** (Non-idempotent). Кожен наступний запит створює новий запис (наприклад, дублікати замовлень із новими `id`).
- **`PUT`:** **Небезпечний** (Unsafe — змінює стан сервера), але **Ідемпотентний** (Idempotent). Повне перезаписування ресурсу тими самими даними призводить до однакового кінцевого стану.
- **`DELETE`:** **Небезпечний** (Unsafe — видаляє ресурс), але **Ідемпотентний** (Idempotent). Перше видалення знищує ресурс, наступні видалення того самого ресурсу не змінюють стан (ресурс залишається відсутнім).

---

### 3. Що означають коди стану відповідей із груп 2xx, 3xx, 4xx та 5xx? Наведіть конкретні приклади кодів 201, 301, 401, 403, 404 та 500.
- **`2xx` (Success):** Запит успішно отримано, розпізнано та прийнято сервером.
  - `201 Created` — ресурс успішно створено (часто у відповідь на `POST`, повертає новий `id` та заголовок `Location`).
- **`3xx` (Redirection):** Для завершення запиту клієнт повинен виконати додаткову дію (перенаправлення).
  - `301 Moved Permanently` — запитуваний ресурс назавжди перенесено на нову URL-адресу (вказана у заголовку `Location`). Браузери кешують цей редирект.
- **`4xx` (Client Error):** Помилка на стороні клієнта (некоректний синтаксис, відсутність авторизації, неіснуючий ресурс).
  - `401 Unauthorized` — клієнт не пройшов автентифікацію (відсутній або недійсний токен/облікові дані).
  - `403 Forbidden` — клієнт автентифікований, але сервер відмовляється надати доступ через брак прав (недостатньо повноважень ролі).
  - `404 Not Found` — ресурс за вказаним URI не знайдено на сервері.
- **`5xx` (Server Error):** Помилка на стороні сервера (сервер не зміг обробити коректний запит).
  - `500 Internal Server Error` — непередбачена внутрішня аварійна помилка бекенду (необроблене виключення, падіння скрипту).

---

### 4. Для чого призначені керуючі заголовки Content-Type та Accept? Як клієнт і сервер домовляються про формат даних (Content Negotiation)?
- **`Content-Type`:** Вказує MIME-тип даних, які **передаються у тілі поточного повідомлення** (як у запиті, так і у відповіді). Наприклад: `Content-Type: application/json; charset=utf-8`.
- **`Accept`:** Вказує типи контенту, які **клієнт здатний прийняти та зрозуміти** у відповіді сервера. Наприклад: `Accept: application/json, text/html;q=0.9`.
- **Механізм Content Negotiation (Узгодження контенту):**
  1. Клієнт передає заголовок `Accept` із переліком підтримуваних форматів та ваговими коефіцієнтами пріоритету `q` (quality value).
  2. Сервер аналізує заголовок, порівнює зі своїми можливостями та обирає найкращий доступний формат.
  3. Сервер відповідає обраним форматом, встановлюючи відповідний заголовок `Content-Type`. Якщо сервер не може надати жодного із запрошених форматів, він повертає статус `406 Not Acceptable`.

---

### 5. Опишіть етапи рукостискання TLS Handshake. Чому передача конфіденційних даних за протоколом HTTP через відкриту мережу є небезпечною?
**Етапи TLS 1.2 / TLS 1.3 Handshake:**
1. **TCP Handshake:** Встановлення базового надійного TCP-з'єднання на порту 443 (пакети `SYN` -> `SYN-ACK` -> `ACK`).
2. **ClientHello:** Клієнт надсилає серверу версію TLS, випадкове число (`Client Random`), перелік підтримуваних шифронаборів (Cipher Suites) та розширення SNI (Server Name Indication).
3. **ServerHello:** Сервер обирає версію TLS, шифронабір та надсилає `Server Random`.
4. **Certificate & Key Exchange:** Сервер надсилає свій цифровий сертифікат X.509 (підписаний акредитованим CA) та параметри обміну ключами (наприклад, ефемерні ключі алгоритму Diffie-Hellman — ECDHE).
5. **Автентифікація та генерація симетричного ключа:** Клієнт перевіряє валідність ланцюжка довіри сертифіката. Сторони обчислюють спільний симетричний сесійний ключ (Master Secret).
6. **Finished:** Клієнт і сервер надсилають зашифровані повідомлення завершення, після чого весь подальший HTTP-трафік шифрується симетричним алгоритмом (наприклад, AES-256-GCM).

**Чому HTTP через відкриту мережу є небезпечним:**
У протоколі HTTP дані (включаючи паролі, персональні дані, JWT-токени, Cookie сесій) передаються у відкритому вигляді (Plaintext). Будь-який проміжний вузол (Wi-Fi роутер у публічному місці, провайдер, зловмисник із packet sniffer) може перехопити трафік (**Eavesdropping** / підслуховування) або непомітно підмінити пакети (**Man-in-the-Middle**).

---

### 6. Що таке Time To First Byte (TTFB) та з яких часових затримок він складається під час виконання запиту?
**TTFB (Time To First Byte)** — це сумарний інтервал часу від моменту, коли клієнт ініціює відправку запиту, до моменту отримання найпершого байта відповіді від сервера.

**Складові TTFB:**
$$\text{TTFB} = t_{\text{DNS}} + t_{\text{TCP}} + t_{\text{TLS}} + t_{\text{Request Transfer}} + t_{\text{Server Processing}} + t_{\text{Response Network Transit}}$$
1. **DNS Lookup:** резолвінг доменного імені в IP-адресу.
2. **TCP Connection:** потрійне рукостискання.
3. **TLS Handshake:** криптографічне узгодження.
4. **Request Transfer:** час фізичної передачі HTTP-запиту клієнтом мережею.
5. **Server Processing Time:** час, потрібний бекенду для маршрутизації, звернення до бази даних, бізнес-логіки та формування відповіді.
6. **Transit Time:** мережева затримка повернення першого пакета від сервера назад до клієнта.

---

### 7. Яке призначення атрибутів HttpOnly, Secure та SameSite у заголовку Set-Cookie? Від яких типів вразливостей вони захищають користувача?
- **`HttpOnly`:**
  - **Призначення:** Забороняє клієнтським скриптам (JavaScript через `document.cookie`) доступ до цього cookie.
  - **Захист:** Захищає від **XSS (Cross-Site Scripting)**. Навіть якщо зловмисник впровадить шкідливий JS-код на сторінку, він не зможе викрасти сесійні ідентифікатори.
- **`Secure`:**
  - **Призначення:** Дозволяє надсилати cookie клієнту лише тоді, коли з'єднання встановлено через шифрований протокол HTTPS.
  - **Захист:** Захищає від **мережевого перехоплення (Sniffing, MitM)** у відкритих мережах.
- **`SameSite` (`Strict`, `Lax`, `None`):**
  - **Призначення:** Контролює, чи надсилається cookie разом із міжсайтовими (cross-site) запитами.
  - **Захист:** Захищає від **CSRF (Cross-Site Request Forgery)**. При значенні `Strict` cookie не додається до жодного запиту, що походить зі стороннього сайту, унеможливлюючи виконання підроблених дій від імені користувача.

---

### 8. Що таке Preflight-запит у механізмі CORS? У яких випадках веббраузер зобов’язаний надіслати запит методом OPTIONS перед основним запитом?
**Preflight-запит (Попередній запит)** — це HTTP-запит методом `OPTIONS`, який браузер автоматично надсилає до сервера перед виконанням фактичного cross-origin запиту. Мета — перевірити, чи сервер взагалі дозволяє такий запит із поточного домену (`Origin`), з цим методом та з такими заголовками.

**Коли браузер зобов’язаний надіслати Preflight-запит:**
Коли запит **не підпадає** під визначення «простого запиту» (Simple Request):
1. **Непростий HTTP-метод:** використовується метод, відмінний від `GET`, `HEAD` або `POST` (наприклад: `PUT`, `DELETE`, `PATCH`).
2. **Непростий заголовок `Content-Type`:** значення відмінне від:
   - `application/x-www-form-urlencoded`
   - `multipart/form-data`
   - `text/plain`  
   *(Тобто якщо передається `application/json`, браузер завжди робить Preflight!)*
3. **Наявність кастомних заголовків:** передача будь-яких заголовків, крім стандартних безпечних CORS-safelisted (наприклад, заголовки `Authorization`, `X-Requested-With`, `X-Custom-Header`).

---

## 5. Інструкція із запуску та перевірки

### Спосіб 1: Запуск автоматизованого PowerShell-скрипту (Windows)
```powershell
cd C:\Users\denchik\Desktop\labs\WEB-Application\Lab-01
powershell -ExecutionPolicy Bypass -File .\run_lab1.ps1
```

### Спосіб 2: Запуск у середовищі Bash (Git Bash / Linux / macOS)
```bash
cd Lab-01
chmod +x run_lab1.sh
./run_lab1.sh
```

### Спосіб 3: Інтерактивне тестування через VS Code REST Client
1. Встановіть розширення **REST Client** (Huachao Mao) або **Thunder Client** у Visual Studio Code.
2. Відкрийте файл `requests.http`.
3. Натисніть посилання **"Send Request"** над будь-яким запитом для перегляду сирих заголовків та тіла відповіді сервера.
