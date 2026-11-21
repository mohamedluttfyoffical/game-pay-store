@echo off
chcp 65001 >nul
title Game Pay - GitHub Auto Sync
echo ========================================================
echo        GAME PAY - مزامنة التعديلات مع GITHUB
echo ========================================================
echo.
echo [1/3] فحص وإضافة كافة الملفات والتعديلات...
git add .

echo [2/3] حفظ التعديلات بختم زمني تلقائي...
set "commit_msg=تحديث تلقائي: %date% - %time%"
git diff --cached --quiet
if %errorlevel% neq 0 (
    git commit -m "%commit_msg%"
) else (
    echo لا توجد تعديلات جديدة للحفظ.
)

echo [3/3] رفع التعديلات مباشرة إلى المستودع الرئيسي (main)...
git push origin main

echo.
echo ========================================================
echo  ✓ تمت المزامنة بنجاح مع:
echo    https://github.com/mohamedluttfyoffical/game-pay-store
echo ========================================================
echo.
timeout /t 5
