# Quick Start Guide - Pest Detection System

## ✅ System Status: FULLY FUNCTIONAL

All components of the pest detection system are now working correctly!

## 🚀 How to Start

### 1. Start ML Service
```bash
cd ml-service
python start_ml_service.py
```
**Service will be available at:** `http://localhost:5001`

### 2. Start Backend (in new terminal)
```bash
cd backend
npm start
```
**Backend will be available at:** `http://localhost:3000`

## 🧪 Test the System

### Option 1: Run Full Test Suite
```bash
python test_pest_detection.py
```

### Option 2: Test ML Service Only
```bash
cd ml-service
python validate_service.py
```

### Option 3: Manual API Testing
```bash
# Test ML service health
curl http://localhost:5001/health

# Test backend health  
curl http://localhost:3000/health

# Test prediction (with image file)
curl -X POST http://localhost:5001/api/predict -F "image=@your_image.jpg"
```

## 📋 Available Endpoints

### ML Service (Port 5001)
- `GET /health` - Health check
- `POST /api/predict` - Image prediction
- `GET /api/classes` - Available pest classes
- `GET /api/model/info` - Model information

### Backend API (Port 3000)
- `POST /api/pest/detect` - Detect pest (requires auth)
- `GET /api/pest/info` - Get pest information
- `GET /api/pest/common` - Common pests for crop
- `GET /api/pest/treatment` - Treatment recommendations

## 🎯 Key Features

✅ **15 Pest Classes Supported**
- Aphids, Armyworm, Beetles, Bollworm, Caterpillars
- Cutworm, Grasshopper, Leafhopper, Mites, Scale Insects
- Thrips, Whitefly, Wireworm, Healthy Crop, Unknown Pest

✅ **Smart Predictions**
- Confidence scoring (0-100%)
- Top 3 predictions provided
- Image quality assessment

✅ **Treatment Recommendations**
- Organic treatment options
- Chemical treatment options  
- Cultural management practices
- Prevention strategies

✅ **Robust System**
- Fallback when ML service unavailable
- Comprehensive error handling
- Input validation and preprocessing

## 📸 Testing with Images

The system works best with:
- **Clear, well-lit images**
- **Images showing pests/damage clearly**
- **Minimum size:** 224x224 pixels
- **Supported formats:** JPG, PNG, GIF
- **Maximum size:** 16MB

## 🔧 Troubleshooting

### ML Service Won't Start
```bash
# Check dependencies
pip install tensorflow flask flask-cors numpy opencv-python pillow

# Run diagnostic
cd ml-service
python test_ml_service.py
```

### Backend Won't Connect to ML Service
1. Ensure ML service is running on port 5001
2. Check `.env` file in backend directory:
   ```
   ML_SERVICE_URL=http://localhost:5001
   ```

### Low Prediction Confidence
- Use better quality images
- Ensure pest/damage is clearly visible
- Try different angles/lighting

## 🎉 Success Indicators

You'll know everything is working when:

1. **ML Service Health Check:** `{"status": "healthy", "model_loaded": true}`
2. **Prediction Response:** Contains pest class, confidence, and treatment info
3. **Backend Integration:** Calls ML service and returns formatted results

## 📚 More Information

- **Complete Documentation:** `PEST_DETECTION_README.md`
- **Deployment Guide:** `deploy_pest_detection.py`
- **API Documentation:** See backend API routes

---

**🎊 Congratulations! Your pest detection system is ready for production use!**