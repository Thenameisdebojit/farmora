# Smart Crop Advisory - Simple Launcher
Write-Host "Starting Smart Crop Advisory System" -ForegroundColor Green

# Change to project directory
Set-Location "D:\smart crop advisory prototype"

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location "D:\smart crop advisory prototype\backend"
    npm run dev
} -Name "Backend"

Write-Host "Backend job started (ID: $($backendJob.Id))" -ForegroundColor Green

# Wait for backend
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start Frontend
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "D:\smart crop advisory prototype\frontend"
    npm run dev
} -Name "Frontend"

Write-Host "Frontend job started (ID: $($frontendJob.Id))" -ForegroundColor Green

# Wait for frontend
Write-Host "Waiting for frontend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check status and open browser
Write-Host "Checking application status..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
    Write-Host "Frontend is accessible! Opening browser..." -ForegroundColor Green
    Start-Process "http://localhost:3000"
} catch {
    Write-Host "Frontend not accessible yet. Trying again..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
        Write-Host "Frontend is now accessible! Opening browser..." -ForegroundColor Green
        Start-Process "http://localhost:3000"
    } catch {
        Write-Host "Frontend still not accessible. Check the job output below:" -ForegroundColor Red
        Write-Host "Frontend Output:" -ForegroundColor Yellow
        Receive-Job -Id $frontendJob.Id
        Write-Host "Backend Output:" -ForegroundColor Yellow
        Receive-Job -Id $backendJob.Id
    }
}

Write-Host ""
Write-Host "Application Status:" -ForegroundColor Magenta
Write-Host "Backend Job: $($backendJob.State)" -ForegroundColor Green
Write-Host "Frontend Job: $($frontendJob.State)" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend URL: http://localhost:3000" -ForegroundColor Gray
Write-Host "Backend URL: http://localhost:5000" -ForegroundColor Gray
Write-Host "To stop servers: Get-Job | Stop-Job; Get-Job | Remove-Job" -ForegroundColor Gray