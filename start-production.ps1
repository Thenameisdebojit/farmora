# Start Smart Crop Advisory System - PRODUCTION MODE
Write-Host "Starting Smart Crop Advisory System (Production Mode)..." -ForegroundColor Green
Write-Host "Full Database, Authentication and Real Features Enabled" -ForegroundColor Yellow
Write-Host ""

# Start Backend with Full Features
Write-Host "Starting Backend Server (MongoDB + Full Features)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"D:\smart crop advisory prototype\backend`" `&`& npm start" -WindowStyle Normal

Start-Sleep -Seconds 15

# Start Frontend  
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"D:\smart crop advisory prototype\frontend`" `&`& npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 10

# Test Backend Connection
Write-Host "Testing backend connection..." -ForegroundColor Yellow

try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 15 -ErrorAction Stop
    if ($healthCheck.StatusCode -eq 200) {
        Write-Host "Backend API is running and responsive!" -ForegroundColor Green
        $healthData = $healthCheck.Content | ConvertFrom-Json
        Write-Host "   Environment: $($healthData.environment)" -ForegroundColor Gray
        Write-Host "   Version: $($healthData.version)" -ForegroundColor Gray
        Write-Host "   Uptime: $([math]::Round($healthData.uptime, 2)) seconds" -ForegroundColor Gray
    }
} catch {
    Write-Host "Backend may still be starting up..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Smart Crop Advisory System Started in PRODUCTION MODE!" -ForegroundColor Green
Write-Host "Backend API:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend App: http://localhost:3000" -ForegroundColor Cyan
Write-Host "API Status:   http://localhost:5000/api/status" -ForegroundColor Cyan
Write-Host ""
Write-Host "Production Features:" -ForegroundColor Yellow
Write-Host "  - MongoDB Database Connection" -ForegroundColor Green
Write-Host "  - JWT Authentication System" -ForegroundColor Green
Write-Host "  - Real-time Notifications" -ForegroundColor Green
Write-Host "  - Weather API Integration" -ForegroundColor Green
Write-Host "  - Market Data APIs" -ForegroundColor Green
Write-Host "  - AI Advisory System" -ForegroundColor Green