#!/usr/bin/env python3
"""
ML Service Validation Script
Tests the complete functionality of the pest detection service
"""

import time
import requests
import threading
import subprocess
import sys
import os
from pathlib import Path
from PIL import Image, ImageDraw
import io

def create_test_image():
    """Create a test image for validation"""
    # Create a 300x300 RGB image with a simple pattern
    img = Image.new('RGB', (300, 300), color='lightgreen')
    draw = ImageDraw.Draw(img)
    
    # Draw some simple shapes to simulate a leaf with spots
    draw.ellipse([50, 50, 250, 250], fill='green')
    draw.ellipse([100, 100, 120, 120], fill='black')  # Simulate pest
    draw.ellipse([180, 150, 200, 170], fill='black')  # Another pest spot
    
    return img

def start_service_in_background():
    """Start the ML service in a separate process"""
    try:
        # Start the service
        process = subprocess.Popen(
            [sys.executable, "simple_api.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=os.getcwd()
        )
        
        # Wait a bit for the service to start
        time.sleep(3)
        
        return process
        
    except Exception as e:
        print(f"❌ Failed to start service: {e}")
        return None

def test_health_endpoint():
    """Test the health endpoint"""
    print("🔍 Testing health endpoint...")
    
    try:
        response = requests.get("http://localhost:5001/health", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Health endpoint works")
            print(f"   Status: {data.get('status')}")
            print(f"   Model loaded: {data.get('model_loaded')}")
            return True
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return False

def test_classes_endpoint():
    """Test the classes endpoint"""
    print("\n🔍 Testing classes endpoint...")
    
    try:
        response = requests.get("http://localhost:5001/api/classes", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Classes endpoint works")
            print(f"   Number of classes: {data.get('num_classes')}")
            print(f"   Sample classes: {', '.join(data.get('classes', [])[:5])}...")
            return True
        else:
            print(f"❌ Classes endpoint failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Classes endpoint error: {e}")
        return False

def test_model_info_endpoint():
    """Test the model info endpoint"""
    print("\n🔍 Testing model info endpoint...")
    
    try:
        response = requests.get("http://localhost:5001/api/model/info", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Model info endpoint works")
            model_info = data.get('model_info', {})
            print(f"   Model loaded: {model_info.get('model_loaded')}")
            print(f"   Model type: {model_info.get('model_type')}")
            return True
        else:
            print(f"❌ Model info endpoint failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Model info endpoint error: {e}")
        return False

def test_prediction_endpoint():
    """Test the prediction endpoint"""
    print("\n🔍 Testing prediction endpoint...")
    
    try:
        # Create test image
        test_img = create_test_image()
        
        # Save to bytes
        img_buffer = io.BytesIO()
        test_img.save(img_buffer, format='JPEG', quality=95)
        img_buffer.seek(0)
        
        # Send prediction request
        files = {'image': ('test_image.jpg', img_buffer, 'image/jpeg')}
        response = requests.post("http://localhost:5001/api/predict", files=files, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('status') == 'success':
                prediction = data.get('prediction', {})
                print("✅ Prediction endpoint works")
                print(f"   Predicted class: {prediction.get('predicted_class')}")
                print(f"   Confidence: {prediction.get('confidence', 0):.2%}")
                print(f"   Status: {prediction.get('status')}")
                
                # Check if pest info is included
                pest_info = prediction.get('pest_info', {})
                if pest_info:
                    print(f"   Description: {pest_info.get('description', 'N/A')[:50]}...")
                    print(f"   Treatment options: {len(pest_info.get('treatment', []))}")
                
                return True
            else:
                print(f"❌ Prediction failed: {data.get('error')}")
                return False
        else:
            print(f"❌ Prediction endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Prediction endpoint error: {e}")
        return False

def validate_service():
    """Run complete service validation"""
    print("🧪 ML Service Complete Validation")
    print("=" * 60)
    
    # Start service
    print("🚀 Starting ML service...")
    process = start_service_in_background()
    
    if not process:
        print("❌ Failed to start service")
        return False
    
    try:
        # Wait for service to be ready
        print("⏳ Waiting for service to be ready...")
        time.sleep(5)
        
        # Check if process is still running
        if process.poll() is not None:
            stdout, stderr = process.communicate()
            print("❌ Service stopped unexpectedly")
            print(f"STDOUT: {stdout.decode()}")
            print(f"STDERR: {stderr.decode()}")
            return False
        
        print("✅ Service started successfully")
        
        # Run tests
        results = []
        results.append(test_health_endpoint())
        results.append(test_classes_endpoint())
        results.append(test_model_info_endpoint())
        results.append(test_prediction_endpoint())
        
        # Summary
        print("\n📋 Validation Summary")
        print("-" * 40)
        
        test_names = [
            "Health Endpoint",
            "Classes Endpoint",
            "Model Info Endpoint",
            "Prediction Endpoint"
        ]
        
        all_passed = True
        for name, result in zip(test_names, results):
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{name}: {status}")
            if not result:
                all_passed = False
        
        print("\n" + "=" * 60)
        if all_passed:
            print("🎉 All validation tests passed!")
            print("✅ ML Service is working correctly and ready for use.")
            print("\nService is running at: http://localhost:5001")
            print("\nAvailable endpoints:")
            print("  - GET  /health - Health check")
            print("  - POST /api/predict - Image prediction")
            print("  - GET  /api/classes - Available classes")
            print("  - GET  /api/model/info - Model information")
        else:
            print("⚠️  Some validation tests failed.")
            print("Please check the service configuration and try again.")
        
        return all_passed
        
    finally:
        # Stop the service
        print("\n🛑 Stopping service...")
        if process and process.poll() is None:
            process.terminate()
            process.wait(timeout=10)
        print("✅ Service stopped")

if __name__ == "__main__":
    success = validate_service()
    
    if success:
        print("\n✨ The ML service is fully functional!")
        print("You can now integrate it with the backend API.")
    else:
        print("\n⚠️  Validation failed. Please check the errors above.")
    
    sys.exit(0 if success else 1)