import numpy as np
import cv2
from PIL import Image
import io
import logging

logger = logging.getLogger(__name__)

def validate_image(image):
    """
    Validate if the image is in correct format and size
    """
    try:
        if image is None:
            return False
        
        if not isinstance(image, Image.Image):
            return False
        
        # Check image mode
        if image.mode not in ['RGB', 'RGBA', 'L']:
            return False
        
        # Check image size (minimum and maximum)
        width, height = image.size
        if width < 32 or height < 32:
            logger.warning(f"Image too small: {width}x{height}")
            return False
        
        if width > 4096 or height > 4096:
            logger.warning(f"Image too large: {width}x{height}")
            return False
        
        return True
    
    except Exception as e:
        logger.error(f"Image validation error: {str(e)}")
        return False

def preprocess_image(image, target_size=(224, 224)):
    """
    Preprocess image for model prediction
    
    Args:
        image (PIL.Image): Input image
        target_size (tuple): Target size for resizing
    
    Returns:
        np.ndarray: Preprocessed image array
    """
    try:
        # Convert to RGB if not already
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize image
        image = image.resize(target_size, Image.Resampling.LANCZOS)
        
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

def enhance_image(image):
    """
    Apply image enhancement techniques for better prediction
    
    Args:
        image (PIL.Image): Input image
    
    Returns:
        PIL.Image: Enhanced image
    """
    try:
        # Convert to OpenCV format
        img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        lab = cv2.cvtColor(img_cv, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        lab = cv2.merge([l, a, b])
        img_cv = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
        
        # Apply Gaussian blur to reduce noise
        img_cv = cv2.GaussianBlur(img_cv, (3, 3), 0)
        
        # Convert back to PIL Image
        img_enhanced = Image.fromarray(cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB))
        
        return img_enhanced
    
    except Exception as e:
        logger.warning(f"Image enhancement failed, using original: {str(e)}")
        return image

def detect_pest_regions(image):
    """
    Detect potential pest regions in the image using computer vision techniques
    
    Args:
        image (PIL.Image): Input image
    
    Returns:
        list: List of bounding boxes for detected regions
    """
    try:
        # Convert to OpenCV format
        img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Convert to grayscale
        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
        
        # Apply edge detection
        edges = cv2.Canny(gray, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter contours by area
        min_area = 100
        max_area = img_cv.shape[0] * img_cv.shape[1] * 0.5
        
        regions = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if min_area < area < max_area:
                x, y, w, h = cv2.boundingRect(contour)
                regions.append({
                    'bbox': (x, y, x + w, y + h),
                    'area': area,
                    'confidence': min(1.0, area / 1000)  # Simple confidence score
                })
        
        # Sort by area (larger regions first)
        regions.sort(key=lambda x: x['area'], reverse=True)
        
        return regions[:5]  # Return top 5 regions
    
    except Exception as e:
        logger.error(f"Pest region detection error: {str(e)}")
        return []

def extract_features(image):
    """
    Extract basic image features that might be useful for pest detection
    
    Args:
        image (PIL.Image): Input image
    
    Returns:
        dict: Dictionary of extracted features
    """
    try:
        # Convert to numpy array
        img_array = np.array(image)
        
        # Basic color statistics
        mean_rgb = np.mean(img_array, axis=(0, 1))
        std_rgb = np.std(img_array, axis=(0, 1))
        
        # Convert to HSV for additional features
        img_hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
        mean_hsv = np.mean(img_hsv, axis=(0, 1))
        std_hsv = np.std(img_hsv, axis=(0, 1))
        
        # Texture features using gradient
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        texture_strength = np.mean(np.sqrt(grad_x**2 + grad_y**2))
        
        features = {
            'mean_rgb': mean_rgb.tolist(),
            'std_rgb': std_rgb.tolist(),
            'mean_hsv': mean_hsv.tolist(),
            'std_hsv': std_hsv.tolist(),
            'texture_strength': float(texture_strength),
            'brightness': float(np.mean(gray)),
            'contrast': float(np.std(gray))
        }
        
        return features
    
    except Exception as e:
        logger.error(f"Feature extraction error: {str(e)}")
        return {}

def create_image_patches(image, patch_size=(64, 64), overlap=0.5):
    """
    Create overlapping patches from an image for detailed analysis
    
    Args:
        image (PIL.Image): Input image
        patch_size (tuple): Size of each patch
        overlap (float): Overlap ratio between patches
    
    Returns:
        list: List of image patches
    """
    try:
        img_array = np.array(image)
        h, w = img_array.shape[:2]
        
        patch_h, patch_w = patch_size
        step_h = int(patch_h * (1 - overlap))
        step_w = int(patch_w * (1 - overlap))
        
        patches = []
        
        for y in range(0, h - patch_h + 1, step_h):
            for x in range(0, w - patch_w + 1, step_w):
                patch = img_array[y:y+patch_h, x:x+patch_w]
                patch_pil = Image.fromarray(patch)
                patches.append({
                    'image': patch_pil,
                    'position': (x, y),
                    'size': patch_size
                })
        
        return patches
    
    except Exception as e:
        logger.error(f"Patch creation error: {str(e)}")
        return []

def apply_augmentation(image, augmentation_type='random'):
    """
    Apply data augmentation for robustness testing
    
    Args:
        image (PIL.Image): Input image
        augmentation_type (str): Type of augmentation to apply
    
    Returns:
        PIL.Image: Augmented image
    """
    try:
        img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        if augmentation_type == 'brightness':
            # Adjust brightness
            img_cv = cv2.convertScaleAbs(img_cv, alpha=1.0, beta=30)
        
        elif augmentation_type == 'contrast':
            # Adjust contrast
            img_cv = cv2.convertScaleAbs(img_cv, alpha=1.3, beta=0)
        
        elif augmentation_type == 'noise':
            # Add Gaussian noise
            noise = np.random.normal(0, 25, img_cv.shape).astype(np.uint8)
            img_cv = cv2.add(img_cv, noise)
        
        elif augmentation_type == 'blur':
            # Apply motion blur
            kernel = np.zeros((15, 15))
            kernel[int((15-1)/2), :] = np.ones(15)
            kernel = kernel / 15
            img_cv = cv2.filter2D(img_cv, -1, kernel)
        
        elif augmentation_type == 'rotation':
            # Rotate image
            h, w = img_cv.shape[:2]
            center = (w // 2, h // 2)
            matrix = cv2.getRotationMatrix2D(center, 15, 1.0)
            img_cv = cv2.warpAffine(img_cv, matrix, (w, h))
        
        # Convert back to PIL
        img_aug = Image.fromarray(cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB))
        return img_aug
    
    except Exception as e:
        logger.error(f"Augmentation error: {str(e)}")
        return image