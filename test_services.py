#!/usr/bin/env python3
"""
Quick test script to verify both services are working
"""

import requests
import json
from PIL import Image, ImageDraw
import io
import time

def test_ml_api():
    """Test ML API"""
    print("🧪 Testing ML API on port 5001...")
    
    try:
        # Test health check
        response = requests.get("http://localhost:5001/health", timeout=5)
        if response.status_code == 200:
            print("✅ ML API health check passed")
            data = response.json()
            print(f"   Service: {data.get('service', 'Unknown')}")
            print(f"   Status: {data.get('status', 'Unknown')}")
            print(f"   Model loaded: {data.get('model_loaded', 'Unknown')}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
            
        # Test classes endpoint
        response = requests.get("http://localhost:5001/api/classes", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Classes endpoint working - {data.get('num_classes', 0)} classes available")
        
        # Test prediction with a simple image
        print("🖼️ Testing image prediction...")
        
        # Create a simple test image
        img = Image.new('RGB', (224, 224), color='lightgreen')
        draw = ImageDraw.Draw(img)
        draw.ellipse([100, 100, 124, 124], fill='darkgreen')
        
        # Convert to bytes
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        # Send prediction request
        files = {'image': ('test.png', img_buffer, 'image/png')}
        response = requests.post("http://localhost:5001/api/predict", files=files, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                prediction = data['prediction']
                print("✅ Image prediction working!")
                print(f"   Predicted: {prediction['predicted_class']}")
                print(f"   Confidence: {prediction['confidence']:.1%}")
                print(f"   Status: {prediction['status']}")
            else:
                print(f"❌ Prediction failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Prediction request failed: {response.status_code}")
            return False
            
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to ML API on port 5001")
        return False
    except Exception as e:
        print(f"❌ ML API test failed: {e}")
        return False

def test_frontend():
    """Test frontend"""
    print("\\n🌐 Testing Frontend on port 3001...")
    
    try:
        response = requests.get("http://localhost:3001", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
            return True
        else:
            print(f"❌ Frontend returned status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to frontend on port 3001")
        return False
    except Exception as e:
        print(f"❌ Frontend test failed: {e}")
        return False

def main():
    print("="*60)
    print("🔍 FARMORA AI SYSTEM TEST")
    print("="*60)
    
    # Test ML API
    api_working = test_ml_api()
    
    # Test Frontend
    frontend_working = test_frontend()
    
    # Results
    print("\\n" + "="*60)
    print("📊 TEST RESULTS")
    print("="*60)
    print(f"ML API (port 5001): {'✅ WORKING' if api_working else '❌ FAILED'}")
    print(f"Frontend (port 3001): {'✅ WORKING' if frontend_working else '❌ FAILED'}")
    
    if api_working and frontend_working:
        print("\\n🎉 SUCCESS! Both services are running!")
        print("\\n📱 How to use:")
        print("1. Open http://localhost:3001 in your browser")
        print("2. Navigate to 'Pest Detection'")
        print("3. Upload a crop image")
        print("4. Get AI analysis with detailed results")
        print("\\n✨ Features available:")
        print("• Real-time pest detection")
        print("• 97% accuracy simulation")
        print("• Detailed treatment recommendations")
        print("• Prevention strategies")
        print("• Professional pest information")
    else:
        print("\\n⚠️ Some services are not working.")
        if not api_working:
            print("❌ ML API not responding - check if minimal_api.py is running")
        if not frontend_working:
            print("❌ Frontend not responding - check if npm run dev is running")
    
    print("="*60)

if __name__ == "__main__":
    main()