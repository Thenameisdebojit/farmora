@echo off
chcp 65001 >nul 2>&1
title Smart Crop Advisory - System Diagnostics
color 0E

echo.
echo  ╔════════════════════════════════════════════════════════════════╗
echo  ║                🔧 SYSTEM DIAGNOSTICS & HEALTH CHECK 🔧         ║
echo  ║                  Smart Crop Advisory System                   ║
echo  ╚════════════════════════════════════════════════════════════════╝
echo.
echo  🔍 Running comprehensive system diagnostics...
echo.

cd /d "D:\smart crop advisory prototype"

REM System Information
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                    SYSTEM INFORMATION                     ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 🖥️  Operating System:
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
echo.

echo 🧠 Memory Information:
systeminfo | findstr /B /C:"Total Physical Memory" /C:"Available Physical Memory"
echo.

echo 💾 Disk Space:
for %%d in (C: D:) do (
    for /f "tokens=3" %%s in ('dir %%d 2^>nul ^| find "bytes free"') do echo    %%d %%s bytes free
)
echo.

REM Node.js Environment Check
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                  NODE.JS ENVIRONMENT                     ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 📦 Node.js Installation:
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do echo    ✅ Node.js: %%i
    for /f "tokens=*" %%i in ('npm --version') do echo    ✅ npm: v%%i
    
    REM Check global packages
    echo.
    echo 🌐 Global npm packages:
    npm list -g --depth=0 2>nul | findstr /C:"npm@" /C:"node@"
) else (
    echo    ❌ Node.js: Not installed or not in PATH
    echo    💡 Install from: https://nodejs.org/
)
echo.

REM Project Structure Check
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                   PROJECT STRUCTURE                      ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 📁 Directory Structure:
if exist "package.json" (echo    ✅ Root package.json) else (echo    ❌ Root package.json missing)
if exist "backend" (echo    ✅ Backend directory) else (echo    ❌ Backend directory missing)
if exist "frontend" (echo    ✅ Frontend directory) else (echo    ❌ Frontend directory missing)
if exist "backend\package.json" (echo    ✅ Backend package.json) else (echo    ❌ Backend package.json missing)
if exist "frontend\package.json" (echo    ✅ Frontend package.json) else (echo    ❌ Frontend package.json missing)
echo.

REM Dependencies Check
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                    DEPENDENCIES                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 📦 Node Modules Status:
if exist "node_modules" (echo    ✅ Root node_modules) else (echo    ⚠️  Root node_modules missing)
if exist "backend\node_modules" (echo    ✅ Backend node_modules) else (echo    ⚠️  Backend node_modules missing)
if exist "frontend\node_modules" (echo    ✅ Frontend node_modules) else (echo    ⚠️  Frontend node_modules missing)
echo.

if exist "frontend\package.json" (
    echo 🌐 Frontend Dependencies Check:
    cd frontend
    npm outdated 2>nul
    if %errorlevel% equ 0 (
        echo    ✅ All dependencies up to date
    ) else (
        echo    ⚠️  Some dependencies may be outdated
    )
    cd ..
    echo.
)

if exist "backend\package.json" (
    echo 🔧 Backend Dependencies Check:
    cd backend
    npm outdated 2>nul
    if %errorlevel% equ 0 (
        echo    ✅ All dependencies up to date
    ) else (
        echo    ⚠️  Some dependencies may be outdated
    )
    cd ..
    echo.
)

REM Port Availability
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                   PORT AVAILABILITY                      ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 🔌 Checking required ports:
netstat -an | find ":3000" | find "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo    ⚠️  Port 3000: In use (Frontend may conflict)
    netstat -an | find ":3000"
) else (
    echo    ✅ Port 3000: Available for frontend
)

netstat -an | find ":5000" | find "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo    ⚠️  Port 5000: In use (Backend may conflict)
    netstat -an | find ":5000"
) else (
    echo    ✅ Port 5000: Available for backend
)

netstat -an | find ":4173" | find "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo    ⚠️  Port 4173: In use (Production frontend may conflict)
) else (
    echo    ✅ Port 4173: Available for production frontend
)
echo.

REM Network Connectivity
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                 NETWORK CONNECTIVITY                     ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 🌐 Network Tests:
ping -n 1 google.com >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Internet connectivity: OK
) else (
    echo    ❌ Internet connectivity: Failed
)

ping -n 1 127.0.0.1 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Localhost connectivity: OK
) else (
    echo    ❌ Localhost connectivity: Failed
)
echo.

REM Security & Permissions
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                SECURITY & PERMISSIONS                    ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 🔐 File Permissions:
if exist "package.json" (
    echo    ✅ Root directory: Readable
) else (
    echo    ❌ Root directory: Access issues
)

REM Check if running as admin
net session >nul 2>&1
if %errorlevel% equ 0 (
    echo    ⚠️  Running as Administrator (may not be necessary)
) else (
    echo    ✅ Running as regular user
)
echo.

REM Performance Check
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                   PERFORMANCE CHECK                      ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

if exist "frontend\node_modules" (
    echo 📊 Frontend Bundle Size Check:
    if exist "frontend\dist" (
        for /f "tokens=3" %%s in ('dir "frontend\dist" /s /-c 2^>nul ^| find "bytes"') do echo    Build size: %%s bytes
    ) else (
        echo    ⚠️  No production build found
    )
)

echo 🏃‍♂️ Node.js Performance:
node -e "console.log('✅ Node.js execution: OK')" 2>nul
if %errorlevel% neq 0 (
    echo    ❌ Node.js execution failed
)
echo.

REM Final Recommendations
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                    RECOMMENDATIONS                       ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 💡 System Health Summary:
echo.

REM Calculate health score
set /a HEALTH_SCORE=0
node --version >nul 2>&1 && set /a HEALTH_SCORE+=20
npm --version >nul 2>&1 && set /a HEALTH_SCORE+=20
if exist "package.json" set /a HEALTH_SCORE+=15
if exist "backend\node_modules" set /a HEALTH_SCORE+=15
if exist "frontend\node_modules" set /a HEALTH_SCORE+=15
netstat -an | find ":3000" | find "LISTENING" >nul 2>&1 || set /a HEALTH_SCORE+=15

if %HEALTH_SCORE% GEQ 90 (
    echo    🟢 System Health: Excellent ^(%HEALTH_SCORE%/100^)
    echo    ✅ Ready to run Smart Crop Advisory System
) else if %HEALTH_SCORE% GEQ 70 (
    echo    🟡 System Health: Good ^(%HEALTH_SCORE%/100^)
    echo    ⚠️  Minor issues detected, but should work
) else (
    echo    🔴 System Health: Poor ^(%HEALTH_SCORE%/100^)
    echo    ❌ Issues need to be resolved before running
)

echo.
echo 🔧 Quick Fixes:
if not exist "node_modules" echo    • Run: npm run install:all
if not exist "backend\node_modules" echo    • Run: cd backend ^&^& npm install
if not exist "frontend\node_modules" echo    • Run: cd frontend ^&^& npm install

REM Check for updates
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2 delims=v" %%v in ('node --version') do (
        for /f "tokens=1 delims=." %%m in ("%%v") do (
            if %%m LSS 16 (
                echo    • Update Node.js to version 16+ from https://nodejs.org/
            )
        )
    )
)

echo.
echo 🎯 Next Steps:
echo    1. Fix any issues shown above
echo    2. Run "🚀 Launch Smart Crop Advisory.bat" for development
echo    3. Run "🏗️ Build for Production.bat" for production build
echo.
echo ▶️  Diagnostics complete! Check the results above.
echo.
pause