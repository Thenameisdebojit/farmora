# Smart Crop Advisory System - Frontend-Backend Integration Guide

This guide provides complete instructions for connecting the React frontend with the Node.js backend, including all necessary configurations and testing procedures.

## 🏗️ Architecture Overview

```
Frontend (React + Vite)     Backend (Node.js + Express)
├── API Services            ├── Authentication Routes
├── Auth Service            ├── Weather Services
├── Notification Service    ├── Advisory Services
├── Chatbot Service         ├── Market Data Services
└── UI Components          ├── Notification Services
                           ├── Pest Detection
                           ├── Irrigation Management
                           └── AI/Chatbot Integration
```

## 📋 Prerequisites

### Backend Requirements
- Node.js (v16 or higher)
- MongoDB (running locally or cloud instance)
- Environment variables configured in `.env`
- All backend dependencies installed

### Frontend Requirements
- Node.js (v16 or higher)
- All frontend dependencies installed
- Environment variables configured in `.env`

### External Services (Optional but Recommended)
- Firebase project for push notifications
- Google Maps API key for location services
- OpenWeather API key for weather data
- Twilio account for SMS notifications
- Email service (Gmail, SendGrid, etc.)

## 🚀 Step-by-Step Setup

### 1. Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd "D:\smart crop advisory prototype\backend"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create or update `.env` file with:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/smart_crop_advisory
   
   # JWT Configuration
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_SECRET=your_refresh_token_secret_here
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Email Configuration (Choose one)
   # Gmail
   EMAIL_SERVICE=gmail
   EMAIL_USERNAME=your_gmail@gmail.com
   EMAIL_PASSWORD=your_app_password
   
   # SendGrid
   SENDGRID_API_KEY=your_sendgrid_api_key
   
   # Twilio SMS Configuration
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   
   # Firebase Admin Configuration
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   
   # External APIs
   OPENWEATHER_API_KEY=your_openweather_api_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   
   # AI/ML Services (Optional)
   OPENAI_API_KEY=your_openai_api_key
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   
   # Security
   BCRYPT_SALT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start the backend server:**
   ```bash
   # Development mode
   npm run dev
   
   # Or production mode
   npm start
   ```

5. **Verify backend is running:**
   Open http://localhost:5000/api/health in your browser. You should see:
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-01-01T12:00:00.000Z",
     "version": "1.0.0"
   }
   ```

### 2. Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd "D:\smart crop advisory prototype\frontend"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Update `.env` file with your actual Firebase credentials:
   ```env
   # Backend API Configuration
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=Smart Crop Advisory System
   VITE_APP_VERSION=1.0.0
   
   # Firebase Configuration (for Push Notifications)
   # Get these from your Firebase Console
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_FIREBASE_VAPID_KEY=your_vapid_key_for_push_notifications
   
   # Map and Location Services
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_DEFAULT_LOCATION_LAT=28.6139
   VITE_DEFAULT_LOCATION_LON=77.2090
   
   # Feature Flags
   VITE_ENABLE_PUSH_NOTIFICATIONS=true
   VITE_ENABLE_AI_FEATURES=true
   VITE_ENABLE_VOICE_INPUT=true
   ```

4. **Update Firebase Service Worker (if using push notifications):**
   Edit `public/firebase-messaging-sw.js` and replace the placeholder values with your actual Firebase config.

5. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

6. **Open the application:**
   Navigate to http://localhost:5173 in your browser.

### 3. Firebase Setup (For Push Notifications)

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Cloud Messaging

2. **Get Firebase Configuration:**
   - Go to Project Settings → General
   - In "Your apps" section, add a web app
   - Copy the configuration object

3. **Generate VAPID Key:**
   - Go to Project Settings → Cloud Messaging
   - In "Web configuration" section, generate a VAPID key pair
   - Copy the VAPID key

4. **Update Environment Variables:**
   - Update both frontend and backend `.env` files with Firebase credentials

## 🧪 Testing the Integration

### 1. Automated Testing

Use the built-in test suite to verify all connections:

```javascript
// In browser console or create a test component
import { runApiTests, quickHealthCheck } from './src/utils/apiTest';

// Quick health check
await quickHealthCheck();

// Full test suite
await runApiTests();
```

### 2. Manual Testing Checklist

#### Backend Health Check
- [ ] Backend server starts without errors
- [ ] Health endpoint returns 200 status
- [ ] Database connections are established
- [ ] All middleware is loaded correctly

#### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens are issued correctly
- [ ] Protected routes require authentication
- [ ] Password reset functionality works

#### API Endpoints
- [ ] Weather data is retrieved
- [ ] Advisory recommendations are generated
- [ ] Market data is accessible
- [ ] Pest detection works
- [ ] Irrigation scheduling functions
- [ ] Notification system operates

#### Frontend Integration
- [ ] API calls succeed
- [ ] Authentication state is managed
- [ ] Error handling works
- [ ] Loading states are displayed
- [ ] Data is formatted correctly

#### Notification System
- [ ] Push notification permissions can be requested
- [ ] FCM tokens are registered
- [ ] Notifications are received and displayed
- [ ] Email notifications are sent
- [ ] SMS notifications work (if configured)

## 🔧 Troubleshooting Common Issues

### Backend Issues

#### Server Won't Start
```bash
# Check if port is already in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <PID_NUMBER> /F

# Check Node.js version
node --version
```

#### Database Connection Errors
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify database permissions

#### Environment Variable Issues
- Ensure all required variables are set
- Check for typos in variable names
- Restart server after changes

### Frontend Issues

#### API Connection Errors
```javascript
// Test API connectivity
fetch('http://localhost:5000/api/health')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('API Error:', error));
```

#### CORS Issues
- Ensure backend CORS is configured correctly
- Check if frontend URL is in allowed origins
- Verify request headers

#### Environment Variable Not Loading
- Variables must start with `VITE_`
- Restart development server after changes
- Check browser dev tools for variable values

### Firebase/Push Notification Issues

#### Service Worker Registration Fails
- Ensure `firebase-messaging-sw.js` is in `public/` folder
- Check browser dev tools for service worker errors
- Verify Firebase configuration

#### Push Notifications Not Working
- Check notification permissions in browser
- Verify VAPID key configuration
- Ensure Firebase project has Cloud Messaging enabled

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
POST /api/auth/logout - User logout
POST /api/auth/refresh - Refresh JWT token
GET /api/auth/profile - Get user profile
PUT /api/auth/profile - Update user profile
```

### Notification Endpoints
```
GET /api/notifications/user/:userId - Get user notifications
POST /api/notifications - Create notification
PATCH /api/notifications/:id/read - Mark as read
GET /api/notifications/preferences/:userId - Get preferences
PUT /api/notifications/preferences/:userId - Update preferences
POST /api/notifications/register-token - Register FCM token
```

### Weather Endpoints
```
GET /api/weather/current - Current weather
GET /api/weather/forecast - Weather forecast
GET /api/weather/alerts - Weather alerts
GET /api/weather/farming-advisory - Farming weather advisory
```

### Advisory Endpoints
```
GET /api/advisory/personalized - Personalized advisory
GET /api/advisory/crop-recommendations - Crop recommendations
POST /api/advisory/fertilizer-recommendations - Fertilizer advice
POST /api/advisory/chat - AI chat assistance
```

## 🔒 Security Considerations

### Production Checklist
- [ ] Use HTTPS in production
- [ ] Set secure JWT secrets
- [ ] Configure proper CORS origins
- [ ] Enable rate limiting
- [ ] Validate all user inputs
- [ ] Use environment variables for secrets
- [ ] Enable security headers (helmet.js)
- [ ] Set up proper logging and monitoring

## 🚀 Deployment

### Backend Deployment
1. **Environment Setup:**
   - Set `NODE_ENV=production`
   - Configure production database
   - Set secure JWT secrets

2. **Deploy to Platform:**
   - Heroku, AWS, DigitalOcean, etc.
   - Ensure all environment variables are set
   - Configure build scripts

### Frontend Deployment
1. **Build for Production:**
   ```bash
   npm run build
   ```

2. **Deploy Static Files:**
   - Vercel, Netlify, AWS S3, etc.
   - Configure environment variables
   - Set up custom domain (optional)

## 📞 Support

If you encounter any issues during integration:

1. **Check the console logs** for detailed error messages
2. **Run the automated test suite** to identify specific problems
3. **Verify environment variables** are correctly set
4. **Ensure all dependencies** are installed
5. **Check that services** (MongoDB, Firebase) are running

## 📋 Next Steps

After successful integration:

1. **Implement additional features** as needed
2. **Set up monitoring and logging** for production
3. **Configure automated backups** for database
4. **Implement CI/CD pipeline** for deployments
5. **Add comprehensive error tracking**
6. **Set up performance monitoring**

## 🎉 Conclusion

You now have a fully integrated Smart Crop Advisory System with:
- ✅ Secure authentication system
- ✅ Real-time weather data
- ✅ AI-powered advisory services
- ✅ Comprehensive notification system
- ✅ Pest detection capabilities
- ✅ Irrigation management
- ✅ Market data integration
- ✅ Chatbot assistance

The system is ready for development, testing, and eventual production deployment!