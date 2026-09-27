@echo off
title Any DL Web Application
cd /d "%~dp0"
echo ====================================================
echo           ANY DL WEB APPLICATION
echo ====================================================
echo Starting Any DL Server on http://localhost:3000 ...
echo.
node server.js
pause
