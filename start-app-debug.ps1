# Smart Crop Advisory - Debug Launcher
Write-Host "🌾 Starting Smart Crop Advisory System - Debug Mode" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

# Function to test port availability
function Test-Port($port) {
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect('127.0.0.1', $port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Check if ports are available
Write-Host "🔍 Checking port availability..." -ForegroundColor Cyan
if (Test-Port 3000) {
    Write-Host "⚠️  Port 3000 is already in use!" -ForegroundColor Yellow
} else {
    Write-Host "✅ Port 3000 is available" -ForegroundColor Green
}

if (Test-Port 5000) {
    Write-Host "⚠️  Port 5000 is already in use!" -ForegroundColor Yellow
} else {
    Write-Host "✅ Port 5000 is available" -ForegroundColor Green
}

Write-Host ""

# Start Backend
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Cyan
Write-Host "Location: D:\smart crop advisory prototype\backend" -ForegroundColor Gray

try {
    $backendJob = Start-Job -ScriptBlock {
        Set-Location "D:\smart crop advisory prototype\backend"
        npm run dev 2>&1
    } -Name "Backend"
    
    Write-Host "✅ Backend job started (ID: $($backendJob.Id))" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start backend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Wait for backend to initialize
Write-Host "⏳ Waiting for backend to initialize (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check backend status
$backendOutput = Receive-Job -Id $backendJob.Id
if ($backendOutput -match "Server running on port 5000") {
    Write-Host "✅ Backend is running on port 5000" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend may not have started properly" -ForegroundColor Yellow
    Write-Host "Backend Output:" -ForegroundColor Gray
    Write-Host $backendOutput -ForegroundColor White
}

Write-Host ""

# Start Frontend
Write-Host "🌐 Starting Frontend Server..." -ForegroundColor Cyan
Write-Host "Location: D:\smart crop advisory prototype\frontend" -ForegroundColor Gray

try {
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location "D:\smart crop advisory prototype\frontend"
        npm run dev 2>&1
    } -Name "Frontend"
    
    Write-Host "✅ Frontend job started (ID: $($frontendJob.Id))" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start frontend: $($_.Exception.Message)" -ForegroundColor Red
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    exit 1
}

# Wait for frontend to initialize
Write-Host "⏳ Waiting for frontend to initialize (8 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check frontend status
$frontendOutput = Receive-Job -Id $frontendJob.Id
if ($frontendOutput -match "Local:.*http://localhost:3000") {
    Write-Host "✅ Frontend is running on port 3000" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend may not have started properly" -ForegroundColor Yellow
    Write-Host "Frontend Output:" -ForegroundColor Gray
    Write-Host $frontendOutput -ForegroundColor White
}

Write-Host ""

# Test accessibility
Write-Host "🌐 Testing application accessibility..." -ForegroundColor Cyan

# Test backend
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend API is accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend API is not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Frontend is accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    
    # Open browser
    Write-Host "🌐 Opening browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:3000"
    
} catch {
    Write-Host "❌ Frontend is not accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "📊 Detailed Frontend Output:" -ForegroundColor Yellow
    Write-Host "=" * 40 -ForegroundColor Gray
    $frontendOutput = Receive-Job -Id $frontendJob.Id
    Write-Host $frontendOutput -ForegroundColor White
}

Write-Host ""
Write-Host "🎯 Application Status Summary:" -ForegroundColor Magenta
Write-Host "Backend Job: $(if ($backendJob.State -eq 'Running') { '✅ Running' } else { '❌ ' + $backendJob.State })" -ForegroundColor $(if ($backendJob.State -eq 'Running') { 'Green' } else { 'Red' })
Write-Host "Frontend Job: $(if ($frontendJob.State -eq 'Running') { '✅ Running' } else { '❌ ' + $frontendJob.State })" -ForegroundColor $(if ($frontendJob.State -eq 'Running') { 'Green' } else { 'Red' })

Write-Host ""
Write-Host "🔧 To view job output: Receive-Job -Id <JobId>" -ForegroundColor Gray
Write-Host "⏹️  To stop servers: Get-Job | Stop-Job; Get-Job | Remove-Job" -ForegroundColor Gray
Write-Host "🌐 Frontend URL: http://localhost:3000" -ForegroundColor Gray
Write-Host "🔧 Backend URL: http://localhost:5000" -ForegroundColor Gray

Write-Host ""
Write-Host "Script complete. Check the status above." -ForegroundColor Green
