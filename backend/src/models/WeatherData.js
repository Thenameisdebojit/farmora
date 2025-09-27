// backend/src/models/WeatherData.js
const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema({
  // Location Information
  location: {
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    city: String,
    district: String,
    state: String,
    country: { type: String, default: 'India' },
    elevation: Number // in meters
  },
  
  // Current Weather Data
  current: {
    temperature: { type: Number, required: true }, // in Celsius
    feelsLike: Number,
    humidity: { type: Number, required: true }, // percentage
    pressure: Number, // in hPa
    visibility: Number, // in meters
    uvIndex: Number,
    windSpeed: { type: Number, required: true }, // in km/h
    windDirection: Number, // in degrees
    windGust: Number,
    cloudCover: Number, // percentage
    dewPoint: Number,
    weather: {
      main: { type: String, required: true }, // Clear, Clouds, Rain, etc.
      description: { type: String, required: true },
      icon: String
    },
    precipitation: {
      last1h: { type: Number, default: 0 },
      last3h: { type: Number, default: 0 },
      last24h: { type: Number, default: 0 }
    }
  },
  
  // Forecast Data (next 7 days)
  forecast: [{
    date: { type: Date, required: true },
    temperature: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      average: Number
    },
    humidity: {
      min: Number,
      max: Number,
      average: { type: Number, required: true }
    },
    windSpeed: {
      min: Number,
      max: Number,
      average: { type: Number, required: true }
    },
    pressure: Number,
    weather: {
      main: { type: String, required: true },
      description: { type: String, required: true },
      icon: String
    },
    precipitation: {
      probability: { type: Number, default: 0 }, // percentage
      amount: { type: Number, default: 0 } // in mm
    },
    sunrise: Date,
    sunset: Date
  }],
  
  // Historical Data (last 30 days summary)
  historical: {
    averageTemperature: Number,
    maxTemperature: Number,
    minTemperature: Number,
    totalPrecipitation: Number,
    rainyDays: Number,
    averageHumidity: Number,
    averageWindSpeed: Number,
    period: {
      from: Date,
      to: Date
    }
  },
  
  // Agricultural Specific Data
  agricultural: {
    soilTemperature: Number,
    soilMoisture: Number, // percentage
    evapotranspiration: Number, // mm/day
    growingDegreeDays: Number,
    heatStressIndex: Number,
    chillHours: Number, // for fruit crops
    photoperiod: Number, // daylight hours
    solarRadiation: Number // MJ/m²/day
  },
  
  // Weather Alerts and Warnings
  alerts: [{
    type: {
      type: String,
      enum: ['heat_wave', 'cold_wave', 'heavy_rain', 'thunderstorm', 'hail', 'frost', 'drought', 'flood', 'cyclone', 'dust_storm'],
      required: true
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'severe', 'extreme'],
      required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    areas: [String], // affected areas
    isActive: { type: Boolean, default: true },
    source: String,
    urgency: {
      type: String,
      enum: ['immediate', 'expected', 'future', 'past'],
      default: 'expected'
    }
  }],
  
  // Data Source and Quality
  source: {
    provider: { type: String, required: true }, // OpenWeatherMap, IMD, etc.
    api: String,
    quality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    lastUpdated: { type: Date, default: Date.now },
    updateFrequency: { type: String, default: '1hour' } // 1hour, 3hour, 6hour, daily
  },
  
  // Seasonal Information
  season: {
    current: {
      type: String,
      enum: ['winter', 'spring', 'summer', 'monsoon', 'post_monsoon'],
      required: true
    },
    cropSeason: {
      type: String,
      enum: ['kharif', 'rabi', 'zaid'],
      required: true
    },
    monsoonStatus: {
      type: String,
      enum: ['pre_monsoon', 'onset', 'active', 'break', 'withdrawal', 'post_monsoon']
    }
  },
  
  // Extreme Events
  extremeEvents: [{
    type: {
      type: String,
      enum: ['highest_temp', 'lowest_temp', 'highest_rainfall', 'strongest_wind'],
      required: true
    },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    date: { type: Date, required: true },
    description: String
  }],
  
  // Verification and Accuracy
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedBy: String,
    verificationDate: Date,
    accuracy: {
      temperature: Number, // percentage accuracy
      precipitation: Number,
      wind: Number,
      overall: Number
    }
  },
  
  // Usage Statistics
  usage: {
    requestCount: { type: Number, default: 1 },
    lastRequested: { type: Date, default: Date.now },
    popularityScore: { type: Number, default: 0 }
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { 
    type: Date, 
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // Expire after 24 hours
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
weatherDataSchema.index({ 'location.coordinates': '2dsphere' });
weatherDataSchema.index({ 'location.city': 1, 'location.state': 1 });
weatherDataSchema.index({ 'source.lastUpdated': -1 });
weatherDataSchema.index({ createdAt: -1 });
weatherDataSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Compound indexes
weatherDataSchema.index({ 
  'location.coordinates.latitude': 1, 
  'location.coordinates.longitude': 1,
  'source.lastUpdated': -1 
});

// Virtual fields
weatherDataSchema.virtual('temperatureInFahrenheit').get(function() {
  return this.current?.temperature ? (this.current.temperature * 9/5) + 32 : null;
});

weatherDataSchema.virtual('isDataFresh').get(function() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.source?.lastUpdated > oneHourAgo;
});

weatherDataSchema.virtual('activeAlerts').get(function() {
  return this.alerts?.filter(alert => alert.isActive && new Date() <= alert.endTime) || [];
});

weatherDataSchema.virtual('weatherSummary').get(function() {
  if (!this.current) return null;
  
  const { temperature, weather, humidity, windSpeed } = this.current;
  return `${weather.description}, ${temperature}°C, ${humidity}% humidity, ${windSpeed} km/h wind`;
});

// Pre-save middleware
weatherDataSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate agricultural metrics if not provided
  if (this.current && !this.agricultural.soilTemperature) {
    this.agricultural.soilTemperature = this.current.temperature - 2; // Rough estimate
  }
  
  // Update popularity score
  this.usage.popularityScore = this.usage.requestCount * 0.1;
  
  next();
});

// Instance methods
weatherDataSchema.methods.getComfortIndex = function() {
  if (!this.current) return null;
  
  const { temperature, humidity } = this.current;
  
  // Heat Index calculation
  if (temperature >= 27) {
    const T = temperature;
    const RH = humidity;
    const heatIndex = -8.78469475556 + 1.61139411 * T + 2.33854883889 * RH + 
                     -0.14611605 * T * RH + -0.012308094 * T * T + 
                     -0.0164248277778 * RH * RH;
    
    if (heatIndex > 40) return 'dangerous';
    if (heatIndex > 32) return 'extreme_caution';
    if (heatIndex > 27) return 'caution';
  }
  
  return 'comfortable';
};

weatherDataSchema.methods.getFarmingAdvice = function() {
  const advice = [];
  
  if (!this.current) return advice;
  
  const { temperature, humidity, windSpeed, weather, precipitation } = this.current;
  
  // Temperature-based advice
  if (temperature > 35) {
    advice.push('Avoid spraying during hot hours. Provide shade to livestock.');
  } else if (temperature < 10) {
    advice.push('Protect crops from cold. Consider covering sensitive plants.');
  }
  
  // Humidity-based advice
  if (humidity > 80) {
    advice.push('High humidity may promote fungal diseases. Ensure good ventilation.');
  } else if (humidity < 30) {
    advice.push('Low humidity. Increase irrigation frequency.');
  }
  
  // Wind-based advice
  if (windSpeed > 25) {
    advice.push('Strong winds. Avoid spraying and support tall plants.');
  }
  
  // Weather-based advice
  if (weather.main === 'Rain') {
    advice.push('Postpone spraying activities. Ensure proper drainage.');
  } else if (weather.main === 'Clear' && temperature > 30) {
    advice.push('Good weather for harvesting. Increase irrigation if needed.');
  }
  
  return advice;
};

weatherDataSchema.methods.getIrrigationRecommendation = function() {
  if (!this.current) return 'no_data';
  
  const { temperature, humidity, precipitation } = this.current;
  const recent24hRain = precipitation.last24h || 0;
  
  if (recent24hRain > 10) return 'skip_irrigation';
  if (temperature > 35 && humidity < 40) return 'increase_irrigation';
  if (temperature < 20 && humidity > 70) return 'reduce_irrigation';
  
  return 'normal_irrigation';
};

weatherDataSchema.methods.incrementUsage = function() {
  this.usage.requestCount += 1;
  this.usage.lastRequested = new Date();
  this.usage.popularityScore = this.usage.requestCount * 0.1;
  return this.save({ validateBeforeSave: false });
};

// Static methods
weatherDataSchema.statics.findByLocation = function(latitude, longitude, maxDistance = 50000) {
  return this.findOne({
    'location.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: maxDistance
      }
    },
    expiresAt: { $gt: new Date() }
  }).sort({ 'source.lastUpdated': -1 });
};

weatherDataSchema.statics.findRecent = function(hours = 24) {
  const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({
    'source.lastUpdated': { $gte: timeThreshold }
  }).sort({ 'source.lastUpdated': -1 });
};

weatherDataSchema.statics.findWithAlerts = function() {
  return this.find({
    'alerts.isActive': true,
    'alerts.endTime': { $gte: new Date() }
  }).sort({ 'alerts.severity': 1 });
};

weatherDataSchema.statics.getWeatherStats = async function(days = 7) {
  const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: dateThreshold } } },
    {
      $group: {
        _id: null,
        avgTemperature: { $avg: '$current.temperature' },
        maxTemperature: { $max: '$current.temperature' },
        minTemperature: { $min: '$current.temperature' },
        avgHumidity: { $avg: '$current.humidity' },
        totalRequests: { $sum: '$usage.requestCount' },
        totalAlerts: { $sum: { $size: '$alerts' } }
      }
    }
  ]);
};

weatherDataSchema.statics.findByCity = function(city, state) {
  return this.find({
    'location.city': new RegExp(city, 'i'),
    'location.state': new RegExp(state, 'i'),
    expiresAt: { $gt: new Date() }
  }).sort({ 'source.lastUpdated': -1 });
};

module.exports = mongoose.model('WeatherData', weatherDataSchema);