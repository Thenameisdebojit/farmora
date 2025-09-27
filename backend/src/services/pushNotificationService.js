// backend/src/services/pushNotificationService.js
const admin = require('firebase-admin');
const { AppError } = require('../utils/errorHandler');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };

    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
      console.log('Firebase Admin SDK initialized successfully');
    } else {
      console.warn('Firebase credentials not configured. Push notifications will be disabled.');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

/**
 * Send push notification using Firebase Cloud Messaging
 * @param {Object} options - Notification options
 * @param {Array|string} options.deviceTokens - Device token(s) to send to
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body/message
 * @param {Object} options.data - Additional data payload
 * @param {string} options.priority - Notification priority ('high' or 'normal')
 * @param {Object} options.android - Android-specific options
 * @param {Object} options.apns - APNs-specific options
 * @param {string} options.imageUrl - Notification image URL
 * @returns {Promise} Send result
 */
const sendPushNotification = async (options) => {
  const {
    deviceTokens,
    title,
    body,
    data = {},
    priority = 'normal',
    android = {},
    apns = {},
    imageUrl
  } = options;

  if (!admin.apps.length) {
    throw new AppError('Firebase Admin SDK not initialized', 500);
  }

  if (!deviceTokens || !title || !body) {
    throw new AppError('Missing required push notification parameters', 400);
  }

  // Convert single token to array for consistency
  const tokens = Array.isArray(deviceTokens) ? deviceTokens : [deviceTokens];
  
  if (tokens.length === 0) {
    throw new AppError('No device tokens provided', 400);
  }

  // Build the notification message
  const message = {
    notification: {
      title,
      body
    },
    data: {
      ...data,
      // Ensure all data values are strings (FCM requirement)
      ...Object.keys(data).reduce((acc, key) => {
        acc[key] = String(data[key]);
        return acc;
      }, {})
    },
    android: {
      priority: priority === 'high' ? 'high' : 'normal',
      notification: {
        sound: 'default',
        channelId: 'crop_advisory_notifications',
        priority: priority === 'high' ? 'high' : 'default',
        defaultSound: true,
        defaultVibrateTimings: true,
        defaultLightSettings: true,
        ...android.notification
      },
      ...android
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
          alert: {
            title,
            body
          },
          'content-available': 1,
          'mutable-content': 1,
          ...apns.payload?.aps
        },
        ...apns.payload
      },
      headers: {
        'apns-priority': priority === 'high' ? '10' : '5',
        ...apns.headers
      },
      ...apns
    }
  };

  // Add image if provided
  if (imageUrl) {
    message.notification.imageUrl = imageUrl;
    if (message.android.notification) {
      message.android.notification.imageUrl = imageUrl;
    }
  }

  try {
    let result;
    
    if (tokens.length === 1) {
      // Send to single device
      message.token = tokens[0];
      result = await admin.messaging().send(message);
      
      return {
        success: true,
        messageId: result,
        totalTokens: 1,
        successCount: 1,
        failureCount: 0,
        results: [{ success: true, messageId: result }]
      };
    } else {
      // Send to multiple devices
      delete message.token;
      message.tokens = tokens;
      result = await admin.messaging().sendMulticast(message);
      
      // Process results and handle failed tokens
      const failedTokens = [];
      const successfulResults = [];
      
      result.responses.forEach((response, index) => {
        if (!response.success) {
          failedTokens.push({
            token: tokens[index],
            error: response.error.code,
            message: response.error.message
          });
        } else {
          successfulResults.push({
            token: tokens[index],
            messageId: response.messageId
          });
        }
      });
      
      return {
        success: result.successCount > 0,
        totalTokens: tokens.length,
        successCount: result.successCount,
        failureCount: result.failureCount,
        results: successfulResults,
        failedTokens,
        responses: result.responses
      };
    }
  } catch (error) {
    console.error('Push notification sending failed:', error);
    throw new AppError(`Failed to send push notification: ${error.message}`, 500);
  }
};

/**
 * Send notification to a topic (for broadcast messages)
 * @param {Object} options - Topic notification options
 * @param {string} options.topic - FCM topic name
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {Object} options.data - Additional data payload
 * @returns {Promise} Send result
 */
const sendToTopic = async (options) => {
  const { topic, title, body, data = {} } = options;

  if (!admin.apps.length) {
    throw new AppError('Firebase Admin SDK not initialized', 500);
  }

  if (!topic || !title || !body) {
    throw new AppError('Missing required topic notification parameters', 400);
  }

  const message = {
    notification: {
      title,
      body
    },
    data: {
      ...data,
      // Ensure all data values are strings
      ...Object.keys(data).reduce((acc, key) => {
        acc[key] = String(data[key]);
        return acc;
      }, {})
    },
    topic
  };

  try {
    const result = await admin.messaging().send(message);
    
    return {
      success: true,
      messageId: result,
      topic
    };
  } catch (error) {
    console.error('Topic notification sending failed:', error);
    throw new AppError(`Failed to send topic notification: ${error.message}`, 500);
  }
};

/**
 * Subscribe devices to a topic
 * @param {Array|string} tokens - Device token(s) to subscribe
 * @param {string} topic - Topic name
 * @returns {Promise} Subscription result
 */
const subscribeToTopic = async (tokens, topic) => {
  if (!admin.apps.length) {
    throw new AppError('Firebase Admin SDK not initialized', 500);
  }

  if (!tokens || !topic) {
    throw new AppError('Missing required parameters for topic subscription', 400);
  }

  const tokenArray = Array.isArray(tokens) ? tokens : [tokens];

  try {
    const result = await admin.messaging().subscribeToTopic(tokenArray, topic);
    
    return {
      success: result.failureCount === 0,
      successCount: result.successCount,
      failureCount: result.failureCount,
      errors: result.errors || []
    };
  } catch (error) {
    console.error('Topic subscription failed:', error);
    throw new AppError(`Failed to subscribe to topic: ${error.message}`, 500);
  }
};

/**
 * Unsubscribe devices from a topic
 * @param {Array|string} tokens - Device token(s) to unsubscribe
 * @param {string} topic - Topic name
 * @returns {Promise} Unsubscription result
 */
const unsubscribeFromTopic = async (tokens, topic) => {
  if (!admin.apps.length) {
    throw new AppError('Firebase Admin SDK not initialized', 500);
  }

  if (!tokens || !topic) {
    throw new AppError('Missing required parameters for topic unsubscription', 400);
  }

  const tokenArray = Array.isArray(tokens) ? tokens : [tokens];

  try {
    const result = await admin.messaging().unsubscribeFromTopic(tokenArray, topic);
    
    return {
      success: result.failureCount === 0,
      successCount: result.successCount,
      failureCount: result.failureCount,
      errors: result.errors || []
    };
  } catch (error) {
    console.error('Topic unsubscription failed:', error);
    throw new AppError(`Failed to unsubscribe from topic: ${error.message}`, 500);
  }
};

/**
 * Send templated push notification for different notification types
 * @param {string} template - Template type
 * @param {Object} data - Template data
 * @param {Array|string} deviceTokens - Device tokens
 * @returns {Promise} Send result
 */
const sendTemplatedPush = async (template, data, deviceTokens) => {
  const templates = {
    weather_alert: {
      title: `🌦️ Weather Alert: ${data.alertType}`,
      body: `${data.severity} - ${data.message}`,
      priority: 'high',
      android: {
        notification: {
          channelId: 'weather_alerts',
          color: '#ff6b6b',
          icon: 'weather_alert'
        }
      }
    },
    
    market_update: {
      title: `📈 Market Update: ${data.crop}`,
      body: `₹${data.currentPrice}/${data.unit || 'kg'} (${data.priceChange > 0 ? '+' : ''}${data.priceChange}%)`,
      android: {
        notification: {
          channelId: 'market_updates',
          color: '#4ecdc4',
          icon: 'market_update'
        }
      }
    },
    
    pest_warning: {
      title: `🐛 Pest Alert: ${data.pestType}`,
      body: `Detected in ${data.affectedCrop}. Severity: ${data.severity}`,
      priority: 'high',
      android: {
        notification: {
          channelId: 'pest_alerts',
          color: '#ffa726',
          icon: 'pest_warning'
        }
      }
    },
    
    irrigation_reminder: {
      title: `💧 Irrigation Reminder`,
      body: `${data.cropName} field needs watering. Soil moisture: ${data.soilMoisture || 'Low'}%`,
      android: {
        notification: {
          channelId: 'irrigation_reminders',
          color: '#42a5f5',
          icon: 'irrigation'
        }
      }
    },
    
    fertilizer_schedule: {
      title: `🌱 Fertilizer Reminder`,
      body: `Apply ${data.fertilizerType} to ${data.cropName}`,
      android: {
        notification: {
          channelId: 'fertilizer_reminders',
          color: '#66bb6a',
          icon: 'fertilizer'
        }
      }
    },
    
    harvest_ready: {
      title: `🌾 Harvest Alert`,
      body: `${data.cropName} is ready for harvest!`,
      priority: 'high',
      android: {
        notification: {
          channelId: 'harvest_alerts',
          color: '#ffd54f',
          icon: 'harvest'
        }
      }
    },
    
    expert_message: {
      title: `👨‍🌾 Message from ${data.expertName}`,
      body: data.message,
      android: {
        notification: {
          channelId: 'expert_messages',
          color: '#ab47bc',
          icon: 'expert'
        }
      }
    },
    
    consultation_reminder: {
      title: `📅 Consultation Reminder`,
      body: `Appointment with ${data.expertName} at ${data.dateTime}`,
      android: {
        notification: {
          channelId: 'consultations',
          color: '#5c6bc0',
          icon: 'consultation'
        }
      }
    },
    
    price_alert: {
      title: `💰 Price Alert: ${data.crop}`,
      body: `Price ${data.trend} to ₹${data.currentPrice}`,
      android: {
        notification: {
          channelId: 'price_alerts',
          color: '#26a69a',
          icon: 'price_alert'
        }
      }
    },
    
    emergency: {
      title: `🚨 Emergency Alert`,
      body: data.message,
      priority: 'high',
      android: {
        notification: {
          channelId: 'emergency_alerts',
          color: '#f44336',
          icon: 'emergency',
          vibrate: [0, 1000, 500, 1000]
        }
      }
    }
  };

  const template_config = templates[template];
  if (!template_config) {
    throw new AppError(`Push notification template '${template}' not found`, 400);
  }

  const notificationOptions = {
    deviceTokens,
    title: template_config.title,
    body: template_config.body,
    data: {
      type: template,
      ...data
    },
    priority: template_config.priority || 'normal',
    android: template_config.android || {},
    apns: template_config.apns || {}
  };

  return await sendPushNotification(notificationOptions);
};

/**
 * Validate device tokens
 * @param {Array|string} tokens - Device token(s) to validate
 * @returns {Promise} Validation result
 */
const validateDeviceTokens = async (tokens) => {
  if (!admin.apps.length) {
    throw new AppError('Firebase Admin SDK not initialized', 500);
  }

  const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
  const results = {
    validTokens: [],
    invalidTokens: [],
    errors: []
  };

  try {
    // Send a test message with dry_run flag
    const testMessage = {
      notification: {
        title: 'Test',
        body: 'Token validation'
      },
      tokens: tokenArray,
      dryRun: true
    };

    const response = await admin.messaging().sendMulticast(testMessage);
    
    response.responses.forEach((result, index) => {
      if (result.success) {
        results.validTokens.push(tokenArray[index]);
      } else {
        results.invalidTokens.push({
          token: tokenArray[index],
          error: result.error.code,
          message: result.error.message
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Token validation failed:', error);
    throw new AppError(`Failed to validate tokens: ${error.message}`, 500);
  }
};

/**
 * Clean up invalid tokens from database
 * @param {Array} invalidTokens - Array of invalid token objects
 * @returns {Promise} Cleanup result
 */
const cleanupInvalidTokens = async (invalidTokens) => {
  // This would integrate with your User model to remove invalid tokens
  const User = require('../models/User');
  
  const tokensToRemove = invalidTokens
    .filter(tokenData => 
      ['registration-token-not-registered', 'invalid-registration-token'].includes(tokenData.error)
    )
    .map(tokenData => tokenData.token);

  if (tokensToRemove.length === 0) {
    return { removed: 0 };
  }

  try {
    const result = await User.updateMany(
      { deviceTokens: { $in: tokensToRemove } },
      { $pullAll: { deviceTokens: tokensToRemove } }
    );

    return {
      removed: tokensToRemove.length,
      usersUpdated: result.modifiedCount
    };
  } catch (error) {
    console.error('Token cleanup failed:', error);
    throw new AppError(`Failed to cleanup invalid tokens: ${error.message}`, 500);
  }
};

/**
 * Get FCM server key info (for debugging)
 * @returns {Object} Service configuration status
 */
const getServiceStatus = () => {
  return {
    initialized: admin.apps.length > 0,
    projectId: process.env.FIREBASE_PROJECT_ID || null,
    hasCredentials: !!(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)
  };
};

/**
 * Send notification with retry logic
 * @param {Object} options - Notification options
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise} Send result with retry info
 */
const sendPushWithRetry = async (options, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sendPushNotification(options);
      
      if (result.success) {
        return {
          ...result,
          attempts: attempt
        };
      }
      
      // If partial success, don't retry successful tokens
      if (result.successCount > 0 && result.failedTokens) {
        options.deviceTokens = result.failedTokens.map(f => f.token);
      }
      
      lastError = new Error(`Attempt ${attempt} failed: ${result.failureCount} failures`);
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.message.includes('not initialized') || 
          error.message.includes('Missing required')) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw new AppError(`Failed after ${maxRetries} attempts: ${lastError.message}`, 500);
};

module.exports = {
  sendPushNotification,
  sendToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
  sendTemplatedPush,
  validateDeviceTokens,
  cleanupInvalidTokens,
  getServiceStatus,
  sendPushWithRetry
};