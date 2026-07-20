@echo off
setlocal

cd /d "C:\Users\Frank\Documents\portfolio"

echo Starting portfolio project...
echo.

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Please install Node.js first:
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies. This may take a few minutes...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo npm install failed.
    pause
    exit /b 1
  )
)

start "" cmd /c "timeout /t 4 /nobreak >nul && start "" "http://127.0.0.1:5173/portfolio/""
call npm.cmd run dev -- --host 127.0.0.1

pause
