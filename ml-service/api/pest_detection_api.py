import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import tensorflow as tf
from PIL import Image
import io
import base64
import json
import logging
from datetime import datetime
from pathlib import Path

from config.config import API_CONFIG, MODEL_DIR, PEST_CLASSES, LOGS_DIR
from utils.image_utils import preprocess_image, validate_image
from utils.prediction_utils import PestPredictor

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOGS_DIR / 'api.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = API_CONFIG['max_content_length']
CORS(app)

# Global predictor instance
predictor = None

def initialize_predictor():
    """Initialize the pest predictor with the trained model"""
    global predictor
    try:
        logger.info("Initializing pest predictor...")
        predictor = PestPredictor()
        predictor.load_model()
        logger.info("Predictor initialized successfully!")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize predictor: {str(e)}")
        return False

# Initialize predictor when module loads
with app.app_context():
    initialize_predictor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'predictor_ready': predictor is not None and predictor.model is not None
    })

@app.route('/api/predict', methods=['POST'])
def predict_pest():
    """Main prediction endpoint"""
    try:
        # Check if predictor is ready
        if predictor is None or predictor.model is None:
            return jsonify({
                'error': 'Model not loaded. Please try again later.',
                'status': 'error'
            }), 503
        
        # Check if image is provided
        if 'image' not in request.files and 'image_data' not in request.json:
            return jsonify({
                'error': 'No image provided. Please upload an image file or provide base64 image data.',
                'status': 'error'
            }), 400
        
        image = None
        
        # Handle file upload
        if 'image' in request.files:
            file = request.files['image']
            if file.filename == '':
                return jsonify({
                    'error': 'No image file selected.',
                    'status': 'error'
                }), 400
            
            try:
                image_bytes = file.read()
                image = Image.open(io.BytesIO(image_bytes))
            except Exception as e:
                return jsonify({
                    'error': f'Invalid image file: {str(e)}',
                    'status': 'error'
                }), 400
        
        # Handle base64 image data
        elif 'image_data' in request.json:
            try:
                image_data = request.json['image_data']
                # Remove data URL prefix if present
                if image_data.startswith('data:image'):
                    image_data = image_data.split(',')[1]
                
                image_bytes = base64.b64decode(image_data)
                image = Image.open(io.BytesIO(image_bytes))
            except Exception as e:
                return jsonify({
                    'error': f'Invalid base64 image data: {str(e)}',
                    'status': 'error'
                }), 400
        
        # Validate image
        if not validate_image(image):
            return jsonify({
                'error': 'Invalid image format. Please provide a valid image file.',
                'status': 'error'
            }), 400
        
        # Make prediction
        try:
            prediction_result = predictor.predict(image)
            
            # Log prediction
            logger.info(f"Prediction made: {prediction_result['predicted_class']} "
                       f"(confidence: {prediction_result['confidence']:.2%})")
            
            return jsonify({
                'status': 'success',
                'prediction': prediction_result,
                'timestamp': datetime.now().isoformat()
            })
        
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            return jsonify({
                'error': f'Prediction failed: {str(e)}',
                'status': 'error'
            }), 500
    
    except Exception as e:
        logger.error(f"Unexpected error in predict_pest: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/predict_batch', methods=['POST'])
def predict_pest_batch():
    """Batch prediction endpoint"""
    try:
        if predictor is None or predictor.model is None:
            return jsonify({
                'error': 'Model not loaded. Please try again later.',
                'status': 'error'
            }), 503
        
        # Check if images are provided
        if 'images' not in request.files:
            return jsonify({
                'error': 'No images provided for batch prediction.',
                'status': 'error'
            }), 400
        
        files = request.files.getlist('images')
        if len(files) == 0:
            return jsonify({
                'error': 'No image files selected.',
                'status': 'error'
            }), 400
        
        if len(files) > 10:  # Limit batch size
            return jsonify({
                'error': 'Too many images. Maximum 10 images allowed per batch.',
                'status': 'error'
            }), 400
        
        results = []
        
        for i, file in enumerate(files):
            try:
                if file.filename == '':
                    results.append({
                        'index': i,
                        'filename': '',
                        'error': 'Empty filename',
                        'status': 'error'
                    })
                    continue
                
                image_bytes = file.read()
                image = Image.open(io.BytesIO(image_bytes))
                
                if not validate_image(image):
                    results.append({
                        'index': i,
                        'filename': file.filename,
                        'error': 'Invalid image format',
                        'status': 'error'
                    })
                    continue
                
                prediction_result = predictor.predict(image)
                
                results.append({
                    'index': i,
                    'filename': file.filename,
                    'prediction': prediction_result,
                    'status': 'success'
                })
                
            except Exception as e:
                results.append({
                    'index': i,
                    'filename': file.filename if hasattr(file, 'filename') else 'unknown',
                    'error': str(e),
                    'status': 'error'
                })
        
        return jsonify({
            'status': 'success',
            'results': results,
            'total_images': len(files),
            'successful_predictions': len([r for r in results if r['status'] == 'success']),
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Batch prediction failed: {str(e)}")
        return jsonify({
            'error': 'Batch prediction failed',
            'status': 'error'
        }), 500

@app.route('/api/classes', methods=['GET'])
def get_pest_classes():
    """Get available pest classes"""
    try:
        return jsonify({
            'status': 'success',
            'classes': PEST_CLASSES,
            'num_classes': len(PEST_CLASSES),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get classes: {str(e)}")
        return jsonify({
            'error': 'Failed to retrieve pest classes',
            'status': 'error'
        }), 500

@app.route('/api/model/info', methods=['GET'])
def get_model_info():
    """Get model information"""
    try:
        if predictor is None:
            return jsonify({
                'error': 'Predictor not initialized',
                'status': 'error'
            }), 503
        
        model_info = predictor.get_model_info()
        return jsonify({
            'status': 'success',
            'model_info': model_info,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get model info: {str(e)}")
        return jsonify({
            'error': 'Failed to retrieve model information',
            'status': 'error'
        }), 500

@app.route('/api/model/reload', methods=['POST'])
def reload_model():
    """Reload the model (admin endpoint)"""
    try:
        # Check for admin key (in production, use proper authentication)
        admin_key = request.headers.get('X-Admin-Key')
        if admin_key != 'your-secret-admin-key':  # Replace with actual admin key
            return jsonify({
                'error': 'Unauthorized',
                'status': 'error'
            }), 401
        
        if initialize_predictor():
            return jsonify({
                'status': 'success',
                'message': 'Model reloaded successfully',
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'error': 'Failed to reload model',
                'status': 'error'
            }), 500
    except Exception as e:
        logger.error(f"Model reload failed: {str(e)}")
        return jsonify({
            'error': 'Model reload failed',
            'status': 'error'
        }), 500

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    return jsonify({
        'error': 'File too large. Maximum file size is 16MB.',
        'status': 'error'
    }), 413

@app.errorhandler(404)
def not_found(e):
    """Handle not found error"""
    return jsonify({
        'error': 'Endpoint not found',
        'status': 'error'
    }), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle internal server error"""
    return jsonify({
        'error': 'Internal server error',
        'status': 'error'
    }), 500

def create_app():
    """Factory function to create Flask app"""
    return app

if __name__ == '__main__':
    # Ensure logs directory exists
    LOGS_DIR.mkdir(exist_ok=True)
    
    # Start the Flask development server
    logger.info("Starting Pest Detection API...")
    logger.info(f"API Configuration: {API_CONFIG}")
    
    app.run(
        host=API_CONFIG['host'],
        port=API_CONFIG['port'],
        debug=API_CONFIG['debug']
    )