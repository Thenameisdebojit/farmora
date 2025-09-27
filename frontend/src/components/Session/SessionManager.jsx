// Session Manager for comprehensive user session handling
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Clock, 
  LogOut,
  RefreshCw,
  User,
  Shield,
  Activity,
  X
} from 'lucide-react';

const SessionManager = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [sessionWarning, setSessionWarning] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionInfo, setSessionInfo] = useState({
    issuedAt: null,
    expiresAt: null,
    lastActivity: null
  });

  // Session timeout warning threshold (5 minutes before expiry)
  const WARNING_THRESHOLD = 5 * 60 * 1000;

  // Check session status
  const checkSession = useCallback(() => {
    if (!isAuthenticated || !user) return;

    const token = authService.getToken();
    if (!token) {
      handleSessionExpiry();
      return;
    }

    try {
      // Decode JWT token to get expiry time
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now();
      const expiry = payload.exp * 1000; // Convert to milliseconds
      const timeUntilExpiry = expiry - now;

      setSessionInfo({
        issuedAt: new Date(payload.iat * 1000),
        expiresAt: new Date(expiry),
        lastActivity: new Date()
      });

      // Check if session is expired
      if (timeUntilExpiry <= 0) {
        handleSessionExpiry();
        return;
      }

      // Check if we should show warning
      if (timeUntilExpiry <= WARNING_THRESHOLD && !sessionWarning) {
        setSessionWarning(true);
        setTimeLeft(Math.floor(timeUntilExpiry / 1000));
      } else if (timeUntilExpiry > WARNING_THRESHOLD && sessionWarning) {
        setSessionWarning(false);
        setTimeLeft(0);
      }

      // Update time left if warning is active
      if (sessionWarning) {
        setTimeLeft(Math.floor(timeUntilExpiry / 1000));
      }

    } catch (error) {
      console.error('Error checking session:', error);
      handleSessionExpiry();
    }
  }, [isAuthenticated, user, sessionWarning]);

  // Handle session expiry
  const handleSessionExpiry = useCallback(() => {
    setSessionExpired(true);
    setSessionWarning(false);
    
    setTimeout(() => {
      logout();
      window.location.href = '/login?expired=true';
    }, 3000);
  }, [logout]);

  // Extend session
  const extendSession = useCallback(async () => {
    try {
      const result = await authService.refreshToken();
      if (result) {
        setSessionWarning(false);
        setTimeLeft(0);
      } else {
        handleSessionExpiry();
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
      handleSessionExpiry();
    }
  }, [handleSessionExpiry]);

  // Track user activity to extend session
  const trackActivity = useCallback(() => {
    if (isAuthenticated) {
      setSessionInfo(prev => ({
        ...prev,
        lastActivity: new Date()
      }));
    }
  }, [isAuthenticated]);

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check session immediately
    checkSession();

    // Set up interval to check session every 30 seconds
    const sessionCheckInterval = setInterval(checkSession, 30000);

    // Set up activity tracking
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const activityThrottle = 60000; // Track activity at most once per minute
    let lastActivityTime = 0;

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityTime > activityThrottle) {
        trackActivity();
        lastActivityTime = now;
      }
    };

    // Add activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup
    return () => {
      clearInterval(sessionCheckInterval);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAuthenticated, checkSession, trackActivity]);

  // Session Warning Modal
  const SessionWarningModal = () => (
    <AnimatePresence>
      {sessionWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-orange-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Session Expiring Soon</h3>
                <p className="text-sm text-gray-600">Your session will expire in:</p>
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {formatTimeRemaining(timeLeft)}
              </div>
              <p className="text-gray-600 text-sm">
                Extend your session to continue working
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={extendSession}
                className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <RefreshCw size={16} />
                <span>Extend Session</span>
              </button>
              <button
                onClick={() => {
                  setSessionWarning(false);
                  logout();
                }}
                className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>

            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-orange-700">
                  For your security, sessions automatically expire after a period of inactivity.
                  Extending your session will keep you logged in for another session period.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Session Expired Modal
  const SessionExpiredModal = () => (
    <AnimatePresence>
      {sessionExpired && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-red-200"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-red-600" size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Session Expired</h3>
              <p className="text-gray-600 mb-6">
                Your session has expired for security reasons. You'll be redirected to the login page shortly.
              </p>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <motion.div
                  className="bg-red-600 h-2 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                />
              </div>

              <button
                onClick={() => {
                  setSessionExpired(false);
                  logout();
                  window.location.href = '/login';
                }}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Login Again
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Session Info Badge (for development/admin)
  const SessionInfoBadge = () => {
    if (!isAuthenticated || !sessionInfo.expiresAt) return null;

    const now = new Date();
    const timeUntilExpiry = sessionInfo.expiresAt.getTime() - now.getTime();
    const isExpiringSoon = timeUntilExpiry <= WARNING_THRESHOLD;

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 right-4 z-40"
      >
        <div className={`bg-white rounded-lg shadow-lg border-l-4 p-3 text-xs max-w-xs ${
          isExpiringSoon ? 'border-orange-400' : 'border-green-400'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <User className={isExpiringSoon ? 'text-orange-600' : 'text-green-600'} size={14} />
            <span className="font-medium text-gray-900">Session Info</span>
          </div>
          <div className="space-y-1 text-gray-600">
            <p>User: {user?.name || user?.email}</p>
            <p>Expires: {sessionInfo.expiresAt.toLocaleTimeString()}</p>
            <p>Last Activity: {sessionInfo.lastActivity?.toLocaleTimeString()}</p>
            {isExpiringSoon && (
              <p className="text-orange-600 font-medium">
                ⚠️ Expiring in {formatTimeRemaining(Math.floor(timeUntilExpiry / 1000))}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {children}
      <SessionWarningModal />
      <SessionExpiredModal />
      {process.env.NODE_ENV === 'development' && <SessionInfoBadge />}
    </>
  );
};

export default SessionManager;