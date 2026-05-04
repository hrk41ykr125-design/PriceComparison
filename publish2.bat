@echo off
setlocal enabledelayedexpansion

:: 1. Git 操作
git add .
git commit -m "Auto-deploy update"
IF ERRORLEVEL 1 ( goto :end_script )
git push origin main
IF ERRORLEVEL 1 ( goto :end_script )

:: 2. ビルドとデプロイ
echo Build started...
npm run build
IF ERRORLEVEL 1 ( goto :end_script )

echo Deploying to Cloudflare...
npx wrangler pages deploy dist --project-name=pricecomparison --branch=main
IF ERRORLEVEL 1 ( goto :end_script )

:end_script
echo Deployment finished successfully.
pause
