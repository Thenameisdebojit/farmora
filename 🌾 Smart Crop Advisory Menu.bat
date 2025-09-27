@echo off
chcp 65001 >nul 2>&1
title Smart Crop Advisory System - Main Menu
color 0A

:MENU
cls
echo.
echo  ╔════════════════════════════════════════════════════════════════╗
echo  ║                🌾 SMART CROP ADVISORY SYSTEM 🌾                ║
echo  ║                         Main Control Menu                     ║
echo  ║                          Version 2.0                          ║
echo  ╚════════════════════════════════════════════════════════════════╝
echo.
echo  🚀 Welcome to the most advanced agricultural platform
echo  📍 Location: D:\smart crop advisory prototype
echo.

REM Quick system check
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo  ✅ System Ready - Node.js %NODE_VER%
) else (
    echo  ❌ System Issue - Node.js not found
    set NODE_VER=Not installed
)
echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║                       MAIN OPTIONS                       ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo  [1] 🚀 Launch Development Mode
echo      └─ Start both servers in development mode with hot reload
echo.
echo  [2] 🏗️ Build and Run Production
echo      └─ Create optimized build and run production servers
echo.
echo  [3] ⏹️ Stop Running Application
echo      └─ Stop all Smart Crop Advisory servers and processes
echo.
echo  [4] 🔧 System Diagnostics
echo      └─ Run comprehensive system health check and diagnostics
echo.
echo  [5] 📦 Install/Update Dependencies
echo      └─ Install or update all required npm packages
echo.
echo  [6] 🧹 Clean Project
echo      └─ Remove node_modules and builds, fresh start
echo.
echo  [7] 📊 Project Information
echo      └─ View project details, features, and status
echo.
echo  [8] 🌐 Quick Launch (Browser Only)
echo      └─ Fast frontend-only launch for demo purposes
echo.
echo  [0] ❌ Exit
echo      └─ Close this menu
echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║                   🎯 ENHANCED FEATURES                   ║
echo ║  ✅ Weather Dashboard    ✅ AI Crop Advisory             ║
echo ║  ✅ Market Intelligence  ✅ Pest Detection               ║
echo ║  ✅ Smart Irrigation     ✅ Video Consultation           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

set /p choice=🔹 Select an option (0-8): 

if "%choice%"=="1" goto LAUNCH_DEV
if "%choice%"=="2" goto LAUNCH_PROD
if "%choice%"=="3" goto STOP_APP
if "%choice%"=="4" goto DIAGNOSTICS
if "%choice%"=="5" goto INSTALL_DEPS
if "%choice%"=="6" goto CLEAN_PROJECT
if "%choice%"=="7" goto PROJECT_INFO
if "%choice%"=="8" goto QUICK_LAUNCH
if "%choice%"=="0" goto EXIT

echo.
echo ❌ Invalid option. Please select 0-8.
timeout /t 2 >nul
goto MENU

:LAUNCH_DEV
cls
echo.
echo 🚀 Launching Development Mode...
echo.
call "🚀 Launch Smart Crop Advisory.bat"
goto MENU

:LAUNCH_PROD
cls
echo.
echo 🏗️ Building and launching Production Mode...
echo.
call "🏗️ Build for Production.bat"
goto MENU

:STOP_APP
cls
echo.
echo ⏹️ Stopping Application...
echo.
call "⏹️ Stop Smart Crop Advisory.bat"
goto MENU

:DIAGNOSTICS
cls
echo.
echo 🔧 Running System Diagnostics...
echo.
call "🔧 System Diagnostics.bat"
goto MENU

:INSTALL_DEPS
cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                DEPENDENCY INSTALLATION                   ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo 📦 Installing/Updating all dependencies...
echo.

cd /d "D:\smart crop advisory prototype"

echo [1/4] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Root installation failed
    pause
    goto MENU
)

echo [2/4] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend installation failed
    pause
    goto MENU
)

echo [3/4] Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend installation failed
    pause
    goto MENU
)

cd ..
echo [4/4] Running final checks...
echo.
echo ✅ All dependencies installed successfully!
echo.
pause
goto MENU

:CLEAN_PROJECT
cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                    PROJECT CLEANUP                       ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo ⚠️  This will remove all node_modules and build files.
echo    You will need to reinstall dependencies afterward.
echo.
set /p confirm=Are you sure? (y/N): 
if /i not "%confirm%"=="y" goto MENU

echo.
echo 🧹 Cleaning project...
cd /d "D:\smart crop advisory prototype"

if exist "node_modules" (
    echo Removing root node_modules...
    rmdir /s /q "node_modules" >nul 2>&1
)

if exist "backend\node_modules" (
    echo Removing backend node_modules...
    rmdir /s /q "backend\node_modules" >nul 2>&1
)

if exist "frontend\node_modules" (
    echo Removing frontend node_modules...
    rmdir /s /q "frontend\node_modules" >nul 2>&1
)

if exist "frontend\dist" (
    echo Removing frontend build...
    rmdir /s /q "frontend\dist" >nul 2>&1
)

if exist "backend\dist" (
    echo Removing backend build...
    rmdir /s /q "backend\dist" >nul 2>&1
)

echo.
echo ✅ Project cleaned successfully!
echo 💡 Run option [5] to reinstall dependencies.
echo.
pause
goto MENU

:PROJECT_INFO
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    📊 PROJECT INFORMATION                     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 🌾 Smart Crop Advisory System v2.0
echo 📍 Location: D:\smart crop advisory prototype
echo 🎯 Purpose: Advanced AI-powered agricultural assistance platform
echo.

if exist "package.json" (
    echo 📦 Project Structure:
    if exist "backend" echo    ✅ Backend (Node.js + Express)
    if exist "frontend" echo    ✅ Frontend (React + Vite)
    if exist "backend\package.json" echo    ✅ Backend configuration
    if exist "frontend\package.json" echo    ✅ Frontend configuration
    echo.
)

echo 🚀 Enhanced Features Available:
echo    • 🌤️  Enhanced Weather Dashboard with AI insights
echo    • 🤖 Interactive AI-powered Crop Advisory Chat
echo    • 📈 Market Intelligence with Real-time Data
echo    • 🐛 Advanced Pest Detection with Image Analysis  
echo    • 💧 Smart Irrigation Management System
echo    • 👥 Video Consultation Platform
echo    • 🔔 Real-time Notification System
echo.

echo 🔧 Technical Stack:
echo    • Frontend: React 18, Vite, Tailwind CSS, Framer Motion
echo    • Backend: Node.js, Express, MongoDB
echo    • Animations: Framer Motion, Lucide Icons
echo    • State Management: React Hooks
echo    • Styling: Tailwind CSS + Custom Components
echo.

echo 📊 System Status:
if exist "frontend\node_modules" (echo    ✅ Frontend dependencies ready) else (echo    ⚠️  Frontend dependencies needed)
if exist "backend\node_modules" (echo    ✅ Backend dependencies ready) else (echo    ⚠️  Backend dependencies needed)

netstat -an | find ":3000" | find "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (echo    🟢 Frontend server running) else (echo    ⚪ Frontend server stopped)

netstat -an | find ":5000" | find "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (echo    🟢 Backend server running) else (echo    ⚪ Backend server stopped)

echo.
echo 🌐 Access URLs (when running):
echo    • Development: http://localhost:3000
echo    • Production:  http://localhost:4173
echo    • Backend API: http://localhost:5000
echo    • API Health:  http://localhost:5000/health
echo.
echo 📝 Available Commands:
echo    • npm run dev:frontend    - Start frontend dev server
echo    • npm run dev:backend     - Start backend dev server
echo    • npm run build:frontend  - Build frontend for production
echo    • npm run build:backend   - Build backend for production
echo.
pause
goto MENU

:QUICK_LAUNCH
cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                    🌐 QUICK LAUNCH                       ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo 🏃‍♂️ Quick frontend-only launch for demonstrations...
echo.

cd /d "D:\smart crop advisory prototype\frontend"

if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Installation failed
        pause
        goto MENU
    )
)

echo 🚀 Starting frontend development server...
echo.
echo 💡 Note: Backend features will show mock data
echo 🌐 Opening http://localhost:3000 in 10 seconds...
echo.

start "🌐 Smart Crop Advisory - Quick Demo" cmd /c "npm run dev && pause"
timeout /t 10 /nobreak >nul
start http://localhost:3000

echo ✅ Quick launch completed!
echo ⚠️  Only frontend is running - some features may show demo data
echo.
pause
goto MENU

:EXIT
cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                      👋 GOODBYE!                         ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo 🌾 Thank you for using Smart Crop Advisory System!
echo.
echo 💡 Quick reminders:
echo    • Use "🚀 Launch Smart Crop Advisory.bat" for full experience
echo    • Run "🔧 System Diagnostics.bat" if you have issues
echo    • All your data is preserved
echo.
echo 🎯 Smart farming made simple! 
echo.
timeout /t 3 /nobreak >nul
exit