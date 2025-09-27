# 🚀 Smart Crop Advisory - Production Setup Guide

## 📋 Overview

This guide will help you set up the Smart Crop Advisory system in **full production mode** with:
- **Real MongoDB database** (no demo mode)
- **Twilio SMS** for OTP authentication 
- **Google OAuth** for social login
- **Production-grade security** and error handling
- **No mock data or demo fallbacks**

---

## 🛠️ Prerequisites

Before starting, ensure you have:
- **Node.js 16+** installed
- **MongoDB Atlas** account (or local MongoDB)
- **Twilio** account for SMS services
- **Google Cloud Console** project for OAuth
- **Domain name** (optional, for production deployment)

---

## ⚙️ Backend Configuration

### 1. **Set up Environment Variables**

Create `.env.production` in the backend directory:

```bash
cd backend
cp .env.production.example .env.production
```

Update with your actual credentials:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smart-crop-advisory?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_EXPIRES_IN=24h

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Google OAuth Configuration  
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Security & Server
NODE_ENV=production
PORT=5000
DEMO_MODE=false
FRONTEND_URL=http://localhost:3000
```

### 2. **Install Dependencies**

```bash
cd backend
npm install
```

### 3. **Start Production Server**

```bash
# Method 1: Using production starter (recommended)
node start-production.js

# Method 2: Direct start  
NODE_ENV=production DEMO_MODE=false node src/server.js
```

---

## 🎨 Frontend Configuration

### 1. **Set up Environment Variables**

Update `.env.production` in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Authentication Features
VITE_ENABLE_PHONE_AUTH=true
VITE_ENABLE_GOOGLE_AUTH=true
VITE_ENABLE_REGISTRATION=true

# App Configuration
VITE_APP_NAME=Smart Crop Advisory System
VITE_NODE_ENV=production
```

### 2. **Install Dependencies**

```bash
cd frontend
npm install
```

### 3. **Start Production Frontend**

```bash
# Development mode (for testing)
npm run dev

# Production build
npm run build
npm run preview
```

---

## 📱 Twilio SMS Setup

### 1. **Create Twilio Account**
1. Go to [twilio.com](https://www.twilio.com)
2. Sign up for a free account
3. Get your Account SID and Auth Token
4. Purchase a phone number

### 2. **Configure Twilio**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. **Test SMS Functionality**
```bash
# Test SMS service (backend must be running)
curl -X GET http://localhost:5000/api/auth/phone/test
```

---

## 🔐 Google OAuth Setup

### 1. **Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**

### 2. **Configure OAuth Consent Screen**
- Application name: `Smart Crop Advisory`
- Authorized domains: `localhost:3000` (for development)
- Scopes: `email`, `profile`, `openid`

### 3. **Create OAuth Client ID**
- Application type: **Web application**
- Name: `Smart Crop Advisory Web Client`
- Authorized JavaScript origins:
  - `http://localhost:3000`
  - `https://yourdomain.com` (for production)
- Authorized redirect URIs:
  - `http://localhost:3000/auth/google/callback`

### 4. **Update Environment Variables**
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 5. **Test Google OAuth**
```bash
# Test Google OAuth service
curl -X GET http://localhost:5000/api/auth/google/status
```

---

## 🗄️ MongoDB Setup

### 1. **MongoDB Atlas Setup**
1. Create account at [mongodb.com](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create database user
4. Whitelist IP addresses (or use 0.0.0.0/0 for development)
5. Get connection string

### 2. **Connection String Format**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/smart-crop-advisory?retryWrites=true&w=majority
```

### 3. **Test Database Connection**
```bash
# Check database connection (backend must be running)
curl -X GET http://localhost:5000/health
```

---

## 🧪 Testing Production Authentication

### 1. **Start Both Services**
```bash
# Terminal 1: Backend
cd backend
node start-production.js

# Terminal 2: Frontend  
cd frontend
npm run dev
```

### 2. **Test Email Authentication**
1. Navigate to: `http://localhost:3000/auth`
2. Click **"Sign Up"** tab
3. Fill in registration form:
   - First Name: `John`
   - Last Name: `Doe` 
   - Email: `john.doe@example.com`
   - Password: `securepass123`
   - Confirm password
   - Select state and district
   - Accept terms
4. Click **"Create Account"**
5. Should redirect to dashboard after success

### 3. **Test Email Login**
1. Switch to **"Sign In"** tab
2. Enter credentials:
   - Email: `john.doe@example.com`
   - Password: `securepass123`
3. Click **"Sign In"**
4. Should authenticate and redirect

### 4. **Test Phone Authentication**
1. Click **"Phone"** tab
2. Enter 10-digit phone number (e.g., `9876543210`)
3. Click **"Send OTP"**
4. Check your phone for SMS (real OTP)
5. Enter the received OTP
6. Click **"Verify & Continue"**
7. Should authenticate and redirect

### 5. **Test Google OAuth**
1. Click **"Continue with Google"**
2. Should open Google OAuth popup
3. Sign in with your Google account
4. Grant permissions
5. Should authenticate and redirect

---

## ⚡ Performance & Security

### 1. **Security Features Enabled**
- ✅ **JWT Authentication** with secure secrets
- ✅ **Password Hashing** with bcrypt
- ✅ **Rate Limiting** on auth endpoints
- ✅ **CORS Protection** for frontend domains
- ✅ **Input Validation** on all forms
- ✅ **SQL Injection Protection** via MongoDB
- ✅ **XSS Protection** with sanitization

### 2. **Production Optimizations**
- ✅ **Database Connection Pooling**
- ✅ **Error Logging** and monitoring
- ✅ **Request Compression** (gzip)
- ✅ **Static File Caching**
- ✅ **Graceful Shutdown** handling

### 3. **Monitoring & Logging**
- ✅ **Health Check Endpoint**: `/health`
- ✅ **API Status Endpoint**: `/api/status`
- ✅ **Structured Logging** with timestamps
- ✅ **Error Stack Traces** in development

---

## 🚨 Troubleshooting

### **Backend Won't Start**
```bash
# Check if MongoDB is accessible
curl -X GET http://localhost:5000/health

# Check environment variables
node -e "console.log(process.env.MONGODB_URI ? 'DB configured' : 'DB not configured')"

# Check port availability
netstat -an | findstr :5000
```

### **SMS Not Working**
```bash
# Test Twilio configuration
curl -X GET http://localhost:5000/api/auth/phone/test

# Check Twilio credentials
node -e "console.log(process.env.TWILIO_ACCOUNT_SID ? 'Twilio configured' : 'Twilio not configured')"
```

### **Google OAuth Not Working**
```bash
# Test Google OAuth configuration
curl -X GET http://localhost:5000/api/auth/google/status

# Check Google credentials  
node -e "console.log(process.env.GOOGLE_CLIENT_ID ? 'Google configured' : 'Google not configured')"
```

### **Frontend Connection Issues**
- Verify backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env.production`
- Check browser developer console for CORS errors
- Verify network requests in DevTools

---

## 📊 API Endpoints

### **Authentication Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/phone/send-otp` - Send SMS OTP
- `POST /api/auth/phone/verify-otp` - Verify OTP
- `POST /api/auth/google/login` - Google OAuth login
- `GET /api/auth/google/auth-url` - Get Google OAuth URL

### **System Endpoints**
- `GET /health` - Health check
- `GET /api/status` - API status and endpoints
- `GET /api/auth/google/status` - Google OAuth service status

---

## 🔄 Next Steps

### **Immediate Production Deployment**
1. **Domain Setup**: Configure your domain and SSL certificates
2. **Environment Secrets**: Use proper secret management (Azure Key Vault, AWS Secrets Manager)
3. **Database Security**: Enable MongoDB authentication and IP whitelisting
4. **Monitoring**: Set up application performance monitoring (APM)
5. **Backups**: Configure automated database backups

### **Advanced Features**
1. **Email Verification**: Add email confirmation for new registrations
2. **Password Reset**: Implement forgot/reset password flow
3. **Two-Factor Authentication**: Add TOTP-based 2FA
4. **Social Login**: Add Facebook, Apple, Microsoft OAuth
5. **API Rate Limiting**: Implement per-user rate limits
6. **Audit Logging**: Track user actions and security events

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify all environment variables are set correctly
4. Test individual components (database, SMS, OAuth) separately

**System Status:**
- ✅ **Backend**: Production-ready with real database and services
- ✅ **Frontend**: No demo mode, real API integration
- ✅ **Authentication**: Multi-method with security best practices
- ✅ **SMS**: Real Twilio integration
- ✅ **OAuth**: Real Google authentication
- ✅ **Security**: Production-grade protection

🌾 **Smart Crop Advisory - Production Authentication System**