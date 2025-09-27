# Smart Crop Advisory - Notification System

## Overview

This comprehensive notification system provides real-time alerts, scheduled notifications, and multi-channel delivery (Push, Email, SMS, In-App) for the Smart Crop Advisory platform. It supports weather alerts, pest warnings, market updates, crop reminders, and expert communications.

## Features

### Core Functionality
- **Multi-channel delivery**: Push notifications (Firebase), Email (SendGrid/SMTP), SMS (Twilio), In-app messaging
- **Real-time updates**: WebSocket integration for instant notifications
- **Scheduled notifications**: Cron-based scheduler for automated alerts
- **Template system**: Pre-built templates for different notification types
- **Analytics & tracking**: Delivery tracking, read receipts, interaction metrics
- **Localization**: Multi-language support for notifications

### Notification Types
- Weather alerts (severe weather, forecasts)
- Pest and disease warnings
- Market price updates and alerts
- Irrigation reminders
- Fertilizer schedules
- Harvest notifications
- Crop stage updates
- Expert messages and consultations
- System notifications and achievements

### Advanced Features
- Priority-based delivery
- Retry mechanisms with exponential backoff
- Token validation and cleanup
- Notification expiry and automatic cleanup
- Bulk notification support
- Search and filtering capabilities
- Daily digest summaries

## Architecture

### Components

1. **Models**: `Notification.js` - Comprehensive notification data model
2. **Controllers**: `notificationController.js` - REST API endpoints
3. **Routes**: `notificationRoutes.js` - API route definitions
4. **Services**:
   - `emailService.js` - Email delivery (SendGrid/SMTP)
   - `smsService.js` - SMS delivery (Twilio)
   - `pushNotificationService.js` - Push notifications (Firebase)
   - `notificationScheduler.js` - Automated scheduling
5. **Utilities**: `validators.js` - Input validation functions

### Database Schema

The notification model includes:
- Recipient and delivery information
- Content and localization
- Delivery method preferences
- Scheduling and expiry
- Analytics and interaction tracking
- Rich data payload support

## Installation & Setup

### 1. Install Dependencies

```bash
# Core notification dependencies
npm install node-cron mongoose

# Email services
npm install nodemailer @sendgrid/mail

# SMS services  
npm install twilio

# Push notifications
npm install firebase-admin

# WebSocket support (if not already installed)
npm install socket.io
```

### 2. Environment Variables

Add the following to your `.env` file:

```bash
# Firebase Configuration (for Push Notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_DATABASE_URL=your-database-url

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com

# Email Configuration (SMTP - Alternative to SendGrid)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone

# WebSocket Configuration
SOCKET_PORT=3001
```

### 3. Database Setup

The notification system uses MongoDB. Make sure your MongoDB connection is configured and the notification model is imported:

```javascript
// In your main server file
const mongoose = require('mongoose');
const Notification = require('./src/models/Notification');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);
```

### 4. Initialize Services

```javascript
// In your main server file (app.js or server.js)
const notificationScheduler = require('./src/services/notificationScheduler');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Create HTTP server and Socket.IO instance
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

// Initialize notification scheduler
notificationScheduler.init();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  notificationScheduler.stop();
  process.exit(0);
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 5. Route Integration

Add notification routes to your main app:

```javascript
// In your main server file
const notificationRoutes = require('./src/routes/notificationRoutes');

app.use('/api/notifications', notificationRoutes);
```

## API Endpoints

### Core Notification Management

```http
POST /api/notifications
GET /api/notifications/me
GET /api/notifications/:id
PATCH /api/notifications/:id/read
PATCH /api/notifications/:id/dismiss
POST /api/notifications/:id/track
```

### Bulk Operations

```http
POST /api/notifications/bulk
PATCH /api/notifications/mark-multiple-read
PATCH /api/notifications/mark-all-read
```

### Analytics & Search

```http
GET /api/notifications/search?q=weather
GET /api/notifications/unread/counts
GET /api/notifications/analytics
```

### Admin Operations

```http
GET /api/notifications/admin/all
POST /api/notifications/process-scheduled
DELETE /api/notifications/cleanup-expired
```

## Usage Examples

### 1. Create a Weather Alert

```javascript
const notification = await fetch('/api/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    recipient: 'user_id',
    type: 'weather_alert',
    category: 'weather',
    priority: 'high',
    title: 'Severe Weather Warning',
    message: 'Heavy rainfall expected in your area tomorrow',
    data: {
      weatherData: {
        temperature: 25,
        humidity: 95,
        windSpeed: 45,
        condition: 'stormy',
        alertType: 'heavy_rain'
      }
    },
    deliveryMethods: {
      push: { enabled: true },
      email: { enabled: true },
      sms: { enabled: true },
      inApp: { enabled: true }
    }
  })
});
```

### 2. Send Bulk Market Updates

```javascript
const bulkNotification = await fetch('/api/notifications/bulk', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    recipients: ['farmer1_id', 'farmer2_id', 'farmer3_id'],
    notification: {
      type: 'market_update',
      category: 'market',
      priority: 'medium',
      title: 'Market Update: Rice Prices',
      message: 'Rice prices have increased by 8% this week',
      data: {
        marketData: {
          crop: 'rice',
          currentPrice: 2500,
          priceChange: 8,
          trend: 'increasing',
          marketCenter: 'Mumbai'
        }
      }
    }
  })
});
```

### 3. Track User's Unread Notifications

```javascript
// Get unread counts by category
const counts = await fetch('/api/notifications/unread/counts', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get user's notifications with filters
const notifications = await fetch('/api/notifications/me?unreadOnly=true&limit=20', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 4. Real-time Notification Handling (Frontend)

```javascript
// Socket.IO client setup
const socket = io('ws://localhost:3001');

// Join user room for targeted notifications
socket.emit('join_user_room', { userId: currentUser.id });

// Listen for new notifications
socket.on('new_notification', (data) => {
  const { notification } = data;
  
  // Update UI with new notification
  addNotificationToUI(notification);
  
  // Update notification count
  updateNotificationCount();
  
  // Show toast/popup if needed
  showNotificationToast(notification);
});

// Listen for notification read updates
socket.on('notification_read', (data) => {
  const { notificationId } = data;
  markNotificationAsReadInUI(notificationId);
});
```

## Configuration Options

### Notification Preferences

Users can configure their notification preferences:

```javascript
// User model notification preferences
notificationPreferences: {
  push: { enabled: true },
  email: { enabled: true, frequency: 'immediate' }, // immediate, daily, weekly
  sms: { enabled: false },
  dailyDigest: { enabled: true, time: '08:00' },
  categories: {
    weather: { enabled: true, priority: 'high' },
    market: { enabled: true, priority: 'medium' },
    crop: { enabled: true, priority: 'high' },
    social: { enabled: true, priority: 'low' }
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '07:00'
  }
}
```

### Scheduler Configuration

The notification scheduler runs several cron jobs:

- **Process Scheduled**: Every 5 minutes
- **Cleanup Expired**: Daily at 2 AM
- **Daily Digest**: Daily at 8 AM
- **Irrigation Check**: Every hour
- **Fertilizer Check**: Every 6 hours
- **Harvest Check**: Daily at 6 AM
- **Crop Stage Check**: Daily at 7 AM
- **Weather Alerts**: Every 30 minutes
- **Market Updates**: Daily at 9 AM and 5 PM

## Error Handling & Monitoring

### Retry Logic

The system includes built-in retry mechanisms:
- Maximum 3 retries per notification
- Exponential backoff for failed deliveries
- Separate retry logic for each delivery method

### Logging & Monitoring

```javascript
// Monitor notification metrics
const analytics = await fetch('/api/notifications/analytics?startDate=2024-01-01&endDate=2024-01-31');

// Check service status
const pushStatus = getServiceStatus(); // from pushNotificationService
const emailStatus = await verifyEmailService();
const smsStatus = await verifySMSService();
```

### Error Types & Handling

1. **Invalid Tokens**: Automatic cleanup of expired device tokens
2. **Service Outages**: Graceful fallback to alternative delivery methods
3. **Rate Limits**: Automatic throttling and queuing
4. **Validation Errors**: Comprehensive input validation
5. **Database Errors**: Transaction rollback and error logging

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Role-based access control (RBAC)
3. **Input Validation**: Comprehensive validation for all inputs
4. **Data Sanitization**: HTML/script tag removal
5. **Rate Limiting**: Prevent spam and abuse
6. **Encryption**: Sensitive data encryption at rest and in transit

## Performance Optimization

1. **Database Indexing**: Optimized indexes for query performance
2. **Pagination**: All list endpoints support pagination
3. **Caching**: Redis caching for frequently accessed data
4. **Batch Processing**: Bulk operations for efficiency
5. **Background Jobs**: Asynchronous processing for heavy operations

## Testing

### Unit Tests Example

```javascript
// Test notification creation
describe('Notification Creation', () => {
  it('should create a valid notification', async () => {
    const notificationData = {
      recipient: 'user_id',
      type: 'weather_alert',
      category: 'weather',
      title: 'Test Alert',
      message: 'Test message'
    };
    
    const notification = await Notification.create(notificationData);
    expect(notification).toBeDefined();
    expect(notification.status).toBe('pending');
  });
});
```

### Integration Tests

```javascript
// Test notification delivery
describe('Notification Delivery', () => {
  it('should send notification via multiple channels', async () => {
    const notification = await createTestNotification();
    const result = await sendNotificationImmediately(notification);
    
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

## Troubleshooting

### Common Issues

1. **Firebase not initialized**: Check Firebase credentials
2. **Email delivery failures**: Verify SMTP/SendGrid configuration
3. **SMS sending errors**: Check Twilio account balance and credentials
4. **Socket connection issues**: Verify CORS settings
5. **Database connection errors**: Check MongoDB connection string

### Debug Mode

Enable debug logging:

```javascript
// Enable debug mode
process.env.DEBUG = 'notification:*';

// Or specific components
process.env.DEBUG = 'notification:email,notification:sms';
```

## Future Enhancements

1. **AI-powered recommendations**: Smart notification timing and content
2. **Advanced analytics**: Machine learning for delivery optimization  
3. **Multi-tenant support**: Organization-level notification management
4. **Advanced templating**: Visual template builder
5. **Webhook integrations**: Third-party service notifications
6. **Mobile app deep linking**: Direct navigation from notifications

## Support

For questions or issues with the notification system:

1. Check the error logs for detailed error messages
2. Verify all environment variables are correctly set
3. Test individual services (email, SMS, push) separately
4. Monitor notification analytics for delivery patterns
5. Check user notification preferences

## License

This notification system is part of the Smart Crop Advisory platform. All rights reserved.