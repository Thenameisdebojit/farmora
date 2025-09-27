// backend/src/models/Crop.js
const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Crop name is required'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true
  },
  scientificName: {
    type: String,
    trim: true
  },
  scientificName: {
    type: String,
    trim: true
  },
  commonNames: [{ type: String }], // Alternative names in different languages
  category: {
    type: String,
    required: [true, 'Crop category is required'],
    enum: [
      'cereals', 
      'pulses', 
      'oilseeds', 
      'vegetables', 
      'fruits', 
      'spices', 
      'cash_crops', 
      'fodder',
      'medicinal'
    ]
  },
  seasons: [{
    type: String,
    enum: ['kharif', 'rabi', 'zaid', 'perennial'],
    required: true
  }],
  growthStages: [{
    stage: {
      type: String,
      required: true,
      enum: [
        'seed_preparation',
        'germination', 
        'seedling', 
        'vegetative', 
        'flowering', 
        'fruit_formation',
        'maturation',
        'harvest'
      ]
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1
    },
    description: String,
    requirements: {
      water: String, // e.g., "Light watering", "Heavy irrigation"
      nutrients: String, // e.g., "High nitrogen", "Balanced NPK"
      temperature: String, // e.g., "20-25°C", "Cool weather"
      care: [String] // Array of care instructions
    }
  }],
  soilRequirements: {
    types: [{
      type: String,
      enum: ['clay', 'sandy', 'loam', 'silt', 'peat', 'chalk']
    }],
    phRange: {
      min: { type: Number, min: 0, max: 14 },
      max: { type: Number, min: 0, max: 14 }
    },
    drainage: {
      type: String,
      enum: ['poor', 'moderate', 'good', 'excellent'],
      required: true
    },
    organicMatter: String // e.g., "2-3%", "High"
  },
  climateRequirements: {
    temperature: {
      min: { type: Number },
      max: { type: Number },
      optimal: { type: Number }
    },
    rainfall: {
      annual: {
        min: { type: Number }, // in mm
        max: { type: Number }
      },
      distribution: String // e.g., "Well distributed", "Monsoon dependent"
    },
    humidity: {
      min: { type: Number, min: 0, max: 100 },
      max: { type: Number, min: 0, max: 100 }
    },
    sunlight: {
      type: String,
      enum: ['full_sun', 'partial_sun', 'shade'],
      default: 'full_sun'
    }
  },
  nutritionRequirements: {
    nitrogen: { type: Number }, // kg per hectare
    phosphorus: { type: Number },
    potassium: { type: Number },
    secondary: {
      calcium: Number,
      magnesium: Number,
      sulfur: Number
    },
    micronutrients: [{
      name: String,
      quantity: String
    }],
    organicMatter: String
  },
  commonPests: [{
    name: { type: String, required: true },
    scientificName: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    symptoms: [String],
    season: [String], // When this pest is most active
    treatment: {
      organic: [String],
      chemical: [String],
      biological: [String],
      cultural: [String] // Cultural practices
    },
    prevention: [String]
  }],
  commonDiseases: [{
    name: { type: String, required: true },
    scientificName: String,
    type: {
      type: String,
      enum: ['fungal', 'bacterial', 'viral', 'nematode'],
      required: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    symptoms: [String],
    favorableConditions: String,
    treatment: {
      organic: [String],
      chemical: [String],
      cultural: [String]
    },
    prevention: [String]
  }],
  marketInfo: {
    averageYield: {
      value: Number,
      unit: { type: String, default: 'tons/hectare' }
    },
    averagePrice: {
      value: Number,
      unit: { type: String, default: 'INR/quintal' },
      season: String
    },
    demandTrend: {
      type: String,
      enum: ['increasing', 'stable', 'decreasing']
    },
    exportPotential: {
      type: Boolean,
      default: false
    },
    storageLife: {
      duration: Number, // in days
      conditions: String
    },
    processingOptions: [String] // e.g., "Oil extraction", "Flour milling"
  },
  cultivationTips: [{
    stage: String, // Which growth stage this tip applies to
    tip: String,
    importance: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  }],
  companionCrops: [{ type: String }], // Crops that grow well together
  rotationCrops: [{ type: String }], // Good crops for rotation
  regions: [{ // Regions where this crop is commonly grown
    state: String,
    districts: [String],
    productivity: String // e.g., "High", "Medium"
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better query performance
cropSchema.index({ name: 'text', commonNames: 'text' });
cropSchema.index({ category: 1 });
cropSchema.index({ seasons: 1 });
cropSchema.index({ 'regions.state': 1 });
cropSchema.index({ isActive: 1 });

// Update updatedAt before saving
cropSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to get crop summary
cropSchema.methods.getSummary = function() {
  return {
    name: this.name,
    category: this.category,
    seasons: this.seasons,
    totalGrowthDays: this.growthStages.reduce((sum, stage) => sum + stage.durationDays, 0),
    mainPests: this.commonPests.filter(pest => pest.severity === 'high' || pest.severity === 'critical').length,
    mainDiseases: this.commonDiseases.filter(disease => disease.severity === 'high' || disease.severity === 'critical').length
  };
};

// Instance method to get stage by name
cropSchema.methods.getGrowthStage = function(stageName) {
  return this.growthStages.find(stage => stage.stage === stageName);
};

// Instance method to get current stage based on days from planting
cropSchema.methods.getCurrentStage = function(daysFromPlanting) {
  let totalDays = 0;
  for (let stage of this.growthStages) {
    totalDays += stage.durationDays;
    if (daysFromPlanting <= totalDays) {
      return stage;
    }
  }
  return this.growthStages[this.growthStages.length - 1]; // Return last stage if beyond total
};

// Static method to find crops by season
cropSchema.statics.findBySeason = function(season) {
  return this.find({
    seasons: season,
    isActive: true
  }).sort({ name: 1 });
};

// Static method to find crops suitable for soil type
cropSchema.statics.findBySoilType = function(soilType) {
  return this.find({
    'soilRequirements.types': soilType,
    isActive: true
  }).sort({ name: 1 });
};

// Static method to search crops
cropSchema.statics.searchCrops = function(searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    isActive: true
  }, {
    score: { $meta: 'textScore' }
  }).sort({
    score: { $meta: 'textScore' }
  });
};

// Static method to get crops by region
cropSchema.statics.findByRegion = function(state, district = null) {
  let query = {
    'regions.state': state,
    isActive: true
  };
  
  if (district) {
    query['regions.districts'] = district;
  }
  
  return this.find(query).sort({ name: 1 });
};

module.exports = mongoose.model('Crop', cropSchema);
