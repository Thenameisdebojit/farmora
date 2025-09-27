// backend/src/services/googleAuthService.js

const { OAuth2Client } = require('google-auth-library');

class GoogleAuthService {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    
    this.initializeGoogleAuth();
  }

  initializeGoogleAuth() {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        console.warn('⚠️ Google OAuth credentials not configured. Google authentication will be disabled.');
        return;
      }

      this.client = new OAuth2Client(
        clientId,
        clientSecret,
        process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
      );
      
      this.isConfigured = true;
      console.log('✅ Google OAuth service initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Google OAuth service:', error.message);
      this.isConfigured = false;
    }
  }

  async verifyIdToken(idToken) {
    try {
      if (!this.isConfigured) {
        throw new Error('Google OAuth service is not properly configured');
      }

      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      
      return {
        success: true,
        user: {
          googleId: payload.sub,
          email: payload.email,
          name: payload.name,
          firstName: payload.given_name,
          lastName: payload.family_name,
          picture: payload.picture,
          emailVerified: payload.email_verified,
          locale: payload.locale
        }
      };

    } catch (error) {
      console.error('Google token verification failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Invalid Google authentication token'
      };
    }
  }

  async getAuthUrl(scopes = ['openid', 'email', 'profile']) {
    try {
      if (!this.isConfigured) {
        throw new Error('Google OAuth service is not configured');
      }

      const authUrl = this.client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true,
        state: this.generateState()
      });

      return {
        success: true,
        authUrl,
        message: 'Authorization URL generated successfully'
      };

    } catch (error) {
      console.error('Failed to generate Google auth URL:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate authorization URL'
      };
    }
  }

  async getTokens(code) {
    try {
      if (!this.isConfigured) {
        throw new Error('Google OAuth service is not configured');
      }

      const { tokens } = await this.client.getToken(code);
      this.client.setCredentials(tokens);

      return {
        success: true,
        tokens,
        message: 'Tokens retrieved successfully'
      };

    } catch (error) {
      console.error('Failed to get Google tokens:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to exchange authorization code for tokens'
      };
    }
  }

  async getUserInfo(accessToken) {
    try {
      if (!this.isConfigured) {
        throw new Error('Google OAuth service is not configured');
      }

      this.client.setCredentials({ access_token: accessToken });
      
      const response = await this.client.request({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo'
      });

      return {
        success: true,
        user: response.data,
        message: 'User information retrieved successfully'
      };

    } catch (error) {
      console.error('Failed to get Google user info:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve user information'
      };
    }
  }

  async revokeToken(token) {
    try {
      if (!this.isConfigured) {
        throw new Error('Google OAuth service is not configured');
      }

      await this.client.revokeToken(token);

      return {
        success: true,
        message: 'Token revoked successfully'
      };

    } catch (error) {
      console.error('Failed to revoke Google token:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to revoke token'
      };
    }
  }

  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  getStatus() {
    return {
      configured: this.isConfigured,
      clientId: process.env.GOOGLE_CLIENT_ID ? 
        process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : null,
      service: 'Google OAuth 2.0'
    };
  }

  // Test method for development
  async testConfiguration() {
    try {
      if (!this.isConfigured) {
        return {
          success: false,
          message: 'Google OAuth service is not configured'
        };
      }

      // Test by generating an auth URL
      const result = await this.getAuthUrl();
      
      return {
        success: result.success,
        message: result.success ? 'Google OAuth configuration is valid' : result.message
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Google OAuth configuration test failed'
      };
    }
  }
}

// Export singleton instance
module.exports = new GoogleAuthService();