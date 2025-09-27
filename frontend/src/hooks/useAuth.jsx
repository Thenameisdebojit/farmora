// src/hooks/useAuth.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import authService from '../services/authService';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initialize authentication using authService
    const initializeAuth = () => {
      try {
        const isAuth = authService.isAuthenticated();
        const userData = authService.getUser();
        
        if (isAuth && userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    
    // Listen to auth state changes
    const unsubscribe = authService.addAuthListener((event, data) => {
      switch (event) {
        case 'login':
        case 'register':
        case 'init':
          setUser(data);
          setIsAuthenticated(true);
          break;
        case 'logout':
          setUser(null);
          setIsAuthenticated(false);
          break;
        case 'profileUpdate':
          setUser(data);
          break;
        default:
          break;
      }
    });
    
    return unsubscribe;
  }, []);

  const login = async (userData) => {
    try {
      setLoading(true);
      
      // Use userData directly if it's from successful backend authentication
      // The actual backend call should be done before calling this function
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, user: userData };
      }
      
      return { success: false, error: 'No user data provided' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Use authService logout which handles backend call and cleanup
      await authService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      const result = await authService.updateProfile(userData);
      
      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      }
      
      return { success: false, error: result.message };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  };

  const getAuthToken = () => {
    return authService.getToken();
  };

  const isTokenValid = () => {
    return authService.isAuthenticated();
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    getAuthToken,
    isTokenValid
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Higher-order component for protected routes
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
      return (
        <div className="auth-loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return (
        <div className="auth-required">
          <p>Please log in to access this feature.</p>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};

export default useAuth;