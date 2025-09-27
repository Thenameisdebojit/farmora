// frontend/src/components/auth/LoginRegister.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import authService from '../../services/authService';

const LoginRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // Form data states
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    location: {
      state: '',
      district: '',
      coordinates: {
        latitude: '',
        longitude: ''
      }
    },
    farmDetails: {
      farmSize: '',
      soilType: 'loam',
      primaryCrops: [],
      irrigationType: 'manual',
      organicCertified: false
    },
    preferences: {
      language: 'en',
      notifications: {
        weather: true,
        market: true,
        pest: true,
        irrigation: true,
        consultation: true
      }
    }
  });

  useEffect(() => {
    // Clear errors when switching between login/register
    setErrors({});
    setSuccess('');
  }, [isLogin]);

  useEffect(() => {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, location]);

  // Form validation
  const validateLoginForm = () => {
    const newErrors = {};

    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!loginData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (loginData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors = {};

    if (!registerData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!registerData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!registerData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!registerData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(registerData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!registerData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (registerData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!registerData.location.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!registerData.location.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (registerData.role === 'farmer') {
      if (!registerData.farmDetails.farmSize) {
        newErrors.farmSize = 'Farm size is required';
      } else if (isNaN(registerData.farmDetails.farmSize) || Number(registerData.farmDetails.farmSize) <= 0) {
        newErrors.farmSize = 'Farm size must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form handlers
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await authService.login(loginData);
      
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        const redirectTo = location.state?.from?.pathname || '/dashboard';
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 1000);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Prepare registration data
      const registrationData = {
        ...registerData,
        name: `${registerData.firstName} ${registerData.lastName}`, // For backward compatibility
        farmDetails: {
          ...registerData.farmDetails,
          farmSize: Number(registerData.farmDetails.farmSize)
        }
      };

      const result = await authService.register(registrationData);
      
      if (result.success) {
        setSuccess('Registration successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value, isNestedField = false) => {
    if (isLogin) {
      setLoginData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      if (isNestedField) {
        const [parent, child] = field.split('.');
        setRegisterData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      } else {
        setRegisterData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    }

    // Clear error when user starts typing
    if (errors[field] || errors[field?.split('.')[1]]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        delete newErrors[field?.split('.')[1]];
        return newErrors;
      });
    }
  };

  const LoginForm = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to your Smart Crop Advisory account</p>
      </div>

      {errors.general && (
        <div className="alert alert-error">
          <ExclamationCircleIcon className="w-5 h-5" />
          {errors.general}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircleIcon className="w-5 h-5" />
          {success}
        </div>
      )}

      <Input
        id="email"
        type="email"
        label="Email Address"
        placeholder="Enter your email"
        value={loginData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        leftIcon={<EnvelopeIcon className="w-5 h-5" />}
        error={errors.email}
        required
      />

      <Input
        id="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        value={loginData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        leftIcon={<LockClosedIcon className="w-5 h-5" />}
        error={errors.password}
        required
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input type="checkbox" className="rounded border-gray-300 mr-2" />
          <span className="text-sm text-gray-600">Remember me</span>
        </label>
        <button
          type="button"
          className="text-sm text-primary-600 hover:text-primary-700"
          onClick={() => {/* TODO: Implement forgot password */}}
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
      >
        Sign In
      </Button>

      <div className="text-center">
        <span className="text-gray-600">Don't have an account? </span>
        <button
          type="button"
          className="text-primary-600 hover:text-primary-700 font-medium"
          onClick={() => setIsLogin(false)}
        >
          Sign up
        </button>
      </div>
    </form>
  );

  const RegisterForm = () => (
    <form onSubmit={handleRegisterSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-600 mt-2">Join Smart Crop Advisory today</p>
      </div>

      {errors.general && (
        <div className="alert alert-error">
          <ExclamationCircleIcon className="w-5 h-5" />
          {errors.general}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircleIcon className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="firstName"
          label="First Name"
          placeholder="John"
          value={registerData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          leftIcon={<UserIcon className="w-5 h-5" />}
          error={errors.firstName}
          required
        />

        <Input
          id="lastName"
          label="Last Name"
          placeholder="Doe"
          value={registerData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          leftIcon={<UserIcon className="w-5 h-5" />}
          error={errors.lastName}
          required
        />
      </div>

      <Input
        id="email"
        type="email"
        label="Email Address"
        placeholder="john@example.com"
        value={registerData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        leftIcon={<EnvelopeIcon className="w-5 h-5" />}
        error={errors.email}
        required
      />

      <Input
        id="phone"
        type="tel"
        label="Phone Number"
        placeholder="1234567890"
        value={registerData.phone}
        onChange={(e) => handleInputChange('phone', e.target.value)}
        leftIcon={<PhoneIcon className="w-5 h-5" />}
        error={errors.phone}
        required
      />

      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          I am a *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['farmer', 'expert', 'consultant'].map((role) => (
            <label key={role} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="role"
                value={role}
                checked={registerData.role === role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="mr-3"
              />
              <span className="capitalize font-medium">{role}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="Enter password"
          value={registerData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          leftIcon={<LockClosedIcon className="w-5 h-5" />}
          error={errors.password}
          helperText="Must contain uppercase, lowercase, and number"
          required
        />

        <Input
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Confirm password"
          value={registerData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          leftIcon={<LockClosedIcon className="w-5 h-5" />}
          error={errors.confirmPassword}
          required
        />
      </div>

      {/* Location Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="state"
          label="State"
          placeholder="e.g., Punjab"
          value={registerData.location.state}
          onChange={(e) => handleInputChange('location.state', e.target.value, true)}
          leftIcon={<MapPinIcon className="w-5 h-5" />}
          error={errors.state}
          required
        />

        <Input
          id="district"
          label="District"
          placeholder="e.g., Ludhiana"
          value={registerData.location.district}
          onChange={(e) => handleInputChange('location.district', e.target.value, true)}
          leftIcon={<MapPinIcon className="w-5 h-5" />}
          error={errors.district}
          required
        />
      </div>

      {/* Farm Details (only for farmers) */}
      {registerData.role === 'farmer' && (
        <>
          <h3 className="text-lg font-semibold text-gray-900 border-t pt-6">Farm Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="farmSize"
              type="number"
              label="Farm Size (acres)"
              placeholder="e.g., 5"
              value={registerData.farmDetails.farmSize}
              onChange={(e) => handleInputChange('farmDetails.farmSize', e.target.value, true)}
              leftIcon={<BuildingOfficeIcon className="w-5 h-5" />}
              error={errors.farmSize}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soil Type *
              </label>
              <select
                value={registerData.farmDetails.soilType}
                onChange={(e) => handleInputChange('farmDetails.soilType', e.target.value, true)}
                className="input w-full"
              >
                <option value="loam">Loam</option>
                <option value="clay">Clay</option>
                <option value="sandy">Sandy</option>
                <option value="silt">Silt</option>
                <option value="peat">Peat</option>
                <option value="chalk">Chalk</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Irrigation Type
            </label>
            <select
              value={registerData.farmDetails.irrigationType}
              onChange={(e) => handleInputChange('farmDetails.irrigationType', e.target.value, true)}
              className="input w-full"
            >
              <option value="manual">Manual</option>
              <option value="drip">Drip</option>
              <option value="sprinkler">Sprinkler</option>
              <option value="flood">Flood</option>
            </select>
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={registerData.farmDetails.organicCertified}
              onChange={(e) => handleInputChange('farmDetails.organicCertified', e.target.checked, true)}
              className="rounded border-gray-300 mr-3"
            />
            <span className="text-sm text-gray-700">I have organic certification</span>
          </label>
        </>
      )}

      <div className="border-t pt-6">
        <label className="flex items-center">
          <input type="checkbox" className="rounded border-gray-300 mr-3" required />
          <span className="text-sm text-gray-700">
            I agree to the{' '}
            <button type="button" className="text-primary-600 hover:text-primary-700">
              Terms of Service
            </button>
            {' '}and{' '}
            <button type="button" className="text-primary-600 hover:text-primary-700">
              Privacy Policy
            </button>
          </span>
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
      >
        Create Account
      </Button>

      <div className="text-center">
        <span className="text-gray-600">Already have an account? </span>
        <button
          type="button"
          className="text-primary-600 hover:text-primary-700 font-medium"
          onClick={() => setIsLogin(true)}
        >
          Sign in
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <Card size="lg" className="shadow-xl">
          {isLogin ? <LoginForm /> : <RegisterForm />}
        </Card>
      </div>
    </div>
  );
};

export default LoginRegister;