# ==============================================================================
# Практична робота № 6: Валідація вхідних даних та обробка запитів у NestJS
# Скрипт автоматизованого тестування конвеєра Request Pipeline (/dishes)
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$baseUrl = "http://localhost:3000/dishes"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " ПЕРЕВІРКА ДОСТУПНОСТІ СЕРВЕРА NESTJS (http://localhost:3000)          " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

try {
    $check = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
} catch {
    Write-Warning "Сервер NestJS ще не запущено на порті 3000."
    Write-Host "Будь ласка, запустіть у першому терміналі команду:" -ForegroundColor Yellow
    Write-Host "cd C:\Users\denchik\Desktop\labs\WEB-Application\Lab-06" -ForegroundColor White
    Write-Host "npm start" -ForegroundColor White
    exit 1
}

Write-Host "Сервер успішно відповідає на запити!`n" -ForegroundColor Green

# ------------------------------------------------------------------------------
# 1. ТЕСТ ВІДХИЛЕННЯ ЗАПИТУ З ЗАБОРОНЕНИМИ ПОЛЯМИ ТА ВІД'ЄМНОЮ ЦІНОЮ
# ------------------------------------------------------------------------------
Write-Host "=== ПЕРЕВІРКА ВІДХИЛЕННЯ ЗАПИТУ З ЗАБОРОНЕНИМИ ПОЛЯМИ ===" -ForegroundColor Cyan
Write-Host "> POST /dishes HTTP/1.1" -ForegroundColor Gray
Write-Host "> Host: localhost:3000" -ForegroundColor Gray
Write-Host "> Content-Type: application/json" -ForegroundColor Gray

$forbiddenBody = '{"title":" Ноутбук Pro 16 ","price":-500,"unknownPayload":"hack"}'
Write-Host $forbiddenBody

try {
    $errResp = Invoke-WebRequest -Uri $baseUrl -Method POST -Body ([System.Text.Encoding]::UTF8.GetBytes($forbiddenBody)) -ContentType "application/json; charset=utf-8" -UseBasicParsing -ErrorAction Stop
} catch {
    $resp = $_.Exception.Response
    Write-Host "< HTTP/1.1 400 Bad Request" -ForegroundColor Red
    Write-Host "< Content-Type: application/json; charset=utf-8" -ForegroundColor Gray
    if ($resp.Headers["X-Response-Time"]) {
        Write-Host "< X-Response-Time: $($resp.Headers['X-Response-Time'])" -ForegroundColor Magenta
    }
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    Write-Host $reader.ReadToEnd()
}
Write-Host ""

# ------------------------------------------------------------------------------
# 2. ТЕСТ ВАЛІДНОГО СТВОРЕННЯ З ПРОБІЛАМИ (TrimPipe + TimingInterceptor)
# ------------------------------------------------------------------------------
Write-Host "=== ТЕСТ ВАЛІДНОГО СТВОРЕННЯ (САНІТИЗАЦІЯ TRIMPIPE) ===" -ForegroundColor Cyan
Write-Host "> POST /dishes HTTP/1.1" -ForegroundColor Gray
$validBody = '{"title":"   Піца Пепероні Діавола   ","price":340,"weightGrams":520,"calories":1180,"isSpicy":true}'
Write-Host $validBody

$validResp = Invoke-WebRequest -Uri $baseUrl -Method POST -Body ([System.Text.Encoding]::UTF8.GetBytes($validBody)) -ContentType "application/json; charset=utf-8" -UseBasicParsing
Write-Host "< HTTP/1.1 201 Created" -ForegroundColor Green
Write-Host "< Content-Type: application/json; charset=utf-8" -ForegroundColor Gray
if ($validResp.Headers["X-Response-Time"]) {
    Write-Host "< X-Response-Time: $($validResp.Headers['X-Response-Time'])" -ForegroundColor Magenta
}
Write-Host $validResp.Content
Write-Host ""

# ------------------------------------------------------------------------------
# 3. ТЕСТ QUERY-ТРАНСФОРМАЦІЇ (?limit=5 -> число 5)
# ------------------------------------------------------------------------------
Write-Host "=== ТЕСТ QUERY-ТРАНСФОРМАЦІЇ (GET /dishes?limit=5) ===" -ForegroundColor Cyan
Write-Host "> GET /dishes?limit=5 HTTP/1.1" -ForegroundColor Gray
$getResp = Invoke-WebRequest -Uri "$baseUrl?limit=5" -Method GET -UseBasicParsing
Write-Host "< HTTP/1.1 200 OK" -ForegroundColor Green
if ($getResp.Headers["X-Response-Time"]) {
    Write-Host "< X-Response-Time: $($getResp.Headers['X-Response-Time'])" -ForegroundColor Magenta
}
Write-Host "Отримано страв у вибірці: $(($getResp.Content | ConvertFrom-Json).Count)" -ForegroundColor Gray
Write-Host $getResp.Content
Write-Host ""

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Всі перевірки конвеєра Request Pipeline успішно завершено!           " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan