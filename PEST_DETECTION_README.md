# Smart Crop Advisory - Pest Detection System

## Overview

The Pest Detection System is a comprehensive AI-powered solution that allows farmers to identify pests and diseases in their crops by uploading images. The system consists of:

1. **ML Service** - TensorFlow-based machine learning service for image analysis
2. **Backend API** - Node.js/Express server that handles requests and integrates with ML service
3. **Frontend Integration** - React components for image upload and result display

## System Architecture

```
Frontend (React) 
    ↓
Backend API (Node.js/Express) 
    ↓
ML Service (Python/TensorFlow/Flask)
    ↓
Trained CNN Model
```

## Features

- **Image-based Pest Detection**: Upload crop images to identify pests and diseases
- **Multi-class Classification**: Supports 15+ common crop pests
- **Treatment Recommendations**: Provides organic, chemical, and cultural treatment options
- **Confidence Scoring**: Shows prediction confidence levels
- **Fallback Detection**: Basic detection when ML service is unavailable
- **Real-time Processing**: Fast image analysis and response
- **RESTful API**: Standard HTTP endpoints for easy integration

## Quick Start

### 1. Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **TensorFlow 2.13+**
- **Required Python packages**:
  ```bash
  pip install tensorflow flask flask-cors numpy opencv-python pillow
  ```

### 2. Start the ML Service

```bash
cd ml-service
python start_ml_service.py
```

The ML service will be available at: `http://localhost:5001`

### 3. Start the Backend

```bash
cd backend
npm install
npm start
```

The backend API will be available at: `http://localhost:3000`

### 4. Test the System

```bash
python test_pest_detection.py
```

## API Endpoints

### ML Service Endpoints

- `GET /health` - Health check
- `POST /api/predict` - Image prediction
- `GET /api/classes` - Available pest classes
- `GET /api/model/info` - Model information

### Backend Endpoints

- `POST /api/pest/detect` - Detect pest from uploaded image (requires auth)
- `GET /api/pest/info` - Get pest information
- `GET /api/pest/common` - Get common pests for a crop
- `GET /api/pest/treatment` - Get treatment recommendations
- `POST /api/pest/report-outbreak` - Report pest outbreak
- `GET /api/pest/alerts` - Get pest alerts for region

## Usage Examples

### 1. Direct ML Service Call

```bash
curl -X POST \
  http://localhost:5001/api/predict \
  -H 'Content-Type: multipart/form-data' \
  -F 'image=@/path/to/crop-image.jpg'
```

### 2. Backend API Call

```bash
curl -X POST \
  http://localhost:3000/api/pest/detect \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: multipart/form-data' \
  -F 'pestImage=@/path/to/crop-image.jpg' \
  -F 'cropType=tomato' \
  -F 'location={"region":"Karnataka","district":"Bangalore"}'
```

### 3. JavaScript Frontend Integration

```javascript
const formData = new FormData();
formData.append('pestImage', imageFile);
formData.append('cropType', 'tomato');

fetch('/api/pest/detect', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Detected pest:', data.data.pest);
  console.log('Confidence:', data.data.confidence);
  console.log('Treatment:', data.data.treatment);
});
```

## Supported Pest Classes

The system currently supports detection of:

1. **Aphids** - Small sap-sucking insects
2. **Armyworm** - Caterpillars that damage leaves
3. **Beetles** - Various beetle species
4. **Bollworm** - Cotton bollworm
5. **Caterpillars** - General caterpillar pests
6. **Cutworm** - Soil-dwelling caterpillars
7. **Grasshopper** - Leaf-eating insects
8. **Leafhopper** - Small jumping insects
9. **Mites** - Microscopic spider-like pests
10. **Scale Insects** - Small sucking insects
11. **Thrips** - Tiny flying insects
12. **Whitefly** - Small white flying insects
13. **Wireworm** - Soil-dwelling larvae
14. **Healthy Crop** - No pest detected
15. **Unknown Pest** - Unidentified pest

## Response Format

### ML Service Response

```json
{
  "status": "success",
  "prediction": {
    "predicted_class": "aphids",
    "confidence": 0.85,
    "status": "confident",
    "top_predictions": [
      {"class": "aphids", "confidence": 0.85},
      {"class": "thrips", "confidence": 0.12},
      {"class": "healthy_crop", "confidence": 0.03}
    ],
    "pest_info": {
      "description": "Small soft-bodied insects that feed on plant juices",
      "treatment": ["Use insecticidal soap", "Apply neem oil"],
      "prevention": ["Regular monitoring", "Maintain plant health"],
      "severity": "medium"
    }
  }
}
```

### Backend API Response

```json
{
  "success": true,
  "data": {
    "pest": "Aphids",
    "confidence": 0.85,
    "severity": "medium",
    "treatment": {
      "organic": ["Neem oil spray", "Insecticidal soap"],
      "chemical": ["Imidacloprid", "Thiamethoxam"],
      "cultural": ["Remove affected leaves"]
    },
    "prevention": [
      "Regular monitoring",
      "Maintain plant hygiene"
    ],
    "imageUrl": "/uploads/pest-images/1234567890-image.jpg"
  }
}
```

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# ML Service Configuration
ML_SERVICE_URL=http://localhost:5001

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/smart-crop-advisory

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB
```

### ML Service Configuration

Edit `ml-service/config/config.py`:

```python
# API configuration
API_CONFIG = {
    'host': '0.0.0.0',
    'port': 5001,
    'debug': False,
    'max_content_length': 16 * 1024 * 1024,  # 16MB
}

# Model configuration
MODEL_CONFIG = {
    'input_shape': (224, 224, 3),
    'num_classes': 15,
    'confidence_threshold': 0.5
}
```

## Troubleshooting

### Common Issues

1. **ML Service Not Starting**
   ```bash
   # Check dependencies
   pip install -r ml-service/requirements.txt
   
   # Check TensorFlow installation
   python -c "import tensorflow as tf; print(tf.__version__)"
   ```

2. **Backend Connection Error**
   ```bash
   # Check if ML service is running
   curl http://localhost:5001/health
   
   # Check backend configuration
   echo $ML_SERVICE_URL
   ```

3. **Image Upload Fails**
   ```bash
   # Check upload directory permissions
   ls -la backend/uploads/pest-images/
   
   # Check file size limits
   # Max size: 10MB for backend, 16MB for ML service
   ```

4. **Low Prediction Confidence**
   - Ensure good image quality (clear, well-lit)
   - Image should show the pest/damage clearly
   - Avoid blurry or very dark images
   - Image should be at least 224x224 pixels

### Debug Mode

Enable debug logging:

```python
# In ml-service/simple_api.py
app.run(host='0.0.0.0', port=5001, debug=True)
```

```javascript
// In backend/src/app.js
process.env.NODE_ENV = 'development'
```

### Performance Optimization

1. **Use GPU Acceleration** (if available):
   ```python
   import tensorflow as tf
   print("GPUs Available: ", tf.config.list_physical_devices('GPU'))
   ```

2. **Model Optimization**:
   - Use TensorFlow Lite for mobile deployment
   - Enable mixed precision training
   - Use model quantization for smaller size

3. **Caching**:
   - Implement Redis caching for frequent predictions
   - Cache model predictions for identical images

## Development

### Adding New Pest Classes

1. **Update pest classes** in `ml-service/config/config.py`:
   ```python
   PEST_CLASSES = [
       'aphids',
       'armyworm',
       # ... existing classes
       'new_pest_name'  # Add new class
   ]
   ```

2. **Update pest database** in `ml-service/utils/prediction_utils.py`:
   ```python
   pest_database = {
       'new_pest_name': {
           'description': 'Description of the new pest',
           'treatment': ['Treatment options'],
           'prevention': ['Prevention methods'],
           'severity': 'medium'
       }
   }
   ```

3. **Retrain the model** with new data

### Model Training

See `ml-service/scripts/train_model.py` for training scripts:

```bash
cd ml-service
python scripts/train_model.py --data-dir /path/to/training/data
```

### Testing

Run comprehensive tests:

```bash
# Test complete pipeline
python test_pest_detection.py

# Interactive testing
python test_pest_detection.py --interactive

# Unit tests (if available)
cd backend && npm test
cd ml-service && python -m pytest
```

## Production Deployment

### Docker Deployment

1. **ML Service Dockerfile**:
   ```dockerfile
   FROM tensorflow/tensorflow:2.13.0
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   EXPOSE 5001
   CMD ["python", "simple_api.py"]
   ```

2. **Backend Dockerfile**:
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   CMD ["node", "src/server.js"]
   ```

3. **Docker Compose**:
   ```yaml
   version: '3.8'
   services:
     ml-service:
       build: ./ml-service
       ports:
         - "5001:5001"
       
     backend:
       build: ./backend
       ports:
         - "3000:3000"
       environment:
         - ML_SERVICE_URL=http://ml-service:5001
       depends_on:
         - ml-service
   ```

### Production Considerations

1. **Security**:
   - Implement rate limiting
   - Validate file types and sizes
   - Sanitize user inputs
   - Use HTTPS in production

2. **Scalability**:
   - Use load balancers
   - Implement horizontal scaling
   - Use CDN for static assets
   - Database optimization

3. **Monitoring**:
   - Application performance monitoring
   - Error tracking and alerting
   - Model performance metrics
   - System resource monitoring

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review system logs for errors
3. Test individual components using the test script
4. Ensure all dependencies are properly installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.