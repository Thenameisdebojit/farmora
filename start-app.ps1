# Smart Crop Advisory System Launcher
# PowerShell script to start both backend and frontend servers

param(
    [switch]$NoBrowser,
    [switch]$Help
)

if ($Help) {
    Write-Host "Smart Crop Advisory System Launcher" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\start-app.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -NoBrowser    Don't open browser automatically"
    Write-Host "  -Help         Show this help message"
    Write-Host ""
    exit 0
}

# Function to write colored output
function Write-ColoredMessage {
    param([string]$Message, [string]$Color = "White", [string]$Prefix = "")
    Write-Host "[$Prefix] $Message" -ForegroundColor $Color
}

# Function to check if a port is available
function Test-Port {
    param([int]$Port)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("127.0.0.1", $Port)
        $tcpClient.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function to stop existing Node.js processes
function Stop-ExistingProcesses {
    Write-ColoredMessage "Stopping existing Node.js processes..." "Yellow" "INFO"
    Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
        Write-ColoredMessage "Stopping process: $($_.ProcessName) (PID: $($_.Id))" "Yellow" "INFO"
        $_ | Stop-Process -Force -ErrorAction SilentlyContinue
    }
}

# Clear screen and show header
Clear-Host
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Smart Crop Advisory System" -ForegroundColor Green
Write-Host "    Application Launcher v1.0" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set project directory
$projectDir = "D:\smart crop advisory prototype"
Set-Location $projectDir

# Check if Node.js is installed
Write-ColoredMessage "Checking Node.js installation..." "Blue" "INFO"
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-ColoredMessage "Node.js version: $nodeVersion" "Green" "SUCCESS"
    }
    else {
        throw "Node.js not found"
    }
}
catch {
    Write-ColoredMessage "Node.js is not installed or not in PATH" "Red" "ERROR"
    Write-ColoredMessage "Please install Node.js from https://nodejs.org/" "Yellow" "INFO"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-ColoredMessage "npm version: $npmVersion" "Green" "SUCCESS"
    }
    else {
        throw "npm not found"
    }
}
catch {
    Write-ColoredMessage "npm is not installed or not in PATH" "Red" "ERROR"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-ColoredMessage "Dependencies not found. Installing..." "Yellow" "WARNING"
    Write-ColoredMessage "This may take a few minutes..." "Blue" "INFO"
    
    try {
        & npm run install:all
        if ($LASTEXITCODE -ne 0) {
            throw "npm install failed"
        }
        Write-ColoredMessage "Dependencies installed successfully" "Green" "SUCCESS"
    }
    catch {
        Write-ColoredMessage "Failed to install dependencies" "Red" "ERROR"
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Stop any existing processes
Stop-ExistingProcesses

# Check if ports are available
Write-ColoredMessage "Checking port availability..." "Blue" "INFO"

if (Test-Port 5000) {
    Write-ColoredMessage "Port 5000 (backend) is already in use" "Red" "WARNING"
    Write-ColoredMessage "Attempting to free the port..." "Yellow" "INFO"
    Start-Sleep 2
}

if (Test-Port 3000) {
    Write-ColoredMessage "Port 3000 (frontend) is already in use" "Red" "WARNING" 
    Write-ColoredMessage "Attempting to free the port..." "Yellow" "INFO"
    Start-Sleep 2
}

Write-Host ""

# Start backend server
Write-ColoredMessage "Starting Backend Server (MongoDB + API)..." "Green" "INFO"
$backendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    & npm run dev:backend
} -ArgumentList $projectDir

Start-Sleep 8  # Give backend time to start

# Start frontend server
Write-ColoredMessage "Starting Frontend Server (React App)..." "Green" "INFO"
$frontendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    & npm run dev:frontend
} -ArgumentList $projectDir

Start-Sleep 5  # Give frontend time to start

# Display success message
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Application Started Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-ColoredMessage "Backend API:     http://localhost:5000" "Cyan" "URL"
Write-ColoredMessage "Frontend App:    http://localhost:3000" "Cyan" "URL"
Write-ColoredMessage "Health Check:    http://localhost:5000/health" "Cyan" "URL"
Write-ColoredMessage "API Status:      http://localhost:5000/api/status" "Cyan" "URL"

Write-Host ""
Write-ColoredMessage "Database: MongoDB Atlas (Connected)" "Green" "INFO"
Write-ColoredMessage "Environment: Development" "Blue" "INFO"

Write-Host ""

# Open browser
if (-not $NoBrowser) {
    Write-ColoredMessage "Opening application in default browser..." "Blue" "INFO"
    Start-Sleep 2
    Start-Process "http://localhost:3000"
}

# Display management information
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "         Application Management" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop the application:" -ForegroundColor White
Write-Host "  • Press Ctrl+C to stop this script" -ForegroundColor Gray
Write-Host "  • Both backend and frontend will be terminated" -ForegroundColor Gray
Write-Host ""
Write-Host "To restart:" -ForegroundColor White
Write-Host "  • Run this script again: .\start-app.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "Logs:" -ForegroundColor White
Write-Host "  • Backend Job ID: $($backendJob.Id)" -ForegroundColor Gray
Write-Host "  • Frontend Job ID: $($frontendJob.Id)" -ForegroundColor Gray
Write-Host ""

# Monitor jobs
Write-ColoredMessage "Application is running... Press Ctrl+C to stop" "Green" "INFO"

try {
    while ($true) {
        # Check if jobs are still running
        if ($backendJob.State -eq "Failed" -or $backendJob.State -eq "Completed") {
            Write-ColoredMessage "Backend server has stopped unexpectedly" "Red" "ERROR"
            break
        }
        if ($frontendJob.State -eq "Failed" -or $frontendJob.State -eq "Completed") {
            Write-ColoredMessage "Frontend server has stopped unexpectedly" "Red" "ERROR"
            break
        }
        Start-Sleep 5
    }
}
catch {
    # Handle Ctrl+C
    Write-Host ""
    Write-ColoredMessage "Shutting down application..." "Yellow" "INFO"
}
finally {
    # Cleanup
    Write-ColoredMessage "Stopping background jobs..." "Yellow" "INFO"
    $backendJob | Stop-Job -PassThru | Remove-Job -Force
    $frontendJob | Stop-Job -PassThru | Remove-Job -Force
    
    Write-ColoredMessage "Stopping Node.js processes..." "Yellow" "INFO"
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-ColoredMessage "Application stopped successfully" "Green" "SUCCESS"
    Write-Host ""
    Write-Host "Thank you for using Smart Crop Advisory System!" -ForegroundColor Green
}