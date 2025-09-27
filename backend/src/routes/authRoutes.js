// backend/src/routes/authRoutes.js
const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  registerDeviceToken,
  removeDeviceToken
} = require('../controllers/authController');

const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validatePagination, sanitizeInput } = require('../middleware/validationMiddleware');

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (require authentication)
router.use(protect);

// User profile routes
router.get('/me', getMe);
router.put('/me', updateDetails);
router.put('/update-password', updatePassword);
router.post('/logout', logout);

// Device token management
router.post('/device-token', registerDeviceToken);
router.delete('/device-token', removeDeviceToken);

// Admin only routes
router.use(restrictTo('admin'));

// User management routes (admin only)
router.get('/users', validatePagination, getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;