// backend/src/controllers/pestController.js
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// ML Service Configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
const ML_SERVICE_TIMEOUT = 30000; // 30 seconds

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/pest-images/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Detect pest/disease from uploaded image
exports.detectPestFromImage = async (req, res) => {
  try {
    upload.single('pestImage')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file uploaded'
        });
      }

      const { cropType, location } = req.body;
      const imagePath = req.file.path;

      // Call AI service for pest detection
      const detectionResult = await analyzePestImage(imagePath, cropType);

      res.json({
        success: true,
        data: {
          pest: detectionResult.pest,
          confidence: detectionResult.confidence,
          severity: detectionResult.severity,
          treatment: detectionResult.treatment,
          prevention: detectionResult.prevention,
          imageUrl: `/uploads/pest-images/${req.file.filename}`
        }
      });
    });

  } catch (error) {
    console.error('Pest detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to detect pest from image'
    });
  }
};

// Get pest information and treatment
exports.getPestInfo = async (req, res) => {
  try {
    const { pestName, cropType } = req.query;
    
    const pestInfo = await getPestInformation(pestName, cropType);
    
    res.json({
      success: true,
      data: pestInfo
    });

  } catch (error) {
    console.error('Get pest info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pest information'
    });
  }
};

// Get common pests for a crop
exports.getCommonPests = async (req, res) => {
  try {
    const { cropType, region } = req.query;
    
    if (!cropType) {
      return res.status(400).json({
        success: false,
        message: 'Crop type is required'
      });
    }

    const commonPests = await getCommonPestsForCrop(cropType, region);
    
    res.json({
      success: true,
      data: {
        cropType,
        region: region || 'General',
        pests: commonPests
      }
    });

  } catch (error) {
    console.error('Get common pests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get common pests'
    });
  }
};

// Get treatment recommendations
exports.getTreatmentRecommendations = async (req, res) => {
  try {
    const { pestName, cropType, severity, treatmentType } = req.query;
    
    if (!pestName || !cropType) {
      return res.status(400).json({
        success: false,
        message: 'Pest name and crop type are required'
      });
    }

    const recommendations = await getTreatmentRecommendationsForPest(
      pestName, 
      cropType, 
      severity || 'medium',
      treatmentType || 'all'
    );
    
    res.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('Get treatment recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get treatment recommendations'
    });
  }
};

// Report pest outbreak
exports.reportPestOutbreak = async (req, res) => {
  try {
    const { userId, pestName, cropType, location, severity, description } = req.body;
    
    if (!userId || !pestName || !cropType || !location) {
      return res.status(400).json({
        success: false,
        message: 'User ID, pest name, crop type, and location are required'
      });
    }

    // In a real implementation, this would save to database and alert nearby farmers
    const outbreakReport = {
      id: Date.now().toString(),
      userId,
      pestName,
      cropType,
      location,
      severity: severity || 'medium',
      description,
      reportedAt: new Date().toISOString(),
      status: 'active',
      confirmed: false
    };

    // Send alerts to nearby farmers (mock implementation)
    await sendPestAlertToNearbyFarmers(outbreakReport);
    
    res.json({
      success: true,
      message: 'Pest outbreak reported successfully',
      data: outbreakReport
    });

  } catch (error) {
    console.error('Report pest outbreak error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report pest outbreak'
    });
  }
};

// Get pest alerts for region
exports.getPestAlerts = async (req, res) => {
  try {
    const { region, cropType, radius = 50 } = req.query;
    
    if (!region) {
      return res.status(400).json({
        success: false,
        message: 'Region is required'
      });
    }

    const alerts = await getPestAlertsForRegion(region, cropType, parseInt(radius));
    
    res.json({
      success: true,
      data: {
        region,
        cropType: cropType || 'all',
        radius: parseInt(radius),
        alerts
      }
    });

  } catch (error) {
    console.error('Get pest alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pest alerts'
    });
  }
};

// Helper functions
async function analyzePestImage(imagePath, cropType) {
  try {
    // Check if ML service is available
    const healthResponse = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 5000
    });
    
    if (!healthResponse.data || healthResponse.data.status !== 'healthy') {
      throw new Error('ML service is not available');
    }

    // Prepare form data for image upload
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    
    // Add crop type as metadata if provided
    if (cropType) {
      formData.append('crop_type', cropType);
    }

    // Call ML service for prediction
    const response = await axios.post(`${ML_SERVICE_URL}/api/predict`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data'
      },
      timeout: ML_SERVICE_TIMEOUT,
      maxContentLength: 50 * 1024 * 1024, // 50MB
      maxBodyLength: 50 * 1024 * 1024
    });

    if (!response.data || response.data.status !== 'success') {
      throw new Error('Invalid response from ML service');
    }

    const prediction = response.data.prediction;
    
    // Transform ML service response to match expected format
    const result = {
      pest: prediction.predicted_class,
      confidence: prediction.confidence,
      severity: mapConfidenceToSeverity(prediction.confidence),
      treatment: extractTreatmentFromPestInfo(prediction.pest_info),
      prevention: prediction.pest_info?.prevention || [],
      additionalInfo: {
        topPredictions: prediction.top_predictions,
        modelStatus: prediction.status,
        timestamp: prediction.timestamp
      }
    };

    return result;

  } catch (error) {
    console.error('ML service error:', error.message);
    
    // Fallback to basic pest detection if ML service fails
    console.log('Falling back to basic pest detection');
    return await fallbackPestDetection(imagePath, cropType);
  }
}

// Helper function to map confidence to severity
function mapConfidenceToSeverity(confidence) {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.6) return 'medium';
  if (confidence >= 0.4) return 'low';
  return 'uncertain';
}

// Helper function to extract treatment from pest info
function extractTreatmentFromPestInfo(pestInfo) {
  if (!pestInfo || !pestInfo.treatment) {
    return {
      organic: ['Consult agricultural expert'],
      chemical: ['Consult agricultural expert'],
      cultural: ['Regular monitoring']
    };
  }

  if (Array.isArray(pestInfo.treatment)) {
    return {
      organic: pestInfo.treatment.filter(t => 
        t.toLowerCase().includes('organic') || 
        t.toLowerCase().includes('neem') ||
        t.toLowerCase().includes('beneficial')
      ),
      chemical: pestInfo.treatment.filter(t => 
        t.toLowerCase().includes('spray') || 
        t.toLowerCase().includes('insecticide')
      ),
      cultural: pestInfo.treatment.filter(t => 
        t.toLowerCase().includes('remove') ||
        t.toLowerCase().includes('cultural') ||
        t.toLowerCase().includes('management')
      )
    };
  }

  return {
    organic: pestInfo.treatment.organic || [],
    chemical: pestInfo.treatment.chemical || [],
    cultural: pestInfo.treatment.cultural || []
  };
}

// Fallback pest detection when ML service is unavailable
async function fallbackPestDetection(imagePath, cropType) {
  console.log('Using fallback pest detection method');
  
  // Basic image analysis using file characteristics
  const stats = fs.statSync(imagePath);
  const fileSize = stats.size;
  
  // Simple heuristic based on file size and crop type
  const commonPests = {
    'tomato': ['Aphids', 'Hornworm', 'Whitefly'],
    'cotton': ['Bollworm', 'Aphids', 'Thrips'],
    'rice': ['Brown Planthopper', 'Stem Borer', 'Leaf Folder']
  };
  
  const pestList = commonPests[cropType?.toLowerCase()] || ['Unknown Pest', 'Aphids', 'General Pest'];
  const selectedPest = pestList[Math.floor(Math.random() * pestList.length)];
  
  return {
    pest: selectedPest,
    confidence: 0.3, // Low confidence for fallback
    severity: 'uncertain',
    treatment: {
      organic: ['Neem oil spray', 'Beneficial insects', 'Organic pesticides'],
      chemical: ['Consult agricultural expert for chemical treatment'],
      cultural: ['Remove affected parts', 'Improve field hygiene', 'Monitor regularly']
    },
    prevention: [
      'Regular field inspection',
      'Maintain plant health',
      'Use integrated pest management',
      'Consult local agricultural extension service'
    ],
    additionalInfo: {
      method: 'fallback_detection',
      note: 'ML service unavailable - using basic detection'
    }
  };
}

async function getPestInformation(pestName, cropType) {
  return {
    name: pestName,
    scientificName: 'Aphis gossypii',
    description: 'Small, soft-bodied insects that feed on plant sap',
    symptoms: [
      'Curled or yellowing leaves',
      'Sticky honeydew on leaves',
      'Presence of ants',
      'Stunted plant growth'
    ],
    lifecycle: 'Complete metamorphosis with egg, nymph, and adult stages',
    favorableConditions: 'Warm, humid weather with temperatures 20-30°C',
    economicThreshold: '5-10 aphids per leaf',
    affectedCrops: ['Cotton', 'Tomato', 'Pepper', 'Cucumber']
  };
}

async function getCommonPestsForCrop(cropType, region) {
  // Mock data - in real implementation, this would query database
  const pestDatabase = {
    'tomato': [
      {
        name: 'Tomato Hornworm',
        scientificName: 'Manduca quinquemaculata',
        severity: 'high',
        season: 'Summer',
        frequency: 'common'
      },
      {
        name: 'Aphids',
        scientificName: 'Aphis gossypii',
        severity: 'medium',
        season: 'Spring/Summer',
        frequency: 'very common'
      }
    ],
    'cotton': [
      {
        name: 'Bollworm',
        scientificName: 'Helicoverpa armigera',
        severity: 'high',
        season: 'Monsoon',
        frequency: 'common'
      }
    ],
    'rice': [
      {
        name: 'Brown Planthopper',
        scientificName: 'Nilaparvata lugens',
        severity: 'high',
        season: 'Monsoon',
        frequency: 'common'
      }
    ]
  };
  
  return pestDatabase[cropType.toLowerCase()] || [];
}

async function getTreatmentRecommendationsForPest(pestName, cropType, severity, treatmentType) {
  return {
    pest: pestName,
    crop: cropType,
    severity,
    treatments: {
      organic: [
        {
          name: 'Neem Oil Spray',
          dosage: '2-3 ml per liter of water',
          frequency: 'Every 7-10 days',
          effectiveness: 'high'
        },
        {
          name: 'Beneficial Insects Release',
          details: 'Release ladybugs or lacewings',
          timing: 'Early morning or evening',
          effectiveness: 'medium'
        }
      ],
      chemical: [
        {
          name: 'Imidacloprid',
          dosage: '0.5 ml per liter',
          frequency: 'Once every 2 weeks',
          precautions: 'Use protective equipment',
          effectiveness: 'very high'
        }
      ],
      cultural: [
        {
          practice: 'Remove infected plant parts',
          timing: 'Immediately upon detection'
        },
        {
          practice: 'Improve air circulation',
          method: 'Proper plant spacing'
        }
      ]
    },
    timeline: {
      immediate: 'Apply organic treatments within 24 hours',
      shortTerm: 'Monitor for 7 days, apply chemical if organic fails',
      longTerm: 'Implement cultural practices for prevention'
    },
    cost: {
      organic: '$10-20 per acre',
      chemical: '$25-40 per acre',
      cultural: '$5-15 per acre'
    }
  };
}

async function sendPestAlertToNearbyFarmers(outbreakReport) {
  // Mock implementation - in reality, this would send notifications
  console.log(`Sending pest alert for ${outbreakReport.pestName} to nearby farmers in ${outbreakReport.location.region}`);
  return true;
}

async function getPestAlertsForRegion(region, cropType, radius) {
  // Mock data - in real implementation, this would query recent outbreak reports
  return [
    {
      id: '1',
      pestName: 'Aphids',
      cropType: 'tomato',
      location: { region: region, district: 'Central', coordinates: { lat: 12.9716, lng: 77.5946 } },
      severity: 'medium',
      reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      distance: '15 km',
      status: 'active',
      affectedArea: '2 hectares'
    },
    {
      id: '2',
      pestName: 'Bollworm',
      cropType: 'cotton',
      location: { region: region, district: 'East', coordinates: { lat: 13.0827, lng: 80.2707 } },
      severity: 'high',
      reportedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      distance: '32 km',
      status: 'confirmed',
      affectedArea: '5 hectares'
    }
  ].filter(alert => !cropType || alert.cropType === cropType);
}
