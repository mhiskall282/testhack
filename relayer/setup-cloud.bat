@echo off
echo 🌐 Orbital Cloud Relayer Setup
echo ================================
echo.

echo 📋 This script will help you set up the cloud relayer
echo.

echo 🔍 Checking current setup...
if exist ".env" (
    echo ✅ .env file already exists
    echo.
    echo Current configuration:
    type .env
    echo.
    echo Do you want to update it? (y/n)
    set /p choice=
    if /i "%choice%"=="y" (
        echo.
        echo 📝 Updating .env file...
    ) else (
        echo.
        echo Setup complete! Run 'start-cloud.bat' to start the relayer.
        pause
        exit /b 0
    )
) else (
    echo 📝 Creating .env file from template...
    copy env-template.txt .env
    echo ✅ .env file created
)

echo.
echo 🌐 Choose your Redis provider:
echo 1. Redis Cloud (Recommended - 30MB free)
echo 2. Upstash (10,000 requests/day free)
echo 3. Railway (Free tier available)
echo.
set /p provider="Enter choice (1-3): "

if "%provider%"=="1" (
    echo.
    echo 🚀 Setting up Redis Cloud...
    echo Go to: https://redis.com/try-free/
    echo Create account and database, then copy credentials
    echo.
    set /p redis_url="Enter Redis URL (redis://host:port): "
    set /p redis_pass="Enter Redis password: "
    
    echo REDIS_CLOUD_URL=%redis_url% > .env
    echo REDIS_CLOUD_PASSWORD=%redis_pass% >> .env
    echo SPY_HOST=https://wormhole-v2-testnet-api.certus.one >> .env
    echo RELAYER_NAME=OrbitalCloudRelayer >> .env
    echo ENVIRONMENT=TESTNET >> .env
    echo. >> .env
    echo # Add your private keys below: >> .env
    echo # ETH_PRIVATE_KEY=your_key_here >> .env
    echo # SUI_PRIVATE_KEY=your_key_here >> .env
    
    echo ✅ Redis Cloud configured!
    
) else if "%provider%"=="2" (
    echo.
    echo 🚀 Setting up Upstash Redis...
    echo Go to: https://upstash.com/
    echo Create account and Redis database, then copy credentials
    echo.
    set /p redis_url="Enter Redis URL: "
    set /p redis_token="Enter Redis token: "
    
    echo UPSTASH_REDIS_URL=%redis_url% > .env
    echo UPSTASH_REDIS_TOKEN=%redis_token% >> .env
    echo SPY_HOST=https://wormhole-v2-testnet-api.certus.one >> .env
    echo RELAYER_NAME=OrbitalCloudRelayer >> .env
    echo ENVIRONMENT=TESTNET >> .env
    echo. >> .env
    echo # Add your private keys below: >> .env
    echo # ETH_PRIVATE_KEY=your_key_here >> .env
    echo # SUI_PRIVATE_KEY=your_key_here >> .env
    
    echo ✅ Upstash Redis configured!
    
) else (
    echo ❌ Invalid choice
    pause
    exit /b 1
)

echo.
echo 🔑 Next steps:
echo 1. Edit .env file and add your private keys
echo 2. Run 'npm install' to install dependencies
echo 3. Run 'start-cloud.bat' to start the relayer
echo.
echo 📖 See CLOUD_SETUP.md for detailed instructions
echo.
echo 🎉 Setup complete!
pause
