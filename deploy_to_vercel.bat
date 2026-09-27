@echo off
cd /d "%~dp0"
title Any DL - Deploy to Vercel
echo ========================================================
echo         ANY DL - ONE-CLICK DEPLOY TO VERCEL
echo ========================================================
echo.
echo Deploying latest code and legal pages to Vercel Production...
echo.
call npx vercel --prod
echo.
echo ========================================================
echo Done! Check your live production URL above.
echo ========================================================
pause
