@echo off
echo Starting Smart Crop Advisory System...
echo.

echo Starting Backend Server...
start "Backend Server" "%~dp0start-backend.bat"

echo Waiting for backend to initialize...
timeout /t 10 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" "%~dp0start-frontend.bat"

echo.
echo Both servers are starting in separate windows.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause