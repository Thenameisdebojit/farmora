// backend/src/services/emailService.js
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const { AppError } = require('../utils/errorHandler');

// Configure SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Create nodemailer transporter for SMTP
let smtpTransporter = null;
if (process.env.SMTP_HOST) {
  smtpTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Send email using preferred service (SendGrid or SMTP)
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @param {string} options.from - Sender email (optional)
 * @param {Array} options.attachments - Email attachments (optional)
 * @returns {Promise} Send result
 */
const sendEmail = async (options) => {
  const { to, subject, text, html, from, attachments = [] } = options;
  
  if (!to || !subject || (!text && !html)) {
    throw new AppError('Missing required email parameters', 400);
  }

  const fromAddress = from || process.env.FROM_EMAIL || 'noreply@cropadvisory.com';
  
  try {
    // Try SendGrid first if configured
    if (process.env.SENDGRID_API_KEY) {
      return await sendEmailViaSendGrid({
        to,
        from: fromAddress,
        subject,
        text,
        html,
        attachments
      });
    }
    
    // Fallback to SMTP if configured
    if (smtpTransporter) {
      return await sendEmailViaSMTP({
        to,
        from: fromAddress,
        subject,
        text,
        html,
        attachments
      });
    }
    
    throw new AppError('No email service configured', 500);
    
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new AppError(`Failed to send email: ${error.message}`, 500);
  }
};

/**
 * Send email via SendGrid
 */
const sendEmailViaSendGrid = async (emailData) => {
  const msg = {
    to: emailData.to,
    from: emailData.from,
    subject: emailData.subject,
    text: emailData.text,
    html: emailData.html
  };

  // Add attachments if provided
  if (emailData.attachments && emailData.attachments.length > 0) {
    msg.attachments = emailData.attachments.map(attachment => ({
      content: attachment.content,
      filename: attachment.filename,
      type: attachment.type || 'application/octet-stream',
      disposition: attachment.disposition || 'attachment'
    }));
  }

  try {
    const response = await sgMail.send(msg);
    return {
      success: true,
      messageId: response[0]?.headers?.['x-message-id'],
      service: 'sendgrid',
      response: response[0]
    };
  } catch (error) {
    console.error('SendGrid error:', error);
    throw error;
  }
};

/**
 * Send email via SMTP
 */
const sendEmailViaSMTP = async (emailData) => {
  const mailOptions = {
    from: emailData.from,
    to: emailData.to,
    subject: emailData.subject,
    text: emailData.text,
    html: emailData.html,
    attachments: emailData.attachments
  };

  try {
    const info = await smtpTransporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      service: 'smtp',
      response: info
    };
  } catch (error) {
    console.error('SMTP error:', error);
    throw error;
  }
};

/**
 * Send bulk emails
 * @param {Array} emails - Array of email objects
 * @returns {Promise} Results array
 */
const sendBulkEmails = async (emails) => {
  const results = [];
  
  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      results.push({
        email: email.to,
        success: true,
        result
      });
    } catch (error) {
      results.push({
        email: email.to,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Send templated email for different notification types
 * @param {string} template - Template type
 * @param {Object} data - Template data
 * @param {string} recipient - Recipient email
 */
const sendTemplatedEmail = async (template, data, recipient) => {
  const templates = {
    weather_alert: {
      subject: `Weather Alert: ${data.alertType}`,
      generateHtml: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc3545; color: white; padding: 20px; text-align: center;">
            <h2>⚠️ Weather Alert</h2>
          </div>
          <div style="padding: 20px;">
            <h3>Alert Type: ${data.alertType}</h3>
            <p><strong>Severity:</strong> ${data.severity}</p>
            <p><strong>Message:</strong> ${data.message}</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4>Weather Details:</h4>
              <ul>
                <li>Temperature: ${data.temperature || 'N/A'}°C</li>
                <li>Humidity: ${data.humidity || 'N/A'}%</li>
                <li>Wind Speed: ${data.windSpeed || 'N/A'} km/h</li>
                <li>Condition: ${data.condition || 'N/A'}</li>
              </ul>
            </div>
          </div>
        </div>
      `
    },
    
    market_update: {
      subject: `Market Update: ${data.crop} Prices`,
      generateHtml: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #28a745; color: white; padding: 20px; text-align: center;">
            <h2>📈 Market Update</h2>
          </div>
          <div style="padding: 20px;">
            <h3>Crop: ${data.crop}</h3>
            <p><strong>Current Price:</strong> ₹${data.currentPrice} per ${data.unit || 'kg'}</p>
            <p><strong>Price Change:</strong> 
              <span style="color: ${data.priceChange > 0 ? '#28a745' : '#dc3545'};">
                ${data.priceChange > 0 ? '+' : ''}${data.priceChange}%
              </span>
            </p>
            <p><strong>Trend:</strong> ${data.trend}</p>
            <p><strong>Market Center:</strong> ${data.marketCenter}</p>
          </div>
        </div>
      `
    },
    
    pest_warning: {
      subject: `Pest Alert: ${data.pestType}`,
      generateHtml: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ffc107; color: #212529; padding: 20px; text-align: center;">
            <h2>🐛 Pest Warning</h2>
          </div>
          <div style="padding: 20px;">
            <h3>Pest: ${data.pestType}</h3>
            <p><strong>Affected Crop:</strong> ${data.affectedCrop}</p>
            <p><strong>Severity Level:</strong> ${data.severity}</p>
            <p><strong>Description:</strong> ${data.description}</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4>Recommended Actions:</h4>
              <ul>
                ${data.recommendations?.map(rec => `<li>${rec}</li>`).join('') || '<li>Consult with agricultural expert</li>'}
              </ul>
            </div>
          </div>
        </div>
      `
    },
    
    irrigation_reminder: {
      subject: `Irrigation Reminder: ${data.cropName}`,
      generateHtml: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #17a2b8; color: white; padding: 20px; text-align: center;">
            <h2>💧 Irrigation Reminder</h2>
          </div>
          <div style="padding: 20px;">
            <h3>Crop: ${data.cropName}</h3>
            <p><strong>Field:</strong> ${data.fieldName || 'Your field'}</p>
            <p><strong>Last Irrigation:</strong> ${data.lastIrrigation ? new Date(data.lastIrrigation).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Soil Moisture:</strong> ${data.soilMoisture || 'N/A'}%</p>
            <p><strong>Recommended Action:</strong> ${data.action || 'Schedule irrigation'}</p>
          </div>
        </div>
      `
    },
    
    crop_stage_update: {
      subject: `Crop Update: ${data.cropName} Stage Change`,
      generateHtml: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #6f42c1; color: white; padding: 20px; text-align: center;">
            <h2>🌱 Crop Stage Update</h2>
          </div>
          <div style="padding: 20px;">
            <h3>Crop: ${data.cropName}</h3>
            <p><strong>New Stage:</strong> ${data.newStage}</p>
            <p><strong>Days Since Planting:</strong> ${data.daysSincePlanting || 'N/A'}</p>
            <p><strong>Expected Duration:</strong> ${data.expectedDuration || 'N/A'} days</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4>Stage Activities:</h4>
              <ul>
                ${data.activities?.map(activity => `<li>${activity}</li>`).join('') || '<li>Monitor crop development</li>'}
              </ul>
            </div>
          </div>
        </div>
      `
    }
  };

  const emailTemplate = templates[template];
  if (!emailTemplate) {
    throw new AppError(`Email template '${template}' not found`, 400);
  }

  const htmlContent = emailTemplate.generateHtml(data);
  const textContent = htmlContent.replace(/<[^>]*>/g, ''); // Strip HTML tags

  return await sendEmail({
    to: recipient,
    subject: emailTemplate.subject,
    html: htmlContent,
    text: textContent
  });
};

/**
 * Verify email service configuration
 * @returns {Promise} Verification result
 */
const verifyEmailService = async () => {
  try {
    if (process.env.SENDGRID_API_KEY) {
      // Test SendGrid connection
      const testMsg = {
        to: 'test@example.com',
        from: process.env.FROM_EMAIL || 'noreply@cropadvisory.com',
        subject: 'Test Connection',
        text: 'This is a test message',
        mail_settings: {
          sandbox_mode: {
            enable: true // Use sandbox mode for testing
          }
        }
      };
      
      await sgMail.send(testMsg);
      return {
        success: true,
        service: 'sendgrid',
        message: 'SendGrid connection verified'
      };
    }
    
    if (smtpTransporter) {
      // Test SMTP connection
      await smtpTransporter.verify();
      return {
        success: true,
        service: 'smtp',
        message: 'SMTP connection verified'
      };
    }
    
    return {
      success: false,
      message: 'No email service configured'
    };
    
  } catch (error) {
    console.error('Email service verification failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  sendTemplatedEmail,
  verifyEmailService
};