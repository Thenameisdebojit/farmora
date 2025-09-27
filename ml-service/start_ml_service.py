#!/usr/bin/env python3
"""
Startup script for the Smart Crop Advisory ML Service
"""

import os
import sys
import logging
from pathlib import Path

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_dependencies():
    """Check if all required dependencies are installed"""
    try:
        import tensorflow as tf
        import flask
        import numpy as np
        import cv2
        import PIL
        logger.info("✅ All required dependencies are installed")
        return True
    except ImportError as e:
        logger.error(f"❌ Missing dependency: {e}")
        logger.info("Please install required dependencies:")
        logger.info("pip install tensorflow flask numpy opencv-python pillow flask-cors")
        return False

def setup_directories():
    """Create required directories"""
    directories = [
        'models',
        'logs',
        'data',
        'uploads'
    ]
    
    for dir_name in directories:
        dir_path = Path(dir_name)
        dir_path.mkdir(exist_ok=True)
        logger.info(f"✅ Directory ready: {dir_path.absolute()}")

def check_tensorflow():
    """Check TensorFlow installation and GPU availability"""
    try:
        import tensorflow as tf
        logger.info(f"✅ TensorFlow version: {tf.__version__}")
        
        # Check for GPU
        gpus = tf.config.list_physical_devices('GPU')
        if gpus:
            logger.info(f"✅ Found {len(gpus)} GPU(s)")
            for gpu in gpus:
                logger.info(f"  - {gpu}")
        else:
            logger.info("ℹ️  No GPU found, using CPU")
        
        return True
    except Exception as e:
        logger.error(f"❌ TensorFlow check failed: {e}")
        return False

def start_service():
    """Start the ML service"""
    logger.info("🚀 Starting Smart Crop Advisory ML Service...")
    
    # Check dependencies
    if not check_dependencies():
        return False
    
    # Setup directories
    setup_directories()
    
    # Check TensorFlow
    if not check_tensorflow():
        return False
    
    try:
        # Import and start the simple API
        from simple_api import app
        
        logger.info("🌐 Starting Flask server on http://0.0.0.0:5001")
        logger.info("📋 Available endpoints:")
        logger.info("  - GET  /health - Health check")
        logger.info("  - POST /api/predict - Image prediction")
        logger.info("  - GET  /api/classes - Available classes")
        logger.info("  - GET  /api/model/info - Model information")
        logger.info("")
        logger.info("🔗 Test the service:")
        logger.info("  curl http://localhost:5001/health")
        logger.info("")
        logger.info("⚠️  To stop the service, press Ctrl+C")
        
        # Start the Flask app
        app.run(host='0.0.0.0', port=5001, debug=False)
        
    except KeyboardInterrupt:
        logger.info("\n⏹️  Service stopped by user")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to start service: {e}")
        return False

if __name__ == "__main__":
    success = start_service()
    sys.exit(0 if success else 1)