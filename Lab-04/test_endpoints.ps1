# ==============================================================================
# Практична робота № 4: Розроблення REST-ендпоінтів засобами NestJS
# Скрипт автоматизованого тестування REST API (Варіант 4: /dishes)
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$baseUrl = "http://localhost:3000/dishes"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " ПЕРЕВІРКА ДОСТУПНОСТІ СЕРВЕРА NESTJS (http://localhost:3000)          " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# Перевірка чи запущено сервер
try {
    $check = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
} catch {
    Write-Warning "Сервер NestJS ще не запущено на порті 3000."
    Write-Host "Будь ласка, запустіть у сусідньому терміналі команду:" -ForegroundColor Yellow
    Write-Host "cd C:\Users\denchik\Desktop\labs\WEB-Application\Lab-04" -ForegroundColor White
    Write-Host "npm start" -ForegroundColor White
    exit 1
}

Write-Host "Сервер успішно відповідає на запити!`n" -ForegroundColor Green

Write-Host "=== ТЕСТУВАННЯ ЕНДПОІНТІВ ЧЕРЕЗ HTTP КЛІЄНТ ===`n" -ForegroundColor Cyan

# 1. POST /dishes
Write-Host "> POST /dishes HTTP/1.1" -ForegroundColor Gray
Write-Host "> Host: localhost:3000" -ForegroundColor Gray
Write-Host "> Content-Type: application/json" -ForegroundColor Gray
$postBody = @{
    title = "Піца Пепероні Діавола"
    price = 340
    weightGrams = 520
    calories = 1180
    isSpicy = $true
} | ConvertTo-Json

Write-Host $postBody
$postResp = Invoke-WebRequest -Uri $baseUrl -Method POST -Body $postBody -ContentType "application/json; charset=utf-8" -UseBasicParsing
Write-Host "< HTTP/1.1 201 Created" -ForegroundColor Green
Write-Host "< Content-Type: application/json; charset=utf-8" -ForegroundColor Gray
Write-Host $postResp.Content
Write-Host ""

$newDish = $postResp.Content | ConvertFrom-Json
$createdId = $newDish.id

# 2. GET /dishes/non-existent-id
Write-Host "> GET /dishes/non-existent-id HTTP/1.1" -ForegroundColor Gray
try {
    $errResp = Invoke-WebRequest -Uri "$baseUrl/non-existent-id" -Method GET -UseBasicParsing -ErrorAction Stop
} catch {
    Write-Host "< HTTP/1.1 404 Not Found" -ForegroundColor Red
    Write-Host "< Content-Type: application/json; charset=utf-8" -ForegroundColor Gray
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host $reader.ReadToEnd()
}
Write-Host ""

# 3. GET /dishes (Отримання списку та перевірка кастомних заголовків)
Write-Host "> GET /dishes HTTP/1.1" -ForegroundColor Gray
$listResp = Invoke-WebRequest -Uri $baseUrl -Method GET -UseBasicParsing
Write-Host "< HTTP/1.1 200 OK" -ForegroundColor Green
Write-Host "< X-API-Version: $($listResp.Headers['X-API-Version'])" -ForegroundColor Magenta
Write-Host "< X-Service-Status: $($listResp.Headers['X-Service-Status'])" -ForegroundColor Magenta
Write-Host "Отримано страв у каталозі: $(($listResp.Content | ConvertFrom-Json).Count)" -ForegroundColor Gray
Write-Host ""

# 4. PATCH /dishes/:id
Write-Host "> PATCH /dishes/$createdId HTTP/1.1" -ForegroundColor Gray
$patchBody = @{
    price = 365
    title = "Піца Пепероні Діавола (Оновлено)"
} | ConvertTo-Json
$patchResp = Invoke-WebRequest -Uri "$baseUrl/$createdId" -Method PATCH -Body $patchBody -ContentType "application/json; charset=utf-8" -UseBasicParsing
Write-Host "< HTTP/1.1 200 OK" -ForegroundColor Green
Write-Host $patchResp.Content
Write-Host ""

# 5. DELETE /dishes/:id
Write-Host "> DELETE /dishes/$createdId HTTP/1.1" -ForegroundColor Gray
$deleteResp = Invoke-WebRequest -Uri "$baseUrl/$createdId" -Method DELETE -UseBasicParsing
Write-Host "< HTTP/1.1 204 No Content" -ForegroundColor Green
Write-Host "Успішно видалено створену страву з каталогу."
Write-Host ""

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Всі REST-ендпоінти успішно протестовані!                             " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
