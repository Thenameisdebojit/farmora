import os
import numpy as np
import cv2
from pathlib import Path
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import seaborn as sns
from config.config import DATA_CONFIG, PEST_CLASSES, DATA_DIR
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PestDataPreprocessor:
    def __init__(self):
        self.image_size = DATA_CONFIG['image_size']
        self.train_split = DATA_CONFIG['train_split']
        self.val_split = DATA_CONFIG['val_split']
        self.test_split = DATA_CONFIG['test_split']
        self.classes = PEST_CLASSES
        
    def create_sample_data(self):
        """
        Create sample synthetic data for demonstration purposes.
        In production, replace this with actual pest image datasets.
        """
        logger.info("Creating sample synthetic data...")
        
        # Create sample data directories
        sample_dir = DATA_DIR / "sample_data"
        sample_dir.mkdir(exist_ok=True)
        
        for pest_class in self.classes:
            class_dir = sample_dir / pest_class
            class_dir.mkdir(exist_ok=True)
            
            # Generate synthetic images for each class
            for i in range(50):  # 50 samples per class
                # Create a synthetic image with some patterns
                img = self.generate_synthetic_pest_image(pest_class)
                
                # Save the image
                img_path = class_dir / f"{pest_class}_{i:03d}.jpg"
                cv2.imwrite(str(img_path), img)
        
        logger.info(f"Sample data created with {len(self.classes)} classes")
        return sample_dir
    
    def generate_synthetic_pest_image(self, pest_class):
        """Generate synthetic pest images with distinctive patterns"""
        img = np.random.randint(0, 255, (*self.image_size, 3), dtype=np.uint8)
        
        # Add class-specific patterns
        class_patterns = {
            'aphids': self._add_small_clusters,
            'armyworm': self._add_worm_pattern,
            'beetles': self._add_beetle_shapes,
            'bollworm': self._add_round_patterns,
            'caterpillars': self._add_elongated_patterns,
            'cutworm': self._add_curved_patterns,
            'grasshopper': self._add_leg_patterns,
            'leafhopper': self._add_triangular_patterns,
            'mites': self._add_tiny_dots,
            'scale_insects': self._add_scale_patterns,
            'thrips': self._add_linear_patterns,
            'whitefly': self._add_white_spots,
            'wireworm': self._add_wire_patterns,
            'healthy_crop': self._add_healthy_patterns,
            'unknown_pest': self._add_random_patterns
        }
        
        if pest_class in class_patterns:
            img = class_patterns[pest_class](img)
        
        return img
    
    def _add_small_clusters(self, img):
        """Add small clustered patterns for aphids"""
        for _ in range(np.random.randint(5, 15)):
            center = (np.random.randint(20, img.shape[1]-20), 
                     np.random.randint(20, img.shape[0]-20))
            cv2.circle(img, center, np.random.randint(2, 5), (0, 100, 0), -1)
        return img
    
    def _add_worm_pattern(self, img):
        """Add worm-like patterns"""
        for _ in range(np.random.randint(2, 5)):
            pts = np.random.randint(0, min(img.shape[:2]), (4, 2))
            cv2.polylines(img, [pts], False, (139, 69, 19), 3)
        return img
    
    def _add_beetle_shapes(self, img):
        """Add oval beetle shapes"""
        for _ in range(np.random.randint(2, 6)):
            center = (np.random.randint(30, img.shape[1]-30), 
                     np.random.randint(30, img.shape[0]-30))
            axes = (np.random.randint(8, 15), np.random.randint(12, 20))
            cv2.ellipse(img, center, axes, 0, 0, 360, (0, 0, 0), -1)
        return img
    
    def _add_round_patterns(self, img):
        """Add round patterns for bollworm"""
        for _ in range(np.random.randint(3, 8)):
            center = (np.random.randint(15, img.shape[1]-15), 
                     np.random.randint(15, img.shape[0]-15))
            cv2.circle(img, center, np.random.randint(5, 12), (100, 50, 0), -1)
        return img
    
    def _add_elongated_patterns(self, img):
        """Add elongated patterns for caterpillars"""
        for _ in range(np.random.randint(1, 3)):
            start = (np.random.randint(0, img.shape[1]//2), 
                    np.random.randint(0, img.shape[0]))
            end = (start[0] + np.random.randint(50, 100), 
                  start[1] + np.random.randint(-20, 20))
            cv2.line(img, start, end, (50, 150, 50), np.random.randint(8, 15))
        return img
    
    def _add_curved_patterns(self, img):
        """Add curved patterns for cutworm"""
        for _ in range(np.random.randint(1, 3)):
            pts = []
            for i in range(5):
                x = np.random.randint(0, img.shape[1])
                y = np.random.randint(0, img.shape[0])
                pts.append([x, y])
            pts = np.array(pts, dtype=np.int32)
            cv2.polylines(img, [pts], False, (75, 75, 0), 5)
        return img
    
    def _add_leg_patterns(self, img):
        """Add leg-like patterns for grasshopper"""
        center = (img.shape[1]//2, img.shape[0]//2)
        for angle in range(0, 360, 60):
            end_x = int(center[0] + 40 * np.cos(np.radians(angle)))
            end_y = int(center[1] + 40 * np.sin(np.radians(angle)))
            cv2.line(img, center, (end_x, end_y), (0, 150, 0), 3)
        return img
    
    def _add_triangular_patterns(self, img):
        """Add triangular patterns for leafhopper"""
        for _ in range(np.random.randint(3, 7)):
            pts = np.random.randint(0, min(img.shape[:2]), (3, 2))
            cv2.fillPoly(img, [pts], (0, 200, 100))
        return img
    
    def _add_tiny_dots(self, img):
        """Add tiny dots for mites"""
        for _ in range(np.random.randint(20, 50)):
            center = (np.random.randint(0, img.shape[1]), 
                     np.random.randint(0, img.shape[0]))
            cv2.circle(img, center, 1, (200, 0, 0), -1)
        return img
    
    def _add_scale_patterns(self, img):
        """Add scale-like patterns"""
        for _ in range(np.random.randint(10, 20)):
            center = (np.random.randint(10, img.shape[1]-10), 
                     np.random.randint(10, img.shape[0]-10))
            cv2.circle(img, center, np.random.randint(3, 7), (150, 100, 50), -1)
        return img
    
    def _add_linear_patterns(self, img):
        """Add linear patterns for thrips"""
        for _ in range(np.random.randint(5, 12)):
            start = (np.random.randint(0, img.shape[1]), 
                    np.random.randint(0, img.shape[0]))
            end = (start[0] + np.random.randint(-30, 30), 
                  start[1] + np.random.randint(-30, 30))
            cv2.line(img, start, end, (255, 255, 0), 2)
        return img
    
    def _add_white_spots(self, img):
        """Add white spots for whitefly"""
        for _ in range(np.random.randint(8, 15)):
            center = (np.random.randint(10, img.shape[1]-10), 
                     np.random.randint(10, img.shape[0]-10))
            cv2.circle(img, center, np.random.randint(3, 8), (255, 255, 255), -1)
        return img
    
    def _add_wire_patterns(self, img):
        """Add wire-like patterns for wireworm"""
        for _ in range(np.random.randint(2, 4)):
            start = (0, np.random.randint(0, img.shape[0]))
            end = (img.shape[1], np.random.randint(0, img.shape[0]))
            cv2.line(img, start, end, (100, 50, 0), 2)
        return img
    
    def _add_healthy_patterns(self, img):
        """Add healthy green patterns"""
        img[:] = [0, 150, 0]  # Green background
        # Add some leaf-like patterns
        for _ in range(np.random.randint(3, 6)):
            pts = np.random.randint(0, min(img.shape[:2]), (6, 2))
            cv2.fillPoly(img, [pts], (0, 200, 50))
        return img
    
    def _add_random_patterns(self, img):
        """Add random patterns for unknown pests"""
        for _ in range(np.random.randint(5, 15)):
            shape_type = np.random.choice(['circle', 'line', 'rectangle'])
            color = tuple(np.random.randint(0, 255, 3).tolist())
            
            if shape_type == 'circle':
                center = (np.random.randint(0, img.shape[1]), 
                         np.random.randint(0, img.shape[0]))
                cv2.circle(img, center, np.random.randint(2, 10), color, -1)
            elif shape_type == 'line':
                start = (np.random.randint(0, img.shape[1]), 
                        np.random.randint(0, img.shape[0]))
                end = (np.random.randint(0, img.shape[1]), 
                      np.random.randint(0, img.shape[0]))
                cv2.line(img, start, end, color, np.random.randint(1, 5))
            else:
                pt1 = (np.random.randint(0, img.shape[1]//2), 
                      np.random.randint(0, img.shape[0]//2))
                pt2 = (pt1[0] + np.random.randint(10, 50), 
                      pt1[1] + np.random.randint(10, 50))
                cv2.rectangle(img, pt1, pt2, color, -1)
        return img
    
    def load_and_preprocess_data(self, data_dir=None):
        """Load and preprocess the dataset"""
        if data_dir is None:
            # Create sample data if no real data is provided
            data_dir = self.create_sample_data()
        
        logger.info(f"Loading data from {data_dir}")
        
        images = []
        labels = []
        
        for class_idx, class_name in enumerate(self.classes):
            class_dir = Path(data_dir) / class_name
            if not class_dir.exists():
                logger.warning(f"Class directory {class_dir} not found")
                continue
            
            image_files = list(class_dir.glob("*.jpg")) + list(class_dir.glob("*.png"))
            logger.info(f"Found {len(image_files)} images for class {class_name}")
            
            for img_path in image_files:
                try:
                    # Load and preprocess image
                    img = cv2.imread(str(img_path))
                    if img is not None:
                        img = cv2.resize(img, self.image_size)
                        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                        img = img.astype(np.float32) / 255.0
                        
                        images.append(img)
                        labels.append(class_idx)
                except Exception as e:
                    logger.error(f"Error loading image {img_path}: {e}")
        
        images = np.array(images)
        labels = np.array(labels)
        
        logger.info(f"Loaded {len(images)} images with {len(set(labels))} classes")
        
        return images, labels
    
    def create_data_generators(self, X_train, y_train, X_val, y_val):
        """Create data generators with augmentation"""
        
        # Data augmentation for training
        train_datagen = ImageDataGenerator(
            rotation_range=30,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            vertical_flip=True,
            fill_mode='nearest',
            brightness_range=[0.8, 1.2]
        )
        
        # No augmentation for validation
        val_datagen = ImageDataGenerator()
        
        train_generator = train_datagen.flow(
            X_train, y_train,
            batch_size=32,
            shuffle=True
        )
        
        val_generator = val_datagen.flow(
            X_val, y_val,
            batch_size=32,
            shuffle=False
        )
        
        return train_generator, val_generator
    
    def prepare_dataset(self, data_dir=None):
        """Complete dataset preparation pipeline"""
        logger.info("Starting dataset preparation...")
        
        # Load data
        images, labels = self.load_and_preprocess_data(data_dir)
        
        if len(images) == 0:
            raise ValueError("No images loaded. Check data directory.")
        
        # Convert labels to categorical
        labels = tf.keras.utils.to_categorical(labels, len(self.classes))
        
        # Split data
        X_temp, X_test, y_temp, y_test = train_test_split(
            images, labels, 
            test_size=self.test_split, 
            stratify=labels.argmax(axis=1),
            random_state=42
        )
        
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp,
            test_size=self.val_split / (self.train_split + self.val_split),
            stratify=y_temp.argmax(axis=1),
            random_state=42
        )
        
        logger.info(f"Dataset split - Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
        
        # Create data generators
        train_gen, val_gen = self.create_data_generators(X_train, y_train, X_val, y_val)
        
        return {
            'train_generator': train_gen,
            'val_generator': val_gen,
            'test_data': (X_test, y_test),
            'class_names': self.classes
        }

if __name__ == "__main__":
    preprocessor = PestDataPreprocessor()
    data = preprocessor.prepare_dataset()
    logger.info("Data preparation completed successfully!")