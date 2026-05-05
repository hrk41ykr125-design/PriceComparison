@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

set "BRANCH=main"
set "CLOUDFLARE_PROJECT=pricecomparison"
set "COMMIT_MESSAGE=Auto deploy: %date% %time%"

echo ========================================
echo   GitHub main + Cloudflare auto deploy
echo ========================================
echo.

echo [0/6] Checking tools...
where git > nul 2>&1
if errorlevel 1 (
  echo [ERROR] git was not found.
  goto :fail
)

where npm.cmd > nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm.cmd was not found.
  goto :fail
)

where npx.cmd > nul 2>&1
if errorlevel 1 (
  echo [ERROR] npx.cmd was not found.
  goto :fail
)

for /f "delims=" %%b in ('git branch --show-current') do set "CURRENT_BRANCH=%%b"
if not "%CURRENT_BRANCH%"=="%BRANCH%" (
  echo [ERROR] Current branch is "%CURRENT_BRANCH%". Switch to "%BRANCH%" and run this file again.
  goto :fail
)

echo [1/6] Building the app...
call npm.cmd run build
if errorlevel 1 (
  echo [ERROR] Build failed.
  goto :fail
)

if not exist "dist\index.html" (
  echo [ERROR] dist\index.html was not created.
  goto :fail
)

findstr /c:"src/main.jsx" "dist\index.html" > nul 2>&1
if not errorlevel 1 (
  echo [ERROR] dist\index.html still points to src/main.jsx. Check the Vite build output.
  goto :fail
)

echo.
echo [2/6] Staging changes...
git add -A
if errorlevel 1 (
  echo [ERROR] git add failed.
  goto :fail
)

git diff --cached --quiet
if errorlevel 1 (
  echo.
  echo [3/6] Creating commit...
  git commit -m "%COMMIT_MESSAGE%"
  if errorlevel 1 (
    echo [ERROR] git commit failed.
    goto :fail
  )
) else (
  echo.
  echo [3/6] No changes to commit.
)

echo.
echo [4/6] Pulling latest main from GitHub...
git pull --rebase origin %BRANCH%
if errorlevel 1 (
  echo [ERROR] git pull --rebase failed. Resolve conflicts, then run this file again.
  goto :fail
)

echo.
echo [5/6] Pushing to GitHub main...
git push origin %BRANCH%
if errorlevel 1 (
  echo [ERROR] git push failed.
  goto :fail
)

echo.
echo [6/6] Deploying to Cloudflare Pages...
call npx.cmd wrangler pages deploy dist --project-name=%CLOUDFLARE_PROJECT% --branch=%BRANCH%
if errorlevel 1 (
  echo [ERROR] Cloudflare Pages deploy failed.
  goto :fail
)

echo.
echo ========================================
echo   Done.
echo ========================================
pause
exit /b 0

:fail
echo.
echo ========================================
echo   Aborted.
echo ========================================
pause
exit /b 1
