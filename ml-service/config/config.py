import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).parent.parent
MODEL_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"
LOGS_DIR = BASE_DIR / "logs"

# Model configuration
MODEL_CONFIG = {
    'input_shape': (224, 224, 3),
    'num_classes': 15,  # Common crop pests
    'batch_size': 32,
    'epochs': 100,
    'learning_rate': 0.001,
    'patience': 10,  # Early stopping patience
}

# Data configuration
DATA_CONFIG = {
    'train_split': 0.7,
    'val_split': 0.15,
    'test_split': 0.15,
    'augmentation': True,
    'image_size': (224, 224),
}

# API configuration
API_CONFIG = {
    'host': '0.0.0.0',
    'port': 5001,
    'debug': False,
    'max_content_length': 16 * 1024 * 1024,  # 16MB max file size
}

# Pest classes - Common crop pests
PEST_CLASSES = [
    'aphids',
    'armyworm',
    'beetles',
    'bollworm',
    'caterpillars',
    'cutworm',
    'grasshopper',
    'leafhopper',
    'mites',
    'scale_insects',
    'thrips',
    'whitefly',
    'wireworm',
    'healthy_crop',
    'unknown_pest'
]

# Model paths
TRAINED_MODEL_PATH = MODEL_DIR / "pest_detection_model.h5"
WEIGHTS_PATH = MODEL_DIR / "pest_detection_weights.h5"
SCALER_PATH = MODEL_DIR / "scaler.pkl"

# Logging configuration
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
    },
    'handlers': {
        'default': {
            'level': 'INFO',
            'formatter': 'standard',
            'class': 'logging.StreamHandler',
        },
        'file': {
            'level': 'INFO',
            'formatter': 'standard',
            'class': 'logging.FileHandler',
            'filename': LOGS_DIR / 'ml_service.log',
            'mode': 'a',
        },
    },
    'loggers': {
        '': {
            'handlers': ['default', 'file'],
            'level': 'INFO',
            'propagate': False
        }
    }
}