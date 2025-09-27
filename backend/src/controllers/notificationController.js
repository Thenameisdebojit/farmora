// backend/src/controllers/notificationController.js
const Notification = require('../models/Notification');
const User = require('../models/User');
const { AppError, catchAsync } = require('../utils/errorHandler');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');
const { sendPushNotification } = require('../services/pushNotificationService');
const { validateNotificationData } = require('../utils/validators');
const mongoose = require('mongoose');
// const { io } = require('../server'); // Socket.IO instance - will be set up separately

// Create a new notification
exports.createNotification = catchAsync(async (req, res, next) => {
  // Validate notification data
  const validationResult = validateNotificationData(req.body);
  if (!validationResult.isValid) {
    return next(new AppError(validationResult.errors.join(', '), 400));
  }

  const notificationData = {
    ...req.body,
    source: {
      type: req.user?.role === 'admin' ? 'admin' : 'user',
      id: req.user?.id,
      name: req.user?.name || 'System',
      automated: req.body.automated || false
    }
  };

  const notification = await Notification.create(notificationData);
  
  // Populate recipient information
  await notification.populate('recipient', 'name email phoneNumber deviceTokens preferredLanguage');
  
  // Schedule or send immediately
  if (!notification.scheduledFor || notification.scheduledFor <= new Date()) {
    await sendNotificationImmediately(notification);
  }

  res.status(201).json({
    status: 'success',
    data: {
      notification
    }
  });
});

// Send bulk notifications
exports.createBulkNotifications = catchAsync(async (req, res, next) => {
  const { recipients, notification: notificationTemplate } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return next(new AppError('Recipients array is required and cannot be empty', 400));
  }

  const notifications = [];
  const errors = [];

  // Create notifications for each recipient
  for (const recipientId of recipients) {
    try {
      const notificationData = {
        ...notificationTemplate,
        recipient: recipientId,
        source: {
          type: req.user?.role === 'admin' ? 'admin' : 'user',
          id: req.user?.id,
          name: req.user?.name || 'System',
          automated: notificationTemplate.automated || false
        }
      };

      const notification = await Notification.create(notificationData);
      await notification.populate('recipient', 'name email phoneNumber deviceTokens preferredLanguage');
      
      notifications.push(notification);
    } catch (error) {
      errors.push({
        recipientId,
        error: error.message
      });
    }
  }

  // Send notifications immediately if not scheduled
  if (!notificationTemplate.scheduledFor || new Date(notificationTemplate.scheduledFor) <= new Date()) {
    const sendPromises = notifications.map(notification => 
      sendNotificationImmediately(notification).catch(error => ({
        notificationId: notification._id,
        error: error.message
      }))
    );
    
    await Promise.allSettled(sendPromises);
  }

  res.status(201).json({
    status: 'success',
    data: {
      created: notifications.length,
      errors: errors.length,
      notifications: notifications.map(n => n._id),
      errorDetails: errors
    }
  });
});

// Get user's notifications with filtering and pagination
exports.getUserNotifications = catchAsync(async (req, res, next) => {
  const userId = req.params.userId || req.user.id;
  
  // Build filter query
  const filter = { recipient: userId };
  
  if (req.query.status && req.query.status !== 'all') {
    filter.status = req.query.status;
  }
  
  if (req.query.type) {
    filter.type = req.query.type;
  }
  
  if (req.query.category) {
    filter.category = req.query.category;
  }
  
  if (req.query.priority) {
    filter.priority = req.query.priority;
  }
  
  if (req.query.unreadOnly === 'true') {
    filter.readAt = { $exists: false };
  }
  
  // Date range filtering
  if (req.query.fromDate || req.query.toDate) {
    filter.createdAt = {};
    if (req.query.fromDate) {
      filter.createdAt.$gte = new Date(req.query.fromDate);
    }
    if (req.query.toDate) {
      filter.createdAt.$lte = new Date(req.query.toDate);
    }
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Sort options
  let sort = { createdAt: -1 };
  if (req.query.sort) {
    const sortBy = req.query.sort;
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    sort = { [sortBy]: sortOrder };
  }

  // Execute query
  const notifications = await Notification.find(filter)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('source.id', 'name profilePicture role')
    .populate('relatedEntities.crops', 'cropType variety plantingDate')
    .lean();

  // Get total count for pagination
  const total = await Notification.countDocuments(filter);

  // Get unread count
  const unreadCount = await Notification.getUnreadCount(userId);

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    }
  });
});

// Get notification by ID
exports.getNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id)
    .populate('recipient', 'name email phoneNumber')
    .populate('source.id', 'name profilePicture role')
    .populate('relatedEntities.crops', 'cropType variety plantingDate currentStage')
    .populate('relatedEntities.users', 'name role profilePicture');

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  // Check if user has access to this notification
  if (req.user.role !== 'admin' && 
      notification.recipient.toString() !== req.user.id &&
      notification.source.id !== req.user.id) {
    return next(new AppError('Access denied', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});

// Mark notification as read
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  // Check if user has access to this notification
  if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403));
  }

  await notification.markAsRead();

  // Emit real-time update (if io is available)
  if (global.io) {
    global.io.to(`user_${notification.recipient}`).emit('notification_read', {
      notificationId: notification._id
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});

// Mark multiple notifications as read
exports.markMultipleAsRead = catchAsync(async (req, res, next) => {
  const { notificationIds } = req.body;

  if (!notificationIds || !Array.isArray(notificationIds)) {
    return next(new AppError('Notification IDs array is required', 400));
  }

  const result = await Notification.updateMany(
    {
      _id: { $in: notificationIds },
      recipient: req.user.id,
      readAt: { $exists: false }
    },
    {
      readAt: new Date(),
      status: 'read'
    }
  );

  // Emit real-time update (if io is available)
  if (global.io) {
    global.io.to(`user_${req.user.id}`).emit('notifications_read', {
      notificationIds,
      count: result.modifiedCount
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

// Mark all notifications as read
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  const result = await Notification.markAllAsRead(req.user.id, req.body.type);

  // Emit real-time update (if io is available)
  if (global.io) {
    global.io.to(`user_${req.user.id}`).emit('all_notifications_read', {
      type: req.body.type,
      count: result.modifiedCount
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

// Dismiss notification
exports.dismissNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403));
  }

  await notification.dismiss();

  // Emit real-time update (if io is available)
  if (global.io) {
    global.io.to(`user_${notification.recipient}`).emit('notification_dismissed', {
      notificationId: notification._id
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});

// Track notification interaction
exports.trackInteraction = catchAsync(async (req, res, next) => {
  const { action, metadata } = req.body;
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  if (notification.recipient.toString() !== req.user.id) {
    return next(new AppError('Access denied', 403));
  }

  switch (action) {
    case 'click':
      await notification.incrementClicks();
      break;
    case 'act':
      await notification.markAsActed(metadata?.actionType);
      break;
    default:
      notification.interactions.actions.push({
        action,
        timestamp: new Date(),
        metadata
      });
      await notification.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});

// Get notification analytics
exports.getAnalytics = catchAsync(async (req, res, next) => {
  const startDate = new Date(req.query.startDate || Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = new Date(req.query.endDate || Date.now());

  const analytics = await Notification.getAnalytics(startDate, endDate);

  // Get additional metrics
  const totalNotifications = await Notification.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const deliveryRates = await Notification.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSent: { $sum: 1 },
        pushDelivered: {
          $sum: { $cond: ['$deliveryMethods.push.delivered', 1, 0] }
        },
        emailDelivered: {
          $sum: { $cond: ['$deliveryMethods.email.delivered', 1, 0] }
        },
        smsDelivered: {
          $sum: { $cond: ['$deliveryMethods.sms.delivered', 1, 0] }
        },
        readCount: {
          $sum: { $cond: [{ $ifNull: ['$readAt', false] }, 1, 0] }
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      period: { startDate, endDate },
      totalNotifications,
      analytics,
      deliveryRates: deliveryRates[0] || {}
    }
  });
});

// Get unread count by category
exports.getUnreadCounts = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  const counts = await Notification.aggregate([
    {
      $match: {
        recipient: mongoose.Types.ObjectId(userId),
        readAt: { $exists: false },
        status: { $ne: 'dismissed' }
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  const countsByCategory = {};
  counts.forEach(item => {
    countsByCategory[item._id] = item.count;
  });

  // Get total unread count
  const totalUnread = await Notification.getUnreadCount(userId);

  res.status(200).json({
    status: 'success',
    data: {
      totalUnread,
      byCategory: countsByCategory
    }
  });
});

// Search notifications
exports.searchNotifications = catchAsync(async (req, res, next) => {
  const { q: query } = req.query;
  
  if (!query || query.length < 2) {
    return next(new AppError('Search query must be at least 2 characters long', 400));
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const searchResults = await Notification.find({
    $and: [
      { recipient: req.user.id },
      {
        $text: { $search: query }
      }
    ]
  })
  .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
  .limit(limit)
  .skip(skip)
  .populate('source.id', 'name role');

  const total = await Notification.countDocuments({
    $and: [
      { recipient: req.user.id },
      { $text: { $search: query } }
    ]
  });

  res.status(200).json({
    status: 'success',
    results: searchResults.length,
    data: {
      notifications: searchResults,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Admin: Get all notifications with advanced filtering
exports.getAllNotifications = catchAsync(async (req, res, next) => {
  // Only admins can access this endpoint
  if (req.user.role !== 'admin') {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  const filter = {};
  
  // Apply filters
  if (req.query.recipient) filter.recipient = req.query.recipient;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.sourceType) filter['source.type'] = req.query.sourceType;
  
  // Date range
  if (req.query.fromDate || req.query.toDate) {
    filter.createdAt = {};
    if (req.query.fromDate) filter.createdAt.$gte = new Date(req.query.fromDate);
    if (req.query.toDate) filter.createdAt.$lte = new Date(req.query.toDate);
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('recipient', 'name email role')
    .populate('source.id', 'name role')
    .lean();

  const total = await Notification.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Send scheduled notifications (to be called by a cron job)
exports.processScheduledNotifications = catchAsync(async (req, res, next) => {
  const pendingNotifications = await Notification.findPending()
    .populate('recipient', 'name email phoneNumber deviceTokens preferredLanguage');

  const results = {
    processed: 0,
    successful: 0,
    failed: 0,
    errors: []
  };

  for (const notification of pendingNotifications) {
    results.processed++;
    try {
      await sendNotificationImmediately(notification);
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        notificationId: notification._id,
        error: error.message
      });
      await notification.markFailed('system', error);
    }
  }

  res.status(200).json({
    status: 'success',
    data: results
  });
});

// Clean up expired notifications
exports.cleanupExpired = catchAsync(async (req, res, next) => {
  const result = await Notification.cleanupExpired();

  res.status(200).json({
    status: 'success',
    data: {
      deletedCount: result.deletedCount
    }
  });
});

// Helper function to send notification immediately
async function sendNotificationImmediately(notification) {
  const recipient = notification.recipient;
  const deliveryMethods = notification.deliveryMethods;
  const localizedContent = notification.getLocalizedContent(recipient.preferredLanguage || 'en');
  
  const errors = [];

  try {
    // Send push notification
    if (deliveryMethods.push.enabled && recipient.deviceTokens?.length > 0) {
      try {
        const pushResponse = await sendPushNotification({
          deviceTokens: recipient.deviceTokens,
          title: localizedContent.title,
          body: localizedContent.message,
          data: {
            notificationId: notification._id.toString(),
            type: notification.type,
            category: notification.category,
            priority: notification.priority,
            ...notification.data
          }
        });
        
        await notification.markDelivered('push', pushResponse);
      } catch (error) {
        errors.push({ method: 'push', error: error.message });
        await notification.markFailed('push', error);
      }
    }

    // Send email notification
    if (deliveryMethods.email.enabled && recipient.email) {
      try {
        const emailResponse = await sendEmail({
          to: recipient.email,
          subject: localizedContent.title,
          html: generateEmailTemplate(notification, localizedContent),
          text: localizedContent.message
        });
        
        await notification.markDelivered('email', emailResponse);
      } catch (error) {
        errors.push({ method: 'email', error: error.message });
        await notification.markFailed('email', error);
      }
    }

    // Send SMS notification
    if (deliveryMethods.sms.enabled && recipient.phoneNumber) {
      try {
        const smsResponse = await sendSMS({
          to: recipient.phoneNumber,
          message: `${localizedContent.title}\n\n${localizedContent.message}`
        });
        
        await notification.markDelivered('sms', smsResponse);
      } catch (error) {
        errors.push({ method: 'sms', error: error.message });
        await notification.markFailed('sms', error);
      }
    }

    // Send real-time in-app notification via WebSocket (if io is available)
    if (deliveryMethods.inApp.enabled) {
      if (global.io) {
        global.io.to(`user_${recipient._id}`).emit('new_notification', {
          notification: {
            _id: notification._id,
            type: notification.type,
            category: notification.category,
            priority: notification.priority,
            title: localizedContent.title,
            message: localizedContent.message,
            data: notification.data,
            createdAt: notification.createdAt
          }
        });
        console.log(`Real-time notification sent to user ${recipient._id}`);
      } else {
        console.log('Socket.IO not available - Real-time notification skipped');
      }
    }

    // Update notification status if at least one method succeeded
    if (errors.length < Object.keys(deliveryMethods).filter(method => deliveryMethods[method].enabled).length) {
      notification.status = 'delivered';
      notification.sentAt = new Date();
      await notification.save();
    }

  } catch (error) {
    throw new AppError(`Failed to send notification: ${error.message}`, 500);
  }

  if (errors.length > 0) {
    console.warn(`Notification ${notification._id} had delivery errors:`, errors);
  }

  return { success: errors.length === 0, errors };
}

// Helper function to generate email template
function generateEmailTemplate(notification, content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${content.title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #28a745;">
        <h2 style="color: #28a745; margin-top: 0;">${content.title}</h2>
        <p style="font-size: 16px;">${content.message}</p>
        
        ${notification.data?.actionData?.actionUrl ? `
          <div style="margin: 20px 0;">
            <a href="${notification.data.actionData.actionUrl}" 
               style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px; display: inline-block;">
              ${notification.data.actionData.buttonText || 'View Details'}
            </a>
          </div>
        ` : ''}
        
        <div style="border-top: 1px solid #ddd; padding-top: 15px; margin-top: 20px; font-size: 12px; color: #666;">
          <p>Sent by Smart Crop Advisory System</p>
          <p>Priority: ${notification.priority} | Category: ${notification.category}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  createNotification: exports.createNotification,
  createBulkNotifications: exports.createBulkNotifications,
  getUserNotifications: exports.getUserNotifications,
  getNotification: exports.getNotification,
  markAsRead: exports.markAsRead,
  markMultipleAsRead: exports.markMultipleAsRead,
  markAllAsRead: exports.markAllAsRead,
  dismissNotification: exports.dismissNotification,
  trackInteraction: exports.trackInteraction,
  getAnalytics: exports.getAnalytics,
  getUnreadCounts: exports.getUnreadCounts,
  searchNotifications: exports.searchNotifications,
  getAllNotifications: exports.getAllNotifications,
  processScheduledNotifications: exports.processScheduledNotifications,
  cleanupExpired: exports.cleanupExpired,
  sendNotificationImmediately
};
