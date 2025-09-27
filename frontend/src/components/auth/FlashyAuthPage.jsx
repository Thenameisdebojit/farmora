// src/components/auth/FlashyAuthPage.jsx
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
  Globe,
  Sparkles,
  Shield,
  Zap,
  Heart,
  Star
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import { toast } from 'react-hot-toast';

// Animated Background Component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
      
      {/* Gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-600/30 rounded-full filter blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/30 to-green-600/30 rounded-full filter blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
        }}
      />
    </div>
  );
};

// Enhanced Google OAuth Button
const GoogleAuthButton = ({ onSuccess, onError, disabled, loading, setLoading }) => {
  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const isGoogleEnabled = import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true';
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!isGoogleEnabled || !clientId || clientId.includes('your-google-client-id')) {
        toast.error('Google authentication is not configured. Please use email/phone authentication.');
        return;
      }

      // Load Google Identity Services
      if (typeof google === 'undefined' || !google.accounts) {
        await loadGoogleScript();
      }

      // Initialize Google Sign-In
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            if (!response.credential) {
              throw new Error('No credential received from Google');
            }

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
          } finally {
            setLoading(false);
          }
        }
      });

      // Show the One Tap dialog
      google.accounts.id.prompt();
      
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Google authentication failed. Please try again.');
      onError?.(error);
      setLoading(false);
    }
  };

  const loadGoogleScript = () => {
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

  return (
    <motion.button
      onClick={handleGoogleAuth}
      disabled={disabled || loading}
      className="w-full relative overflow-hidden bg-white text-gray-700 border-2 border-gray-200 rounded-2xl py-4 px-6 font-semibold transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-center justify-center">
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-6 h-6" />
          </motion.div>
        ) : (
          <>
            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
            <motion.div
              className="absolute right-4"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-blue-500" />
            </motion.div>
          </>
        )}
      </div>
    </motion.button>
  );
};

// Enhanced OTP Input
const OTPInput = ({ length = 6, value, onChange, onComplete, loading }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));

  useEffect(() => {
    setOtp(value ? value.split('').slice(0, length) : new Array(length).fill(''));
  }, [value, length]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp.map((d, idx) => (idx === index ? element.value : d))];
    setOtp(newOtp);
    onChange(newOtp.join(''));

    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }

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
    <div className="flex space-x-3 justify-center">
      {otp.map((data, index) => (
        <motion.input
          key={index}
          type="text"
          maxLength="1"
          value={data}
          onChange={e => handleChange(e.target, index)}
          onKeyDown={e => handleKeyDown(e, index)}
          onFocus={e => e.target.select()}
          className="w-14 h-14 text-center text-xl font-bold bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl focus:border-blue-400 focus:bg-white/20 focus:outline-none transition-all duration-300 text-white placeholder-white/50"
          whileFocus={{ scale: 1.1 }}
          disabled={loading}
        />
      ))}
    </div>
  );
};

// Main Flashy Auth Component
const FlashyAuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, isAuthenticated, user } = useAuth();

  // Read URL parameters for initial mode and method
  const urlParams = new URLSearchParams(location.search);
  const initialMode = urlParams.get('mode') || 'login'; // login, register
  const initialMethod = urlParams.get('method') || 'email'; // email, phone

  const [mode, setMode] = useState(initialMode);
  const [authMethod, setAuthMethod] = useState(initialMethod);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    otp: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
    state: 'Maharashtra',
    district: 'Pune',
    acceptTerms: false
  });

  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/dashboard';

  // Only redirect after successful authentication action, not on page load
  // This allows users to see the auth page even if they're already logged in
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate(redirectTo, { replace: true });
  //   }
  // }, [isAuthenticated, navigate, redirectTo]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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
          phone: '',
          role: 'farmer',
          location: {
            address: {
              district: formData.district,
              state: formData.state,
              country: 'India'
            }
          }
        });
      }

      if (result.success) {
        setSuccess(`${mode === 'login' ? 'Login' : 'Registration'} successful!`);
        
        if (login && result.user) {
          await login(result.user);
        }

        toast.success(`Welcome${result.user?.name ? `, ${result.user.name}` : ''}! 🌾`);
        
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 1500);
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

  const handlePhoneAuth = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = formData.phone.replace(/\s+/g, '');
      
      const result = await authService.sendOTP(
        cleanPhone,
        formData.firstName || '',
        formData.lastName || ''
      );
      
      if (result.success) {
        setSuccess('OTP sent to your phone! Check your messages 📱');
        setOtpSent(true);
        setMode('otp-verify');
        setResendCooldown(60);
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

  const handleOTPVerify = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = formData.phone.replace(/\s+/g, '');
      
      const result = await authService.verifyOTP(cleanPhone, formData.otp);
      
      if (result.success) {
        setSuccess('Phone verification successful! 🎉');
        
        if (login && result.user) {
          await login(result.user);
        }

        toast.success(`Welcome${result.user?.name ? `, ${result.user.name}` : ''}! 📱✨`);
        
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 1500);
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

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    try {
      const cleanPhone = formData.phone.replace(/\s+/g, '');
      
      const result = await authService.resendOTP(cleanPhone);
      
      if (result.success) {
        setSuccess('OTP resent successfully! 📱');
        setFormData(prev => ({ ...prev, otp: '' }));
        setResendCooldown(60);
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
    <div className="min-h-screen relative bg-gradient-to-br from-purple-900 via-blue-900 to-green-900 flex items-center justify-center p-4">
      <AnimatedBackground />
      
      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Animated Header */}
          <motion.div 
            className="relative bg-gradient-to-r from-purple-600/80 via-blue-600/80 to-green-600/80 backdrop-blur-md px-8 py-8 text-white overflow-hidden"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header Background Animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
              }}
            />
            
            <div className="relative text-center">
              <motion.div
                className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                <motion.span 
                  className="text-3xl"
                  animate={{ rotate: [0, -360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  🌾
                </motion.span>
              </motion.div>
              
              <motion.h1 
                className="text-3xl font-bold mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Smart Crop Advisory
              </motion.h1>
              
              <motion.p 
                className="text-white/90 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {isAuthenticated && user ? 
                  `👋 Hello ${user.name || user.email || 'User'} - Try new authentication!` :
                  mode === 'register' ? '🚀 Join the future of farming' :
                  mode === 'otp-verify' ? '📱 Verify your phone number' :
                  '✨ Welcome back, farmer!'}
              </motion.p>

              {/* Floating Icons */}
              <motion.div
                className="absolute top-4 right-4"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Shield className="w-6 h-6 text-white/50" />
              </motion.div>
              <motion.div
                className="absolute bottom-4 left-4"
                animate={{ rotate: [0, 15, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Zap className="w-6 h-6 text-white/50" />
              </motion.div>
            </div>
          </motion.div>

          {/* Form Content */}
          <div className="px-8 py-6">
            {/* Already Logged In Section */}
            {isAuthenticated && user && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-2xl p-4"
              >
                <div className="text-center">
                  <motion.div 
                    className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-xl">👋</span>
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Welcome back, {user.name || user.email || 'User'}! ✨
                  </h3>
                  <p className="text-blue-200 text-sm mb-4">
                    You're already logged in. You can continue to the dashboard or try a different authentication method.
                  </p>
                  <div className="flex space-x-3">
                    <motion.button
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl font-medium transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Go to Dashboard 🏠
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        logout();
                        setSuccess('');
                        setError('');
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl font-medium transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Logout 👋
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {/* Login/Register Forms */}
                {(mode === 'login' || mode === 'register') && (
                  <motion.div
                    key="auth-form"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    {/* Mode Toggle */}
                    <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20">
                      <motion.button
                        type="button"
                        onClick={() => setMode('login')}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          mode === 'login' 
                            ? 'bg-white text-purple-600 shadow-lg' 
                            : 'text-white/70 hover:text-white'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        ✨ Sign In
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => setMode('register')}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          mode === 'register' 
                            ? 'bg-white text-purple-600 shadow-lg' 
                            : 'text-white/70 hover:text-white'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        🚀 Sign Up
                      </motion.button>
                    </div>

                    {/* Auth Method Toggle */}
                    <div className="flex bg-white/5 backdrop-blur-md rounded-2xl p-1 border border-white/10">
                      <motion.button
                        type="button"
                        onClick={() => setAuthMethod('email')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all duration-300 flex items-center justify-center ${
                          authMethod === 'email' 
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'text-white/60 hover:text-white/80'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => setAuthMethod('phone')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all duration-300 flex items-center justify-center ${
                          authMethod === 'phone' 
                            ? 'bg-green-500 text-white shadow-md' 
                            : 'text-white/60 hover:text-white/80'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Phone
                      </motion.button>
                    </div>

                    {/* Registration fields */}
                    {mode === 'register' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            First Name ✨
                          </label>
                          <motion.input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/50 transition-all duration-300"
                            placeholder="John"
                            required
                            whileFocus={{ scale: 1.02 }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Last Name ✨
                          </label>
                          <motion.input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/50 transition-all duration-300"
                            placeholder="Doe"
                            required
                            whileFocus={{ scale: 1.02 }}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Email field */}
                    {authMethod === 'email' && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Email Address 📧
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                          <motion.input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/50 transition-all duration-300"
                            placeholder="john@example.com"
                            required
                            whileFocus={{ scale: 1.02 }}
                          />
                          <motion.div
                            className="absolute right-4 top-1/2 transform -translate-y-1/2"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 4, repeat: Infinity }}
                          >
                            <Star className="w-5 h-5 text-yellow-400/50" />
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                    {/* Phone field */}
                    {authMethod === 'phone' && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Phone Number 📱
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                          <motion.input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-white/50 transition-all duration-300"
                            placeholder="9876543210"
                            maxLength={10}
                            required
                            whileFocus={{ scale: 1.02 }}
                          />
                          <motion.div
                            className="absolute right-4 top-1/2 transform -translate-y-1/2"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Zap className="w-5 h-5 text-green-400/50" />
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                    {/* Password field */}
                    {authMethod === 'email' && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Password 🔐
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                          <motion.input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-white/50 transition-all duration-300"
                            placeholder={mode === 'register' ? 'Create strong password' : 'Enter your password'}
                            minLength={6}
                            required
                            whileFocus={{ scale: 1.02 }}
                          />
                          <motion.button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* Confirm password field */}
                    {mode === 'register' && authMethod === 'email' && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Confirm Password 🔒
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                          <motion.input
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-white/50 transition-all duration-300"
                            placeholder="Confirm your password"
                            minLength={6}
                            required
                            whileFocus={{ scale: 1.02 }}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Location fields for registration */}
                    {mode === 'register' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            State 🌍
                          </label>
                          <motion.select
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white transition-all duration-300"
                            whileFocus={{ scale: 1.02 }}
                          >
                            <option value="Maharashtra" className="text-gray-800">Maharashtra</option>
                            <option value="Karnataka" className="text-gray-800">Karnataka</option>
                            <option value="Tamil Nadu" className="text-gray-800">Tamil Nadu</option>
                            <option value="Gujarat" className="text-gray-800">Gujarat</option>
                          </motion.select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            District 📍
                          </label>
                          <motion.input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/50 transition-all duration-300"
                            placeholder="Your district"
                            whileFocus={{ scale: 1.02 }}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Terms and conditions */}
                    {mode === 'register' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-start"
                      >
                        <motion.input
                          type="checkbox"
                          name="acceptTerms"
                          checked={formData.acceptTerms}
                          onChange={handleInputChange}
                          className="mt-1 mr-3 w-5 h-5 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500 focus:ring-2"
                          required
                          whileTap={{ scale: 0.9 }}
                        />
                        <label className="text-sm text-white/80">
                          I agree to the{' '}
                          <motion.a 
                            href="#" 
                            className="text-blue-400 hover:text-blue-300 underline"
                            whileHover={{ scale: 1.05 }}
                          >
                            Terms of Service
                          </motion.a>
                          {' '}and{' '}
                          <motion.a 
                            href="#" 
                            className="text-blue-400 hover:text-blue-300 underline"
                            whileHover={{ scale: 1.05 }}
                          >
                            Privacy Policy
                          </motion.a>
                        </label>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* OTP Verification Form */}
                {mode === 'otp-verify' && (
                  <motion.div
                    key="otp-form"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-8 text-center"
                  >
                    <div>
                      <motion.div 
                        className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Phone className="w-10 h-10 text-white" />
                      </motion.div>
                      
                      <motion.h3 
                        className="text-2xl font-bold text-white mb-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        Verify Phone Number
                      </motion.h3>
                      
                      <p className="text-white/80">
                        We've sent a 6-digit code to<br />
                        <motion.span 
                          className="font-semibold text-blue-400"
                          animate={{ color: ['#60a5fa', '#34d399', '#60a5fa'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {formData.phone}
                        </motion.span>
                      </p>
                      <p className="text-white/60 mt-2 text-sm">
                        Enter the code to continue 📱✨
                      </p>
                    </div>

                    <OTPInput
                      length={6}
                      value={formData.otp}
                      onChange={(otp) => setFormData(prev => ({ ...prev, otp }))}
                      onComplete={(otp) => setFormData(prev => ({ ...prev, otp }))}
                      loading={loading}
                    />

                    <div className="text-center">
                      <p className="text-white/60 mb-3 text-sm">Didn't receive the code?</p>
                      <motion.button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resendCooldown > 0 || loading}
                        className="text-blue-400 hover:text-blue-300 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s ⏱️` : 'Resend Code 🔄'}
                      </motion.button>
                    </div>

                    <motion.button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setAuthMethod('phone');
                        setOtpSent(false);
                        setFormData(prev => ({ ...prev, otp: '' }));
                      }}
                      className="text-white/70 hover:text-white text-sm flex items-center justify-center w-full"
                      whileHover={{ scale: 1.02 }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Change phone number
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error/Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl p-4 flex items-center"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                    <span className="text-sm text-red-300">{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="bg-green-500/20 backdrop-blur-md border border-green-500/30 rounded-2xl p-4 flex items-center"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-sm text-green-300">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Buttons */}
              {mode !== 'otp-verify' && (
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-purple-700 hover:via-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <div className="relative flex items-center justify-center">
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      <>
                        <span>
                          {authMethod === 'phone' ? '📱 Send OTP' : 
                           mode === 'register' ? '🚀 Create Account' : '✨ Sign In'}
                        </span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </motion.div>
                      </>
                    )}
                  </div>
                </motion.button>
              )}

              {/* OTP Verify Button */}
              {mode === 'otp-verify' && (
                <motion.button
                  type="submit"
                  disabled={loading || !formData.otp || formData.otp.length !== 6}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-green-700 hover:via-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <div className="relative flex items-center justify-center">
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      <>
                        <span>🎉 Verify & Continue</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </motion.div>
                      </>
                    )}
                  </div>
                </motion.button>
              )}

              {/* Google Authentication */}
              {mode !== 'otp-verify' && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-transparent text-white/60">or continue with</span>
                    </div>
                  </div>

                  <GoogleAuthButton
                    onSuccess={(user) => {
                      setSuccess('Google authentication successful! 🎉');
                      if (login) login(user);
                      setTimeout(() => navigate(redirectTo, { replace: true }), 1500);
                    }}
                    onError={(error) => {
                      setError(error.message || 'Google authentication failed');
                    }}
                    disabled={loading}
                    loading={loading}
                    setLoading={setLoading}
                  />
                </>
              )}
            </form>

            {/* Footer */}
            <motion.div 
              className="mt-8 text-center space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                onClick={() => navigate('/')}
                className="text-white/60 hover:text-white/80 text-sm flex items-center justify-center w-full transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Home 🏠
              </motion.button>
              
              {/* Dev Helper - Clear Auth Data */}
              {process.env.NODE_ENV === 'development' && (
                <motion.button
                  onClick={() => {
                    localStorage.removeItem('farmora_token');
                    localStorage.removeItem('farmora_user');
                    localStorage.removeItem('farmora_refresh_token');
                    window.location.reload();
                  }}
                  className="text-red-400/60 hover:text-red-400/80 text-xs flex items-center justify-center w-full transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  🧹 Clear Auth Data (Dev)
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Bottom Floating Elements */}
        <motion.div
          className="absolute -bottom-4 left-4 text-6xl opacity-10"
          animate={{ 
            y: [-10, 10, -10],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          🌱
        </motion.div>
        <motion.div
          className="absolute -bottom-4 right-4 text-6xl opacity-10"
          animate={{ 
            y: [10, -10, 10],
            rotate: [0, -5, 5, 0]
          }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          🚀
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FlashyAuthPage;