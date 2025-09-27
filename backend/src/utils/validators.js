// backend/src/utils/validators.js

/**
 * Validate notification data
 * @param {Object} data - Notification data to validate
 * @returns {Object} Validation result
 */
const validateNotificationData = (data) => {
  const errors = [];
  const {
    recipient,
    type,
    category,
    priority,
    title,
    message,
    deliveryMethods,
    scheduledFor,
    expiresAt
  } = data;

  // Required fields
  if (!recipient) {
    errors.push('Recipient is required');
  }

  if (!type) {
    errors.push('Notification type is required');
  } else {
    const validTypes = [
      'weather_alert', 'pest_warning', 'disease_alert', 'market_update',
      'irrigation_reminder', 'fertilizer_schedule', 'harvest_ready',
      'expert_message', 'consultation_request', 'consultation_reminder',
      'system_update', 'achievement', 'recommendation', 'emergency',
      'crop_stage_update', 'activity_reminder', 'price_alert'
    ];
    if (!validTypes.includes(type)) {
      errors.push('Invalid notification type');
    }
  }

  if (!category) {
    errors.push('Category is required');
  } else {
    const validCategories = ['weather', 'crop', 'market', 'system', 'social', 'emergency'];
    if (!validCategories.includes(category)) {
      errors.push('Invalid category');
    }
  }

  if (!title) {
    errors.push('Title is required');
  } else if (title.length > 200) {
    errors.push('Title cannot exceed 200 characters');
  }

  if (!message) {
    errors.push('Message is required');
  } else if (message.length > 1000) {
    errors.push('Message cannot exceed 1000 characters');
  }

  // Optional field validations
  if (priority) {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      errors.push('Invalid priority level');
    }
  }

  // Date validations
  if (scheduledFor) {
    const scheduledDate = new Date(scheduledFor);
    if (isNaN(scheduledDate.getTime())) {
      errors.push('Invalid scheduled date format');
    } else if (scheduledDate < new Date()) {
      errors.push('Scheduled date cannot be in the past');
    }
  }

  if (expiresAt) {
    const expiryDate = new Date(expiresAt);
    if (isNaN(expiryDate.getTime())) {
      errors.push('Invalid expiry date format');
    } else if (expiryDate <= new Date()) {
      errors.push('Expiry date must be in the future');
    }
  }

  // Delivery methods validation
  if (deliveryMethods) {
    const { push, email, sms, inApp } = deliveryMethods;
    
    if (push && typeof push.enabled !== 'boolean') {
      errors.push('Push notification enabled flag must be boolean');
    }
    
    if (email && typeof email.enabled !== 'boolean') {
      errors.push('Email enabled flag must be boolean');
    }
    
    if (sms && typeof sms.enabled !== 'boolean') {
      errors.push('SMS enabled flag must be boolean');
    }
    
    if (inApp && typeof inApp.enabled !== 'boolean') {
      errors.push('In-app notification enabled flag must be boolean');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate email address format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
const validatePhoneNumber = (phone) => {
  // International format: +[country code][number]
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate MongoDB ObjectId format
 * @param {string} id - ID to validate
 * @returns {boolean} Is valid ObjectId
 */
const validateObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validate crop management data
 * @param {Object} data - Crop data to validate
 * @returns {Object} Validation result
 */
const validateCropData = (data) => {
  const errors = [];
  const {
    cropType,
    variety,
    plantingDate,
    expectedHarvestDate,
    fieldSize,
    location
  } = data;

  // Required fields
  if (!cropType) {
    errors.push('Crop type is required');
  }

  if (!variety) {
    errors.push('Variety is required');
  }

  if (!plantingDate) {
    errors.push('Planting date is required');
  } else {
    const plantingDateObj = new Date(plantingDate);
    if (isNaN(plantingDateObj.getTime())) {
      errors.push('Invalid planting date format');
    }
  }

  if (expectedHarvestDate) {
    const harvestDateObj = new Date(expectedHarvestDate);
    if (isNaN(harvestDateObj.getTime())) {
      errors.push('Invalid harvest date format');
    } else if (new Date(plantingDate) && harvestDateObj <= new Date(plantingDate)) {
      errors.push('Harvest date must be after planting date');
    }
  }

  if (fieldSize) {
    if (typeof fieldSize !== 'number' || fieldSize <= 0) {
      errors.push('Field size must be a positive number');
    }
  }

  if (location) {
    if (location.coordinates) {
      const { latitude, longitude } = location.coordinates;
      if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
        errors.push('Invalid latitude');
      }
      if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
        errors.push('Invalid longitude');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate weather data
 * @param {Object} data - Weather data to validate
 * @returns {Object} Validation result
 */
const validateWeatherData = (data) => {
  const errors = [];
  const {
    temperature,
    humidity,
    windSpeed,
    rainfall,
    pressure,
    condition
  } = data;

  if (temperature !== undefined) {
    if (typeof temperature !== 'number' || temperature < -50 || temperature > 60) {
      errors.push('Temperature must be a number between -50 and 60°C');
    }
  }

  if (humidity !== undefined) {
    if (typeof humidity !== 'number' || humidity < 0 || humidity > 100) {
      errors.push('Humidity must be a number between 0 and 100%');
    }
  }

  if (windSpeed !== undefined) {
    if (typeof windSpeed !== 'number' || windSpeed < 0) {
      errors.push('Wind speed must be a non-negative number');
    }
  }

  if (rainfall !== undefined) {
    if (typeof rainfall !== 'number' || rainfall < 0) {
      errors.push('Rainfall must be a non-negative number');
    }
  }

  if (pressure !== undefined) {
    if (typeof pressure !== 'number' || pressure < 800 || pressure > 1200) {
      errors.push('Pressure must be a number between 800 and 1200 hPa');
    }
  }

  if (condition) {
    const validConditions = [
      'sunny', 'cloudy', 'partly_cloudy', 'rainy', 'stormy', 'foggy',
      'windy', 'hot', 'cold', 'humid', 'dry'
    ];
    if (!validConditions.includes(condition)) {
      errors.push('Invalid weather condition');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate market data
 * @param {Object} data - Market data to validate
 * @returns {Object} Validation result
 */
const validateMarketData = (data) => {
  const errors = [];
  const {
    crop,
    variety,
    price,
    unit,
    marketCenter,
    quality,
    date
  } = data;

  if (!crop) {
    errors.push('Crop name is required');
  }

  if (price !== undefined) {
    if (typeof price !== 'number' || price < 0) {
      errors.push('Price must be a non-negative number');
    }
  }

  if (unit) {
    const validUnits = ['kg', 'quintal', 'ton', 'bag', 'piece', 'dozen'];
    if (!validUnits.includes(unit)) {
      errors.push('Invalid price unit');
    }
  }

  if (quality) {
    const validQualities = ['premium', 'good', 'average', 'poor'];
    if (!validQualities.includes(quality)) {
      errors.push('Invalid quality grade');
    }
  }

  if (date) {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      errors.push('Invalid date format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate user data
 * @param {Object} data - User data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Validation result
 */
const validateUserData = (data, isUpdate = false) => {
  const errors = [];
  const {
    name,
    email,
    phoneNumber,
    password,
    role,
    location
  } = data;

  // Required fields for new users
  if (!isUpdate) {
    if (!name) {
      errors.push('Name is required');
    }
    
    if (!email) {
      errors.push('Email is required');
    }
    
    if (!password) {
      errors.push('Password is required');
    }
  }

  // Field validations
  if (name && (typeof name !== 'string' || name.trim().length < 2)) {
    errors.push('Name must be at least 2 characters long');
  }

  if (email && !validateEmail(email)) {
    errors.push('Invalid email format');
  }

  if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
    errors.push('Invalid phone number format. Use international format (+1234567890)');
  }

  if (password) {
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }
  }

  if (role) {
    const validRoles = ['farmer', 'expert', 'admin'];
    if (!validRoles.includes(role)) {
      errors.push('Invalid user role');
    }
  }

  if (location && location.coordinates) {
    const { latitude, longitude } = location.coordinates;
    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      errors.push('Invalid latitude');
    }
    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      errors.push('Invalid longitude');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize string input
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>]/g, '') // Remove < and > characters
    .substring(0, 1000); // Limit length
};

/**
 * Validate pagination parameters
 * @param {Object} query - Query parameters
 * @returns {Object} Validated pagination params
 */
const validatePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Validate date range
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {Object} Validation result with parsed dates
 */
const validateDateRange = (startDate, endDate) => {
  const errors = [];
  let parsedStartDate, parsedEndDate;

  if (startDate) {
    parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate.getTime())) {
      errors.push('Invalid start date format');
    }
  }

  if (endDate) {
    parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate.getTime())) {
      errors.push('Invalid end date format');
    }
  }

  if (parsedStartDate && parsedEndDate && parsedStartDate >= parsedEndDate) {
    errors.push('Start date must be before end date');
  }

  return {
    isValid: errors.length === 0,
    errors,
    startDate: parsedStartDate,
    endDate: parsedEndDate
  };
};

module.exports = {
  validateNotificationData,
  validateEmail,
  validatePhoneNumber,
  validateObjectId,
  validateCropData,
  validateWeatherData,
  validateMarketData,
  validateUserData,
  sanitizeString,
  validatePagination,
  validateDateRange
};