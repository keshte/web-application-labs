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
Write-Host '{"title":" Ноутбук Pro 16 ","price":-500,"unknownPayload":"hack"}'

curl.exe --% -s -i -X POST http://localhost:3000/dishes -H "Content-Type: application/json" -d "{\"title\":\" Ноутбук Pro 16 \",\"price\":-500,\"unknownPayload\":\"hack\"}"
Write-Host "`n"

# ------------------------------------------------------------------------------
# 2. ТЕСТ ВАЛІДНОГО СТВОРЕННЯ З ПРОБІЛАМИ (TrimPipe + TimingInterceptor)
# ------------------------------------------------------------------------------
Write-Host "=== ТЕСТ ВАЛІДНОГО СТВОРЕННЯ (САНІТИЗАЦІЯ TRIMPIPE) ===" -ForegroundColor Cyan
Write-Host "> POST /dishes HTTP/1.1" -ForegroundColor Gray
Write-Host '{"title":"   Піца Пепероні Діавола   ","price":340,"weightGrams":520,"calories":1180,"isSpicy":true}'

curl.exe --% -s -i -X POST http://localhost:3000/dishes -H "Content-Type: application/json" -d "{\"title\":\"   Піца Пепероні Діавола   \",\"price\":340,\"weightGrams\":520,\"calories\":1180,\"isSpicy\":true}"
Write-Host "`n"

# ------------------------------------------------------------------------------
# 3. ТЕСТ QUERY-ТРАНСФОРМАЦІЇ (?limit=5 -> число 5)
# ------------------------------------------------------------------------------
Write-Host "=== ТЕСТ QUERY-ТРАНСФОРМАЦІЇ (GET /dishes?limit=5) ===" -ForegroundColor Cyan
Write-Host "> GET /dishes?limit=5 HTTP/1.1" -ForegroundColor Gray

curl.exe -s -i "http://localhost:3000/dishes?limit=5"
Write-Host "`n"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Всі перевірки конвеєра Request Pipeline успішно завершено!           " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan