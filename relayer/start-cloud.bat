@echo off
echo 🚀 Starting Orbital Cloud Relayer...
echo.

echo 📦 Checking if .env file exists...
if not exist ".env" (
    echo ❌ .env file not found!
    echo Please create .env file with your cloud Redis credentials first.
    echo See CLOUD_SETUP.md for details.
    pause
    exit /b 1
)

echo ✅ .env file found
echo.

echo 🔧 Building relayer...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build successful
echo.

echo 🚀 Starting Cloud Relayer...
echo.
echo 💡 Make sure you have:
echo    - Redis Cloud credentials in .env
echo    - ETH_PRIVATE_KEY and SUI_PRIVATE_KEY set
echo    - Internet connection for Wormhole Guardian
echo.

node dist/index-cloud.js

pause
