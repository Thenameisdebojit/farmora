// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError, catchAsync } = require('../utils/errorHandler');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  
  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user
    }
  });
};

// Register user
exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, name, email, password, role, phone, phoneNumber, location, farmDetails, expertise } = req.body;

  // Use phone or phoneNumber (backwards compatibility)
  const userPhone = phone || phoneNumber;

  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [{ email }, { phone: userPhone }] 
  });

  if (existingUser) {
    return next(new AppError('User already exists with this email or phone number', 400));
  }

  // Create user data (password will be hashed by pre-save middleware)
  const userData = {
    firstName: firstName || name?.split(' ')[0] || 'User',
    lastName: lastName || name?.split(' ').slice(1).join(' ') || 'Name',
    name: name || `${firstName} ${lastName}`,
    email,
    password,
    role: role || 'farmer',
    phone: userPhone,
    location,
    isActive: true,
    isVerified: false
  };

  // Add role-specific data
  if (role === 'farmer' && farmDetails) {
    userData.farmDetails = farmDetails;
  }

  if (role === 'expert' && expertise) {
    userData.expertise = expertise;
  }

  const user = await User.create(userData);

  sendTokenResponse(user, 201, res);
});

// Login user
exports.login = catchAsync(async (req, res, next) => {
  const { email, phone, password } = req.body;

  // Validate input - must have either email or phone, plus password
  if (!password) {
    return next(new AppError('Please provide password', 400));
  }
  
  if (!email && !phone) {
    return next(new AppError('Please provide email or phone number', 400));
  }

  // Build query to find user by email or phone
  let query = {};
  if (email) {
    query.email = email;
  } else if (phone) {
    query.phone = phone;
  }

  // Check for user
  const user = await User.findOne(query).select('+password');

  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Account is deactivated. Please contact support', 401));
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// Get current user
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

// Update user details
exports.updateDetails = catchAsync(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || req.body.phoneNumber,
    location: req.body.location,
    farmDetails: req.body.farmDetails,
    expertise: req.body.expertise,
    preferences: req.body.preferences || req.body.notificationPreferences
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

// Update password
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400));
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Set new password (will be hashed by pre-save middleware)
  user.password = newPassword;

  await user.save();

  sendTokenResponse(user, 200, res);
});

// Forgot password (placeholder for email implementation)
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide email address', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('No user found with that email address', 404));
  }

  // In a real implementation, you would:
  // 1. Generate a reset token
  // 2. Save it to user document with expiry
  // 3. Send email with reset link
  
  // For now, just send success message
  res.status(200).json({
    success: true,
    message: 'Password reset instructions sent to email (Feature not fully implemented)'
  });
});

// Reset password (placeholder)
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(new AppError('Please provide token and new password', 400));
  }

  // In real implementation:
  // 1. Hash the token and find user
  // 2. Check if token hasn't expired
  // 3. Update password
  
  res.status(200).json({
    success: true,
    message: 'Password reset successful (Feature not fully implemented)'
  });
});

// Logout (client-side token removal)
exports.logout = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
});

// Get all users (admin only)
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};
  if (req.query.role) {
    filter.role = req.query.role;
  }
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  const users = await User.find(filter)
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: users.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      users
    }
  });
});

// Get single user (admin only)
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

// Update user (admin only)
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

// Delete user (admin only)
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Soft delete (deactivate) instead of hard delete
  user.isActive = false;
  user.deactivatedAt = new Date();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully'
  });
});

// Register device token for push notifications
exports.registerDeviceToken = catchAsync(async (req, res, next) => {
  const { deviceToken, deviceType, deviceInfo } = req.body;

  if (!deviceToken) {
    return next(new AppError('Device token is required', 400));
  }

  const user = await User.findById(req.user.id);

  // Add or update device token
  const existingTokenIndex = user.deviceTokens.findIndex(
    token => token.token === deviceToken
  );

  if (existingTokenIndex !== -1) {
    // Update existing token
    user.deviceTokens[existingTokenIndex] = {
      token: deviceToken,
      deviceType: deviceType || 'unknown',
      deviceInfo: deviceInfo || {},
      registeredAt: new Date(),
      isActive: true
    };
  } else {
    // Add new token
    user.deviceTokens.push({
      token: deviceToken,
      deviceType: deviceType || 'unknown',
      deviceInfo: deviceInfo || {},
      registeredAt: new Date(),
      isActive: true
    });
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Device token registered successfully'
  });
});

// Remove device token
exports.removeDeviceToken = catchAsync(async (req, res, next) => {
  const { deviceToken } = req.body;

  if (!deviceToken) {
    return next(new AppError('Device token is required', 400));
  }

  const user = await User.findById(req.user.id);

  user.deviceTokens = user.deviceTokens.filter(
    token => token.token !== deviceToken
  );

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Device token removed successfully'
  });
});