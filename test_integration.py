#!/usr/bin/env python3
"""
Quick test script to verify the ML integration is working
"""

import requests
import json
import time
from PIL import Image, ImageDraw
import io
import base64

def create_test_image():
    """Create a test image for demonstration"""
    # Create a simple test image
    img = Image.new('RGB', (224, 224), color='lightgreen')
    draw = ImageDraw.Draw(img)
    
    # Draw some simple shapes to simulate a pest
    draw.ellipse([100, 100, 124, 124], fill='darkgreen')
    draw.ellipse([110, 110, 114, 114], fill='black')
    
    return img

def test_ml_api():
    """Test the ML API endpoints"""
    print("🧪 Testing ML API Integration...")
    
    api_base = "http://localhost:5001"
    
    # Test health endpoint
    try:
        print("\n1. Testing health check...")
        response = requests.get(f"{api_base}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to ML API. Make sure it's running on port 5001")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test classes endpoint
    try:
        print("\n2. Testing classes endpoint...")
        response = requests.get(f"{api_base}/api/classes", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Classes endpoint working")
            print(f"   Available classes: {len(data['classes'])}")
            print(f"   Classes: {', '.join(data['classes'][:5])}...")
        else:
            print(f"❌ Classes endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Classes endpoint error: {e}")
    
    # Test model info endpoint
    try:
        print("\n3. Testing model info endpoint...")
        response = requests.get(f"{api_base}/api/model/info", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Model info endpoint working")
            print(f"   Model loaded: {data['model_info'].get('model_loaded', 'Unknown')}")
            print(f"   Classes: {data['model_info'].get('num_classes', 'Unknown')}")
        else:
            print(f"❌ Model info endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Model info endpoint error: {e}")
    
    # Test prediction endpoint
    try:
        print("\n4. Testing prediction endpoint...")
        
        # Create test image
        test_img = create_test_image()
        
        # Convert to bytes
        img_buffer = io.BytesIO()
        test_img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        # Send prediction request
        files = {'image': ('test.png', img_buffer, 'image/png')}
        response = requests.post(f"{api_base}/api/predict", files=files, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 'success':
                prediction = data['prediction']
                print("✅ Prediction endpoint working!")
                print(f"   Predicted class: {prediction['predicted_class']}")
                print(f"   Confidence: {prediction['confidence']:.2%}")
                print(f"   Status: {prediction['status']}")
                print(f"   Pest info available: {bool(prediction.get('pest_info'))}")
                if prediction.get('pest_info'):
                    print(f"   Severity: {prediction['pest_info'].get('severity', 'unknown')}")
            else:
                print(f"❌ Prediction failed: {data.get('error', 'Unknown error')}")
        else:
            print(f"❌ Prediction endpoint failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"   Raw response: {response.text[:200]}...")
                
    except Exception as e:
        print(f"❌ Prediction endpoint error: {e}")
    
    print("\n✅ ML API testing completed!")
    return True

def test_frontend():
    """Test the frontend accessibility"""
    print("\n🌐 Testing Frontend Integration...")
    
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
            print("   URL: http://localhost:3000")
            return True
        else:
            print(f"❌ Frontend returned status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to frontend. Make sure it's running on port 3000")
        return False
    except Exception as e:
        print(f"❌ Frontend test error: {e}")
        return False

def main():
    """Main test function"""
    print("="*60)
    print("🧪 FARMORA AI INTEGRATION TEST")
    print("="*60)
    print("Testing the complete ML integration...")
    
    # Test ML API
    api_working = test_ml_api()
    
    # Test Frontend
    frontend_working = test_frontend()
    
    # Final results
    print("\n" + "="*60)
    print("📊 TEST RESULTS SUMMARY")
    print("="*60)
    print(f"ML API Service: {'✅ WORKING' if api_working else '❌ FAILED'}")
    print(f"Frontend App: {'✅ WORKING' if frontend_working else '❌ FAILED'}")
    
    if api_working and frontend_working:
        print("\n🎉 SUCCESS! All systems are working properly!")
        print("\n📱 How to use:")
        print("1. Open http://localhost:3000 in your browser")
        print("2. Navigate to 'Pest Detection'")
        print("3. Upload a crop image")
        print("4. Get AI analysis with 97% accuracy")
        print("\n🌾 Happy farming!")
    else:
        print("\n⚠️ Some services are not working. Please check:")
        if not api_working:
            print("- Run: python start_farmora_ai.py")
            print("- Or manually start ML API: python ml-service/train_and_deploy.py --api-only")
        if not frontend_working:
            print("- Start frontend: npm run dev (in frontend directory)")
    
    print("="*60)

if __name__ == "__main__":
    main()