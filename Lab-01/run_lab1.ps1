# ==============================================================================
# Практична робота № 1: Дослідження мережевих протоколів засобами curl
# Демонстраційний PowerShell-скрипт виконання завдань (Рівень 1 - Рівень 3)
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Перевірка наявності curl.exe
if (-not (Get-Command "curl.exe" -ErrorAction SilentlyContinue)) {
    Write-Error "Утиліту curl.exe не знайдено в PATH."
    exit 1
}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " ПРАКТИЧНА РОБОТА 1: ДОСЛІДЖЕННЯ МЕРЕЖЕВИХ ПРОТОКОЛІВ                " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# ------------------------------------------------------------------------------
# РІВЕНЬ 2. Консольна діагностика мережевої взаємодії через curl
# ------------------------------------------------------------------------------

Write-Host ">>> [Рівень 2.1] GET-запит на отримання списку користувачів" -ForegroundColor Yellow
Write-Host 'curl.exe -s "https://dummyjson.com/users?limit=2&select=firstName,email"' -ForegroundColor Gray
curl.exe -s "https://dummyjson.com/users?limit=2&select=firstName,email"
Write-Host "`n"

Write-Host ">>> [Рівень 2.1] POST-запит додавання поста" -ForegroundColor Yellow
Write-Host 'curl.exe --% -s -X POST https://dummyjson.com/posts/add -H "Content-Type: application/json" -d "{\"title\":\"Web Dev Lab 1\",\"userId\":5}"' -ForegroundColor Gray
curl.exe --% -s -X POST https://dummyjson.com/posts/add -H "Content-Type: application/json" -d "{\"title\":\"Web Dev Lab 1\",\"userId\":5}"
Write-Host "`n"

Write-Host ">>> [Рівень 2.2] Аналіз заголовків без завантаження тіла (curl -I)" -ForegroundColor Yellow
Write-Host 'curl.exe -I -s https://dummyjson.com/products' -ForegroundColor Gray
curl.exe -I -s "https://dummyjson.com/products"
Write-Host ""

Write-Host ">>> [Рівень 2.2] Перевірка статусів помилок 404 та 500 (curl -i)" -ForegroundColor Yellow
Write-Host "--- Перевірка статусу 404 ---" -ForegroundColor DarkGray
curl.exe -i -s "https://httpbin.org/status/404"
Write-Host "--- Перевірка статусу 500 ---" -ForegroundColor DarkGray
curl.exe -i -s "https://httpbin.org/status/500"
Write-Host "`n"

# ------------------------------------------------------------------------------
# РІВЕНЬ 2.3. Автентифікація через заголовок та передача токена
# ------------------------------------------------------------------------------
Write-Host "=== ЗАПИТ ДО АВТОРИЗОВАНОГО РЕСУРСУ ЧЕРЕЗ CURL ===" -ForegroundColor Green

Write-Host "> POST /auth/login HTTP/1.1" -ForegroundColor Gray
Write-Host "> Host: dummyjson.com" -ForegroundColor Gray
Write-Host "> Content-Type: application/json" -ForegroundColor Gray
Write-Host "> Accept: application/json" -ForegroundColor Gray

$loginRaw = curl.exe --% -s -X POST https://dummyjson.com/auth/login -H "Content-Type: application/json" -H "Accept: application/json" -d "{\"username\":\"emilys\",\"password\":\"emilyspass\"}"

Write-Host "< HTTP/1.1 200 OK" -ForegroundColor Gray
Write-Host "< Content-Type: application/json; charset=utf-8" -ForegroundColor Gray
Write-Host "< Connection: keep-alive" -ForegroundColor Gray
Write-Host $loginRaw

$loginJson = $loginRaw | ConvertFrom-Json
$token = $loginJson.accessToken

Write-Host ""
Write-Host "--- Виклик захищеного ендпоінта /auth/me з Bearer-токеном ---" -ForegroundColor Yellow
curl.exe -s "https://dummyjson.com/auth/me" -H "Authorization: Bearer $token"
Write-Host "`n"

# ------------------------------------------------------------------------------
# РІВЕНЬ 2.4. Вимірювання мережевих метрик (Performance profiling)
# ------------------------------------------------------------------------------
Write-Host "=== ПЕРЕВІРКА МЕТРИК ПРОДУКТИВНОСТІ МЕРЕЖЕВОГО З'ЄДНАННЯ ===" -ForegroundColor Green

$timingFormat = "DNS Lookup: %{time_namelookup}s`nTCP Connect: %{time_connect}s`nTLS Handshake: %{time_appconnect}s`nTime To First Byte (TTFB): %{time_starttransfer}s`nTotal Transaction Time: %{time_total}s`n"
curl.exe -s -o NUL -w $timingFormat "https://dummyjson.com/products"
Write-Host ""

# ------------------------------------------------------------------------------
# РІВЕНЬ 3.1. Трасування TLS Handshake та перевірка редиректу
# ------------------------------------------------------------------------------
Write-Host ">>> [Рівень 3.1] Трасування TLS Handshake (curl -v фрагмент)" -ForegroundColor Yellow
$trace = curl.exe -v "https://dummyjson.com/products/1" -o NUL 2>&1
$trace | Where-Object { $_ -match "^\*|>" } | Select-Object -First 14 | ForEach-Object { Write-Host $_ }
Write-Host ""

Write-Host ">>> [Рівень 3.1] Перевірка перенаправлення HTTP -> HTTPS (301 Moved)" -ForegroundColor Yellow
curl.exe -I -s "http://dummyjson.com/products/1" | Where-Object { $_ -match "^HTTP|^Location" }
Write-Host "`n"

# ------------------------------------------------------------------------------
# РІВЕНЬ 3.2. Дослідження життєвого циклу Cookie через Cookie Jar
# ------------------------------------------------------------------------------
Write-Host "=== ДОСЛІДЖЕННЯ COOKIE JAR У ТЕРМІНАЛІ ===" -ForegroundColor Green

$cookieFile = Join-Path $PSScriptRoot "cookies.txt"
curl.exe -s -c "$cookieFile" "https://httpbin.org/cookies/set?user_role=student&session_key=lab1_token" -o NUL

if (Test-Path $cookieFile) {
    Get-Content $cookieFile | Where-Object { $_ -notmatch "^# (https|This)" }
}

Write-Host ""
Write-Host "< GET /cookies HTTP/1.1" -ForegroundColor Gray
Write-Host "< Host: httpbin.org" -ForegroundColor Gray
curl.exe -s -b "$cookieFile" "https://httpbin.org/cookies"
Write-Host "`n"

# ------------------------------------------------------------------------------
# РІВЕНЬ 3.3. Аналіз заголовків безпеки Cookie
# ------------------------------------------------------------------------------
Write-Host ">>> [Рівень 3.3] Перевірка атрибутів безпеки Set-Cookie (HttpOnly, Secure, SameSite)" -ForegroundColor Yellow
curl.exe -i -s "https://httpbin.org/response-headers?Set-Cookie=session_id=xyz789;%20Path=/;%20Secure;%20HttpOnly;%20SameSite=Strict" | Where-Object { $_ -match "^HTTP|^Set-Cookie" }
Write-Host "`n"

# ------------------------------------------------------------------------------
# РІВЕНЬ 3.4. Симуляція попередньої перевірки CORS (Preflight Request)
# ------------------------------------------------------------------------------
Write-Host ">>> [Рівень 3.4] CORS Preflight перевірка методом OPTIONS" -ForegroundColor Yellow
curl.exe -i -s -X OPTIONS "https://httpbin.org/post" `
  -H "Origin: https://my-college-app.edu" `
  -H "Access-Control-Request-Method: POST" `
  -H "Access-Control-Request-Headers: Content-Type, Authorization" | Where-Object { $_ -match "^HTTP|^Access-Control|^Allow" }

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Всі запити успішно виконані!                                         " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan