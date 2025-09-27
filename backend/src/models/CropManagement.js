// backend/src/models/CropManagement.js
const mongoose = require('mongoose');

const cropManagementSchema = new mongoose.Schema({
  // Basic Information
  farmer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Farmer is required'],
    index: true
  },
  crop: {
    type: mongoose.Schema.ObjectId,
    ref: 'Crop',
    required: [true, 'Crop is required']
  },
  fieldName: {
    type: String,
    required: [true, 'Field name is required'],
    trim: true,
    maxlength: [100, 'Field name cannot exceed 100 characters']
  },
  variety: {
    type: String,
    required: [true, 'Crop variety is required'],
    trim: true
  },
  
  // Planting Information
  plantingInfo: {
    sowingDate: {
      type: Date,
      required: [true, 'Sowing date is required'],
      index: true
    },
    area: {
      value: { type: Number, required: true, min: 0 },
      unit: { type: String, enum: ['acre', 'hectare', 'square_meter'], default: 'acre' }
    },
    seedQuantity: {
      value: { type: Number, required: true, min: 0 },
      unit: { type: String, enum: ['kg', 'grams', 'pounds'], default: 'kg' }
    },
    seedSource: String,
    plantingMethod: {
      type: String,
      enum: ['direct_seeding', 'transplanting', 'broadcasting', 'drilling'],
      required: true
    },
    spacing: {
      rowToRow: { type: Number, required: true }, // in cm
      plantToPlant: { type: Number, required: true }
    },
    depth: { type: Number, required: true } // in cm
  },
  
  // Location and Field Details
  location: {
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    address: {
      village: String,
      district: String,
      state: String,
      country: { type: String, default: 'India' }
    },
    soilType: {
      type: String,
      enum: ['alluvial', 'black', 'red', 'laterite', 'desert', 'mountain', 'saline', 'peaty'],
      required: true
    },
    soilPh: {
      type: Number,
      min: 0,
      max: 14
    }
  },
  
  // Growth Tracking
  currentStage: {
    stage: {
      type: String,
      enum: ['seed_preparation', 'germination', 'seedling', 'vegetative', 'flowering', 'fruit_formation', 'maturation', 'harvest', 'post_harvest'],
      default: 'seed_preparation',
      index: true
    },
    startDate: { type: Date, default: Date.now },
    expectedDuration: Number, // in days
    completionPercentage: { type: Number, min: 0, max: 100, default: 0 },
    notes: String,
    issues: [String],
    photos: [String] // URLs to photos
  },
  
  // Growth Stage History
  stageHistory: [{
    stage: {
      type: String,
      enum: ['seed_preparation', 'germination', 'seedling', 'vegetative', 'flowering', 'fruit_formation', 'maturation', 'harvest', 'post_harvest'],
      required: true
    },
    startDate: { type: Date, required: true },
    endDate: Date,
    actualDuration: Number, // in days
    completionPercentage: { type: Number, min: 0, max: 100, default: 100 },
    activities: [{
      activity: String,
      date: Date,
      notes: String,
      cost: Number,
      photos: [String]
    }],
    observations: [{
      date: { type: Date, required: true },
      observation: { type: String, required: true },
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
      actionTaken: String,
      photos: [String]
    }],
    weatherConditions: {
      averageTemperature: Number,
      totalRainfall: Number,
      averageHumidity: Number,
      extremeEvents: [String]
    }
  }],
  
  // Irrigation Management
  irrigation: {
    method: {
      type: String,
      enum: ['drip', 'sprinkler', 'flood', 'furrow', 'basin', 'rainfed'],
      required: true
    },
    schedule: [{
      date: { type: Date, required: true },
      duration: Number, // in minutes
      waterAmount: Number, // in liters
      notes: String,
      automated: { type: Boolean, default: false }
    }],
    totalWaterUsed: { type: Number, default: 0 }, // in liters
    efficiency: Number, // percentage
    issues: [String]
  },
  
  // Fertilizer Management
  fertilization: {
    basalApplication: [{
      fertilizer: { type: String, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String, enum: ['kg', 'grams', 'liters'], default: 'kg' },
      date: { type: Date, required: true },
      cost: Number,
      supplier: String
    }],
    topDressing: [{
      fertilizer: { type: String, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String, enum: ['kg', 'grams', 'liters'], default: 'kg' },
      date: { type: Date, required: true },
      stage: String,
      cost: Number,
      supplier: String
    }],
    organicInputs: [{
      input: { type: String, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String, enum: ['kg', 'tons', 'liters'], default: 'kg' },
      date: { type: Date, required: true },
      cost: Number,
      source: String
    }],
    totalFertilizerCost: { type: Number, default: 0 },
    soilTestResults: [{
      date: { type: Date, required: true },
      nitrogen: Number,
      phosphorus: Number,
      potassium: Number,
      ph: Number,
      organicCarbon: Number,
      recommendations: [String]
    }]
  },
  
  // Pest and Disease Management
  pestManagement: {
    preventiveApplications: [{
      product: { type: String, required: true },
      activeIngredient: String,
      quantity: { type: Number, required: true },
      unit: { type: String, enum: ['ml', 'grams', 'kg'], default: 'ml' },
      date: { type: Date, required: true },
      targetPest: String,
      cost: Number,
      effectiveness: { type: String, enum: ['poor', 'fair', 'good', 'excellent'] }
    }],
    pestIncidents: [{
      pestType: { type: String, required: true },
      identification: String,
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
      affectedArea: Number, // percentage
      firstObserved: { type: Date, required: true },
      symptoms: [String],
      photos: [String],
      treatmentApplied: [{
        product: String,
        quantity: Number,
        date: Date,
        result: String
      }],
      resolved: { type: Boolean, default: false },
      resolvedDate: Date
    }],
    totalPestControlCost: { type: Number, default: 0 }
  },
  
  // Harvest Planning and Records
  harvest: {
    expectedHarvestDate: Date,
    actualHarvestDate: Date,
    harvestMethod: {
      type: String,
      enum: ['manual', 'mechanical', 'semi_mechanical']
    },
    maturityIndicators: [{
      indicator: String,
      value: String,
      date: Date
    }],
    harvestRecords: [{
      date: { type: Date, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String, enum: ['kg', 'quintal', 'tons'], default: 'kg' },
      quality: {
        grade: { type: String, enum: ['A', 'B', 'C', 'reject'] },
        moistureContent: Number,
        impurities: Number,
        remarks: String
      },
      laborCost: Number,
      transportCost: Number
    }],
    totalYield: {
      value: { type: Number, default: 0 },
      unit: { type: String, enum: ['kg', 'quintal', 'tons'], default: 'kg' }
    },
    yieldPerUnit: Number, // yield per acre/hectare
    harvestCost: { type: Number, default: 0 }
  },
  
  // Financial Tracking
  economics: {
    totalInvestment: { type: Number, default: 0 },
    costs: {
      seeds: { type: Number, default: 0 },
      fertilizers: { type: Number, default: 0 },
      pesticides: { type: Number, default: 0 },
      labor: { type: Number, default: 0 },
      irrigation: { type: Number, default: 0 },
      machinery: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      storage: { type: Number, default: 0 },
      others: { type: Number, default: 0 }
    },
    revenue: {
      totalSales: { type: Number, default: 0 },
      averagePrice: { type: Number, default: 0 },
      marketingCosts: { type: Number, default: 0 }
    },
    profitLoss: Number,
    roi: Number, // Return on Investment percentage
    breakEvenYield: Number,
    insurance: {
      covered: { type: Boolean, default: false },
      provider: String,
      premium: Number,
      claimAmount: Number,
      claimStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'] }
    }
  },
  
  // Weather Impact Tracking
  weatherImpact: [{
    date: { type: Date, required: true },
    eventType: {
      type: String,
      enum: ['heavy_rain', 'drought', 'hail', 'frost', 'heat_wave', 'cyclone', 'flood'],
      required: true
    },
    severity: { type: String, enum: ['minor', 'moderate', 'severe', 'extreme'], required: true },
    impact: { type: String, required: true },
    damageAssessment: {
      areaAffected: Number, // percentage
      yieldLoss: Number, // percentage
      financialLoss: Number
    },
    recoveryActions: [String],
    photos: [String]
  }],
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['planned', 'active', 'completed', 'failed', 'abandoned'],
    default: 'planned',
    index: true
  },
  season: {
    type: String,
    enum: ['kharif', 'rabi', 'zaid'],
    required: true,
    index: true
  },
  cropYear: {
    type: String,
    required: true,
    index: true
  },
  tags: [String],
  notes: String,
  
  // AI Recommendations and Insights
  aiInsights: [{
    date: { type: Date, default: Date.now },
    type: { 
      type: String, 
      enum: ['growth_stage', 'irrigation', 'fertilization', 'pest_control', 'harvest_timing', 'general'],
      required: true 
    },
    insight: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 1 },
    source: String,
    actionTaken: { type: Boolean, default: false },
    result: String
  }],
  
  // Collaboration and Sharing
  sharedWith: [{
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    role: { type: String, enum: ['viewer', 'contributor', 'manager'], default: 'viewer' },
    sharedDate: { type: Date, default: Date.now }
  }],
  isPublic: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
cropManagementSchema.index({ farmer: 1, status: 1 });
cropManagementSchema.index({ 'plantingInfo.sowingDate': -1 });
cropManagementSchema.index({ 'currentStage.stage': 1 });
cropManagementSchema.index({ season: 1, cropYear: 1 });
cropManagementSchema.index({ 'location.coordinates': '2dsphere' });
cropManagementSchema.index({ status: 1, 'harvest.actualHarvestDate': -1 });

// Compound indexes
cropManagementSchema.index({ farmer: 1, season: 1, cropYear: 1 });
cropManagementSchema.index({ crop: 1, status: 1 });

// Virtual fields
cropManagementSchema.virtual('daysFromSowing').get(function() {
  if (!this.plantingInfo?.sowingDate) return 0;
  const now = new Date();
  const sowingDate = new Date(this.plantingInfo.sowingDate);
  return Math.floor((now - sowingDate) / (1000 * 60 * 60 * 24));
});

cropManagementSchema.virtual('expectedHarvestDays').get(function() {
  if (!this.harvest?.expectedHarvestDate) return null;
  const now = new Date();
  const harvestDate = new Date(this.harvest.expectedHarvestDate);
  return Math.floor((harvestDate - now) / (1000 * 60 * 60 * 24));
});

cropManagementSchema.virtual('profitMargin').get(function() {
  if (!this.economics?.totalInvestment || this.economics.totalInvestment === 0) return null;
  const profit = (this.economics.revenue?.totalSales || 0) - this.economics.totalInvestment;
  return (profit / this.economics.totalInvestment) * 100;
});

cropManagementSchema.virtual('totalAreaInHectares').get(function() {
  if (!this.plantingInfo?.area) return 0;
  const { value, unit } = this.plantingInfo.area;
  switch (unit) {
    case 'acre': return value * 0.4047;
    case 'square_meter': return value / 10000;
    default: return value;
  }
});

// Pre-save middleware
cropManagementSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate total investment
  if (this.economics?.costs) {
    this.economics.totalInvestment = Object.values(this.economics.costs).reduce((sum, cost) => sum + (cost || 0), 0);
  }
  
  // Calculate profit/loss
  if (this.economics?.revenue?.totalSales && this.economics?.totalInvestment) {
    this.economics.profitLoss = this.economics.revenue.totalSales - this.economics.totalInvestment;
    this.economics.roi = (this.economics.profitLoss / this.economics.totalInvestment) * 100;
  }
  
  next();
});

// Instance methods
cropManagementSchema.methods.updateStage = function(newStage, notes) {
  // Move current stage to history
  if (this.currentStage.stage) {
    this.stageHistory.push({
      stage: this.currentStage.stage,
      startDate: this.currentStage.startDate,
      endDate: new Date(),
      actualDuration: Math.floor((new Date() - this.currentStage.startDate) / (1000 * 60 * 60 * 24)),
      completionPercentage: this.currentStage.completionPercentage || 100,
      activities: [],
      observations: []
    });
  }
  
  // Set new current stage
  this.currentStage = {
    stage: newStage,
    startDate: new Date(),
    notes: notes || '',
    completionPercentage: 0,
    issues: [],
    photos: []
  };
  
  return this.save();
};

cropManagementSchema.methods.addObservation = function(observation, severity = 'low', photos = []) {
  if (!this.currentStage) return;
  
  const stageHistory = this.stageHistory.find(s => s.stage === this.currentStage.stage);
  if (stageHistory) {
    stageHistory.observations.push({
      date: new Date(),
      observation,
      severity,
      photos
    });
  }
  
  return this.save();
};

cropManagementSchema.methods.recordActivity = function(activity, cost = 0, notes = '', photos = []) {
  if (!this.currentStage) return;
  
  const stageHistory = this.stageHistory.find(s => s.stage === this.currentStage.stage);
  if (stageHistory) {
    stageHistory.activities.push({
      activity,
      date: new Date(),
      notes,
      cost,
      photos
    });
  }
  
  // Update economics if cost is provided
  if (cost > 0) {
    this.economics.costs.others = (this.economics.costs.others || 0) + cost;
  }
  
  return this.save();
};

cropManagementSchema.methods.recordHarvest = function(quantity, quality, laborCost = 0, transportCost = 0) {
  this.harvest.harvestRecords.push({
    date: new Date(),
    quantity,
    quality,
    laborCost,
    transportCost
  });
  
  // Update total yield
  this.harvest.totalYield.value = (this.harvest.totalYield.value || 0) + quantity;
  this.harvest.harvestCost = (this.harvest.harvestCost || 0) + laborCost + transportCost;
  
  // Update economics
  this.economics.costs.labor = (this.economics.costs.labor || 0) + laborCost;
  this.economics.costs.transport = (this.economics.costs.transport || 0) + transportCost;
  
  return this.save();
};

// Static methods
cropManagementSchema.statics.findByFarmer = function(farmerId) {
  return this.find({ farmer: farmerId }).populate('crop').sort({ 'plantingInfo.sowingDate': -1 });
};

cropManagementSchema.statics.findActiveCrops = function(farmerId) {
  return this.find({ 
    farmer: farmerId, 
    status: 'active' 
  }).populate('crop').sort({ 'plantingInfo.sowingDate': -1 });
};

cropManagementSchema.statics.findBySeason = function(season, year) {
  return this.find({ season, cropYear: year }).populate(['farmer', 'crop']);
};

cropManagementSchema.statics.getCropStatistics = async function(farmerId) {
  return this.aggregate([
    { $match: { farmer: mongoose.Types.ObjectId(farmerId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalArea: { $sum: '$plantingInfo.area.value' },
        totalInvestment: { $sum: '$economics.totalInvestment' },
        totalRevenue: { $sum: '$economics.revenue.totalSales' }
      }
    }
  ]);
};

cropManagementSchema.statics.getYieldAnalysis = async function(farmerId, cropId) {
  return this.aggregate([
    { 
      $match: { 
        farmer: mongoose.Types.ObjectId(farmerId),
        crop: mongoose.Types.ObjectId(cropId),
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$season',
        avgYield: { $avg: '$yieldPerUnit' },
        maxYield: { $max: '$yieldPerUnit' },
        minYield: { $min: '$yieldPerUnit' },
        totalCrops: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

module.exports = mongoose.model('CropManagement', cropManagementSchema);