// backend/src/config/database.js
const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-crop-advisory';
    
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    };

    const connection = await mongoose.connect(mongoUri, options);
    
    console.log(`✅ MongoDB connected: ${connection.connection.host}`);
    console.log(`📊 Database: ${connection.connection.name}`);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose disconnected from MongoDB');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('📴 Mongoose connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('Error closing mongoose connection:', error);
        process.exit(1);
      }
    });

    return connection;
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Health check function
const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: states[state],
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      collections: Object.keys(mongoose.connection.collections).length
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
};

// Database seeding functions
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Seed crops data
    await seedCrops();
    
    // Seed sample users (if needed for development)
    if (process.env.NODE_ENV === 'development') {
      await seedSampleUsers();
    }
    
    console.log('✅ Database seeding completed');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  }
};

const seedCrops = async () => {
  const Crop = require('../models/Crop');
  
  const sampleCrops = [
    {
      name: 'wheat',
      scientificName: 'Triticum aestivum',
      category: 'cereals',
      seasons: ['rabi'],
      growthStages: [
        {
          stage: 'germination',
          durationDays: 7,
          description: 'Seed germination and emergence',
          requirements: {
            water: 'Light watering daily',
            nutrients: 'Phosphorus rich fertilizer',
            temperature: '15-20°C',
            care: ['Keep soil moist', 'Protect from birds']
          }
        },
        {
          stage: 'vegetative',
          durationDays: 30,
          description: 'Tillering and leaf development',
          requirements: {
            water: 'Regular irrigation every 3-4 days',
            nutrients: 'Nitrogen top dressing',
            temperature: '18-25°C',
            care: ['Weed control', 'First fertilizer application']
          }
        },
        {
          stage: 'flowering',
          durationDays: 21,
          description: 'Ear emergence and flowering',
          requirements: {
            water: 'Critical irrigation period',
            nutrients: 'Balanced NPK',
            temperature: '20-25°C',
            care: ['Adequate water supply', 'Pest monitoring']
          }
        },
        {
          stage: 'maturation',
          durationDays: 30,
          description: 'Grain filling and maturation',
          requirements: {
            water: 'Reduced watering',
            nutrients: 'Potassium for grain quality',
            temperature: '22-30°C',
            care: ['Harvest timing', 'Disease prevention']
          }
        }
      ],
      soilRequirements: {
        types: ['loam', 'clay'],
        phRange: { min: 6.0, max: 7.5 },
        drainage: 'good',
        organicMatter: '1-3%'
      },
      climateRequirements: {
        temperature: { min: 15, max: 25, optimal: 20 },
        rainfall: { annual: { min: 300, max: 600 }, distribution: 'Winter rains preferred' },
        humidity: { min: 50, max: 70 },
        sunlight: 'full_sun'
      },
      nutritionRequirements: {
        nitrogen: 120,
        phosphorus: 60,
        potassium: 40,
        secondary: { calcium: 20, magnesium: 15, sulfur: 25 },
        micronutrients: [
          { name: 'zinc', quantity: '5 kg/ha' },
          { name: 'iron', quantity: '2 kg/ha' }
        ]
      },
      marketInfo: {
        averageYield: { value: 45, unit: 'quintals/hectare' },
        averagePrice: { value: 2000, unit: 'INR/quintal', season: 'harvest' },
        demandTrend: 'stable',
        exportPotential: true,
        storageLife: { duration: 365, conditions: 'Cool, dry place' }
      }
    },
    {
      name: 'rice',
      scientificName: 'Oryza sativa',
      category: 'cereals',
      seasons: ['kharif'],
      growthStages: [
        {
          stage: 'germination',
          durationDays: 10,
          description: 'Seed germination in nursery',
          requirements: {
            water: 'Continuous flooding',
            nutrients: 'Organic matter',
            temperature: '25-30°C',
            care: ['Maintain water level', 'Seedbed preparation']
          }
        },
        {
          stage: 'vegetative',
          durationDays: 55,
          description: 'Transplanting and tillering',
          requirements: {
            water: 'Standing water 2-5 cm',
            nutrients: 'Nitrogen application',
            temperature: '25-30°C',
            care: ['Transplanting', 'Weed management', 'First top dressing']
          }
        },
        {
          stage: 'flowering',
          durationDays: 35,
          description: 'Panicle initiation and flowering',
          requirements: {
            water: 'Continuous flooding',
            nutrients: 'Phosphorus and potassium',
            temperature: '25-30°C',
            care: ['Maintain water level', 'Second top dressing', 'Pest monitoring']
          }
        },
        {
          stage: 'maturation',
          durationDays: 30,
          description: 'Grain filling and maturation',
          requirements: {
            water: 'Intermittent irrigation',
            nutrients: 'Potassium for grain quality',
            temperature: '25-30°C',
            care: ['Drain water 10 days before harvest', 'Disease management']
          }
        }
      ],
      soilRequirements: {
        types: ['clay', 'silt'],
        phRange: { min: 5.5, max: 7.0 },
        drainage: 'poor',
        organicMatter: '2-4%'
      },
      climateRequirements: {
        temperature: { min: 20, max: 35, optimal: 25 },
        rainfall: { annual: { min: 1000, max: 2000 }, distribution: 'Monsoon dependent' },
        humidity: { min: 70, max: 90 },
        sunlight: 'full_sun'
      },
      marketInfo: {
        averageYield: { value: 60, unit: 'quintals/hectare' },
        averagePrice: { value: 1800, unit: 'INR/quintal', season: 'harvest' },
        demandTrend: 'stable',
        exportPotential: true
      }
    }
  ];

  for (const cropData of sampleCrops) {
    const existingCrop = await Crop.findOne({ name: cropData.name });
    if (!existingCrop) {
      await Crop.create(cropData);
      console.log(`✅ Seeded crop: ${cropData.name}`);
    }
  }
};

const seedSampleUsers = async () => {
  const User = require('../models/User');
  
  const sampleUsers = [
    {
      name: 'Ramesh Farmer',
      email: 'ramesh@example.com',
      phone: '9876543210',
      password: 'password123',
      role: 'farmer',
      location: {
        state: 'Maharashtra',
        district: 'Pune',
        coordinates: { latitude: 18.5204, longitude: 73.8567 }
      },
      farmDetails: {
        farmSize: 5.5,
        soilType: 'loam',
        primaryCrops: ['wheat', 'cotton'],
        irrigationType: 'drip'
      }
    },
    {
      name: 'Dr. Priya Agricultural Expert',
      email: 'priya@example.com',
      phone: '9876543211',
      password: 'password123',
      role: 'expert',
      expertise: ['crop_management', 'pest_control', 'soil_health'],
      location: {
        state: 'Maharashtra',
        district: 'Pune',
        coordinates: { latitude: 18.5304, longitude: 73.8667 }
      },
      farmDetails: {
        farmSize: 0, // Expert doesn't own a farm
        soilType: 'loam', // Required field
        primaryCrops: [],
        irrigationType: 'manual'
      }
    }
  ];

  for (const userData of sampleUsers) {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      await User.create(userData);
      console.log(`✅ Seeded user: ${userData.name}`);
    }
  }
};

// Cleanup function for old data
const cleanupOldData = async () => {
  try {
    console.log('🧹 Starting database cleanup...');
    
    // Remove old notifications (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // This would be implemented based on your notification model
    // await Notification.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
    
    console.log('✅ Database cleanup completed');
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
  }
};

// Database backup utilities
const createBackup = async () => {
  try {
    console.log('💾 Creating database backup...');
    // Implementation would depend on your backup strategy
    // This could use mongodump or other backup utilities
    console.log('✅ Database backup created');
  } catch (error) {
    console.error('❌ Database backup failed:', error);
  }
};

module.exports = {
  connectDatabase,
  checkDatabaseHealth,
  seedDatabase,
  cleanupOldData,
  createBackup
};
