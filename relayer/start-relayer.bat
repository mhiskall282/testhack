@echo off
echo 🚀 Starting Orbital Relayer Services...
echo.

echo 📦 Checking if .env file exists...
if not exist ".env" (
    echo ❌ .env file not found!
    echo Please create .env file with your configuration first.
    echo See STARTUP_GUIDE.md for details.
    pause
    exit /b 1
)

echo ✅ .env file found
echo.

echo 🐳 Starting Redis...
docker-compose up redis -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start Redis
    pause
    exit /b 1
)
echo ✅ Redis started

echo 🐳 Starting Guardian (Wormhole Spy)...
docker-compose up guardiand -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start Guardian
    pause
    exit /b 1
)
echo ✅ Guardian started

echo.
echo 🔍 Checking service status...
docker-compose ps
echo.

echo 🚀 Starting Relayer...
echo.
npm start

pause
