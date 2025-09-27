// Simple Login Page for Smart Crop Advisory
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import authService from '../../services/authService';

const SimpleLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  // Get the redirect path from URL params or default to dashboard
  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log(`User is authenticated, redirecting to ${redirectTo}...`);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    console.log('🔄 Starting login process...');
    console.log('Form data:', { email: formData.email, password: '***' });

    try {
      // Validate form
      if (!formData.email || !formData.password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      console.log('📞 Calling authService.login...');
      
      // Call authService login (which handles the API call)
      const result = await authService.login({
        email: formData.email,
        password: formData.password
      });

      console.log('📨 AuthService response:', result);

      if (!result.success) {
        console.error('❌ Login failed:', result.message);
        setError(result.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      console.log('✅ Login successful, user data:', result.user);
      setSuccess('Login successful! Redirecting to dashboard...');

      // Update auth context with user data
      if (login && result.user) {
        console.log('🔄 Updating auth context...');
        const loginResult = await login(result.user);
        console.log('Auth context update result:', loginResult);
      }

      // Wait a moment for state updates, then redirect
      setTimeout(() => {
        console.log(`🚀 Redirecting to ${redirectTo}...`);
        navigate(redirectTo, { replace: true });
      }, 1500);

    } catch (err) {
      console.error('💥 Unexpected error during login:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '1.5rem',
          color: '#1f2937',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          🌾 Smart Crop Advisory - Login
        </h1>


        {/* Success Message */}
        {success && (
          <div style={{
            backgroundColor: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #22c55e',
            borderRadius: '4px',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            ✅ {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #ef4444',
            borderRadius: '4px',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#374151'
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#374151'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#9ca3af' : '#059669',
              color: 'white',
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? '🔄 Signing In...' : '🚀 Sign In'}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/auth?mode=register')}
            style={{
              background: 'none',
              border: 'none',
              color: '#059669',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Sign up here
          </button>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '1rem',
          fontSize: '0.875rem'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer'
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoginPage;