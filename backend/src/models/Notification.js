// backend/src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient Information
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required'],
    index: true
  },
  
  // Notification Type and Category
  type: {
    type: String,
    enum: [
      'weather_alert', 'pest_warning', 'disease_alert', 'market_update', 
      'irrigation_reminder', 'fertilizer_schedule', 'harvest_ready', 
      'expert_message', 'consultation_request', 'consultation_reminder',
      'system_update', 'achievement', 'recommendation', 'emergency',
      'crop_stage_update', 'activity_reminder', 'price_alert'
    ],
    required: [true, 'Notification type is required'],
    index: true
  },
  
  category: {
    type: String,
    enum: ['weather', 'crop', 'market', 'system', 'social', 'emergency'],
    required: [true, 'Category is required'],
    index: true
  },
  
  // Priority and Urgency
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  
  urgency: {
    type: String,
    enum: ['immediate', 'within_hour', 'within_day', 'when_convenient'],
    default: 'when_convenient'
  },
  
  // Content
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  
  // Rich Content
  data: {
    // Weather specific
    weatherData: {
      temperature: Number,
      humidity: Number,
      windSpeed: Number,
      condition: String,
      alertType: String
    },
    
    // Market specific  
    marketData: {
      crop: String,
      currentPrice: Number,
      priceChange: Number,
      trend: String,
      marketCenter: String
    },
    
    // Crop specific
    cropData: {
      cropId: { type: mongoose.Schema.ObjectId, ref: 'CropManagement' },
      cropName: String,
      stage: String,
      action: String,
      daysRemaining: Number
    },
    
    // General action data
    actionData: {
      actionType: String,
      actionUrl: String,
      buttonText: String,
      metadata: mongoose.Schema.Types.Mixed
    }
  },
  
  // Media attachments
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document', 'audio'],
      required: true
    },
    url: { type: String, required: true },
    caption: String,
    size: Number, // in bytes
    duration: Number // for video/audio in seconds
  }],
  
  // Delivery Methods
  deliveryMethods: {
    push: {
      enabled: { type: Boolean, default: true },
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      deviceTokens: [String],
      response: mongoose.Schema.Types.Mixed
    },
    
    email: {
      enabled: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      emailAddress: String,
      response: mongoose.Schema.Types.Mixed
    },
    
    sms: {
      enabled: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      phoneNumber: String,
      response: mongoose.Schema.Types.Mixed
    },
    
    inApp: {
      enabled: { type: Boolean, default: true },
      delivered: { type: Boolean, default: true },
      deliveredAt: { type: Date, default: Date.now }
    }
  },
  
  // Status and Interaction
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'acted_upon', 'dismissed', 'failed'],
    default: 'pending',
    index: true
  },
  
  readAt: Date,
  actedAt: Date,
  dismissedAt: Date,
  
  // Interaction tracking
  interactions: {
    clicks: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    actions: [{
      action: String,
      timestamp: { type: Date, default: Date.now },
      metadata: mongoose.Schema.Types.Mixed
    }]
  },
  
  // Targeting and Scheduling
  targetCriteria: {
    location: {
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      radius: Number, // in meters
      states: [String],
      districts: [String]
    },
    
    userFilters: {
      roles: [String],
      experience: [String],
      crops: [String],
      farmSize: {
        min: Number,
        max: Number
      }
    }
  },
  
  scheduledFor: Date,
  expiresAt: Date,
  
  // Source and Attribution
  source: {
    type: {
      type: String,
      enum: ['system', 'admin', 'expert', 'ai', 'weather_service', 'market_service', 'user'],
      required: true
    },
    id: String, // ID of the source (user ID, service name, etc.)
    name: String, // Display name of the source
    automated: { type: Boolean, default: false }
  },
  
  // Related entities
  relatedEntities: {
    crops: [{ type: mongoose.Schema.ObjectId, ref: 'CropManagement' }],
    consultations: [{ type: mongoose.Schema.ObjectId, ref: 'Consultation' }],
    users: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    weatherAlerts: [{ type: mongoose.Schema.ObjectId, ref: 'WeatherData' }]
  },
  
  // Grouping and threading
  groupId: String, // For grouping related notifications
  threadId: String, // For conversation threading
  
  // A/B testing and campaigns
  campaign: {
    id: String,
    name: String,
    variant: String,
    metrics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    }
  },
  
  // Localization
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'gu', 'mr', 'bn', 'pa']
  },
  
  localizedContent: [{
    language: String,
    title: String,
    message: String
  }],
  
  // Metadata and tracking
  metadata: mongoose.Schema.Types.Mixed,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  sentAt: Date,
  
  // Retry and failure handling
  retryCount: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 3 },
  errors: [{
    method: String,
    error: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, status: 1, createdAt: -1 });
notificationSchema.index({ type: 1, category: 1 });
notificationSchema.index({ priority: 1, urgency: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ 'source.type': 1 });
notificationSchema.index({ groupId: 1 });

// Compound indexes
notificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });
notificationSchema.index({ type: 1, scheduledFor: 1, status: 1 });

// TTL index for automatic cleanup of old notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual fields
notificationSchema.virtual('isRead').get(function() {
  return !!this.readAt;
});

notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && new Date() > this.expiresAt;
});

notificationSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

notificationSchema.virtual('ageInHours').get(function() {
  return Math.floor(this.age / (1000 * 60 * 60));
});

notificationSchema.virtual('deliveryStatus').get(function() {
  const methods = this.deliveryMethods;
  const statuses = [];
  
  if (methods.push.enabled) statuses.push(methods.push.delivered ? 'push: delivered' : 'push: pending');
  if (methods.email.enabled) statuses.push(methods.email.delivered ? 'email: delivered' : 'email: pending');
  if (methods.sms.enabled) statuses.push(methods.sms.delivered ? 'sms: delivered' : 'sms: pending');
  if (methods.inApp.enabled) statuses.push('in-app: delivered');
  
  return statuses.join(', ');
});

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set default expiry if not provided
  if (!this.expiresAt) {
    const expiryDays = {
      'emergency': 1,
      'critical': 7,
      'high': 14,
      'medium': 30,
      'low': 90
    };
    
    const days = expiryDays[this.priority] || 30;
    this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
  
  // Auto-localize content if not provided
  if (!this.localizedContent.length && this.language !== 'en') {
    // This would integrate with a translation service
    this.localizedContent.push({
      language: this.language,
      title: this.title,
      message: this.message
    });
  }
  
  next();
});

// Instance methods
notificationSchema.methods.markAsRead = function() {
  this.readAt = new Date();
  this.status = 'read';
  return this.save();
};

notificationSchema.methods.markAsActed = function(action = 'default') {
  this.actedAt = new Date();
  this.status = 'acted_upon';
  this.interactions.actions.push({
    action,
    timestamp: new Date()
  });
  return this.save();
};

notificationSchema.methods.dismiss = function() {
  this.dismissedAt = new Date();
  this.status = 'dismissed';
  return this.save();
};

notificationSchema.methods.incrementClicks = function() {
  this.interactions.clicks += 1;
  if (this.campaign?.id) {
    this.campaign.metrics.clicks += 1;
  }
  return this.save();
};

notificationSchema.methods.markDelivered = function(method, response = null) {
  if (this.deliveryMethods[method]) {
    this.deliveryMethods[method].delivered = true;
    this.deliveryMethods[method].deliveredAt = new Date();
    if (response) {
      this.deliveryMethods[method].response = response;
    }
    
    // Update overall status
    if (this.status === 'pending' || this.status === 'sent') {
      this.status = 'delivered';
      this.sentAt = new Date();
    }
  }
  return this.save();
};

notificationSchema.methods.markFailed = function(method, error) {
  this.errors.push({
    method,
    error: error.message || error,
    timestamp: new Date()
  });
  
  this.retryCount += 1;
  
  if (this.retryCount >= this.maxRetries) {
    this.status = 'failed';
  }
  
  return this.save();
};

notificationSchema.methods.getLocalizedContent = function(language = 'en') {
  const localized = this.localizedContent.find(content => content.language === language);
  
  if (localized) {
    return {
      title: localized.title,
      message: localized.message
    };
  }
  
  return {
    title: this.title,
    message: this.message
  };
};

// Static methods
notificationSchema.statics.findUnread = function(userId, limit = 50) {
  return this.find({
    recipient: userId,
    readAt: { $exists: false },
    status: { $ne: 'dismissed' }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

notificationSchema.statics.findByType = function(userId, type, limit = 20) {
  return this.find({
    recipient: userId,
    type,
    status: { $ne: 'dismissed' }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

notificationSchema.statics.findPending = function() {
  return this.find({
    status: 'pending',
    $or: [
      { scheduledFor: { $lte: new Date() } },
      { scheduledFor: { $exists: false } }
    ],
    expiresAt: { $gt: new Date() }
  }).sort({ priority: 1, createdAt: 1 });
};

notificationSchema.statics.markAllAsRead = function(userId, type = null) {
  const query = { recipient: userId, readAt: { $exists: false } };
  if (type) query.type = type;
  
  return this.updateMany(query, {
    readAt: new Date(),
    status: 'read'
  });
};

notificationSchema.statics.getUnreadCount = function(userId, category = null) {
  const query = { recipient: userId, readAt: { $exists: false }, status: { $ne: 'dismissed' } };
  if (category) query.category = category;
  
  return this.countDocuments(query);
};

notificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lte: new Date() }
  });
};

notificationSchema.statics.getAnalytics = function(startDate, endDate) {
  const matchStage = {
    createdAt: { $gte: startDate, $lte: endDate }
  };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          type: '$type',
          status: '$status'
        },
        count: { $sum: 1 },
        avgDeliveryTime: { 
          $avg: { 
            $subtract: ['$sentAt', '$createdAt'] 
          } 
        }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count',
            avgDeliveryTime: '$avgDeliveryTime'
          }
        },
        totalCount: { $sum: '$count' }
      }
    }
  ]);
};

// Create and compound text index for search
notificationSchema.index({
  title: 'text',
  message: 'text'
}, {
  weights: {
    title: 10,
    message: 5
  }
});

module.exports = mongoose.model('Notification', notificationSchema);