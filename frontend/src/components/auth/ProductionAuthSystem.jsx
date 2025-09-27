// Production-level Authentication System
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  MapPin,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Globe
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import { toast } from 'react-hot-toast';

// Google OAuth component
const GoogleAuthButton = ({ onSuccess, onError, disabled, mode = 'login' }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      // Check if Google Auth is enabled
      const isGoogleEnabled = import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true';
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!isGoogleEnabled || !clientId || clientId.includes('your-google-client-id')) {
        toast.error('Google authentication is not configured. Please use email/phone authentication.');
        onError?.(new Error('Google OAuth not configured'));
        return;
      }

      // Initialize Google Identity Services
      if (typeof google === 'undefined' || !google.accounts) {
        // Load Google Identity Services script if not already loaded
        await loadGoogleIdentityServices();
      }

      // Use Google One Tap or OAuth popup
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: false
      });

      // Show Google OAuth popup
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to OAuth popup
          google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'email profile',
            callback: handleGoogleTokenCallback
          }).requestAccessToken();
        }
      });
      
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Google authentication failed. Please try again.');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const loadGoogleIdentityServices = () => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined') {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const handleGoogleCallback = async (response) => {
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Send ID token to backend for verification
      const result = await authService.loginWithGoogle(response.credential);
      
      if (result.success) {
        toast.success(`Welcome${result.user?.name ? `, ${result.user.name}` : ''}!`);
        onSuccess?.(result.user);
      } else {
        toast.error(result.message || 'Google authentication failed');
        onError?.(new Error(result.message));
      }
    } catch (error) {
      console.error('Google callback error:', error);
      toast.error('Google authentication failed. Please try again.');
      onError?.(error);
    }
  };

  const handleGoogleTokenCallback = async (response) => {
    try {
      if (!response.access_token) {
        throw new Error('No access token received from Google');
      }

      // Use access token to get user info and authenticate
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`
      );
      
      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user info from Google');
      }
      
      const userInfo = await userInfoResponse.json();
      
      // Send user info to backend
      const result = await authService.loginWithGoogleUserInfo(userInfo);
      
      if (result.success) {
        toast.success(`Welcome${result.user?.name ? `, ${result.user.name}` : ''}!`);
        onSuccess?.(result.user);
      } else {
        toast.error(result.message || 'Google authentication failed');
        onError?.(new Error(result.message));
      }
    } catch (error) {
      console.error('Google token callback error:', error);
      toast.error('Google authentication failed. Please try again.');
      onError?.(error);
    }
  };

  return (
    <button
      onClick={handleGoogleAuth}
      disabled={disabled || loading}
      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </>
      )}
    </button>
  );
};

// OTP Input component
const OTPInput = ({ length = 6, value, onChange, onComplete }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));

  useEffect(() => {
    setOtp(value ? value.split('').slice(0, length) : new Array(length).fill(''));
  }, [value, length]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp.map((d, idx) => (idx === index ? element.value : d))];
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Focus next input
    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }

    // Call onComplete when all fields are filled
    if (newOtp.every(digit => digit !== '') && onComplete) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  return (
    <div className="flex space-x-2 justify-center">
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          maxLength="1"
          value={data}
          onChange={e => handleChange(e.target, index)}
          onKeyDown={e => handleKeyDown(e, index)}
          onFocus={e => e.target.select()}
          className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
        />
      ))}
    </div>
  );
};

// Main Authentication Component
const ProductionAuthSystem = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'phone-auth' | 'otp-verify'
  const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'phone'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // Form data
  const [formData, setFormData] = useState({
    // Login fields
    email: '',
    phone: '',
    password: '',
    otp: '',
    
    // Registration fields
    firstName: '',
    lastName: '',
    confirmPassword: '',
    state: 'Maharashtra',
    district: 'Pune',
    acceptTerms: false
  });

  // Get redirect path
  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Clear errors when user types
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Validate form
  const validateForm = () => {
    if (mode === 'register') {
      if (!formData.firstName.trim()) return 'First name is required';
      if (!formData.lastName.trim()) return 'Last name is required';
      if (!formData.acceptTerms) return 'Please accept the terms and conditions';
    }

    if (authMethod === 'email') {
      if (!formData.email.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    }

    if (authMethod === 'phone') {
      if (!formData.phone.trim()) return 'Phone number is required';
      if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s+/g, ''))) return 'Invalid phone number format';
    }

    if ((mode === 'login' || mode === 'register') && authMethod !== 'phone') {
      if (!formData.password.trim()) return 'Password is required';
      if (formData.password.length < 6) return 'Password must be at least 6 characters';
    }

    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    return null;
  };

  // Handle email/password authentication
  const handleEmailAuth = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      let result;
      
      if (mode === 'login') {
        result = await authService.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        result = await authService.register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          phone: '', // Can be added later
          role: 'farmer',
          location: {
            address: {
              district: formData.district,
              state: formData.state,
              country: 'India'
            },
            coordinates: {
              latitude: 20.5937,
              longitude: 78.9629
            }
          },
          farmDetails: {
            farmSize: 2,
            soilType: 'loam',
            primaryCrops: ['wheat'],
            irrigationType: 'manual'
          },
          experience: 'beginner'
        });
      }

      if (result.success) {
        setSuccess(`${mode === 'login' ? 'Login' : 'Registration'} successful!`);
        
        // Update auth context
        if (login && result.user) {
          await login(result.user);
        }

        toast.success(`Welcome${result.user?.name ? `, ${result.user.name}` : ''}!`);
        
        // Redirect after short delay
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 1000);
      } else {
        setError(result.message || `${mode === 'login' ? 'Login' : 'Registration'} failed`);
      }
    } catch (error) {
      console.error(`${mode} error:`, error);
      setError(`An error occurred. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle phone authentication (OTP-based)
  const handlePhoneAuth = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = formData.phone.replace(/\s+/g, '');
      
      // Use real backend API for OTP
      const result = await authService.sendOTP(
        cleanPhone,
        formData.firstName || '',
        formData.lastName || ''
      );
      
      if (result.success) {
        setSuccess(result.message);
        setOtpSent(true);
        setMode('otp-verify');
        setResendCooldown(60);
        
        // OTP resent successfully - no demo fallbacks in production
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Phone auth error:', error);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOTPVerify = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = formData.phone.replace(/\s+/g, '');
      
      // Use real backend API for OTP verification
      const result = await authService.verifyOTP(cleanPhone, formData.otp);
      
      if (result.success) {
        setSuccess(result.message);
        
        // Update auth context
        if (login && result.user) {
          await login(result.user);
        }

        toast.success(`Welcome${result.user?.name ? `, ${result.user.name}` : ''}!`);
        
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('OTP verify error:', error);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (mode === 'otp-verify') {
      handleOTPVerify();
    } else if (authMethod === 'phone') {
      handlePhoneAuth();
    } else {
      handleEmailAuth();
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    try {
      const cleanPhone = formData.phone.replace(/\s+/g, '');
      
      // Use real backend API for OTP resend
      const result = await authService.resendOTP(cleanPhone);
      
      if (result.success) {
        setSuccess(result.message);
        setFormData(prev => ({ ...prev, otp: '' }));
        setResendCooldown(60);
        
        // Show demo OTP if in demo mode
        if (result.demo?.otp) {
          toast.success(`Demo OTP: ${result.demo.otp}`);
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-6 text-white">
            <div className="text-center">
              <motion.div
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-2xl font-bold">🌾</span>
              </motion.div>
              <h1 className="text-2xl font-bold mb-1">Smart Crop Advisory</h1>
              <p className="text-green-100">
                {mode === 'register' ? 'Create your account' :
                 mode === 'otp-verify' ? 'Verify phone number' :
                 'Sign in to continue'}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {/* Login/Register Forms */}
                {(mode === 'login' || mode === 'register') && (
                  <motion.div
                    key="auth-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          mode === 'login' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('register')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          mode === 'register' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'
                        }`}
                      >
                        Sign Up
                      </button>
                    </div>

                    {/* Auth Method Toggle */}
                    <div className="flex bg-gray-50 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setAuthMethod('email')}
                        className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center ${
                          authMethod === 'email' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                        }`}
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMethod('phone')}
                        className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center ${
                          authMethod === 'phone' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                        }`}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Phone
                      </button>
                    </div>

                    {/* Registration fields */}
                    {mode === 'register' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="First name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Last name"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Email field */}
                    {authMethod === 'email' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Phone field */}
                    {authMethod === 'phone' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="10-digit mobile number"
                            maxLength={10}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Password field */}
                    {authMethod === 'email' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder={mode === 'register' ? 'Create a password' : 'Enter your password'}
                            minLength={6}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Confirm password field */}
                    {mode === 'register' && authMethod === 'email' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Confirm your password"
                            minLength={6}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Location fields for registration */}
                    {mode === 'register' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <select
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="Rajasthan">Rajasthan</option>
                            <option value="Punjab">Punjab</option>
                            <option value="Haryana">Haryana</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            District
                          </label>
                          <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Your district"
                          />
                        </div>
                      </div>
                    )}

                    {/* Terms and conditions */}
                    {mode === 'register' && (
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          name="acceptTerms"
                          checked={formData.acceptTerms}
                          onChange={handleInputChange}
                          className="mt-1 mr-2 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          required
                        />
                        <label className="text-sm text-gray-600">
                          I agree to the{' '}
                          <a href="#" className="text-green-600 hover:underline">Terms of Service</a>
                          {' '}and{' '}
                          <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>
                        </label>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* OTP Verification Form */}
                {mode === 'otp-verify' && (
                  <motion.div
                    key="otp-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 text-center"
                  >
                    <div>
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Verify Phone Number
                      </h3>
                      <p className="text-sm text-gray-600">
                        We've sent a 6-digit code to<br />
                        <span className="font-medium">{formData.phone}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Check your phone for the verification code
                      </p>
                    </div>

                    <div>
                      <OTPInput
                        length={6}
                        value={formData.otp}
                        onChange={(otp) => setFormData(prev => ({ ...prev, otp }))}
                        onComplete={(otp) => setFormData(prev => ({ ...prev, otp }))}
                      />
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resendCooldown > 0}
                        className="text-green-600 hover:text-green-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setAuthMethod('phone');
                        setOtpSent(false);
                        setFormData(prev => ({ ...prev, otp: '' }));
                      }}
                      className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center w-full"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Change phone number
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error/Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-red-700">{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-green-700">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              {mode !== 'otp-verify' && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {authMethod === 'phone' ? 'Send OTP' : 
                       mode === 'register' ? 'Create Account' : 'Sign In'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              )}

              {/* OTP Verify Button */}
              {mode === 'otp-verify' && (
                <button
                  type="submit"
                  disabled={loading || !formData.otp || formData.otp.length !== 6}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verify & Continue
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              )}

              {/* Google Authentication */}
              {mode !== 'otp-verify' && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>

                  <GoogleAuthButton
                    mode={mode}
                    disabled={loading}
                    onSuccess={(user) => {
                      setSuccess('Google authentication successful!');
                      login?.(user);
                      navigate(redirectTo, { replace: true });
                    }}
                    onError={(error) => {
                      setError(error.message || 'Google authentication failed');
                    }}
                  />
                </>
              )}
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductionAuthSystem;