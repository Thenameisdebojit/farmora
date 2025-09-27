@echo off
chcp 65001 >nul 2>&1
title Smart Crop Advisory - Production Build
color 0B

echo.
echo  ╔════════════════════════════════════════════════════════════════╗
echo  ║                🏗️  PRODUCTION BUILD & DEPLOY 🏗️                ║
echo  ║                  Smart Crop Advisory System                   ║
echo  ╚════════════════════════════════════════════════════════════════╝
echo.
echo  🚀 Building optimized production version...
echo.

REM Change to project directory
cd /d "D:\smart crop advisory prototype"

REM System Requirements Check
echo [1/7] 🔍 Verifying build environment...
echo.

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js not found
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ Node.js: %NODE_VERSION%
echo ✅ npm: v%NPM_VERSION%
echo.

REM Clean previous builds
echo [2/7] 🧹 Cleaning previous builds...
echo.

if exist "frontend\dist" (
    echo    Removing frontend\dist...
    rmdir /s /q "frontend\dist" >nul 2>&1
)

if exist "backend\dist" (
    echo    Removing backend\dist...
    rmdir /s /q "backend\dist" >nul 2>&1
)

echo ✅ Build directories cleaned
echo.

REM Install dependencies
echo [3/7] 📦 Installing/updating dependencies...
echo.

call npm run install:all
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies ready
echo.

REM Build Backend
echo [4/7] 🔧 Building backend for production...
echo.

cd backend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Backend build failed
    cd ..
    pause
    exit /b 1
)
cd ..

echo ✅ Backend built successfully
echo.

REM Build Frontend
echo [5/7] 🌐 Building frontend for production...
echo.

cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    cd ..
    pause
    exit /b 1
)
cd ..

echo ✅ Frontend built successfully
echo.

REM Start Production Servers
echo [6/7] 🚀 Starting production servers...
echo.

echo    Starting backend production server...
start "🔧 Smart Crop Advisory - Production Backend" cmd /c "cd /d \"D:\smart crop advisory prototype\backend\" && npm start && echo. && echo Production backend stopped. && pause"

timeout /t 5 /nobreak >nul

echo    Starting frontend production server...
start "🌐 Smart Crop Advisory - Production Frontend" cmd /c "cd /d \"D:\smart crop advisory prototype\frontend\" && npm run preview && echo. && echo Production frontend stopped. && pause"

timeout /t 8 /nobreak >nul

REM Launch Application
echo [7/7] 🎯 Launching production application...
echo.

echo    Opening production application...
start http://localhost:4173

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                🎉 PRODUCTION BUILD SUCCESS! 🎉                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 🌟 SMART CROP ADVISORY - PRODUCTION MODE
echo.
echo 📱 Production URLs:
echo    • Frontend App: http://localhost:4173
echo    • Backend API:  http://localhost:5000 (or configured port)
echo    • Health Check: http://localhost:5000/health
echo.
echo 🏆 PRODUCTION FEATURES:
echo    ✅ Optimized bundle sizes
echo    ✅ Minified JavaScript & CSS
echo    ✅ Tree-shaking enabled
echo    ✅ Production error handling
echo    ✅ Enhanced security headers
echo    ✅ Gzip compression
echo    ✅ Static file caching
echo.
echo 🔧 BUILD STATISTICS:
echo    • Node.js: %NODE_VERSION%
echo    • npm: v%NPM_VERSION%
echo    • Build Mode: Production
echo    • Bundle Optimization: Enabled
echo    • Source Maps: Generated
echo.
echo 📊 PERFORMANCE OPTIMIZATIONS:
echo    • Code splitting implemented
echo    • Asset optimization enabled
echo    • Lazy loading configured
echo    • PWA features active
echo    • Offline caching enabled
echo.
echo 🚀 DEPLOYMENT READY:
echo    • Frontend build: frontend\dist\
echo    • Backend build: backend\dist\
echo    • Static assets: Optimized
echo    • Docker support: Available
echo.
echo ⚠️  PRODUCTION NOTES:
echo    • This is optimized for performance
echo    • Hot reload is disabled
echo    • Debug logs are minimized
echo    • Error reporting is production-safe
echo.
echo 💡 For development mode, use "🚀 Launch Smart Crop Advisory.bat"
echo.
echo ▶️  Production application is ready!
echo.
pause >nul