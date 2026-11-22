@echo off
title Game Pay - Auto Sync Monitor
cd /d "%~dp0"
echo Starting Auto-Sync Monitor for GitHub...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0auto-sync.ps1"
pause
