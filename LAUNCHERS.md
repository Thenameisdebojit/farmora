# 🚀 Smart Crop Advisory System - Available Launchers

This document provides an overview of all the ways you can run the Smart Crop Advisory System.

## 📁 Available Files

| File | Type | Description | Best For |
|------|------|-------------|----------|
| `Quick Start.bat` | Batch File | Simple one-click launcher | **Beginners & Daily Use** |
| `start-app.bat` | Batch File | Detailed startup with separate windows | Troubleshooting |
| `start-app.ps1` | PowerShell | Advanced launcher with monitoring | Developers |
| `stop-app.bat` | Batch File | Application stopper | Everyone |
| `create-shortcuts.bat` | Batch File | Creates desktop shortcuts | One-time setup |

## 🎯 Quick Start Methods

### 🥇 Method 1: Desktop Shortcuts (Recommended)
1. **First time:** Double-click `create-shortcuts.bat`
2. **Daily use:** Double-click desktop shortcut "Smart Crop Advisory - Start"
3. **To stop:** Double-click desktop shortcut "Smart Crop Advisory - Stop"

### 🥈 Method 2: Direct File Launch
- **Start:** Double-click `Quick Start.bat`
- **Stop:** Double-click `stop-app.bat`

### 🥉 Method 3: PowerShell Advanced
```powershell
# Navigate to project folder
cd "D:\smart crop advisory prototype"

# Basic start
.\start-app.ps1

# Start without browser
.\start-app.ps1 -NoBrowser

# Show help
.\start-app.ps1 -Help
```

## 🔄 Launcher Comparison

### Quick Start.bat ⭐ **Recommended**
```
✅ Simplest to use
✅ Automatic dependency installation
✅ Background execution
✅ Opens browser automatically
✅ Minimal user interaction
❌ Less troubleshooting info
```

### start-app.bat 🔧 **For Troubleshooting**
```
✅ Detailed progress messages
✅ Separate windows for each service
✅ Better error visibility
✅ Manual control over each step
❌ More complex interface
❌ Multiple windows to manage
```

### start-app.ps1 🚀 **For Developers**
```
✅ Advanced error handling
✅ Colored output and UI
✅ Port conflict detection
✅ Background job management
✅ Graceful shutdown (Ctrl+C)
✅ Process monitoring
❌ Requires PowerShell knowledge
❌ May need execution policy changes
```

## 🛠️ Setup Instructions

### First Time Setup
1. **Install Node.js** from https://nodejs.org/
2. **Run** `create-shortcuts.bat` to create desktop shortcuts
3. **Double-click** the "Smart Crop Advisory - Start" desktop shortcut

### Daily Usage
1. **Start:** Double-click desktop shortcut or `Quick Start.bat`
2. **Use:** Browser opens automatically at http://localhost:3000
3. **Stop:** Double-click "Stop" shortcut or `stop-app.bat`

## 🌐 Access URLs

Once started, the application is available at:

| Service | URL | Description |
|---------|-----|-------------|
| **Main App** | http://localhost:3000 | React frontend application |
| **API Server** | http://localhost:5000 | Backend REST API |
| **Health Check** | http://localhost:5000/health | Server status |
| **API Status** | http://localhost:5000/api/status | API diagnostics |

## 🔧 Troubleshooting Guide

### Issue: "Node.js not found"
**Solution:**
1. Install Node.js from https://nodejs.org/
2. Restart your computer
3. Try again

### Issue: "Port already in use"
**Solution:**
1. Run `stop-app.bat`
2. Wait 10 seconds
3. Try starting again

### Issue: "Dependencies installation failed"
**Solution:**
1. Check internet connection
2. Delete `node_modules` folder
3. Run launcher again

### Issue: "Database connection failed"
**Solution:**
1. Check internet connection
2. Verify MongoDB credentials in `backend/.env`
3. Contact system administrator

## 💡 Pro Tips

1. **Always use the stop script** to avoid port conflicts
2. **First run takes longer** due to dependency installation
3. **Keep shortcuts on desktop** for easy access
4. **Check console output** if something goes wrong
5. **Use PowerShell version** for debugging issues

## 🚦 Status Indicators

### Application Running Successfully:
- ✅ Backend: http://localhost:5000/health returns "OK"
- ✅ Frontend: http://localhost:3000 loads the app
- ✅ Database: MongoDB Atlas connection established

### Common Error Signs:
- ❌ "EADDRINUSE" = Port already in use
- ❌ "MODULE_NOT_FOUND" = Dependencies missing
- ❌ "Database connection failed" = MongoDB issue

## 📞 Getting Help

If you encounter issues:

1. **Try the troubleshooting section above**
2. **Check the console output for detailed error messages**
3. **Use the advanced PowerShell launcher for better diagnostics**
4. **Restart your computer if problems persist**

---

**Choose the method that works best for you and enjoy the Smart Crop Advisory System! 🌱**