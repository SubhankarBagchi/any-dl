@echo off
title Push Any DL to GitHub
cd /d "%~dp0"
echo ========================================================
echo   Pushing Any DL to https://github.com/SubhankarBagchi/any-dl.git
echo ========================================================
echo.
git branch -M main
git push -u origin main
echo.
echo ========================================================
echo   Done! Your repository is updated on GitHub.
echo ========================================================
pause
