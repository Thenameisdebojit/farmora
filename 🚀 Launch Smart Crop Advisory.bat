@echo off
chcp 65001 >nul 2>&1
title Smart Crop Advisory System - Enhanced Launcher
color 0A

echo.
echo  ╔════════════════════════════════════════════════════════════════╗
echo  ║                 🌾 SMART CROP ADVISORY SYSTEM 🌾                ║
echo  ║                    Enhanced Production Launcher                ║
echo  ║                          Version 2.0                          ║
echo  ╚════════════════════════════════════════════════════════════════╝
echo.
echo  🚀 Starting the most advanced agricultural platform...
echo.

REM Change to project directory
cd /d "D:\smart crop advisory prototype"

REM System Requirements Check
echo [1/6] 🔍 Checking system requirements...
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo.
    echo 💡 Please install Node.js from: https://nodejs.org/
    echo    Recommended version: 18.x or higher
    echo.
    pause
    exit /b 1
)

REM Get Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js: %NODE_VERSION%

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

REM Get npm version
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm: v%NPM_VERSION%

echo ✅ System requirements check passed!
echo.

REM Dependencies Installation Check
echo [2/6] 📦 Checking dependencies...
echo.

if not exist "node_modules" (
    echo 📥 Installing root dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install root dependencies
        pause
        exit /b 1
    )
)

if not exist "backend\node_modules" (
    echo 📥 Installing backend dependencies...
    cd backend
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd ..
)

if not exist "frontend\node_modules" (
    echo 📥 Installing frontend dependencies...
    cd frontend
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
)

echo ✅ All dependencies are ready!
echo.

REM Port Check
echo [3/6] 🔌 Checking port availability...
echo.

REM Check if port 5000 is available
netstat -an | find ":5000 " | find "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  WARNING: Port 5000 is already in use
    echo    This might cause backend startup issues
    echo.
)

REM Check if port 3000 is available
netstat -an | find ":3000 " | find "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  WARNING: Port 3000 is already in use
    echo    Frontend will use an alternative port
    echo.
)

echo ✅ Port availability checked
echo.

REM Start Backend Server
echo [4/6] 🔧 Starting backend server...
echo.
echo    📍 Backend will run on: http://localhost:5000
echo    🔗 API Health Check: http://localhost:5000/health
echo.

start "🔧 Smart Crop Advisory - Backend Server" cmd /c "cd /d \"D:\smart crop advisory prototype\backend\" && npm run dev && echo. && echo Backend server stopped. && pause"

REM Wait for backend to initialize
echo    ⏳ Waiting for backend to initialize (10 seconds)...
timeout /t 10 /nobreak >nul

REM Start Frontend Development Server
echo [5/6] 🌐 Starting frontend development server...
echo.
echo    📍 Frontend will run on: http://localhost:3000
echo    🎯 Access the app at: http://localhost:3000
echo.

start "🌐 Smart Crop Advisory - Frontend Server" cmd /c "cd /d \"D:\smart crop advisory prototype\frontend\" && npm run dev && echo. && echo Frontend server stopped. && pause"

REM Wait for frontend to initialize
echo    ⏳ Waiting for frontend to initialize (8 seconds)...
timeout /t 8 /nobreak >nul

REM Launch Browser
echo [6/6] 🚀 Launching application...
echo.
echo    🌐 Opening Smart Crop Advisory in your default browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    🎉 LAUNCH SUCCESSFUL! 🎉                    ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 🌟 SMART CROP ADVISORY SYSTEM IS NOW RUNNING!
echo.
echo 📱 Access the application:
echo    • Frontend App: http://localhost:3000
echo    • Backend API:  http://localhost:5000
echo    • API Health:   http://localhost:5000/health
echo.
echo 🎯 ENHANCED FEATURES AVAILABLE:
echo    ✅ Enhanced Weather Dashboard with AI insights
echo    ✅ Interactive AI-powered Crop Advisory Chat
echo    ✅ Market Intelligence with Real-time Data
echo    ✅ Pest Detection with Image Analysis
echo    ✅ Smart Irrigation Management
echo    ✅ Video Consultation Platform
echo    ✅ Real-time Notifications
echo.
echo 🔧 TECHNICAL INFO:
echo    • Node.js: %NODE_VERSION%
echo    • npm: v%NPM_VERSION%
echo    • Frontend: React + Vite (Development Mode)
echo    • Backend: Node.js + Express
echo    • Database: MongoDB (Simulated)
echo.
echo 💡 QUICK ACCESS URLS:
echo    • Dashboard: http://localhost:3000/dashboard
echo    • Weather: http://localhost:3000/weather
echo    • AI Advisory: http://localhost:3000/advisory
echo    • Market Intelligence: http://localhost:3000/market
echo    • Pest Detection: http://localhost:3000/pest-detection
echo    • Irrigation: http://localhost:3000/irrigation
echo    • Consultation: http://localhost:3000/consultation
echo.
echo ⚠️  IMPORTANT NOTES:
echo    • Both servers are running in separate windows
echo    • To stop the app: Close both server windows or run "Stop App.bat"
echo    • Auto-save is enabled - changes reflect immediately
echo    • Demo mode: All features unlocked for testing
echo.
echo 🔄 For production deployment, run "Build for Production.bat"
echo.
echo ▶️  The application is ready! You can safely minimize this window.
echo.
pause >nul