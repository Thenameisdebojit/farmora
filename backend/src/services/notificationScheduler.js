// backend/src/services/notificationScheduler.js
const cron = require('node-cron');
const Notification = require('../models/Notification');
const User = require('../models/User');
// const CropManagement = require('../models/CropManagement'); // Commented out temporarily
const { sendNotificationImmediately } = require('../controllers/notificationController');
// const { sendTemplatedEmail } = require('./emailService');
// const { sendTemplatedSMS } = require('./smsService');
// const { sendTemplatedPush } = require('./pushNotificationService');

class NotificationScheduler {
  constructor() {
    this.scheduledJobs = new Map();
    this.isRunning = false;
  }

  /**
   * Initialize the notification scheduler
   */
  init() {
    if (this.isRunning) return;
    
    console.log('Initializing Notification Scheduler...');
    
    // Schedule periodic tasks
    this.schedulePeriodicTasks();
    
    // Schedule crop-specific notifications (temporarily disabled)
    // this.scheduleCropNotifications();
    
    // Schedule weather alerts check (temporarily disabled)
    // this.scheduleWeatherAlerts();
    
    // Schedule market updates (temporarily disabled)
    // this.scheduleMarketUpdates();
    
    this.isRunning = true;
    console.log('Notification Scheduler initialized successfully');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    console.log('Stopping Notification Scheduler...');
    
    // Destroy all scheduled jobs
    this.scheduledJobs.forEach((job, key) => {
      if (job && typeof job.destroy === 'function') {
        job.destroy();
        console.log(`Destroyed job: ${key}`);
      } else if (job && typeof job.stop === 'function') {
        job.stop();
        console.log(`Stopped job: ${key}`);
      }
    });
    
    this.scheduledJobs.clear();
    this.isRunning = false;
    
    console.log('Notification Scheduler stopped');
  }

  /**
   * Schedule periodic maintenance tasks
   */
  schedulePeriodicTasks() {
    // Process scheduled notifications every 5 minutes
    const processScheduledJob = cron.schedule('*/5 * * * *', async () => {
      try {
        await this.processScheduledNotifications();
      } catch (error) {
        console.error('Error processing scheduled notifications:', error);
      }
    }, { scheduled: false });

    // Cleanup expired notifications daily at 2 AM
    const cleanupJob = cron.schedule('0 2 * * *', async () => {
      try {
        await this.cleanupExpiredNotifications();
      } catch (error) {
        console.error('Error cleaning up expired notifications:', error);
      }
    }, { scheduled: false });

    // Generate daily digest notifications at 8 AM
    const digestJob = cron.schedule('0 8 * * *', async () => {
      try {
        await this.generateDailyDigest();
      } catch (error) {
        console.error('Error generating daily digest:', error);
      }
    }, { scheduled: false });

    // Start the jobs
    processScheduledJob.start();
    cleanupJob.start();
    digestJob.start();

    // Store jobs for management
    this.scheduledJobs.set('processScheduled', processScheduledJob);
    this.scheduledJobs.set('cleanup', cleanupJob);
    this.scheduledJobs.set('dailyDigest', digestJob);

    console.log('Periodic tasks scheduled successfully');
  }

  /**
   * Schedule crop-related notifications
   */
  scheduleCropNotifications() {
    // Check for irrigation reminders every hour
    const irrigationJob = cron.schedule('0 * * * *', async () => {
      try {
        await this.checkIrrigationReminders();
      } catch (error) {
        console.error('Error checking irrigation reminders:', error);
      }
    }, { scheduled: false });

    // Check for fertilizer schedules every 6 hours
    const fertilizerJob = cron.schedule('0 */6 * * *', async () => {
      try {
        await this.checkFertilizerSchedules();
      } catch (error) {
        console.error('Error checking fertilizer schedules:', error);
      }
    }, { scheduled: false });

    // Check for harvest readiness daily at 6 AM
    const harvestJob = cron.schedule('0 6 * * *', async () => {
      try {
        await this.checkHarvestReadiness();
      } catch (error) {
        console.error('Error checking harvest readiness:', error);
      }
    }, { scheduled: false });

    // Check crop stage updates daily at 7 AM
    const cropStageJob = cron.schedule('0 7 * * *', async () => {
      try {
        await this.checkCropStageUpdates();
      } catch (error) {
        console.error('Error checking crop stage updates:', error);
      }
    }, { scheduled: false });

    // Start the jobs
    irrigationJob.start();
    fertilizerJob.start();
    harvestJob.start();
    cropStageJob.start();

    // Store jobs for management
    this.scheduledJobs.set('irrigation', irrigationJob);
    this.scheduledJobs.set('fertilizer', fertilizerJob);
    this.scheduledJobs.set('harvest', harvestJob);
    this.scheduledJobs.set('cropStage', cropStageJob);

    console.log('Crop notification tasks scheduled successfully');
  }

  /**
   * Schedule weather alert checks
   */
  scheduleWeatherAlerts() {
    // Check weather conditions every 30 minutes
    const weatherJob = cron.schedule('*/30 * * * *', async () => {
      try {
        await this.checkWeatherAlerts();
      } catch (error) {
        console.error('Error checking weather alerts:', error);
      }
    }, { scheduled: false });

    weatherJob.start();
    this.scheduledJobs.set('weather', weatherJob);

    console.log('Weather alert checks scheduled successfully');
  }

  /**
   * Schedule market update notifications
   */
  scheduleMarketUpdates() {
    // Send market updates twice daily - 9 AM and 5 PM
    const marketJob = cron.schedule('0 9,17 * * *', async () => {
      try {
        await this.sendMarketUpdates();
      } catch (error) {
        console.error('Error sending market updates:', error);
      }
    }, { scheduled: false });

    marketJob.start();
    this.scheduledJobs.set('market', marketJob);

    console.log('Market update notifications scheduled successfully');
  }

  /**
   * Process scheduled notifications
   */
  async processScheduledNotifications() {
    console.log('Processing scheduled notifications...');
    
    const pendingNotifications = await Notification.findPending()
      .populate('recipient', 'name email phoneNumber deviceTokens preferredLanguage');

    let processed = 0;
    let successful = 0;
    let failed = 0;

    for (const notification of pendingNotifications) {
      processed++;
      try {
        await sendNotificationImmediately(notification);
        successful++;
        console.log(`Sent scheduled notification: ${notification._id}`);
      } catch (error) {
        failed++;
        await notification.markFailed('system', error);
        console.error(`Failed to send notification ${notification._id}:`, error.message);
      }
    }

    if (processed > 0) {
      console.log(`Processed ${processed} scheduled notifications: ${successful} successful, ${failed} failed`);
    }

    return { processed, successful, failed };
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications() {
    console.log('Cleaning up expired notifications...');
    
    const result = await Notification.cleanupExpired();
    
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} expired notifications`);
    }

    return result;
  }

  /**
   * Generate daily digest notifications
   */
  async generateDailyDigest() {
    console.log('Generating daily digest notifications...');
    
    const users = await User.find({ 
      role: 'farmer',
      'notificationPreferences.dailyDigest': { $ne: false }
    }).select('name email phoneNumber deviceTokens preferredLanguage location');

    let digestsSent = 0;

    for (const user of users) {
      try {
        // Get user's unread notifications from the last 24 hours
        const unreadNotifications = await Notification.find({
          recipient: user._id,
          readAt: { $exists: false },
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          type: { $ne: 'daily_digest' } // Don't include previous digests
        }).limit(10);

        if (unreadNotifications.length === 0) continue;

        // Create digest notification
        const digestData = {
          recipient: user._id,
          type: 'daily_digest',
          category: 'system',
          priority: 'low',
          title: 'Daily Activity Summary',
          message: `You have ${unreadNotifications.length} unread notifications`,
          data: {
            unreadCount: unreadNotifications.length,
            notifications: unreadNotifications.slice(0, 5).map(n => ({
              type: n.type,
              title: n.title,
              createdAt: n.createdAt
            }))
          },
          source: {
            type: 'system',
            name: 'Daily Digest',
            automated: true
          },
          deliveryMethods: {
            push: { enabled: true },
            email: { enabled: user.email ? true : false },
            sms: { enabled: false }, // Don't send digest via SMS
            inApp: { enabled: true }
          }
        };

        const digestNotification = await Notification.create(digestData);
        await digestNotification.populate('recipient', 'name email phoneNumber deviceTokens preferredLanguage');
        
        await sendNotificationImmediately(digestNotification);
        digestsSent++;
        
      } catch (error) {
        console.error(`Failed to send daily digest to user ${user._id}:`, error.message);
      }
    }

    console.log(`Sent ${digestsSent} daily digest notifications`);
    return { digestsSent };
  }

  /**
   * Check for irrigation reminders
   */
  async checkIrrigationReminders() {
    const crops = await CropManagement.find({
      currentStage: { $in: ['vegetative', 'flowering', 'fruiting'] },
      $or: [
        { 'lastIrrigation': { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } }, // 3 days ago
        { 'lastIrrigation': { $exists: false } }
      ]
    }).populate('farmer', 'name email phoneNumber deviceTokens preferredLanguage');

    for (const crop of crops) {
      try {
        const daysSinceIrrigation = crop.lastIrrigation 
          ? Math.floor((Date.now() - crop.lastIrrigation.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        await Notification.create({
          recipient: crop.farmer._id,
          type: 'irrigation_reminder',
          category: 'crop',
          priority: 'medium',
          title: `Irrigation Reminder: ${crop.cropType}`,
          message: `Your ${crop.cropType} field may need watering. ${daysSinceIrrigation ? `Last irrigated ${daysSinceIrrigation} days ago.` : 'No recent irrigation recorded.'}`,
          data: {
            cropData: {
              cropId: crop._id,
              cropName: crop.cropType,
              variety: crop.variety,
              stage: crop.currentStage,
              lastIrrigation: crop.lastIrrigation,
              daysSinceIrrigation
            }
          },
          relatedEntities: {
            crops: [crop._id]
          },
          source: {
            type: 'system',
            name: 'Irrigation Monitor',
            automated: true
          }
        });

        console.log(`Created irrigation reminder for crop ${crop._id}`);
        
      } catch (error) {
        console.error(`Failed to create irrigation reminder for crop ${crop._id}:`, error.message);
      }
    }
  }

  /**
   * Check for fertilizer schedules
   */
  async checkFertilizerSchedules() {
    const crops = await CropManagement.find({
      currentStage: { $in: ['seedling', 'vegetative', 'flowering'] },
      'fertilizerSchedule.nextApplication': { 
        $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Due within 24 hours
      }
    }).populate('farmer', 'name email phoneNumber deviceTokens preferredLanguage');

    for (const crop of crops) {
      try {
        const nextFertilizer = crop.fertilizerSchedule.find(f => 
          f.nextApplication && f.nextApplication <= new Date(Date.now() + 24 * 60 * 60 * 1000)
        );

        if (!nextFertilizer) continue;

        await Notification.create({
          recipient: crop.farmer._id,
          type: 'fertilizer_schedule',
          category: 'crop',
          priority: 'medium',
          title: `Fertilizer Reminder: ${crop.cropType}`,
          message: `Time to apply ${nextFertilizer.type} fertilizer to your ${crop.cropType} field.`,
          data: {
            cropData: {
              cropId: crop._id,
              cropName: crop.cropType,
              variety: crop.variety,
              stage: crop.currentStage,
              fertilizerType: nextFertilizer.type,
              amount: nextFertilizer.amount,
              scheduledDate: nextFertilizer.nextApplication
            }
          },
          relatedEntities: {
            crops: [crop._id]
          },
          source: {
            type: 'system',
            name: 'Fertilizer Scheduler',
            automated: true
          }
        });

        console.log(`Created fertilizer reminder for crop ${crop._id}`);
        
      } catch (error) {
        console.error(`Failed to create fertilizer reminder for crop ${crop._id}:`, error.message);
      }
    }
  }

  /**
   * Check for harvest readiness
   */
  async checkHarvestReadiness() {
    const crops = await CropManagement.find({
      currentStage: 'maturity',
      expectedHarvestDate: { 
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Within 7 days
      }
    }).populate('farmer', 'name email phoneNumber deviceTokens preferredLanguage');

    for (const crop of crops) {
      try {
        const daysToHarvest = Math.ceil((crop.expectedHarvestDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        await Notification.create({
          recipient: crop.farmer._id,
          type: 'harvest_ready',
          category: 'crop',
          priority: 'high',
          title: `Harvest Alert: ${crop.cropType}`,
          message: `Your ${crop.cropType} is ready for harvest in ${daysToHarvest} day(s). Prepare for harvesting!`,
          data: {
            cropData: {
              cropId: crop._id,
              cropName: crop.cropType,
              variety: crop.variety,
              stage: crop.currentStage,
              expectedHarvestDate: crop.expectedHarvestDate,
              daysToHarvest,
              fieldSize: crop.fieldSize
            }
          },
          relatedEntities: {
            crops: [crop._id]
          },
          source: {
            type: 'system',
            name: 'Harvest Monitor',
            automated: true
          }
        });

        console.log(`Created harvest alert for crop ${crop._id}`);
        
      } catch (error) {
        console.error(`Failed to create harvest alert for crop ${crop._id}:`, error.message);
      }
    }
  }

  /**
   * Check for crop stage updates
   */
  async checkCropStageUpdates() {
    const crops = await CropManagement.find({
      plantingDate: { $exists: true }
    }).populate('farmer', 'name email phoneNumber deviceTokens preferredLanguage');

    for (const crop of crops) {
      try {
        const daysSincePlanting = Math.floor((Date.now() - crop.plantingDate.getTime()) / (1000 * 60 * 60 * 24));
        const expectedStage = this.calculateExpectedStage(crop.cropType, daysSincePlanting);
        
        if (expectedStage && expectedStage !== crop.currentStage) {
          await Notification.create({
            recipient: crop.farmer._id,
            type: 'crop_stage_update',
            category: 'crop',
            priority: 'medium',
            title: `Crop Stage Update: ${crop.cropType}`,
            message: `Your ${crop.cropType} should be entering the ${expectedStage} stage. Consider updating your crop record.`,
            data: {
              cropData: {
                cropId: crop._id,
                cropName: crop.cropType,
                variety: crop.variety,
                currentStage: crop.currentStage,
                expectedStage,
                daysSincePlanting
              }
            },
            relatedEntities: {
              crops: [crop._id]
            },
            source: {
              type: 'system',
              name: 'Crop Stage Monitor',
              automated: true
            }
          });

          console.log(`Created stage update notification for crop ${crop._id}`);
        }
        
      } catch (error) {
        console.error(`Failed to create stage update for crop ${crop._id}:`, error.message);
      }
    }
  }

  /**
   * Check weather alerts (placeholder - would integrate with weather service)
   */
  async checkWeatherAlerts() {
    // This would integrate with a weather API service
    // For now, this is a placeholder implementation
    console.log('Checking weather alerts...');
    
    // Implementation would:
    // 1. Fetch current weather data for user locations
    // 2. Check for severe weather conditions
    // 3. Create weather alert notifications for affected users
    // 4. Consider crop-specific weather requirements
  }

  /**
   * Send market updates (placeholder - would integrate with market API)
   */
  async sendMarketUpdates() {
    // This would integrate with market price APIs
    // For now, this is a placeholder implementation
    console.log('Sending market updates...');
    
    // Implementation would:
    // 1. Fetch latest market prices for various crops
    // 2. Calculate price changes and trends
    // 3. Send targeted updates to users based on their crops
    // 4. Include market recommendations and insights
  }

  /**
   * Calculate expected crop stage based on days since planting
   * @param {string} cropType - Type of crop
   * @param {number} daysSincePlanting - Days since planting
   * @returns {string} Expected stage
   */
  calculateExpectedStage(cropType, daysSincePlanting) {
    // Simplified stage calculation - would be more sophisticated in production
    const stageMapping = {
      'rice': [
        { stage: 'seedling', days: 21 },
        { stage: 'vegetative', days: 60 },
        { stage: 'flowering', days: 90 },
        { stage: 'maturity', days: 120 }
      ],
      'wheat': [
        { stage: 'seedling', days: 14 },
        { stage: 'vegetative', days: 90 },
        { stage: 'flowering', days: 120 },
        { stage: 'maturity', days: 150 }
      ],
      'tomato': [
        { stage: 'seedling', days: 14 },
        { stage: 'vegetative', days: 45 },
        { stage: 'flowering', days: 65 },
        { stage: 'fruiting', days: 85 },
        { stage: 'maturity', days: 120 }
      ]
    };

    const stages = stageMapping[cropType.toLowerCase()] || stageMapping['rice']; // Default to rice
    
    for (let i = stages.length - 1; i >= 0; i--) {
      if (daysSincePlanting >= stages[i].days) {
        return stages[i].stage;
      }
    }
    
    return 'seedling';
  }
}

// Create and export singleton instance
const notificationScheduler = new NotificationScheduler();

module.exports = notificationScheduler;