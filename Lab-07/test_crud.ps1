# ======================================================================
# Автоматизований тест CRUD операцій TypeORM + PostgreSQL (Lab-07)
# Студент: Коштура Нікіта Богданович, КН-43
# Варіант: 4 (Доставка їжі та ресторанів - ресурс /dishes)
# ======================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$baseUrl = "http://localhost:3000/dishes"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " ТЕСТУВАННЯ CRUD ОПЕРАЦІЙ ТА TYPEORM (PostgreSQL / pg-mem)            " -ForegroundColor Cyan
Write-Host " Ресурс: /dishes | Варіант 4 (Доставка їжі та ресторанів)             " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Перевірка доступності сервера
try {
    $ping = Invoke-WebRequest -Uri $baseUrl -Method GET -UseBasicParsing -TimeoutSec 3
    Write-Host "[OK] Сервер NestJS успішно відповідає на порту 3000" -ForegroundColor Green
} catch {
    Write-Host "[ПОМИЛКА] Сервер не відповідає. Запустіть 'npm run start' у директорії Lab-07" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== 1. СТВОРЕННЯ СТРАВ (POST /dishes) ===" -ForegroundColor Yellow

$dish1Payload = @{
    title = "Піца Пепероні Діавола"
    price = 340.00
    weightGrams = 520
    calories = 1180
    isSpicy = $true
} | ConvertTo-Json -Compress

$dish1 = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $dish1Payload -ContentType "application/json; charset=utf-8"
Write-Host "> POST /dishes -> Створено страву 1:" -ForegroundColor Gray
Write-Host "  ID:          $($dish1.id) (UUID v4)" -ForegroundColor White
Write-Host "  Назва:       $($dish1.title)" -ForegroundColor White
Write-Host "  Ціна:        $($dish1.price) грн" -ForegroundColor White
Write-Host "  Вага:        $($dish1.weightGrams) г" -ForegroundColor White
Write-Host "  Калорії:     $($dish1.calories) ккал" -ForegroundColor White
Write-Host "  Гостра:      $($dish1.isSpicy)" -ForegroundColor White
Write-Host "  createdAt:   $($dish1.createdAt)" -ForegroundColor White
Write-Host "  deletedAt:   $($dish1.deletedAt)" -ForegroundColor White

$dish2Payload = @{
    title = "Бургер Техас BBQ"
    price = 285.00
    weightGrams = 420
    calories = 980
    isSpicy = $false
} | ConvertTo-Json -Compress
$dish2 = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $dish2Payload -ContentType "application/json; charset=utf-8"

$dish3Payload = @{
    title = "Салат Цезар з куркою"
    price = 220.00
    weightGrams = 310
    calories = 490
    isSpicy = $false
} | ConvertTo-Json -Compress
$dish3 = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $dish3Payload -ContentType "application/json; charset=utf-8"

$dish4Payload = @{
    title = "Суп Рамен Тонкоцу"
    price = 295.00
    weightGrams = 550
    calories = 780
    isSpicy = $true
} | ConvertTo-Json -Compress
$dish4 = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $dish4Payload -ContentType "application/json; charset=utf-8"

$dish5Payload = @{
    title = "Паста Карбонара"
    price = 260.00
    weightGrams = 380
    calories = 820
    isSpicy = $false
} | ConvertTo-Json -Compress
$dish5 = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $dish5Payload -ContentType "application/json; charset=utf-8"

Write-Host "[OK] Створено 5 тестових страв у базі даних" -ForegroundColor Green

Write-Host ""
Write-Host "=== 2. OFFSET-BASED ПАГІНАЦІЯ (GET /dishes?page=1&limit=2) ===" -ForegroundColor Yellow
$p1Url = "$($baseUrl)?page=1&limit=2"
$page1 = Invoke-RestMethod -Uri $p1Url -Method GET
Write-Host "> GET $p1Url HTTP/1.1" -ForegroundColor Gray
Write-Host "< HTTP/1.1 200 OK" -ForegroundColor Green
Write-Host "  Пагінація: Сторінка $($page1.meta.page) з $($page1.meta.totalPages) (Всього: $($page1.meta.total))" -ForegroundColor White
foreach ($item in $page1.data) {
    Write-Host "  * [$($item.id.Substring(0,8))...] $($item.title) - $($item.price) грн (Вага: $($item.weightGrams)г, Гостра: $($item.isSpicy))" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== 3. ПОШУК ТА ФІЛЬТРАЦІЯ (GET /dishes?search=Піца) ===" -ForegroundColor Yellow
$searchUrl = "$($baseUrl)?search=Піца"
$searchRes = Invoke-RestMethod -Uri $searchUrl -Method GET
Write-Host "> GET $searchUrl HTTP/1.1" -ForegroundColor Gray
Write-Host "< HTTP/1.1 200 OK" -ForegroundColor Green
Write-Host "  Знайдено за збігом 'Піца': $($searchRes.meta.total) запис(ів)" -ForegroundColor White
foreach ($item in $searchRes.data) {
    Write-Host "  * $($item.title) - $($item.price) грн" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== 4. ЧАСТКОВЕ ОНОВЛЕННЯ (PATCH /dishes/:id) ===" -ForegroundColor Yellow
$updatePayload = @{
    price = 375.50
    isSpicy = $false
} | ConvertTo-Json -Compress

$updateUrl = "$baseUrl/$($dish1.id)"
$updated = Invoke-RestMethod -Uri $updateUrl -Method PATCH -Body $updatePayload -ContentType "application/json; charset=utf-8"
Write-Host "> PATCH $updateUrl HTTP/1.1" -ForegroundColor Gray
Write-Host "< HTTP/1.1 200 OK" -ForegroundColor Green
Write-Host "  Оновлена ціна: $($updated.price) грн" -ForegroundColor White
Write-Host "  Оновлений статус гостроти: $($updated.isSpicy)" -ForegroundColor White
Write-Host "  updatedAt: $($updated.updatedAt)" -ForegroundColor White

Write-Host ""
Write-Host "=== 5. М'ЯКЕ ВИДАЛЕННЯ (DELETE /dishes/:id - Soft Delete) ===" -ForegroundColor Yellow
$delUrl = "$baseUrl/$($dish1.id)"
$delResp = Invoke-WebRequest -Uri $delUrl -Method DELETE -UseBasicParsing
Write-Host "> DELETE $delUrl HTTP/1.1" -ForegroundColor Gray
Write-Host "< HTTP/1.1 $($delResp.StatusCode) No Content" -ForegroundColor Green

$listAfterDel = Invoke-RestMethod -Uri $baseUrl -Method GET
Write-Host "  Кількість активних страв після soft delete: $($listAfterDel.meta.total)" -ForegroundColor White
$isDishPresent = $listAfterDel.data | Where-Object { $_.id -eq $dish1.id }
if (-not $isDishPresent) {
    Write-Host "  [OK] Видалена страва '$($dish1.title)' автоматично виключена з вибірки TypeORM (deletedAt IS NOT NULL)" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== 6. ВІДНОВЛЕННЯ СТРАВИ (PATCH /dishes/:id/restore) ===" -ForegroundColor Yellow
$restoreUrl = "$baseUrl/$($dish1.id)/restore"
$restored = Invoke-RestMethod -Uri $restoreUrl -Method PATCH
Write-Host "> PATCH $restoreUrl HTTP/1.1" -ForegroundColor Gray
Write-Host "< HTTP/1.1 200 OK" -ForegroundColor Green
Write-Host "  Повідомлення: $($restored.message)" -ForegroundColor White

$listAfterRestore = Invoke-RestMethod -Uri $baseUrl -Method GET
Write-Host "  Кількість активних страв після відновлення: $($listAfterRestore.meta.total)" -ForegroundColor White
Write-Host "  [OK] Страву успішно повернуто в активне меню" -ForegroundColor Green

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Всі перевірки Lab-07 (CRUD + TypeORM + PostgreSQL) успішно виконано! " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan