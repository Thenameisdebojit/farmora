// backend/src/services/smsService.js
const twilio = require('twilio');
const { AppError } = require('../utils/errorHandler');

// Initialize Twilio client if credentials are available
let twilioClient = null;
let isTwilioConfigured = false;

try {
  if (process.env.TWILIO_ACCOUNT_SID && 
      process.env.TWILIO_AUTH_TOKEN && 
      process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
      process.env.TWILIO_AUTH_TOKEN.length > 10) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID, 
      process.env.TWILIO_AUTH_TOKEN
    );
    isTwilioConfigured = true;
    console.log('✅ Twilio SMS service initialized');
  } else {
    console.warn('⚠️ Twilio credentials not properly configured. SMS functionality will be disabled.');
    console.warn('   To enable SMS: Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER');
  }
} catch (error) {
  console.error('❌ Failed to initialize Twilio:', error.message);
  twilioClient = null;
  isTwilioConfigured = false;
}

/**
 * Send SMS using configured service
 * @param {Object} options - SMS options
 * @param {string} options.to - Recipient phone number (with country code)
 * @param {string} options.message - SMS message content
 * @param {string} options.from - Sender phone number (optional)
 * @returns {Promise} Send result
 */
const sendSMS = async (options) => {
  const { to, message, from } = options;
  
  if (!to || !message) {
    throw new AppError('Missing required SMS parameters', 400);
  }

  // Validate phone number format
  if (!isValidPhoneNumber(to)) {
    throw new AppError('Invalid phone number format', 400);
  }

  // Truncate message if too long (SMS limit is usually 160 characters)
  const truncatedMessage = message.length > 160 ? 
    message.substring(0, 157) + '...' : message;

  try {
    // Try Twilio if configured
    if (twilioClient && isTwilioConfigured) {
      return await sendSMSViaTwilio({
        to,
        message: truncatedMessage,
        from: from || process.env.TWILIO_PHONE_NUMBER
      });
    }
    
    // In production without SMS provider, log the message instead of failing
    console.log(`📱 SMS would be sent to ${to}: ${truncatedMessage}`);
    
    return {
      success: true,
      messageId: 'simulated-' + Date.now(),
      service: 'simulated',
      status: 'delivered',
      message: 'SMS simulated successfully (no provider configured)'
    };
    
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw new AppError(`Failed to send SMS: ${error.message}`, 500);
  }
};

/**
 * Send SMS via Twilio
 */
const sendSMSViaTwilio = async (smsData) => {
  const { to, message, from } = smsData;
  
  if (!from) {
    throw new AppError('Twilio sender phone number not configured', 500);
  }

  try {
    const messageResponse = await twilioClient.messages.create({
      body: message,
      from: from,
      to: to
    });

    return {
      success: true,
      messageId: messageResponse.sid,
      service: 'twilio',
      status: messageResponse.status,
      response: messageResponse
    };
  } catch (error) {
    console.error('Twilio error:', error);
    throw error;
  }
};

/**
 * Send bulk SMS messages
 * @param {Array} messages - Array of SMS message objects
 * @returns {Promise} Results array
 */
const sendBulkSMS = async (messages) => {
  const results = [];
  
  for (const msg of messages) {
    try {
      const result = await sendSMS(msg);
      results.push({
        phone: msg.to,
        success: true,
        result
      });
    } catch (error) {
      results.push({
        phone: msg.to,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Send templated SMS for different notification types
 * @param {string} template - Template type
 * @param {Object} data - Template data
 * @param {string} recipient - Recipient phone number
 */
const sendTemplatedSMS = async (template, data, recipient) => {
  const templates = {
    weather_alert: (data) => 
      `🌦️ WEATHER ALERT: ${data.alertType} - ${data.severity}. ${data.message}. Stay safe!`,
    
    market_update: (data) => 
      `📈 MARKET UPDATE: ${data.crop} ₹${data.currentPrice}/${data.unit || 'kg'} (${data.priceChange > 0 ? '+' : ''}${data.priceChange}%) at ${data.marketCenter}`,
    
    pest_warning: (data) => 
      `🐛 PEST ALERT: ${data.pestType} detected in ${data.affectedCrop}. Severity: ${data.severity}. Take immediate action!`,
    
    irrigation_reminder: (data) => 
      `💧 IRRIGATION REMINDER: Your ${data.cropName} field needs watering. Soil moisture: ${data.soilMoisture || 'Low'}%`,
    
    fertilizer_schedule: (data) => 
      `🌱 FERTILIZER REMINDER: Apply ${data.fertilizerType} to ${data.cropName}. Recommended: ${data.amount}`,
    
    harvest_ready: (data) => 
      `🌾 HARVEST ALERT: Your ${data.cropName} is ready for harvest! Optimal harvesting period: ${data.harvestPeriod}`,
    
    expert_message: (data) => 
      `👨‍🌾 EXPERT MESSAGE: ${data.message} - ${data.expertName}`,
    
    consultation_reminder: (data) => 
      `📅 CONSULTATION REMINDER: Your appointment with ${data.expertName} is scheduled for ${data.dateTime}`,
    
    price_alert: (data) => 
      `💰 PRICE ALERT: ${data.crop} price ${data.trend} to ₹${data.currentPrice}. Target ${data.targetPrice} ${data.direction}`,
    
    emergency: (data) => 
      `🚨 EMERGENCY: ${data.message}. Contact support: ${data.contactNumber || '1800-XXX-XXXX'}`
  };

  const messageGenerator = templates[template];
  if (!messageGenerator) {
    throw new AppError(`SMS template '${template}' not found`, 400);
  }

  const message = messageGenerator(data);

  return await sendSMS({
    to: recipient,
    message: message
  });
};

/**
 * Validate phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} Is valid
 */
const isValidPhoneNumber = (phoneNumber) => {
  // Basic validation for international phone numbers
  // Expects format: +[country code][number] (e.g., +911234567890)
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

/**
 * Format phone number to international format
 * @param {string} phoneNumber - Phone number to format
 * @param {string} countryCode - Default country code (e.g., '91' for India)
 * @returns {string} Formatted phone number
 */
const formatPhoneNumber = (phoneNumber, countryCode = '91') => {
  // Remove all non-digit characters
  let cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // If number doesn't start with country code, add it
  if (!cleanNumber.startsWith(countryCode)) {
    // If starts with 0, remove it (common in Indian numbers)
    if (cleanNumber.startsWith('0')) {
      cleanNumber = cleanNumber.substring(1);
    }
    cleanNumber = countryCode + cleanNumber;
  }
  
  return '+' + cleanNumber;
};

/**
 * Check SMS delivery status
 * @param {string} messageId - Message ID from SMS service
 * @returns {Promise} Delivery status
 */
const checkSMSStatus = async (messageId, service = 'twilio') => {
  try {
    if (service === 'twilio' && twilioClient) {
      const message = await twilioClient.messages(messageId).fetch();
      return {
        messageId,
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        dateUpdated: message.dateUpdated
      };
    }
    
    throw new AppError(`SMS status check not supported for service: ${service}`, 400);
    
  } catch (error) {
    console.error('SMS status check failed:', error);
    throw new AppError(`Failed to check SMS status: ${error.message}`, 500);
  }
};

/**
 * Get SMS service account info (for monitoring usage/balance)
 * @returns {Promise} Account information
 */
const getSMSAccountInfo = async () => {
  try {
    if (twilioClient) {
      const account = await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      const balance = await twilioClient.balance.fetch();
      
      return {
        service: 'twilio',
        accountSid: account.sid,
        accountStatus: account.status,
        balance: balance.balance,
        currency: balance.currency,
        dateCreated: account.dateCreated,
        lastUpdated: account.dateUpdated
      };
    }
    
    throw new AppError('No SMS service configured', 500);
    
  } catch (error) {
    console.error('Failed to get SMS account info:', error);
    throw new AppError(`Failed to get account info: ${error.message}`, 500);
  }
};

/**
 * Verify SMS service configuration
 * @returns {Promise} Verification result
 */
const verifySMSService = async () => {
  try {
    if (twilioClient) {
      // Test Twilio connection by fetching account info
      const account = await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      
      return {
        success: true,
        service: 'twilio',
        message: 'Twilio connection verified',
        accountStatus: account.status
      };
    }
    
    return {
      success: false,
      message: 'No SMS service configured'
    };
    
  } catch (error) {
    console.error('SMS service verification failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get SMS usage statistics
 * @param {Date} startDate - Start date for statistics
 * @param {Date} endDate - End date for statistics
 * @returns {Promise} Usage statistics
 */
const getSMSUsageStats = async (startDate, endDate) => {
  try {
    if (twilioClient) {
      const messages = await twilioClient.messages.list({
        dateSentAfter: startDate,
        dateSentBefore: endDate,
        limit: 1000 // Adjust as needed
      });
      
      const stats = {
        totalSent: messages.length,
        delivered: 0,
        failed: 0,
        pending: 0,
        byStatus: {}
      };
      
      messages.forEach(msg => {
        stats.byStatus[msg.status] = (stats.byStatus[msg.status] || 0) + 1;
        
        if (msg.status === 'delivered') stats.delivered++;
        else if (msg.status === 'failed' || msg.status === 'undelivered') stats.failed++;
        else if (msg.status === 'sent' || msg.status === 'queued') stats.pending++;
      });
      
      return {
        service: 'twilio',
        period: { startDate, endDate },
        ...stats
      };
    }
    
    throw new AppError('No SMS service configured', 500);
    
  } catch (error) {
    console.error('Failed to get SMS usage stats:', error);
    throw new AppError(`Failed to get usage stats: ${error.message}`, 500);
  }
};

module.exports = {
  sendSMS,
  sendBulkSMS,
  sendTemplatedSMS,
  formatPhoneNumber,
  isValidPhoneNumber,
  checkSMSStatus,
  getSMSAccountInfo,
  verifySMSService,
  getSMSUsageStats
};