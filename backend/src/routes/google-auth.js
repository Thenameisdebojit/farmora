// backend/src/routes/google-auth.js

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const googleAuthService = require('../services/googleAuthService');
const router = express.Router();

// Google OAuth login endpoint
router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    // Verify Google ID token
    const verifyResult = await googleAuthService.verifyIdToken(idToken);
    
    if (!verifyResult.success) {
      return res.status(401).json({
        success: false,
        message: verifyResult.message || 'Invalid Google authentication'
      });
    }

    const googleUser = verifyResult.user;

    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { email: googleUser.email },
        { googleId: googleUser.googleId }
      ]
    });

    if (!user) {
      // Create new user with Google data
      const userData = {
        googleId: googleUser.googleId,
        name: googleUser.name,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        email: googleUser.email,
        avatar: googleUser.picture,
        isEmailVerified: googleUser.emailVerified,
        role: 'farmer',
        authMethod: 'google',
        location: {
          address: {
            country: 'India' // Default, can be updated later
          }
        },
        // Default farm details for Google users
        farmDetails: {
          farmSize: 2,
          soilType: 'loam',
          primaryCrops: ['wheat'],
          irrigationType: 'manual'
        },
        experience: 'beginner',
        registrationSource: 'google'
      };

      user = new User(userData);
      await user.save();

      console.log(`✅ New Google user registered: ${user.email}`);
    } else {
      // Update existing user with latest Google info
      user.googleId = googleUser.googleId;
      user.name = googleUser.name;
      user.avatar = googleUser.picture;
      user.lastLoginAt = new Date();
      
      if (!user.firstName && googleUser.firstName) {
        user.firstName = googleUser.firstName;
      }
      if (!user.lastName && googleUser.lastName) {
        user.lastName = googleUser.lastName;
      }

      await user.save();
      console.log(`✅ Existing user logged in via Google: ${user.email}`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        authMethod: 'google'
      },
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        authMethod: 'google',
        registrationSource: user.registrationSource
      },
      token
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed. Please try again.'
    });
  }
});

// Get Google auth URL (for server-side OAuth flow)
router.get('/auth-url', async (req, res) => {
  try {
    const result = await googleAuthService.getAuthUrl();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        authUrl: result.authUrl,
        message: 'Google authorization URL generated'
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || 'Failed to generate Google auth URL'
      });
    }

  } catch (error) {
    console.error('Get Google auth URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Google authorization URL'
    });
  }
});

// Handle OAuth callback (for server-side OAuth flow)
router.post('/callback', async (req, res) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    // Exchange code for tokens
    const tokensResult = await googleAuthService.getTokens(code);
    
    if (!tokensResult.success) {
      return res.status(401).json({
        success: false,
        message: tokensResult.message || 'Failed to exchange authorization code'
      });
    }

    // Get user info using access token
    const userInfoResult = await googleAuthService.getUserInfo(tokensResult.tokens.access_token);
    
    if (!userInfoResult.success) {
      return res.status(401).json({
        success: false,
        message: userInfoResult.message || 'Failed to get user information'
      });
    }

    const googleUser = userInfoResult.user;

    // Process user similar to the login endpoint
    let user = await User.findOne({ 
      $or: [
        { email: googleUser.email },
        { googleId: googleUser.id }
      ]
    });

    if (!user) {
      // Create new user
      const userData = {
        googleId: googleUser.id,
        name: googleUser.name,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        email: googleUser.email,
        avatar: googleUser.picture,
        isEmailVerified: googleUser.verified_email,
        role: 'farmer',
        authMethod: 'google',
        location: {
          address: {
            country: 'India'
          }
        },
        farmDetails: {
          farmSize: 2,
          soilType: 'loam',
          primaryCrops: ['wheat'],
          irrigationType: 'manual'
        },
        experience: 'beginner',
        registrationSource: 'google'
      };

      user = new User(userData);
      await user.save();
    } else {
      // Update existing user
      user.googleId = googleUser.id;
      user.name = googleUser.name;
      user.avatar = googleUser.picture;
      user.lastLoginAt = new Date();
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        authMethod: 'google'
      },
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        authMethod: 'google'
      },
      token
    });

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed. Please try again.'
    });
  }
});

// Revoke Google token (logout)
router.post('/revoke', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required for revocation'
      });
    }

    const result = await googleAuthService.revokeToken(token);
    
    res.status(200).json({
      success: result.success,
      message: result.message || (result.success ? 'Token revoked successfully' : 'Failed to revoke token')
    });

  } catch (error) {
    console.error('Google token revoke error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke Google token'
    });
  }
});

// Get Google OAuth service status
router.get('/status', (req, res) => {
  try {
    const status = googleAuthService.getStatus();
    
    res.status(200).json({
      success: true,
      ...status
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get Google OAuth service status'
    });
  }
});

// Test Google OAuth configuration
router.get('/test', async (req, res) => {
  try {
    const result = await googleAuthService.testConfiguration();
    
    res.status(result.success ? 200 : 500).json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Google OAuth configuration test failed'
    });
  }
});

module.exports = router;