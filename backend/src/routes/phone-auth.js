// backend/src/routes/phone-auth.js

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { formatPhoneNumber } = require('../services/smsService');
const smsService = require('../services/smsService');
const router = express.Router();

// In-memory OTP storage for demo (use Redis in production)
const otpStore = new Map();

// Generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP endpoint
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, firstName = '', lastName = '' } = req.body;

    // Validate phone number
    if (!phone || !/^[0-9]{10}$/.test(phone.replace(/\s+/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit phone number'
      });
    }

    const cleanPhone = phone.replace(/\s+/g, '');

    // Generate OTP
    const otp = generateOTP();

    // Store OTP with expiration (5 minutes)
    const otpData = {
      otp,
      phone: cleanPhone,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    };

    otpStore.set(cleanPhone, otpData);

    // Send SMS via configured provider
    const formatted = formatPhoneNumber(cleanPhone);
    const smsResult = await smsService.sendSMS({
      to: formatted,
      message: `Your Smart Crop Advisory verification code is: ${otp}. It expires in 5 minutes.`
    });

    if (!smsResult.success) {
      return res.status(500).json({ success: false, message: smsResult.message || 'Failed to send OTP via SMS' });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    const cleanPhone = phone.replace(/\s+/g, '');
    const otpData = otpStore.get(cleanPhone);

    // Check if OTP exists
    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new OTP.'
      });
    }

    // Check if OTP expired
    if (new Date() > otpData.expiresAt) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (otpData.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }

    // OTP verified successfully
    otpStore.delete(cleanPhone); // Remove used OTP

    // Check if user exists
    let user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      // Create new user with phone
      const userData = {
        phone: cleanPhone,
        firstName: otpData.firstName || 'Phone',
        lastName: otpData.lastName || 'User',
        name: otpData.firstName && otpData.lastName 
          ? `${otpData.firstName} ${otpData.lastName}` 
          : 'Phone User',
        email: `user_${cleanPhone}@phone.app`, // Generate email from phone
        isPhoneVerified: true,
        role: 'farmer',
        authMethod: 'phone',
        location: {
          address: {
            country: 'India'
          }
        }
      };

      user = new User(userData);
      await user.save();
    } else {
      // Update existing user
      user.isPhoneVerified = true;
      user.lastLoginAt = new Date();
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        phone: user.phone,
        authMethod: 'phone'
      },
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '24h' }
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Phone verification successful',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
        authMethod: 'phone'
      },
      token
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again.'
    });
  }
});

// Resend OTP endpoint
router.post('/resend-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Check if there's an existing OTP request
    const cleanPhone = phone.replace(/\s+/g, '');
    const existingOtp = otpStore.get(cleanPhone);

    // Allow resend if no existing OTP or if it's been more than 1 minute
    if (existingOtp && (new Date() - existingOtp.createdAt) < 60000) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting a new OTP'
      });
    }

    // Generate new OTP
    const otp = generateOTP();

    // Store new OTP
    const otpData = {
      otp,
      phone: cleanPhone,
      firstName: existingOtp?.firstName || '',
      lastName: existingOtp?.lastName || '',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    };

    otpStore.set(cleanPhone, otpData);

    // Send SMS via configured provider
    const formatted = formatPhoneNumber(cleanPhone);
    const smsResult = await smsService.sendSMS({
      to: formatted,
      message: `Your Smart Crop Advisory verification code is: ${otp}. It expires in 5 minutes.`
    });

    if (!smsResult.success) {
      return res.status(500).json({ success: false, message: smsResult.message || 'Failed to resend OTP via SMS' });
    }

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.'
    });
  }
});

// Clean expired OTPs (run periodically)
setInterval(() => {
  const now = new Date();
  for (const [phone, otpData] of otpStore.entries()) {
    if (now > otpData.expiresAt) {
      otpStore.delete(phone);
    }
  }
}, 60000); // Clean every minute

module.exports = router;