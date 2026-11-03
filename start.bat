@echo off
chcp 65001 > nul
title NexusMail — Почта и Планировщик
echo ===================================================
echo     NexusMail — Почта и Планировщик Задач
echo ===================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ВНИМАНИЕ] Для локального запуска на Windows нужен Node.js.
    echo Скачайте бесплатный установщик с сайта: https://nodejs.org
    echo После установки снова дважды кликните по этому файлу.
    echo.
    pause
    exit /b
)

if not exist node_modules (
    echo [1/2] Первичная настройка (установка зависимостей, займет 30-60 сек)...
    call npm install
)

echo [2/2] Запуск приложения NexusMail...
start "" "http://localhost:3000"
call npm run dev
