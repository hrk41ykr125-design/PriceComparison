@echo off
setlocal
chcp 65001 > nul

echo ========================================
echo   単価比較アプリ デプロイ自動化スクリプト
echo ========================================

echo.
echo [1/2] GitHub に更新をプッシュしています...
git add .
git commit -m "Update app: %date% %time%"
git push origin main

echo.
echo [2/2] Cloudflare Pages にビルドとデプロイを行っています...
call npm run build
npx wrangler pages deploy dist --project-name=pricecomparison --branch=main

echo.
echo ========================================
echo   デプロイが完了しました！
echo ========================================
pause
