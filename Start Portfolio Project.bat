@echo off
setlocal
title Frank Martin Portfolio

cd /d "C:\Users\Frank\Documents\portfolio"

echo ========================================
echo   Frank Martin Portfolio
echo ========================================
echo.
echo Starting local website...
echo.

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Please install Node.js first:
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\vite\bin\vite.js" (
  echo Installing dependencies. This may take a few minutes...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo The browser will open automatically.
echo Keep this window open while viewing the portfolio.
echo Press Ctrl+C when you want to stop the website.
echo.

start "" powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://127.0.0.1:5173/portfolio/'"
call npm.cmd run dev -- --host 127.0.0.1

echo.
echo The portfolio server has stopped.
pause
