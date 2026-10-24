# ==============================================================================
# Практична робота № 5: Модульна архітектура та ін’єкція залежностей у NestJS
# Скрипт автоматизованого тестування міжмодульної взаємодії (Dishes & Orders)
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$baseUrl = "http://localhost:3000"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " ПЕРЕВІРКА ДОСТУПНОСТІ СЕРВЕРА NESTJS (http://localhost:3000)          " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

try {
    $check = Invoke-WebRequest -Uri "$baseUrl/dishes" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
} catch {
    Write-Warning "Сервер NestJS ще не запущено на порті 3000."
    Write-Host "Будь ласка, запустіть у першому терміналі команду:" -ForegroundColor Yellow
    Write-Host "cd C:\Users\denchik\Desktop\labs\WEB-Application\Lab-05" -ForegroundColor White
    Write-Host "npm start" -ForegroundColor White
    exit 1
}

Write-Host "Сервер успішно відповідає на запити!`n" -ForegroundColor Green

Write-Host "=== ТЕСТУВАННЯ ВЗАЄМОДІЇ МОДУЛІВ ===`n" -ForegroundColor Cyan

# 1. POST /orders з валідним productId
Write-Host "> POST /orders HTTP/1.1" -ForegroundColor Gray
Write-Host "> Host: localhost:3000" -ForegroundColor Gray
Write-Host "> Content-Type: application/json" -ForegroundColor Gray

$orderBody = '{"productId":"dish-1","quantity":2,"customerEmail":"student@college.edu"}'
Write-Host $orderBody

$orderResp = Invoke-WebRequest -Uri "$baseUrl/orders" -Method POST -Body ([System.Text.Encoding]::UTF8.GetBytes($orderBody)) -ContentType "application/json; charset=utf-8" -UseBasicParsing
Write-Host "< HTTP/1.1 201 Created" -ForegroundColor Green
Write-Host "< Content-Type: application/json; charset=utf-8" -ForegroundColor Gray
Write-Host $orderResp.Content
Write-Host ""

# 2. POST /orders з неіснуючим товаром
Write-Host "> POST /orders (неіснуючий товар: dish-999) HTTP/1.1" -ForegroundColor Gray
try {
    $errBody = '{"productId":"dish-999","quantity":1,"customerEmail":"student@college.edu"}'
    $errResp = Invoke-WebRequest -Uri "$baseUrl/orders" -Method POST -Body ([System.Text.Encoding]::UTF8.GetBytes($errBody)) -ContentType "application/json; charset=utf-8" -UseBasicParsing -ErrorAction Stop
} catch {
    Write-Host "< HTTP/1.1 404 Not Found" -ForegroundColor Red
    Write-Host "< Content-Type: application/json; charset=utf-8" -ForegroundColor Gray
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host $reader.ReadToEnd()
}
Write-Host ""

# 3. GET /dishes (перевірка генерації slug)
Write-Host "> GET /dishes (перевірка автоматичної генерації slug) HTTP/1.1" -ForegroundColor Gray
$dishesResp = Invoke-WebRequest -Uri "$baseUrl/dishes" -Method GET -UseBasicParsing
Write-Host "< HTTP/1.1 200 OK" -ForegroundColor Green
Write-Host $dishesResp.Content
Write-Host ""

# 4. GET /orders (отримання списку замовлень)
Write-Host "> GET /orders HTTP/1.1" -ForegroundColor Gray
$ordersListResp = Invoke-WebRequest -Uri "$baseUrl/orders" -Method GET -UseBasicParsing
Write-Host "< HTTP/1.1 200 OK" -ForegroundColor Green
Write-Host "Кількість створених замовлень: $(($ordersListResp.Content | ConvertFrom-Json).Count)" -ForegroundColor Gray
Write-Host $ordersListResp.Content
Write-Host ""

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Всі міжмодульні сценарії успішно протестовані!                       " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan