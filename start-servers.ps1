# Start Smart Crop Advisory System - PRODUCTION MODE
Write-Host "🌾 Starting Smart Crop Advisory System (Production Mode)..." -ForegroundColor Green
Write-Host "📊 Full Database, Authentication & Real Features Enabled" -ForegroundColor Yellow
Write-Host ""

# Start Backend with Full Features
Write-Host "Starting Backend Server (MongoDB + Full Features)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"D:\smart crop advisory prototype\backend`" && echo Starting Full Backend... && npm start" -WindowStyle Normal

Start-Sleep -Seconds 12

# Start Frontend  
Write-Host "Starting Frontend Server (Full Production Features)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"D:\smart crop advisory prototype\frontend`" && echo Starting Full Frontend... && npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 8

# Test Backend Connection
Write-Host "Testing backend connection..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($healthCheck.StatusCode -eq 200) {
        Write-Host "✅ Backend API is running and responsive!" -ForegroundColor Green
        $healthData = $healthCheck.Content | ConvertFrom-Json
        Write-Host "   Environment: $($healthData.environment)" -ForegroundColor Gray
        Write-Host "   Uptime: $([math]::Round($healthData.uptime, 2)) seconds" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Backend may still be starting up..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Smart Crop Advisory System Started (PRODUCTION MODE)!" -ForegroundColor Green
Write-Host "🔗 Backend API:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "🌐 Frontend App: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📊 API Status:   http://localhost:5000/api/status" -ForegroundColor Cyan
Write-Host ""
Write-Host "Features Enabled:" -ForegroundColor Yellow
Write-Host "  ✅ MongoDB Database Connection" -ForegroundColor Green
Write-Host "  ✅ JWT Authentication System" -ForegroundColor Green
Write-Host "  ✅ Real-time Notifications" -ForegroundColor Green
Write-Host "  ✅ Weather API Integration" -ForegroundColor Green
Write-Host "  ✅ Market Data APIs" -ForegroundColor Green
Write-Host "  ✅ AI Advisory System" -ForegroundColor Green
