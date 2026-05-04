@echo off
setlocal enabledelayedexpansion

:: 1. Git 操作
git add .

git commit -m "Auto-deploy update"
IF ERRORLEVEL 1 ( goto :end_script )

# 既存の git add/commit はそのまま残し、pushの前に追加するイメージです
... (コミット完了後) ...

echo 最新の変更を取得（Pull）しています...
git pull origin main

IF ERRORLEVEL 1 (
echo [!] エラー: プルに失敗しました。ネットワークまたはブランチ設定を確認してください。処理を中断します。
    goto :end_script
)

echo GitHubへプッシュを実行中...
git push origin main  // ここで再度プッシュを試みる
IF ERRORLEVEL 1 (

echo [!] エラー: プッシュに失敗しました。認証情報や権限をご確認ください。処理を中断します。
    goto :end_script
)

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
