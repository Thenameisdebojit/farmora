# 🚀 Smart Crop Advisory System - Quick Start Guide

This guide explains how to easily run the Smart Crop Advisory System using the provided launcher scripts.

## 📋 Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Internet connection** (for MongoDB Atlas connection)

## 🎯 Quick Start Options

### Option 1: Quick Start (Recommended for beginners)
**Double-click:** `Quick Start.bat`

This is the simplest way to run the application:
- ✅ Automatically checks system requirements
- ✅ Installs dependencies if needed
- ✅ Starts both backend and frontend servers
- ✅ Opens the application in your browser
- ✅ Runs in background (minimized windows)

### Option 2: Full Control Launcher
**Double-click:** `start-app.bat`

This provides more detailed feedback:
- ✅ Shows detailed startup progress
- ✅ Opens separate windows for backend and frontend
- ✅ Better error messages and troubleshooting
- ✅ More control over the startup process

### Option 3: Advanced PowerShell Launcher
**Right-click PowerShell:** `start-app.ps1` → "Run with PowerShell"

Most advanced option with additional features:
- ✅ Colored output and better UI
- ✅ Advanced error handling
- ✅ Port conflict detection
- ✅ Background job management
- ✅ Graceful shutdown with Ctrl+C

**PowerShell Options:**
```powershell
# Basic startup
.\start-app.ps1

# Start without opening browser
.\start-app.ps1 -NoBrowser

# Show help
.\start-app.ps1 -Help
```

## 🛑 Stopping the Application

### Quick Stop
**Double-click:** `stop-app.bat`

This will:
- ✅ Stop all Node.js processes
- ✅ Free up ports 3000 and 5000
- ✅ Clean shutdown of the application

### Manual Stop
- Close the backend and frontend command windows
- Or press `Ctrl+C` in each window

## 🌐 Application URLs

Once started, access the application at:

- **Frontend Application:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health
- **API Status:** http://localhost:5000/api/status

## 🔧 Troubleshooting

### 🚨 "No webpage found" or "Connection refused"
**Most common issue!** If the browser shows "no webpage found":

1. **Check if servers are actually running:**
   - Look for TWO command windows: "Smart Crop Advisory - Backend" and "Smart Crop Advisory - Frontend"
   - Both should be showing activity/logs

2. **Test the servers individually:**
   - Backend: Open http://localhost:5000/health (should show JSON response)
   - Frontend: Open http://localhost:3000/test.html (should show test page)
   - If test page works but main app doesn't, there might be a React issue

3. **Wait longer for startup:**
   - First startup can take 2-3 minutes to install dependencies
   - Backend needs 10-15 seconds to connect to MongoDB
   - Frontend needs 5-10 seconds to compile React app

4. **Check for error messages:**
   - Look at the command windows for red error text
   - Common errors: "EADDRINUSE" (port busy), "MODULE_NOT_FOUND" (dependencies)

### Port Already in Use
If you get "EADDRINUSE" errors:
1. Run `stop-app.bat` first
2. Wait 10 seconds
3. Try starting again
4. If still fails, restart your computer

### Dependencies Issues
If you get npm errors:
1. Delete `node_modules` folder (in root, backend, AND frontend)
2. Delete `package-lock.json` files
3. Run the launcher again
4. Be patient - first install takes several minutes

### Node.js Not Found
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. **Important:** Restart your computer after installation
3. Try running the launcher again

### React App Not Loading
If http://localhost:5000/health works but http://localhost:3000 doesn't:
1. Check if frontend command window shows "ready in XXX ms"
2. Try http://localhost:3000/test.html first
3. Look for React/Vite error messages in frontend window
4. Try refreshing the page after 30 seconds

### Database Connection Issues
The app connects to MongoDB Atlas. If you see database errors:
1. Check your internet connection
2. Verify the MongoDB credentials in `backend/.env`
3. Database errors won't prevent the frontend from loading

## 📁 Project Structure

```
D:\smart crop advisory prototype\
├── Quick Start.bat          # Simple double-click launcher
├── start-app.bat           # Detailed launcher
├── start-app.ps1           # Advanced PowerShell launcher  
├── stop-app.bat           # Application stopper
├── backend/               # Node.js API server
├── frontend/              # React web application
└── HOW-TO-RUN.md         # This guide
```

## 💡 Tips

1. **First Time Users**: Use `Quick Start.bat` - it's the easiest
2. **Developers**: Use `start-app.ps1` for better debugging
3. **Always Stop Properly**: Use `stop-app.bat` to avoid port conflicts
4. **Browser Issues**: Try refreshing the page or clearing cache
5. **Slow Startup**: First run may take 2-3 minutes to install dependencies

## 🔄 Development Workflow

```bash
# Start development
Double-click: Quick Start.bat

# Make code changes
# The servers will auto-reload

# Stop when done
Double-click: stop-app.bat
```

## 📞 Support

If you encounter issues:
1. Try the troubleshooting steps above
2. Check the console output for error messages
3. Ensure all prerequisites are installed
4. Restart your computer if problems persist

---

**Happy farming! 🌱**