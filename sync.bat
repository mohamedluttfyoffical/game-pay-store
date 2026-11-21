@echo off
setlocal
echo ========================================================
echo        GAME PAY - GITHUB AUTO SYNC
echo ========================================================
echo.
echo [1/3] Staging changes...
git add .

echo [2/3] Committing changes...
git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Auto-sync update: %DATE% %TIME%"
) else (
    echo No new changes to commit.
)

echo [3/3] Pushing to GitHub (main)...
git push origin main

echo.
echo ========================================================
echo  SUCCESS: Synchronized with GitHub repository:
echo  https://github.com/mohamedluttfyoffical/game-pay-store
echo ========================================================
echo.
if "%~1"=="" pause
