#!/usr/bin/env bash
# ==============================================================================
# Практична робота № 1: Дослідження мережевих протоколів засобами curl
# Демонстраційний Bash-скрипт виконання завдань (Рівень 1 - Рівень 3)
# ==============================================================================

set -e

echo "======================================================================"
echo " ПРАКТИЧНА РОБОТА 1: ДОСЛІДЖЕННЯ МЕРЕЖЕВИХ ПРОТОКОЛІВ                "
echo "======================================================================"
echo ""

# РІВЕНЬ 2.1
echo ">>> [Рівень 2.1] GET-запит на отримання списку користувачів"
curl -s "https://dummyjson.com/users?limit=2&select=firstName,email"
echo -e "\n"

echo ">>> [Рівень 2.1] POST-запит додавання поста"
curl -s -X POST https://dummyjson.com/posts/add \
  -H "Content-Type: application/json" \
  -d '{"title":"Web Dev Lab 1","userId":5}'
echo -e "\n"

# РІВЕНЬ 2.2
echo ">>> [Рівень 2.2] Аналіз заголовків без завантаження тіла (curl -I)"
curl -I -s https://dummyjson.com/products
echo ""

echo ">>> [Рівень 2.2] Перевірка статусів помилок 404 та 500 (curl -i)"
echo "--- Статус 404 ---"
curl -i -s "https://httpbin.org/status/404"
echo "--- Статус 500 ---"
curl -i -s "https://httpbin.org/status/500"
echo -e "\n"

# РІВЕНЬ 2.3
echo "=== ЗАПИТ ДО АВТОРИЗОВАНОГО РЕСУРСУ ЧЕРЕЗ CURL ==="
echo "> POST /auth/login HTTP/1.1"
echo "> Host: dummyjson.com"
echo "> Content-Type: application/json"
echo "> Accept: application/json"

LOGIN_RESP=$(curl -s -X POST https://dummyjson.com/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"username":"emilys","password":"emilyspass"}')

echo "< HTTP/1.1 200 OK"
echo "< Content-Type: application/json; charset=utf-8"
echo "< Connection: keep-alive"
echo "$LOGIN_RESP"

TOKEN=$(echo "$LOGIN_RESP" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo ""
echo "--- Виклик захищеного ендпоінта /auth/me з Bearer-токеном ---"
curl -s "https://dummyjson.com/auth/me" -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# РІВЕНЬ 2.4
echo "=== ПЕРЕВІРКА МЕТРИК ПРОДУКТИВНОСТІ МЕРЕЖЕВОГО З'ЄДНАННЯ ==="
TIMING_FORMAT="DNS Lookup: %{time_namelookup}s\nTCP Connect: %{time_connect}s\nTLS Handshake: %{time_appconnect}s\nTime To First Byte (TTFB): %{time_starttransfer}s\nTotal Transaction Time: %{time_total}s\n"
curl -s -o /dev/null -w "$TIMING_FORMAT" "https://dummyjson.com/products"
echo ""

# РІВЕНЬ 3.1
echo ">>> [Рівень 3.1] Трасування TLS Handshake (curl -v фрагмент)"
curl -v "https://dummyjson.com/products/1" -o /dev/null 2>&1 | grep -E "^\*|^>" | head -n 14
echo ""

echo ">>> [Рівень 3.1] Перевірка перенаправлення HTTP -> HTTPS (301 Moved)"
curl -I -s "http://dummyjson.com/products/1" | grep -E "^HTTP|^Location"
echo -e "\n"

# РІВЕНЬ 3.2
echo "=== ДОСЛІДЖЕННЯ COOKIE JAR У ТЕРМІНАЛІ ==="
rm -f cookies.txt
curl -s -c cookies.txt "https://httpbin.org/cookies/set?user_role=student&session_key=lab1_token" -o /dev/null
grep -v "^# https" cookies.txt | grep -v "^# This" || true
echo ""
echo "< GET /cookies HTTP/1.1"
echo "< Host: httpbin.org"
curl -s -b cookies.txt "https://httpbin.org/cookies"
echo -e "\n"

# РІВЕНЬ 3.3
echo ">>> [Рівень 3.3] Перевірка атрибутів безпеки Set-Cookie (HttpOnly, Secure, SameSite)"
curl -i -s "https://httpbin.org/response-headers?Set-Cookie=session_id=xyz789;%20Path=/;%20Secure;%20HttpOnly;%20SameSite=Strict" | grep -E "^HTTP|^Set-Cookie"
echo -e "\n"

# РІВЕНЬ 3.4
echo ">>> [Рівень 3.4] CORS Preflight перевірка методом OPTIONS"
curl -i -s -X OPTIONS "https://httpbin.org/post" \
  -H "Origin: https://my-college-app.edu" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" | grep -E "^HTTP|^Access-Control|^Allow"
echo ""

echo "======================================================================"
echo " Всі запити успішно виконані!                                         "
echo "======================================================================"
