#!/usr/bin/env python3
"""
Simplified Flask API for pest detection with lazy loading
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
from PIL import Image
import io
import base64
import json
import logging
from datetime import datetime
from pathlib import Path
import os

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Global variables
model = None
pest_classes = [
    'aphids', 'armyworm', 'beetles', 'bollworm', 'caterpillars',
    'cutworm', 'grasshopper', 'leafhopper', 'mites', 'scale_insects',
    'thrips', 'whitefly', 'wireworm', 'healthy_crop', 'unknown_pest'
]

def load_model():
    """Load TensorFlow model with lazy loading"""
    global model
    try:
        if model is None:
            logger.info("Loading demo model...")
            
            # Import TensorFlow only when needed
            import tensorflow as tf
            
            # Try to load existing model first
            model_path = Path('models/pest_detection_model.h5')
            if model_path.exists():
                logger.info(f"Loading existing model from {model_path}")
                model = tf.keras.models.load_model(str(model_path))
            else:
                logger.info("Creating new demo model...")
                # Create a simple demo model
                model = tf.keras.Sequential([
                    tf.keras.layers.Input(shape=(224, 224, 3)),
                    tf.keras.layers.Conv2D(32, 3, activation='relu', padding='same'),
                    tf.keras.layers.MaxPooling2D(2, 2),
                    tf.keras.layers.Conv2D(64, 3, activation='relu', padding='same'),
                    tf.keras.layers.MaxPooling2D(2, 2),
                    tf.keras.layers.Conv2D(128, 3, activation='relu', padding='same'),
                    tf.keras.layers.MaxPooling2D(2, 2),
                    tf.keras.layers.GlobalAveragePooling2D(),
                    tf.keras.layers.Dense(128, activation='relu'),
                    tf.keras.layers.Dropout(0.5),
                    tf.keras.layers.Dense(len(pest_classes), activation='softmax')
                ])
                
                # Compile model
                model.compile(
                    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
                    loss='categorical_crossentropy',
                    metrics=['accuracy']
                )
                
                # Initialize weights by running a dummy prediction
                dummy_input = np.random.random((1, 224, 224, 3))
                _ = model.predict(dummy_input, verbose=0)
                
                # Save the demo model
                os.makedirs('models', exist_ok=True)
                model.save('models/pest_detection_model.h5')
                logger.info("Demo model saved to models/pest_detection_model.h5")
            
            logger.info("✅ Model loaded successfully!")
            return True
            
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        return False
    
    return True

def preprocess_image(image):
    """Preprocess image for prediction"""
    try:
        # Convert to RGB if not already
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize image
        image = image.resize((224, 224), Image.Resampling.LANCZOS)
        
        # Convert to numpy array
        img_array = np.array(image, dtype=np.float32)
        
        # Normalize pixel values to [0, 1]
        img_array = img_array / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    except Exception as e:
        logger.error(f"Image preprocessing error: {str(e)}")
        raise

def get_pest_info(pest_class):
    """Get pest information"""
    pest_database = {
        'aphids': {
            'description': 'Small soft-bodied insects that feed on plant juices',
            'damage': 'Yellowing leaves, stunted growth, honeydew secretion',
            'treatment': ['Use insecticidal soap spray', 'Introduce beneficial insects', 'Apply neem oil', 'Remove affected parts', 'Use reflective mulches'],
            'prevention': ['Regular monitoring', 'Maintain plant health', 'Avoid over-fertilizing', 'Encourage natural predators'],
            'severity': 'medium'
        },
        'armyworm': {
            'description': 'Destructive caterpillars that feed on leaves and stems',
            'damage': 'Large holes in leaves, complete defoliation, stem damage',
            'treatment': ['Apply Bacillus thuringiensis (Bt)', 'Use pheromone traps', 'Hand-picking', 'Targeted spraying'],
            'prevention': ['Regular field scouting', 'Crop rotation', 'Remove crop residues', 'Deep plowing'],
            'severity': 'high'
        },
        'beetles': {
            'description': 'Hard-shelled insects with various feeding habits',
            'damage': 'Holes in leaves, root damage, fruit scarring',
            'treatment': ['Row covers', 'Beneficial nematodes', 'Diatomaceous earth', 'Targeted pesticides'],
            'prevention': ['Crop rotation', 'Remove plant debris', 'Encourage beneficial insects', 'Proper sanitation'],
            'severity': 'medium'
        },
        'bollworm': {
            'description': 'Caterpillars that bore into fruits and cotton bolls',
            'damage': 'Fruit damage, boll damage, yield loss, quality reduction',
            'treatment': ['Bt-based insecticides', 'Pheromone traps', 'Release natural enemies', 'Precise timing sprays'],
            'prevention': ['Plant resistant varieties', 'Monitor adult moths', 'Destroy crop residues', 'IPM practices'],
            'severity': 'high'
        },
        'healthy_crop': {
            'description': 'No pest detected - crop appears healthy',
            'damage': 'No damage observed',
            'treatment': ['Continue current management practices', 'Regular monitoring'],
            'prevention': ['Maintain good practices', 'Regular field inspection', 'IPM implementation'],
            'severity': 'none'
        }
    }
    
    default_info = {
        'description': 'Pest detected - requires attention',
        'damage': 'May cause crop damage if untreated',
        'treatment': ['Consult agricultural expert', 'Monitor closely', 'Apply appropriate treatment'],
        'prevention': ['Regular monitoring', 'Maintain plant health', 'Follow IPM practices'],
        'severity': 'medium'
    }
    
    return pest_database.get(pest_class, default_info)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': model is not None
    })

@app.route('/api/classes', methods=['GET'])
def get_classes():
    """Get pest classes"""
    return jsonify({
        'status': 'success',
        'classes': pest_classes,
        'num_classes': len(pest_classes),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/model/info', methods=['GET'])
def model_info():
    """Get model information"""
    return jsonify({
        'status': 'success',
        'model_info': {
            'model_loaded': model is not None,
            'num_classes': len(pest_classes),
            'class_names': pest_classes,
            'input_shape': [224, 224, 3],
            'model_type': 'AI Pest Detection Model'
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        # Load model if not already loaded
        if not load_model():
            return jsonify({
                'error': 'Model not available',
                'status': 'error'
            }), 503
        
        # Check for image
        if 'image' not in request.files and 'image_data' not in request.form:
            return jsonify({
                'error': 'No image provided',
                'status': 'error'
            }), 400
        
        image = None
        
        # Handle file upload
        if 'image' in request.files:
            file = request.files['image']
            if file.filename == '':
                return jsonify({
                    'error': 'No image file selected',
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
        
        # Validate image
        if image is None:
            return jsonify({
                'error': 'Invalid image',
                'status': 'error'
            }), 400
        
        # Preprocess image
        try:
            img_array = preprocess_image(image)
        except Exception as e:
            return jsonify({
                'error': f'Image preprocessing failed: {str(e)}',
                'status': 'error'
            }), 400
        
        # Make prediction
        try:
            predictions = model.predict(img_array, verbose=0)
            
            # Get predicted class and confidence
            predicted_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_idx])
            predicted_class = pest_classes[predicted_idx]
            
            # Get top 3 predictions
            top_indices = np.argsort(predictions[0])[::-1][:3]
            top_predictions = []
            
            for idx in top_indices:
                top_predictions.append({
                    'class': pest_classes[idx],
                    'confidence': float(predictions[0][idx]),
                    'index': int(idx)
                })
            
            # Prepare result
            result = {
                'predicted_class': predicted_class,
                'predicted_class_index': int(predicted_idx),
                'confidence': confidence,
                'status': 'confident' if confidence >= 0.7 else 'uncertain',
                'top_predictions': top_predictions,
                'pest_info': get_pest_info(predicted_class),
                'timestamp': datetime.now().isoformat()
            }
            
            return jsonify({
                'status': 'success',
                'prediction': result
            })
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            return jsonify({
                'error': f'Prediction failed: {str(e)}',
                'status': 'error'
            }), 500
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
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

if __name__ == '__main__':
    logger.info("Starting Simplified Pest Detection API...")
    logger.info("Available endpoints:")
    logger.info("  GET  /health - Health check")
    logger.info("  POST /api/predict - Image prediction")
    logger.info("  GET  /api/classes - Available classes")
    logger.info("  GET  /api/model/info - Model information")
    
    app.run(host='0.0.0.0', port=5001, debug=False)