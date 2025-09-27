// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');

// const userSchema = new mongoose.Schema({
//   // Basic Information
//   firstName: {
//     type: String,
//     required: [true, 'First name is required'],
//     trim: true,
//     maxLength: [50, 'First name cannot be more than 50 characters']
//   },
//   lastName: {
//     type: String,
//     required: [true, 'Last name is required'],
//     trim: true,
//     maxLength: [50, 'Last name cannot be more than 50 characters']
//   },
//   email: {
//     type: String,
//     required: function() {
//       return !this.phoneNumber || this.authProvider === 'google';
//     },
//     unique: true,
//     lowercase: true,
//     match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
//   },
//   phoneNumber: {
//     type: String,
//     required: function() {
//       return !this.email || this.authProvider === 'phone';
//     },
//     unique: true,
//     validate: {
//       validator: function(v) {
//         return /^\+?[1-9]\d{1,14}$/.test(v); // E.164 format
//       },
//       message: 'Please provide a valid phone number'
//     }
//   },
  
//   // Authentication
//   password: {
//     type: String,
//     required: function() {
//       return this.authProvider === 'email';
//     },
//     minLength: [8, 'Password must be at least 8 characters'],
//     select: false // Don't include in queries by default
//   },
//   passwordConfirm: {
//     type: String,
//     required: function() {
//       return this.password && this.isNew;
//     },
//     validate: {
//       validator: function(el) {
//         return el === this.password;
//       },
//       message: 'Passwords do not match'
//     }
//   },
  
//   // Authentication Provider
//   authProvider: {
//     type: String,
//     enum: ['email', 'google', 'phone'],
//     default: 'email'
//   },
  
//   // Google OAuth
//   googleId: {
//     type: String,
//     unique: true,
//     sparse: true
//   },
  
//   // Phone Verification
//   phoneVerified: {
//     type: Boolean,
//     default: false
//   },
//   phoneVerificationCode: {
//     type: String,
//     select: false
//   },
//   phoneVerificationExpires: {
//     type: Date,
//     select: false
//   },
  
//   // Email Verification
//   emailVerified: {
//     type: Boolean,
//     default: false
//   },
//   emailVerificationToken: {
//     type: String,
//     select: false
//   },
//   emailVerificationExpires: {
//     type: Date,
//     select: false
//   },
  
//   // Profile Information
//   avatar: {
//     type: String,
//     default: function() {
//       return `https://ui-avatars.com/api/?name=${this.firstName}+${this.lastName}&background=28a745&color=fff&size=200`;
//     }
//   },
//   dateOfBirth: Date,
//   gender: {
//     type: String,
//     enum: ['male', 'female', 'other', 'prefer_not_to_say']
//   },
  
//   // Farming Information
//   farmingExperience: {
//     type: String,
//     enum: ['beginner', 'intermediate', 'advanced', 'expert'],
//     default: 'beginner'
//   },
//   farmSize: {
//     value: Number,
//     unit: {
//       type: String,
//       enum: ['acres', 'hectares', 'square_meters'],
//       default: 'acres'
//     }
//   },
//   location: {
//     address: String,
//     city: String,
//     state: String,
//     country: String,
//     zipCode: String,
//     coordinates: {
//       type: [Number], // [longitude, latitude]
//       index: '2dsphere'
//     }
//   },
//   cropsGrown: [{
//     type: String,
//     enum: [
//       'rice', 'wheat', 'corn', 'soybeans', 'cotton', 'sugarcane', 'tomatoes', 
//       'potatoes', 'onions', 'peppers', 'lettuce', 'carrots', 'beans', 'peas',
//       'apples', 'oranges', 'grapes', 'strawberries', 'bananas', 'mangoes'
//     ]
//   }],
//   farmingType: {
//     type: String,
//     enum: ['organic', 'conventional', 'mixed'],
//     default: 'conventional'
//   },
  
//   // App Settings
//   role: {
//     type: String,
//     enum: ['user', 'farmer', 'expert', 'admin'],
//     default: 'farmer'
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   preferences: {
//     language: {
//       type: String,
//       default: 'en'
//     },
//     notifications: {
//       email: {
//         type: Boolean,
//         default: true
//       },
//       sms: {
//         type: Boolean,
//         default: false
//       },
//       push: {
//         type: Boolean,
//         default: true
//       }
//     },
//     units: {
//       temperature: {
//         type: String,
//         enum: ['celsius', 'fahrenheit'],
//         default: 'celsius'
//       },
//       measurement: {
//         type: String,
//         enum: ['metric', 'imperial'],
//         default: 'metric'
//       }
//     }
//   },
  
//   // Security & Tokens
//   passwordChangedAt: Date,
//   passwordResetToken: {
//     type: String,
//     select: false
//   },
//   passwordResetExpires: {
//     type: Date,
//     select: false
//   },
//   loginAttempts: {
//     type: Number,
//     default: 0
//   },
//   lockUntil: Date,
  
//   // Device Management
//   deviceTokens: [{
//     token: String,
//     platform: {
//       type: String,
//       enum: ['ios', 'android', 'web']
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   }],
  
//   // Audit Trail
//   lastLoginAt: Date,
//   lastLoginIP: String,
//   loginCount: {
//     type: Number,
//     default: 0
//   }
// }, {
//   timestamps: true,
//   toJSON: {
//     transform: function(doc, ret) {
//       delete ret.password;
//       delete ret.passwordConfirm;
//       delete ret.passwordResetToken;
//       delete ret.passwordResetExpires;
//       delete ret.phoneVerificationCode;
//       delete ret.phoneVerificationExpires;
//       delete ret.emailVerificationToken;
//       delete ret.emailVerificationExpires;
//       delete ret.__v;
//       return ret;
//     }
//   }
// });

// // Indexes for performance
// userSchema.index({ email: 1 });
// userSchema.index({ phoneNumber: 1 });
// userSchema.index({ googleId: 1 });
// userSchema.index({ 'location.coordinates': '2dsphere' });
// userSchema.index({ createdAt: -1 });

// // Virtual for full name
// userSchema.virtual('fullName').get(function() {
//   return `${this.firstName} ${this.lastName}`;
// });

// // Virtual for account lock status
// userSchema.virtual('isLocked').get(function() {
//   return !!(this.lockUntil && this.lockUntil > Date.now());
// });

// // Pre-save middleware
// userSchema.pre('save', async function(next) {
//   // Only hash password if it's modified and exists
//   if (!this.isModified('password') || !this.password) return next();
  
//   // Hash password with cost of 12
//   this.password = await bcrypt.hash(this.password, 12);
  
//   // Delete passwordConfirm field
//   this.passwordConfirm = undefined;
  
//   next();
// });

// userSchema.pre('save', function(next) {
//   if (!this.isModified('password') || this.isNew) return next();
  
//   // Set passwordChangedAt to current time minus 1 second
//   // (to ensure JWT is created after password change)
//   this.passwordChangedAt = Date.now() - 1000;
//   next();
// });

// // Instance methods
// userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
//   return await bcrypt.compare(candidatePassword, userPassword);
// };

// userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
//     return JWTTimestamp < changedTimestamp;
//   }
//   return false;
// };

// userSchema.methods.createPasswordResetToken = function() {
//   const resetToken = crypto.randomBytes(32).toString('hex');
  
//   this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
//   return resetToken;
// };

// userSchema.methods.createEmailVerificationToken = function() {
//   const verificationToken = crypto.randomBytes(32).toString('hex');
  
//   this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
//   this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
//   return verificationToken;
// };

// userSchema.methods.createPhoneVerificationCode = function() {
//   const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  
//   this.phoneVerificationCode = crypto.createHash('sha256').update(code).digest('hex');
//   this.phoneVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
//   return code;
// };

// userSchema.methods.getSignedJwtToken = function() {
//   return jwt.sign(
//     { id: this._id, email: this.email, role: this.role },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.JWT_EXPIRE || '7d' }
//   );
// };

// userSchema.methods.incrementLoginAttempts = function() {
//   // If we have a previous lock that has expired, restart at 1
//   if (this.lockUntil && this.lockUntil < Date.now()) {
//     return this.updateOne({
//       $set: {
//         loginAttempts: 1
//       },
//       $unset: {
//         lockUntil: 1
//       }
//     });
//   }
  
//   const updates = { $inc: { loginAttempts: 1 } };
  
//   // Lock account after 5 failed attempts for 2 hours
//   if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
//     updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
//   }
  
//   return this.updateOne(updates);
// };

// userSchema.methods.resetLoginAttempts = function() {
//   return this.updateOne({
//     $unset: {
//       loginAttempts: 1,
//       lockUntil: 1
//     }
//   });
// };

// module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['farmer', 'expert', 'admin'],
    default: 'farmer'
  },
  // Profile Information
  avatar: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v < new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    default: 'prefer_not_to_say'
  },
  
  // Enhanced Location Information
  location: {
    address: {
      street: String,
      city: String,
      district: { type: String },
      state: { type: String },
      country: { type: String, default: 'India' },
      pincode: String,
      landmark: String
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    }
  },
  farmDetails: {
    farmSize: { type: Number }, // in acres
    soilType: { 
      type: String, 
      enum: ['clay', 'sandy', 'loam', 'silt', 'peat', 'chalk']
    },
    primaryCrops: [{ type: String }],
    irrigationType: { 
      type: String, 
      enum: ['drip', 'sprinkler', 'flood', 'manual'],
      default: 'manual'
    },
    organicCertified: { type: Boolean, default: false }
  },
  expertise: [{
    type: String,
    enum: ['crop_management', 'pest_control', 'soil_health', 'irrigation', 'market_analysis', 'organic_farming']
  }],
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert'],
    default: 'beginner'
  },
  preferences: {
    language: { type: String, default: 'en' },
    notifications: {
      weather: { type: Boolean, default: true },
      market: { type: Boolean, default: true },
      pest: { type: Boolean, default: true },
      irrigation: { type: Boolean, default: true },
      consultation: { type: Boolean, default: true }
    },
    units: {
      temperature: { type: String, enum: ['celsius', 'fahrenheit'], default: 'celsius' },
      area: { type: String, enum: ['acres', 'hectares'], default: 'acres' },
      currency: { type: String, default: 'INR' }
    }
  },
  profileImage: { type: String },
  fcmToken: { type: String },
  deviceType: { type: String, enum: ['android', 'ios', 'web'] },
  tokenUpdatedAt: { type: Date },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, default: 0 },
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    timeSlots: [{
      start: String, // Format: "HH:MM"
      end: String    // Format: "HH:MM"
    }]
  },
  lastLoginAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for location-based queries
userSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ expertise: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Get user's full name
userSchema.methods.getFullName = function() {
  return this.name;
};

// Check if user is expert
userSchema.methods.isExpert = function() {
  return this.role === 'expert';
};

// Get user's location string
userSchema.methods.getLocationString = function() {
  return `${this.location.district}, ${this.location.state}`;
};

// Hide sensitive information when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.fcmToken;
  return user;
};

// Static method to find nearby users
userSchema.statics.findNearbyUsers = function(latitude, longitude, radiusInKm = 50) {
  // Simple distance calculation - for production use MongoDB geospatial queries
  return this.find({
    isActive: true,
    'location.coordinates.latitude': {
      $gte: latitude - (radiusInKm / 111), // Rough conversion
      $lte: latitude + (radiusInKm / 111)
    },
    'location.coordinates.longitude': {
      $gte: longitude - (radiusInKm / (111 * Math.cos(latitude * Math.PI / 180))),
      $lte: longitude + (radiusInKm / (111 * Math.cos(latitude * Math.PI / 180)))
    }
  });
};

// Static method to find experts by expertise
userSchema.statics.findExpertsBySkill = function(expertise, location) {
  let query = {
    role: 'expert',
    isActive: true,
    expertise: { $in: [expertise] }
  };
  
  if (location) {
    query['location.state'] = location.state;
  }
  
  return this.find(query).sort({ rating: -1, reviewCount: -1 });
};

module.exports = mongoose.model('User', userSchema);
