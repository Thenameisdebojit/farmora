// backend/src/routes/notificationRoutes.js
const express = require('express');
const {
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  getNotification,
  markAsRead,
  markMultipleAsRead,
  markAllAsRead,
  dismissNotification,
  trackInteraction,
  getAnalytics,
  getUnreadCounts,
  searchNotifications,
  getAllNotifications,
  processScheduledNotifications,
  cleanupExpired
} = require('../controllers/notificationController');

const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @route   POST /api/notifications
 * @desc    Create a new notification
 * @access  Private (Admin/Expert)
 */
router.post('/', restrictTo('admin', 'expert'), createNotification);

/**
 * @route   POST /api/notifications/bulk
 * @desc    Create bulk notifications
 * @access  Private (Admin only)
 */
router.post('/bulk', restrictTo('admin'), createBulkNotifications);

/**
 * @route   GET /api/notifications/me
 * @desc    Get current user's notifications
 * @access  Private
 */
router.get('/me', getUserNotifications);

/**
 * @route   GET /api/notifications/user/:userId
 * @desc    Get specific user's notifications (admin/expert only)
 * @access  Private (Admin/Expert)
 */
router.get('/user/:userId', restrictTo('admin', 'expert'), getUserNotifications);

/**
 * @route   GET /api/notifications/search
 * @desc    Search notifications for current user
 * @access  Private
 */
router.get('/search', searchNotifications);

/**
 * @route   GET /api/notifications/unread/counts
 * @desc    Get unread notification counts by category
 * @access  Private
 */
router.get('/unread/counts', getUnreadCounts);

/**
 * @route   GET /api/notifications/analytics
 * @desc    Get notification analytics
 * @access  Private (Admin only)
 */
router.get('/analytics', restrictTo('admin'), getAnalytics);

/**
 * @route   GET /api/notifications/admin/all
 * @desc    Get all notifications with advanced filtering (admin only)
 * @access  Private (Admin only)
 */
router.get('/admin/all', restrictTo('admin'), getAllNotifications);

/**
 * @route   POST /api/notifications/process-scheduled
 * @desc    Process scheduled notifications (system cron job)
 * @access  Private (Admin only)
 */
router.post('/process-scheduled', restrictTo('admin'), processScheduledNotifications);

/**
 * @route   DELETE /api/notifications/cleanup-expired
 * @desc    Clean up expired notifications
 * @access  Private (Admin only)
 */
router.delete('/cleanup-expired', restrictTo('admin'), cleanupExpired);

/**
 * @route   GET /api/notifications/:id
 * @desc    Get notification by ID
 * @access  Private
 */
router.get('/:id', getNotification);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch('/:id/read', markAsRead);

/**
 * @route   PATCH /api/notifications/:id/dismiss
 * @desc    Dismiss notification
 * @access  Private
 */
router.patch('/:id/dismiss', dismissNotification);

/**
 * @route   POST /api/notifications/:id/track
 * @desc    Track notification interaction
 * @access  Private
 */
router.post('/:id/track', trackInteraction);

/**
 * @route   PATCH /api/notifications/mark-multiple-read
 * @desc    Mark multiple notifications as read
 * @access  Private
 */
router.patch('/mark-multiple-read', markMultipleAsRead);

/**
 * @route   PATCH /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/mark-all-read', markAllAsRead);

module.exports = router;
