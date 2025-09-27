// frontend/src/services/authService.js
import api from './api';

const API_URL = 'http://localhost:5000/api/v1';

// Removed duplicate AuthService class - using the more complete one below

// Ensure AuthService is only defined once
if (typeof window !== 'undefined' && window.AuthService) {
  console.warn('AuthService already exists in global scope');
}

class AuthService {
  constructor() {
    this.TOKEN_KEY = 'farmora_token';
    this.USER_KEY = 'farmora_user';
    this.REFRESH_TOKEN_KEY = 'farmora_refresh_token';
    this.isInitialized = false;
    this.authListeners = new Set();
    this.API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  }

  // Initialize auth service
  initialize() {
    if (this.isInitialized) return;
    
    this.checkAuthState();
    this.setupTokenRefresh();
    this.isInitialized = true;
  }

  // Authentication Methods
  async login(credentials) {
    try {
      // Support both email and phone login
      let loginData = {};
      if (credentials.email) {
        loginData = {
          email: credentials.email,
          password: credentials.password
        };
      } else if (credentials.phone) {
        loginData = {
          phone: credentials.phone,
          password: credentials.password
        };
      } else {
        throw new Error('Please provide either email or phone number');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store tokens and user data
      this.setAuthData(data.token, data.refreshToken, data.data.user);
      
      // Notify listeners
      this.notifyAuthListeners('login', data.user);

      return {
        success: true,
        user: data.data.user,
        message: 'Login successful'
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed. Please try again.'
      };
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Auto-login after successful registration
      if (data.token) {
        this.setAuthData(data.token, data.refreshToken, data.data.user);
        this.notifyAuthListeners('register', data.data.user);
      }

      return {
        success: true,
        user: data.data.user,
        message: data.message || 'Registration successful'
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed. Please try again.'
      };
    }
  }

  async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        // Notify server about logout
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.warn('Logout server notification failed:', error);
    } finally {
      // Clear local storage regardless of server response
      this.clearAuthData();
      this.notifyAuthListeners('logout');
      
      // Redirect to login page
      window.location.href = '/login';
    }
  }

  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed');
      }

      // Update stored tokens
      this.setToken(data.token);
      if (data.refreshToken) {
        this.setRefreshToken(data.refreshToken);
      }

      return data.token;

    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      this.logout();
      throw error;
    }
  }

  // Password Management
  async forgotPassword(email) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Password reset email sent' : 'Failed to send reset email')
      };

    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Failed to send reset email. Please try again.'
      };
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password: newPassword })
      });

      const data = await response.json();

      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Password reset successful' : 'Password reset failed')
      };

    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Password reset failed. Please try again.'
      };
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const token = this.getToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/update-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Password changed successfully' : 'Password change failed')
      };

    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Password change failed. Please try again.'
      };
    }
  }

  // Profile Management
  async updateProfile(profileData) {
    try {
      const token = this.getToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      // Update stored user data
      this.setUser(data.user);
      this.notifyAuthListeners('profileUpdate', data.user);

      return {
        success: true,
        user: data.user,
        message: 'Profile updated successfully'
      };

    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: error.message || 'Profile update failed'
      };
    }
  }

  async uploadAvatar(file) {
    try {
      const token = this.getToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Avatar upload failed');
      }

      // Update stored user data
      const currentUser = this.getUser();
      const updatedUser = { ...currentUser, avatar: data.avatarUrl };
      this.setUser(updatedUser);
      this.notifyAuthListeners('profileUpdate', updatedUser);

      return {
        success: true,
        avatarUrl: data.avatarUrl,
        message: 'Avatar uploaded successfully'
      };

    } catch (error) {
      console.error('Avatar upload error:', error);
      return {
        success: false,
        message: error.message || 'Avatar upload failed'
      };
    }
  }

  // Token Management
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token) {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token) {
    if (token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  // User Management
  getUser() {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user) {
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.USER_KEY);
    }
  }

  // Auth State Management
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    
    if (!token || !user) {
      return false;
    }

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      if (payload.exp && payload.exp < now) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  }

  hasAnyRole(roles) {
    const user = this.getUser();
    return user && roles.includes(user.role);
  }

  hasPermission(permission) {
    const user = this.getUser();
    return user && user.permissions && user.permissions.includes(permission);
  }

  // Private Methods
  setAuthData(token, refreshToken, user) {
    this.setToken(token);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
    this.setUser(user);
  }

  clearAuthData() {
    this.setToken(null);
    this.setRefreshToken(null);
    this.setUser(null);
  }

  checkAuthState() {
    const token = this.getToken();
    const user = this.getUser();

    if (token && user && !this.isTokenExpired(token)) {
      this.notifyAuthListeners('init', user);
    } else if (token && this.isTokenExpired(token)) {
      // Try to refresh token
      this.refreshToken().catch(() => {
        this.logout();
      });
    }
  }

  isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp && payload.exp < now;
    } catch (error) {
      return true;
    }
  }

  setupTokenRefresh() {
    const token = this.getToken();
    
    if (token && !this.isTokenExpired(token)) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();
      const refreshTime = exp - (5 * 60 * 1000); // 5 minutes before expiry

      if (refreshTime > now) {
        setTimeout(() => {
          this.refreshToken().catch(console.error);
        }, refreshTime - now);
      }
    }
  }

  // Event Management
  addAuthListener(listener) {
    this.authListeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.authListeners.delete(listener);
    };
  }

  notifyAuthListeners(event, data) {
    this.authListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  // Utility Methods
  getAuthHeader() {
    const token = this.getToken();
    return token ? `Bearer ${token}` : null;
  }

  async validateSession() {
    try {
      const token = this.getToken();
      
      if (!token) {
        return false;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  // Phone Authentication Methods
  async sendOTP(phone, firstName = '', lastName = '') {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/phone/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, firstName, lastName })
      });

      const data = await response.json();

      return {
        success: response.ok,
        message: data.message || (response.ok ? 'OTP sent successfully' : 'Failed to send OTP'),
        demo: data.demo // For demo mode
      };

    } catch (error) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  async verifyOTP(phone, otp) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/phone/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      // Store tokens and user data
      this.setAuthData(data.token, null, data.user);
      
      // Notify listeners
      this.notifyAuthListeners('login', data.user);

      return {
        success: true,
        user: data.user,
        message: data.message || 'Phone verification successful'
      };

    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        message: error.message || 'OTP verification failed. Please try again.'
      };
    }
  }

  async resendOTP(phone) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/phone/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      return {
        success: response.ok,
        message: data.message || (response.ok ? 'OTP resent successfully' : 'Failed to resend OTP'),
        demo: data.demo // For demo mode
      };

    } catch (error) {
      console.error('Resend OTP error:', error);
      return {
        success: false,
        message: 'Failed to resend OTP. Please try again.'
      };
    }
  }

  // Google OAuth Methods
  async loginWithGoogle(idToken) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google authentication failed');
      }

      // Store tokens and user data
      this.setAuthData(data.token, null, data.user);
      
      // Notify listeners
      this.notifyAuthListeners('login', data.user);

      return {
        success: true,
        user: data.user,
        message: data.message || 'Google authentication successful'
      };

    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        message: error.message || 'Google authentication failed. Please try again.'
      };
    }
  }

  async loginWithGoogleUserInfo(userInfo) {
    try {
      // This method is used when we get user info directly from Google API
      // Create a mock ID token scenario or send user info directly
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userInfo })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google authentication failed');
      }

      // Store tokens and user data
      this.setAuthData(data.token, null, data.user);
      
      // Notify listeners
      this.notifyAuthListeners('login', data.user);

      return {
        success: true,
        user: data.user,
        message: data.message || 'Google authentication successful'
      };

    } catch (error) {
      console.error('Google user info login error:', error);
      return {
        success: false,
        message: error.message || 'Google authentication failed. Please try again.'
      };
    }
  }

  async getGoogleAuthUrl() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google/auth-url`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      return {
        success: response.ok,
        authUrl: data.authUrl,
        message: data.message || (response.ok ? 'Auth URL generated' : 'Failed to generate auth URL')
      };

    } catch (error) {
      console.error('Get Google auth URL error:', error);
      return {
        success: false,
        message: 'Failed to get Google authorization URL'
      };
    }
  }

  async loginWithFacebook() {
    // Implement Facebook OAuth integration
    throw new Error('Facebook login not implemented yet');
  }

  // Two-Factor Authentication (placeholder)
  async enableTwoFactor() {
    // Implement 2FA setup
    throw new Error('Two-factor authentication not implemented yet');
  }

  async verifyTwoFactor(code) {
    // Implement 2FA verification
    throw new Error('Two-factor authentication not implemented yet');
  }
}

// Create and export singleton instance
let authService;

// Ensure only one instance exists
if (typeof window !== 'undefined') {
  if (!window.__authServiceInstance) {
    window.__authServiceInstance = new AuthService();
    window.__authServiceInstance.initialize();
  }
  authService = window.__authServiceInstance;
} else {
  authService = new AuthService();
  authService.initialize();
}

export default authService;
