// backend/src/models/IrrigationDevice.js
const mongoose = require('mongoose');

const irrigationDeviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Device name is required'],
    trim: true,
    maxlength: [100, 'Device name cannot exceed 100 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  deviceType: {
    type: String,
    required: [true, 'Device type is required'],
    enum: [
      'soil_moisture_sensor',
      'drip_controller',
      'sprinkler_controller',
      'weather_station',
      'water_level_sensor',
      'pump_controller'
    ]
  },
  sensorId: {
    type: String,
    required: [true, 'Sensor ID is required'],
    unique: true,
    trim: true
  },
  location: {
    fieldName: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    area: { type: Number }, // in square meters
    cropType: { type: String }
  },
  configuration: {
    moistureThreshold: {
      type: Number,
      default: 30,
      min: 10,
      max: 80,
      validate: {
        validator: function(value) {
          return value >= 10 && value <= 80;
        },
        message: 'Moisture threshold must be between 10% and 80%'
      }
    },
    irrigationDuration: {
      type: Number, // in minutes
      default: 15,
      min: 1,
      max: 120
    },
    autoMode: {
      type: Boolean,
      default: true
    },
    operatingHours: {
      start: { type: String, default: '06:00' }, // 24-hour format
      end: { type: String, default: '20:00' }
    },
    daysOfWeek: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    waterFlowRate: { type: Number }, // liters per minute
    maxDailyWater: { type: Number } // maximum liters per day
  },
  status: {
    isOnline: { type: Boolean, default: false },
    lastPing: { type: Date },
    batteryLevel: { type: Number, min: 0, max: 100 },
    signalStrength: { type: Number, min: 0, max: 100 },
    currentState: {
      type: String,
      enum: ['idle', 'irrigating', 'monitoring', 'offline', 'error'],
      default: 'idle'
    },
    lastIrrigation: {
      startTime: Date,
      endTime: Date,
      duration: Number, // actual duration in minutes
      waterUsed: Number // liters
    }
  },
  alerts: {
    lowBattery: { type: Boolean, default: false },
    deviceOffline: { type: Boolean, default: false },
    highMoisture: { type: Boolean, default: false },
    lowMoisture: { type: Boolean, default: false },
    irrigationFailed: { type: Boolean, default: false }
  },
  maintenance: {
    lastServiceDate: Date,
    nextServiceDue: Date,
    serviceNotes: [String],
    warrantyExpiry: Date
  },
  calibration: {
    lastCalibrated: Date,
    calibrationValues: {
      moistureOffset: { type: Number, default: 0 },
      flowRateMultiplier: { type: Number, default: 1.0 }
    },
    calibratedBy: String // technician name or user
  },
  installationDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
irrigationDeviceSchema.index({ userId: 1, isActive: 1 });
irrigationDeviceSchema.index({ sensorId: 1 });
irrigationDeviceSchema.index({ deviceType: 1 });
irrigationDeviceSchema.index({ 'status.isOnline': 1 });
irrigationDeviceSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });

// Update updatedAt field before saving
irrigationDeviceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to check if device is online
irrigationDeviceSchema.methods.isDeviceOnline = function() {
  if (!this.status.lastPing) return false;
  
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.status.lastPing > fiveMinutesAgo;
};

// Instance method to get device health score
irrigationDeviceSchema.methods.getHealthScore = function() {
  let score = 100;
  
  // Deduct points for offline status
  if (!this.isDeviceOnline()) score -= 30;
  
  // Deduct points for low battery
  if (this.status.batteryLevel && this.status.batteryLevel < 20) score -= 20;
  
  // Deduct points for weak signal
  if (this.status.signalStrength && this.status.signalStrength < 30) score -= 15;
  
  // Deduct points for active alerts
  const activeAlerts = Object.values(this.alerts).filter(alert => alert === true).length;
  score -= activeAlerts * 10;
  
  // Deduct points for overdue maintenance
  if (this.maintenance.nextServiceDue && this.maintenance.nextServiceDue < new Date()) {
    score -= 15;
  }
  
  return Math.max(0, score);
};

// Instance method to check if irrigation is needed
irrigationDeviceSchema.methods.needsIrrigation = function(currentMoisture) {
  if (!this.configuration.autoMode) return false;
  if (this.status.currentState === 'irrigating') return false;
  
  return currentMoisture < this.configuration.moistureThreshold;
};

// Instance method to check if within operating hours
irrigationDeviceSchema.methods.isWithinOperatingHours = function() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 100 + currentMinute;
  
  const startTime = parseInt(this.configuration.operatingHours.start.replace(':', ''));
  const endTime = parseInt(this.configuration.operatingHours.end.replace(':', ''));
  
  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    // Handles overnight periods (e.g., 22:00 to 06:00)
    return currentTime >= startTime || currentTime <= endTime;
  }
};

// Instance method to check if today is an operating day
irrigationDeviceSchema.methods.isOperatingDay = function() {
  if (!this.configuration.daysOfWeek || this.configuration.daysOfWeek.length === 0) {
    return true; // If no specific days set, operate every day
  }
  
  const today = new Date().toLocaleDateString('en', { weekday: 'long' }).toLowerCase();
  return this.configuration.daysOfWeek.includes(today);
};

// Instance method to get water usage statistics
irrigationDeviceSchema.methods.getWaterUsageStats = function(days = 30) {
  // This would typically query a separate collection for historical data
  // For now, return mock data structure
  return {
    totalWaterUsed: 0,
    averageDailyUsage: 0,
    irrigationEvents: 0,
    efficiency: 0,
    period: days
  };
};

// Static method to find devices by user
irrigationDeviceSchema.statics.findByUser = function(userId) {
  return this.find({
    userId: userId,
    isActive: true
  }).sort({ createdAt: -1 });
};

// Static method to find devices needing maintenance
irrigationDeviceSchema.statics.findNeedingMaintenance = function() {
  const today = new Date();
  return this.find({
    isActive: true,
    'maintenance.nextServiceDue': { $lte: today }
  });
};

// Static method to find offline devices
irrigationDeviceSchema.statics.findOfflineDevices = function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.find({
    isActive: true,
    $or: [
      { 'status.lastPing': { $lt: fiveMinutesAgo } },
      { 'status.lastPing': { $exists: false } }
    ]
  });
};

// Static method to find devices with low battery
irrigationDeviceSchema.statics.findLowBatteryDevices = function(threshold = 20) {
  return this.find({
    isActive: true,
    'status.batteryLevel': { $lt: threshold }
  });
};

// Static method to find devices by location radius
irrigationDeviceSchema.statics.findNearby = function(latitude, longitude, radiusKm = 5) {
  const earthRadius = 6371; // Earth's radius in kilometers
  const lat1 = latitude * Math.PI / 180;
  const deltaLat = (radiusKm / earthRadius);
  const deltaLon = radiusKm / (earthRadius * Math.cos(lat1));
  
  return this.find({
    isActive: true,
    'location.coordinates.latitude': {
      $gte: latitude - deltaLat * 180 / Math.PI,
      $lte: latitude + deltaLat * 180 / Math.PI
    },
    'location.coordinates.longitude': {
      $gte: longitude - deltaLon * 180 / Math.PI,
      $lte: longitude + deltaLon * 180 / Math.PI
    }
  });
};

// Virtual field for device age in days
irrigationDeviceSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.installationDate) / (1000 * 60 * 60 * 24));
});

// Virtual field for time since last ping
irrigationDeviceSchema.virtual('timeSinceLastPing').get(function() {
  if (!this.status.lastPing) return null;
  return new Date() - this.status.lastPing;
});

module.exports = mongoose.model('IrrigationDevice', irrigationDeviceSchema);
