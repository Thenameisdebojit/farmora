import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import tensorflow as tf
from pathlib import Path
import json
import logging
from datetime import datetime

from config.config import MODEL_DIR, PEST_CLASSES, MODEL_CONFIG
from utils.image_utils import preprocess_image, enhance_image, extract_features

logger = logging.getLogger(__name__)

class PestPredictor:
    """
    Pest detection predictor class for loading and using trained models
    """
    
    def __init__(self):
        self.model = None
        self.model_config = None
        self.class_names = PEST_CLASSES
        self.confidence_threshold = 0.5
        self.model_loaded = False
        
    def load_model(self, model_path=None):
        """
        Load the trained model for prediction
        
        Args:
            model_path (str, optional): Path to model file. If None, searches for default models.
        """
        try:
            if model_path is None:
                # Try to find the best available model
                model_path = self._find_best_model()
            
            if not model_path or not Path(model_path).exists():
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            logger.info(f"Loading model from: {model_path}")
            
            # Load the model
            if str(model_path).endswith('.h5'):
                self.model = tf.keras.models.load_model(str(model_path), compile=False)
            else:
                self.model = tf.saved_model.load(str(model_path))
            
            # Load model configuration if available
            config_path = MODEL_DIR / "pest_detection_model_config.json"
            if config_path.exists():
                with open(config_path, 'r') as f:
                    self.model_config = json.load(f)
                    if 'class_names' in self.model_config:
                        self.class_names = self.model_config['class_names']
            
            self.model_loaded = True
            logger.info("Model loaded successfully!")
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise
    
    def _find_best_model(self):
        """Find the best available model file"""
        
        # Priority order of model files to look for
        model_candidates = [
            MODEL_DIR / "pest_detection_model.h5",
            MODEL_DIR / "final_model_transfer_learning.h5",
            MODEL_DIR / "final_model_advanced_cnn.h5",
            MODEL_DIR / "pest_detection_model_savedmodel"
        ]
        
        for model_path in model_candidates:
            if model_path.exists():
                logger.info(f"Found model: {model_path}")
                return model_path
        
        # If no models found, create a dummy model for demonstration
        logger.warning("No trained model found. Creating dummy model for demonstration.")
        return self._create_dummy_model()
    
    def _create_dummy_model(self):
        """Create a dummy model for demonstration purposes"""
        try:
            # Create a simple model architecture
            model = tf.keras.Sequential([
                tf.keras.layers.Input(shape=(224, 224, 3)),
                tf.keras.layers.Conv2D(32, 3, activation='relu'),
                tf.keras.layers.MaxPooling2D(),
                tf.keras.layers.Conv2D(64, 3, activation='relu'),
                tf.keras.layers.MaxPooling2D(),
                tf.keras.layers.Conv2D(64, 3, activation='relu'),
                tf.keras.layers.Flatten(),
                tf.keras.layers.Dense(64, activation='relu'),
                tf.keras.layers.Dense(len(self.class_names), activation='softmax')
            ])
            
            # Compile model
            model.compile(
                optimizer='adam',
                loss='categorical_crossentropy',
                metrics=['accuracy']
            )
            
            # Save dummy model
            dummy_path = MODEL_DIR / "dummy_model.h5"
            model.save(str(dummy_path))
            
            logger.info(f"Created dummy model: {dummy_path}")
            return dummy_path
            
        except Exception as e:
            logger.error(f"Failed to create dummy model: {str(e)}")
            raise
    
    def predict(self, image, enhance=True, extract_additional_features=False):
        """
        Make prediction on a single image
        
        Args:
            image (PIL.Image): Input image
            enhance (bool): Whether to apply image enhancement
            extract_additional_features (bool): Whether to extract additional image features
        
        Returns:
            dict: Prediction results
        """
        if not self.model_loaded or self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        try:
            # Enhance image if requested
            if enhance:
                image = enhance_image(image)
            
            # Preprocess image
            img_array = preprocess_image(image)
            
            # Make prediction
            predictions = self.model.predict(img_array, verbose=0)
            
            # Get the predicted class and confidence
            predicted_class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class_idx])
            predicted_class = self.class_names[predicted_class_idx]
            
            # Get top 3 predictions
            top_indices = np.argsort(predictions[0])[::-1][:3]
            top_predictions = []
            
            for idx in top_indices:
                top_predictions.append({
                    'class': self.class_names[idx],
                    'confidence': float(predictions[0][idx]),
                    'index': int(idx)
                })
            
            # Determine prediction status
            status = 'confident' if confidence >= self.confidence_threshold else 'uncertain'
            
            # Prepare result
            result = {
                'predicted_class': predicted_class,
                'predicted_class_index': int(predicted_class_idx),
                'confidence': confidence,
                'status': status,
                'top_predictions': top_predictions,
                'threshold': self.confidence_threshold,
                'timestamp': datetime.now().isoformat()
            }
            
            # Add additional features if requested
            if extract_additional_features:
                features = extract_features(image)
                result['image_features'] = features
            
            # Add pest information and recommendations
            result['pest_info'] = self._get_pest_info(predicted_class)
            
            return result
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise
    
    def predict_batch(self, images, enhance=True):
        """
        Make predictions on multiple images
        
        Args:
            images (list): List of PIL Images
            enhance (bool): Whether to apply image enhancement
        
        Returns:
            list: List of prediction results
        """
        if not self.model_loaded or self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        results = []
        
        for i, image in enumerate(images):
            try:
                result = self.predict(image, enhance=enhance)
                result['batch_index'] = i
                results.append(result)
            except Exception as e:
                results.append({
                    'batch_index': i,
                    'error': str(e),
                    'status': 'error'
                })
        
        return results
    
    def _get_pest_info(self, pest_class):
        """
        Get information and recommendations for a detected pest
        
        Args:
            pest_class (str): Name of the detected pest class
        
        Returns:
            dict: Pest information and recommendations
        """
        
        # Pest information database
        pest_database = {
            'aphids': {
                'description': 'Small soft-bodied insects that feed on plant juices',
                'damage': 'Yellowing leaves, stunted growth, honeydew secretion',
                'treatment': [
                    'Use insecticidal soap spray',
                    'Introduce beneficial insects like ladybugs',
                    'Apply neem oil',
                    'Remove affected plant parts'
                ],
                'prevention': [
                    'Regular monitoring',
                    'Maintain plant health',
                    'Avoid over-fertilizing with nitrogen'
                ],
                'severity': 'medium'
            },
            'armyworm': {
                'description': 'Caterpillars that feed on leaves and stems',
                'damage': 'Chewed leaves, defoliation, stem damage',
                'treatment': [
                    'Apply Bacillus thuringiensis (Bt)',
                    'Use pheromone traps',
                    'Hand-picking in small infestations',
                    'Apply appropriate insecticides'
                ],
                'prevention': [
                    'Regular field inspection',
                    'Crop rotation',
                    'Remove crop residues'
                ],
                'severity': 'high'
            },
            'beetles': {
                'description': 'Hard-bodied insects with various feeding habits',
                'damage': 'Holes in leaves, root damage, fruit scarring',
                'treatment': [
                    'Use beneficial nematodes for soil-dwelling species',
                    'Apply diatomaceous earth',
                    'Use row covers',
                    'Hand-picking for small populations'
                ],
                'prevention': [
                    'Crop rotation',
                    'Remove plant debris',
                    'Encourage beneficial insects'
                ],
                'severity': 'medium'
            },
            'bollworm': {
                'description': 'Caterpillars that bore into fruits and bolls',
                'damage': 'Fruit damage, yield loss, quality reduction',
                'treatment': [
                    'Apply Bt-based insecticides',
                    'Use pheromone traps for monitoring',
                    'Release natural enemies',
                    'Apply appropriate chemical control'
                ],
                'prevention': [
                    'Plant resistant varieties',
                    'Monitor adult moth activity',
                    'Destroy crop residues'
                ],
                'severity': 'high'
            },
            'healthy_crop': {
                'description': 'No pest detected - crop appears healthy',
                'damage': 'No damage observed',
                'treatment': [
                    'Continue current management practices',
                    'Regular monitoring'
                ],
                'prevention': [
                    'Maintain good agricultural practices',
                    'Regular field inspection',
                    'Integrated pest management'
                ],
                'severity': 'none'
            }
        }
        
        # Default information for unknown pests
        default_info = {
            'description': 'Unidentified pest or unclear image',
            'damage': 'Damage assessment needed',
            'treatment': [
                'Consult with agricultural extension service',
                'Take clear photos for expert identification',
                'Monitor closely for symptoms'
            ],
            'prevention': [
                'Regular monitoring',
                'Maintain plant health',
                'Follow integrated pest management'
            ],
            'severity': 'unknown'
        }
        
        return pest_database.get(pest_class, default_info)
    
    def get_model_info(self):
        """Get information about the loaded model"""
        if not self.model_loaded:
            return {'status': 'Model not loaded'}
        
        try:
            info = {
                'model_loaded': self.model_loaded,
                'num_classes': len(self.class_names),
                'class_names': self.class_names,
                'confidence_threshold': self.confidence_threshold,
                'input_shape': self.model.input_shape if hasattr(self.model, 'input_shape') else 'Unknown'
            }
            
            if self.model_config:
                info.update({
                    'model_type': self.model_config.get('model_type', 'Unknown'),
                    'training_params': self.model_config.get('training_params', {})
                })
            
            return info
            
        except Exception as e:
            logger.error(f"Failed to get model info: {str(e)}")
            return {'error': str(e)}
    
    def set_confidence_threshold(self, threshold):
        """Set the confidence threshold for predictions"""
        if 0.0 <= threshold <= 1.0:
            self.confidence_threshold = threshold
            logger.info(f"Confidence threshold set to {threshold}")
        else:
            raise ValueError("Threshold must be between 0.0 and 1.0")
    
    def evaluate_prediction_quality(self, image, prediction_result):
        """
        Evaluate the quality of a prediction based on image characteristics
        
        Args:
            image (PIL.Image): Input image
            prediction_result (dict): Prediction results
        
        Returns:
            dict: Quality assessment
        """
        try:
            # Extract image features
            features = extract_features(image)
            
            quality_score = 1.0
            quality_factors = []
            
            # Check image brightness
            brightness = features.get('brightness', 128)
            if brightness < 50:
                quality_score *= 0.8
                quality_factors.append('Image too dark')
            elif brightness > 200:
                quality_score *= 0.9
                quality_factors.append('Image too bright')
            
            # Check image contrast
            contrast = features.get('contrast', 50)
            if contrast < 20:
                quality_score *= 0.8
                quality_factors.append('Low contrast')
            
            # Check prediction confidence
            confidence = prediction_result.get('confidence', 0)
            if confidence < 0.7:
                quality_score *= 0.7
                quality_factors.append('Low model confidence')
            
            # Check texture strength (important for pest detection)
            texture = features.get('texture_strength', 10)
            if texture < 5:
                quality_score *= 0.9
                quality_factors.append('Low texture detail')
            
            # Overall quality assessment
            if quality_score >= 0.8:
                quality_level = 'high'
            elif quality_score >= 0.6:
                quality_level = 'medium'
            else:
                quality_level = 'low'
            
            return {
                'quality_score': quality_score,
                'quality_level': quality_level,
                'quality_factors': quality_factors,
                'recommendations': self._get_image_quality_recommendations(quality_factors)
            }
            
        except Exception as e:
            logger.error(f"Quality evaluation failed: {str(e)}")
            return {'error': str(e)}
    
    def _get_image_quality_recommendations(self, quality_factors):
        """Get recommendations for improving image quality"""
        recommendations = []
        
        if 'Image too dark' in quality_factors:
            recommendations.append('Increase lighting or brightness')
        if 'Image too bright' in quality_factors:
            recommendations.append('Reduce lighting or use diffused light')
        if 'Low contrast' in quality_factors:
            recommendations.append('Improve image contrast or use better lighting')
        if 'Low model confidence' in quality_factors:
            recommendations.append('Try taking photos from different angles')
        if 'Low texture detail' in quality_factors:
            recommendations.append('Get closer to subject or use higher resolution')
        
        if not recommendations:
            recommendations.append('Image quality is good')
        
        return recommendations