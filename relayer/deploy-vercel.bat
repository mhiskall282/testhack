@echo off
echo 🚀 Deploying Orbital Relayer to Vercel...

echo 📦 Building relayer...
call npm run build

echo 🌐 Deploying to Vercel...
call vercel --prod

echo ✅ Relayer deployment complete!
pause
