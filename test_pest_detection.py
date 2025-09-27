#!/usr/bin/env python3
"""
Test script for the complete pest detection pipeline
"""

import requests
import json
import time
import os
from PIL import Image, ImageDraw
import io
import base64

# Configuration
BACKEND_URL = 'http://localhost:3000'
ML_SERVICE_URL = 'http://localhost:5001'

def create_test_image():
    """Create a simple test image"""
    # Create a 300x300 RGB image with a simple pattern
    img = Image.new('RGB', (300, 300), color='lightgreen')
    draw = ImageDraw.Draw(img)
    
    # Draw some simple shapes to simulate a leaf with spots (aphids)
    draw.ellipse([50, 50, 250, 250], fill='green')
    draw.ellipse([100, 100, 120, 120], fill='black')  # Simulate pest
    draw.ellipse([180, 150, 200, 170], fill='black')  # Another pest spot
    draw.ellipse([130, 180, 150, 200], fill='brown')  # Damage
    
    return img

def save_test_image(image, filename='test_leaf.jpg'):
    """Save test image to file"""
    image.save(filename, 'JPEG', quality=95)
    return filename

def test_ml_service_health():
    """Test ML service health endpoint"""
    print("🔍 Testing ML service health...")
    try:
        response = requests.get(f"{ML_SERVICE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ ML service is healthy")
            print(f"   Status: {data.get('status')}")
            print(f"   Model loaded: {data.get('model_loaded')}")
            return True
        else:
            print(f"❌ ML service health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ML service is not reachable: {e}")
        return False

def test_ml_service_classes():
    """Test ML service classes endpoint"""
    print("🔍 Testing ML service classes...")
    try:
        response = requests.get(f"{ML_SERVICE_URL}/api/classes", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Classes endpoint working")
            print(f"   Number of classes: {data.get('num_classes')}")
            print(f"   Classes: {', '.join(data.get('classes', [])[:5])}...")
            return True
        else:
            print(f"❌ Classes endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Classes endpoint error: {e}")
        return False

def test_ml_service_prediction(image_path):
    """Test ML service prediction endpoint"""
    print("🔍 Testing ML service prediction...")
    try:
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post(f"{ML_SERVICE_URL}/api/predict", files=files, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                prediction = data.get('prediction', {})
                print(f"✅ ML prediction successful")
                print(f"   Predicted class: {prediction.get('predicted_class')}")
                print(f"   Confidence: {prediction.get('confidence', 0):.2%}")
                print(f"   Status: {prediction.get('status')}")
                return True, data
            else:
                print(f"❌ ML prediction failed: {data.get('error', 'Unknown error')}")
                return False, None
        else:
            print(f"❌ ML prediction request failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ ML prediction error: {e}")
        return False, None

def test_backend_health():
    """Test backend health endpoint"""
    print("🔍 Testing backend health...")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend is healthy")
            print(f"   Message: {data.get('message')}")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend is not reachable: {e}")
        return False

def test_backend_pest_detection(image_path, auth_token=None):
    """Test backend pest detection endpoint"""
    print("🔍 Testing backend pest detection...")
    try:
        headers = {}
        if auth_token:
            headers['Authorization'] = f'Bearer {auth_token}'
        
        with open(image_path, 'rb') as f:
            files = {'pestImage': f}
            data = {'cropType': 'tomato', 'location': 'test'}
            response = requests.post(
                f"{BACKEND_URL}/api/pest/detect", 
                files=files, 
                data=data,
                headers=headers,
                timeout=60
            )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                pest_data = data.get('data', {})
                print(f"✅ Backend pest detection successful")
                print(f"   Detected pest: {pest_data.get('pest')}")
                print(f"   Confidence: {pest_data.get('confidence', 0):.2%}")
                print(f"   Severity: {pest_data.get('severity')}")
                return True, data
            else:
                print(f"❌ Backend pest detection failed: {data.get('message')}")
                return False, None
        else:
            print(f"❌ Backend pest detection request failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ Backend pest detection error: {e}")
        return False, None

def run_complete_test():
    """Run complete pest detection pipeline test"""
    print("🧪 Starting Complete Pest Detection Pipeline Test")
    print("=" * 60)
    
    # Create test image
    print("📸 Creating test image...")
    test_img = create_test_image()
    img_path = save_test_image(test_img)
    print(f"✅ Test image created: {img_path}")
    print()
    
    # Test ML service
    print("🤖 Testing ML Service...")
    print("-" * 30)
    ml_healthy = test_ml_service_health()
    print()
    
    if ml_healthy:
        test_ml_service_classes()
        print()
        
        ml_success, ml_result = test_ml_service_prediction(img_path)
        print()
    else:
        ml_success = False
        print("⚠️  Skipping ML service tests due to health check failure")
        print()
    
    # Test backend
    print("🖥️  Testing Backend Service...")
    print("-" * 30)
    backend_healthy = test_backend_health()
    print()
    
    if backend_healthy and ml_healthy:
        backend_success, backend_result = test_backend_pest_detection(img_path)
        print()
    else:
        backend_success = False
        print("⚠️  Skipping backend pest detection test")
        print()
    
    # Summary
    print("📋 Test Summary")
    print("-" * 30)
    print(f"ML Service Health: {'✅' if ml_healthy else '❌'}")
    print(f"ML Service Prediction: {'✅' if ml_success else '❌'}")
    print(f"Backend Health: {'✅' if backend_healthy else '❌'}")
    print(f"Backend Integration: {'✅' if backend_success else '❌'}")
    print()
    
    if ml_healthy and backend_healthy and ml_success:
        print("🎉 Pest Detection Pipeline is working!")
        print("   You can now:")
        print("   1. Start the ML service: python ml-service/start_ml_service.py")
        print("   2. Start the backend: npm start (in backend directory)")
        print("   3. Test with frontend or API calls")
    else:
        print("⚠️  Some issues need to be resolved:")
        if not ml_healthy:
            print("   - Start ML service: python ml-service/start_ml_service.py")
        if not backend_healthy:
            print("   - Start backend service: npm start (in backend directory)")
        print("   - Check service logs for detailed error information")
    
    # Cleanup
    try:
        os.remove(img_path)
        print(f"🧹 Cleaned up test image: {img_path}")
    except:
        pass

def test_individual_components():
    """Test individual components separately"""
    print("🔧 Testing Individual Components")
    print("=" * 60)
    
    # Create test image
    test_img = create_test_image()
    img_path = save_test_image(test_img, 'component_test.jpg')
    
    while True:
        print("\nChoose a test:")
        print("1. Test ML Service Health")
        print("2. Test ML Service Classes")
        print("3. Test ML Service Prediction")
        print("4. Test Backend Health")
        print("5. Test Backend Pest Detection")
        print("6. Run Complete Pipeline Test")
        print("0. Exit")
        
        choice = input("\nEnter your choice (0-6): ").strip()
        
        if choice == '0':
            break
        elif choice == '1':
            test_ml_service_health()
        elif choice == '2':
            test_ml_service_classes()
        elif choice == '3':
            test_ml_service_prediction(img_path)
        elif choice == '4':
            test_backend_health()
        elif choice == '5':
            test_backend_pest_detection(img_path)
        elif choice == '6':
            run_complete_test()
            break
        else:
            print("Invalid choice. Please try again.")
    
    # Cleanup
    try:
        os.remove(img_path)
    except:
        pass

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--interactive':
        test_individual_components()
    else:
        run_complete_test()