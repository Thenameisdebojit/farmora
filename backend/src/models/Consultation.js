// backend/src/models/Consultation.js
const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer ID is required']
  },
  expertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Expert ID is required']
  },
  consultationType: {
    type: String,
    required: [true, 'Consultation type is required'],
    enum: [
      'video_call',
      'audio_call',
      'chat_only',
      'field_visit',
      'group_session'
    ]
  },
  topic: {
    type: String,
    required: [true, 'Consultation topic is required'],
    trim: true,
    maxlength: [200, 'Topic cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: [
      'crop_management',
      'pest_disease_control',
      'soil_health',
      'irrigation',
      'fertilization',
      'market_guidance',
      'organic_farming',
      'post_harvest',
      'general_advisory'
    ]
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Scheduled date must be in the future'
    }
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [15, 'Minimum duration is 15 minutes'],
    max: [120, 'Maximum duration is 120 minutes'],
    default: 30
  },
  status: {
    type: String,
    enum: [
      'scheduled',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'no_show',
      'rescheduled'
    ],
    default: 'scheduled'
  },
  actualStartTime: Date,
  actualEndTime: Date,
  actualDuration: Number, // calculated actual duration in minutes
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  meetingCredentials: {
    roomUrl: String,
    accessToken: String,
    recordingId: String
  },
  farmContext: {
    cropType: String,
    farmSize: Number,
    location: {
      state: String,
      district: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    currentIssues: [String],
    previousConsultations: Number
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'video']
    },
    url: String,
    filename: String,
    description: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  notes: {
    farmerNotes: String, // Notes from farmer before consultation
    expertNotes: String, // Notes from expert during/after consultation
    recommendations: [String], // Key recommendations provided
    followUpRequired: { type: Boolean, default: false },
    followUpDate: Date
  },
  pricing: {
    baseFee: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  feedback: {
    farmerRating: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator: function(value) {
          return Number.isInteger(value) && value >= 1 && value <= 5;
        },
        message: 'Rating must be an integer between 1 and 5'
      }
    },
    expertRating: {
      type: Number,
      min: 1,
      max: 5
    },
    farmerFeedback: String,
    expertFeedback: String,
    overallExperience: {
      type: String,
      enum: ['poor', 'fair', 'good', 'very_good', 'excellent']
    },
    technicalIssues: { type: Boolean, default: false },
    wouldRecommend: { type: Boolean }
  },
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    cancelledAt: Date,
    refundStatus: {
      type: String,
      enum: ['not_applicable', 'pending', 'processed', 'failed']
    }
  },
  reminders: {
    farmerReminded: { type: Boolean, default: false },
    expertReminded: { type: Boolean, default: false },
    reminderSentAt: Date
  },
  recordingConsent: {
    farmerConsent: { type: Boolean, default: false },
    expertConsent: { type: Boolean, default: false },
    recordingUrl: String,
    recordingDuration: Number
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
consultationSchema.index({ farmerId: 1, scheduledDate: -1 });
consultationSchema.index({ expertId: 1, scheduledDate: -1 });
consultationSchema.index({ status: 1, scheduledDate: 1 });
consultationSchema.index({ scheduledDate: 1 });
consultationSchema.index({ category: 1, status: 1 });
consultationSchema.index({ 'farmContext.cropType': 1 });

// Update updatedAt field before saving
consultationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate actual duration if start and end times are available
consultationSchema.pre('save', function(next) {
  if (this.actualStartTime && this.actualEndTime) {
    this.actualDuration = Math.round(
      (this.actualEndTime - this.actualStartTime) / (1000 * 60)
    );
  }
  next();
});

// Instance method to check if consultation can be started
consultationSchema.methods.canStart = function() {
  if (this.status !== 'scheduled' && this.status !== 'confirmed') {
    return { canStart: false, reason: 'Consultation is not in scheduled or confirmed state' };
  }
  
  const now = new Date();
  const scheduledTime = new Date(this.scheduledDate);
  const timeDiff = Math.abs(now - scheduledTime) / (1000 * 60); // difference in minutes
  
  if (timeDiff > 30) { // Allow starting 30 minutes before or after scheduled time
    return { canStart: false, reason: 'Outside the allowed time window' };
  }
  
  return { canStart: true };
};

// Instance method to check if consultation can be cancelled
consultationSchema.methods.canCancel = function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return { canCancel: false, reason: 'Consultation is already completed or cancelled' };
  }
  
  if (this.status === 'in_progress') {
    return { canCancel: false, reason: 'Cannot cancel an ongoing consultation' };
  }
  
  const now = new Date();
  const scheduledTime = new Date(this.scheduledDate);
  const hoursUntil = (scheduledTime - now) / (1000 * 60 * 60);
  
  if (hoursUntil < 2) {
    return { canCancel: true, reason: 'Late cancellation - may incur charges' };
  }
  
  return { canCancel: true };
};

// Instance method to get consultation summary
consultationSchema.methods.getSummary = function() {
  return {
    id: this._id,
    topic: this.topic,
    scheduledDate: this.scheduledDate,
    duration: this.duration,
    status: this.status,
    consultationType: this.consultationType,
    category: this.category,
    urgency: this.urgency
  };
};

// Instance method to check if reminder should be sent
consultationSchema.methods.shouldSendReminder = function() {
  if (this.reminders.farmerReminded && this.reminders.expertReminded) {
    return false;
  }
  
  const now = new Date();
  const scheduledTime = new Date(this.scheduledDate);
  const hoursUntil = (scheduledTime - now) / (1000 * 60 * 60);
  
  // Send reminder 24 hours before and 1 hour before
  return hoursUntil <= 24 && hoursUntil >= 23 || hoursUntil <= 1 && hoursUntil >= 0.5;
};

// Static method to find upcoming consultations
consultationSchema.statics.findUpcoming = function(userId, role = 'farmer', hours = 24) {
  const now = new Date();
  const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
  
  const userField = role === 'farmer' ? 'farmerId' : 'expertId';
  
  return this.find({
    [userField]: userId,
    scheduledDate: { $gte: now, $lte: futureTime },
    status: { $in: ['scheduled', 'confirmed'] }
  }).sort({ scheduledDate: 1 });
};

// Static method to find consultations needing reminders
consultationSchema.statics.findNeedingReminders = function() {
  const now = new Date();
  const twentyFourHours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const oneHour = new Date(now.getTime() + 60 * 60 * 1000);
  
  return this.find({
    status: { $in: ['scheduled', 'confirmed'] },
    $or: [
      {
        scheduledDate: { $gte: twentyFourHours, $lte: new Date(twentyFourHours.getTime() + 60 * 60 * 1000) },
        'reminders.farmerReminded': false
      },
      {
        scheduledDate: { $gte: oneHour, $lte: new Date(oneHour.getTime() + 30 * 60 * 1000) },
        'reminders.farmerReminded': false
      }
    ]
  });
};

// Static method to find overdue consultations
consultationSchema.statics.findOverdue = function() {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  return this.find({
    scheduledDate: { $lt: thirtyMinutesAgo },
    status: { $in: ['scheduled', 'confirmed'] }
  });
};

// Static method to get expert statistics
consultationSchema.statics.getExpertStats = function(expertId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        expertId: mongoose.Types.ObjectId(expertId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgRating: { $avg: '$feedback.farmerRating' },
        avgDuration: { $avg: '$actualDuration' }
      }
    }
  ]);
};

// Virtual field for time until consultation
consultationSchema.virtual('timeUntilConsultation').get(function() {
  const now = new Date();
  return this.scheduledDate - now;
});

// Virtual field for consultation duration in hours
consultationSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

module.exports = mongoose.model('Consultation', consultationSchema);
