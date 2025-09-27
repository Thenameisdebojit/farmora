#!/usr/bin/env python3
"""
Quick test script to diagnose ML service issues
"""

import sys
import os
import traceback

def test_imports():
    """Test if all required modules can be imported"""
    print("🔍 Testing imports...")
    
    try:
        import tensorflow as tf
        print(f"✅ TensorFlow {tf.__version__}")
    except ImportError as e:
        print(f"❌ TensorFlow: {e}")
        return False
    
    try:
        import flask
        print(f"✅ Flask {flask.__version__}")
    except ImportError as e:
        print(f"❌ Flask: {e}")
        return False
    
    try:
        import numpy as np
        print(f"✅ NumPy {np.__version__}")
    except ImportError as e:
        print(f"❌ NumPy: {e}")
        return False
    
    try:
        import cv2
        print(f"✅ OpenCV {cv2.__version__}")
    except ImportError as e:
        print(f"❌ OpenCV: {e}")
        return False
    
    try:
        from PIL import Image
        print("✅ Pillow/PIL")
    except ImportError as e:
        print(f"❌ Pillow: {e}")
        return False
    
    return True

def test_simple_api():
    """Test the simple_api module"""
    print("\n🔍 Testing simple_api module...")
    
    try:
        from simple_api import load_model, get_pest_info, pest_classes
        print("✅ simple_api imports successfully")
        
        # Test pest classes
        print(f"✅ Pest classes loaded: {len(pest_classes)} classes")
        print(f"   Sample classes: {pest_classes[:3]}")
        
        # Test model loading
        print("🔄 Testing model loading...")
        result = load_model()
        print(f"✅ Model loading result: {result}")
        
        # Test pest info function
        print("🔄 Testing pest info function...")
        info = get_pest_info('aphids')
        print("✅ Pest info function works")
        print(f"   Description: {info.get('description', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in simple_api: {e}")
        traceback.print_exc()
        return False

def test_model_creation():
    """Test TensorFlow model creation"""
    print("\n🔍 Testing TensorFlow model creation...")
    
    try:
        import tensorflow as tf
        import numpy as np
        
        # Create a simple model
        model = tf.keras.Sequential([
            tf.keras.layers.Input(shape=(224, 224, 3)),
            tf.keras.layers.Conv2D(32, 3, activation='relu'),
            tf.keras.layers.MaxPooling2D(),
            tf.keras.layers.Flatten(),
            tf.keras.layers.Dense(15, activation='softmax')
        ])
        
        print("✅ Model creation successful")
        
        # Test compilation
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        print("✅ Model compilation successful")
        
        # Test prediction with dummy data
        dummy_input = np.random.random((1, 224, 224, 3))
        prediction = model.predict(dummy_input, verbose=0)
        print("✅ Model prediction successful")
        print(f"   Output shape: {prediction.shape}")
        
        return True
        
    except Exception as e:
        print(f"❌ Model creation error: {e}")
        traceback.print_exc()
        return False

def test_directories():
    """Test if required directories exist"""
    print("\n🔍 Testing directory structure...")
    
    required_dirs = [
        'models',
        'logs', 
        'data',
        'uploads',
        'utils',
        'config'
    ]
    
    all_exist = True
    for dir_name in required_dirs:
        if os.path.exists(dir_name):
            print(f"✅ {dir_name}/ exists")
        else:
            print(f"❌ {dir_name}/ missing")
            all_exist = False
    
    return all_exist

def main():
    """Run all tests"""
    print("🧪 ML Service Diagnostic Test")
    print("=" * 50)
    
    results = []
    
    # Test 1: Imports
    results.append(test_imports())
    
    # Test 2: Directories
    results.append(test_directories())
    
    # Test 3: Model creation
    results.append(test_model_creation())
    
    # Test 4: Simple API
    results.append(test_simple_api())
    
    # Summary
    print("\n📋 Test Summary")
    print("-" * 30)
    
    test_names = [
        "Package Imports",
        "Directory Structure", 
        "TensorFlow Model",
        "Simple API Module"
    ]
    
    all_passed = True
    for i, (name, result) in enumerate(zip(test_names, results)):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{name}: {status}")
        if not result:
            all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 All tests passed! ML service should work correctly.")
        print("\nTo start the service:")
        print("   python simple_api.py")
        print("   or")
        print("   python start_ml_service.py")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    main()