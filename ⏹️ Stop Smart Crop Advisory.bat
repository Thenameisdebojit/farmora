@echo off
chcp 65001 >nul 2>&1
title Smart Crop Advisory - Stop Application
color 0C

echo.
echo  ╔════════════════════════════════════════════════════════════════╗
echo  ║                    ⏹️  STOP APPLICATION ⏹️                     ║
echo  ║                  Smart Crop Advisory System                   ║
echo  ╚════════════════════════════════════════════════════════════════╝
echo.

echo 🔍 Stopping Smart Crop Advisory System...
echo.

REM Kill processes running on port 3000 (Frontend)
echo [1/4] 🌐 Stopping frontend server (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo    Terminating process %%a...
    taskkill /f /pid %%a >nul 2>&1
    if %errorlevel% equ 0 (
        echo    ✅ Frontend server stopped
    ) else (
        echo    ⚠️  Frontend server was not running
    )
)

REM Kill processes running on port 5000 (Backend)
echo [2/4] 🔧 Stopping backend server (port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    echo    Terminating process %%a...
    taskkill /f /pid %%a >nul 2>&1
    if %errorlevel% equ 0 (
        echo    ✅ Backend server stopped
    ) else (
        echo    ⚠️  Backend server was not running
    )
)

REM Kill any remaining Node.js processes related to the project
echo [3/4] 🧹 Cleaning up remaining processes...
tasklist | find /i "node.exe" >nul 2>&1
if %errorlevel% equ 0 (
    echo    Found Node.js processes, attempting cleanup...
    wmic process where "name='node.exe' and CommandLine like '%%smart crop advisory%%'" delete >nul 2>&1
    echo    ✅ Cleanup completed
) else (
    echo    ✅ No Node.js processes found
)

REM Kill any Vite dev server processes
echo [4/4] 🏗️ Stopping Vite development servers...
tasklist | find /i "vite" >nul 2>&1
if %errorlevel% equ 0 (
    taskkill /f /im "vite.exe" >nul 2>&1
    echo    ✅ Vite servers stopped
) else (
    echo    ✅ No Vite processes found
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                      ✅ STOP COMPLETE ✅                       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 🎯 Smart Crop Advisory System has been stopped successfully!
echo.
echo 📊 Summary:
echo    • Frontend server (port 3000): Stopped
echo    • Backend server (port 5000): Stopped  
echo    • All related processes: Terminated
echo    • Resources: Released
echo.
echo 💡 To restart the application, run "🚀 Launch Smart Crop Advisory.bat"
echo.
echo ▶️  You can safely close this window.
echo.
timeout /t 3 /nobreak >nul