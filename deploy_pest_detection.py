#!/usr/bin/env python3
"""
Deployment script for Smart Crop Advisory Pest Detection System
"""

import os
import sys
import subprocess
import time
import requests
from pathlib import Path
import json

def print_header(title):
    """Print a formatted header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def print_step(step_num, description):
    """Print a formatted step"""
    print(f"\n🔧 Step {step_num}: {description}")
    print("-" * 40)

def run_command(command, cwd=None, shell=True):
    """Run a command and return success status"""
    try:
        print(f"Running: {command}")
        result = subprocess.run(command, shell=shell, cwd=cwd, capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Success")
            if result.stdout:
                print(f"Output: {result.stdout}")
            return True
        else:
            print(f"❌ Failed with return code {result.returncode}")
            if result.stderr:
                print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def check_python_dependencies():
    """Check if required Python packages are installed"""
    print("🔍 Checking Python dependencies...")
    
    required_packages = [
        'tensorflow',
        'flask',
        'flask-cors',
        'numpy',
        'opencv-python',
        'pillow',
        'requests'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - Missing")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("Install them with:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    return True

def check_node_dependencies():
    """Check if Node.js backend dependencies are installed"""
    print("🔍 Checking Node.js dependencies...")
    
    backend_path = Path("backend")
    if not backend_path.exists():
        print("❌ Backend directory not found")
        return False
    
    node_modules = backend_path / "node_modules"
    if not node_modules.exists():
        print("⚠️  Node modules not installed")
        print("Installing dependencies...")
        return run_command("npm install", cwd=backend_path)
    
    print("✅ Node modules found")
    return True

def setup_directories():
    """Create required directories"""
    print("📁 Setting up directories...")
    
    directories = [
        "ml-service/models",
        "ml-service/logs",
        "ml-service/data",
        "backend/uploads/pest-images",
        "backend/logs"
    ]
    
    for dir_path in directories:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"✅ {dir_path}")
    
    return True

def create_env_file():
    """Create environment file for backend"""
    print("⚙️  Creating environment configuration...")
    
    env_path = Path("backend/.env")
    
    env_content = """# Smart Crop Advisory Environment Configuration

# ML Service Configuration
ML_SERVICE_URL=http://localhost:5001

# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (Update with your MongoDB URI)
MONGODB_URI=mongodb://localhost:27017/smart-crop-advisory

# JWT Configuration (Update with your secret)
JWT_SECRET=your-jwt-secret-key-change-this-in-production

# File Upload Configuration
MAX_FILE_SIZE=10485760

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
"""
    
    if not env_path.exists():
        with open(env_path, 'w') as f:
            f.write(env_content)
        print("✅ Created .env file")
    else:
        print("✅ .env file already exists")
    
    return True

def test_ml_service():
    """Test if ML service is running"""
    print("🧪 Testing ML service...")
    
    try:
        response = requests.get("http://localhost:5001/health", timeout=5)
        if response.status_code == 200:
            print("✅ ML service is running")
            return True
        else:
            print(f"❌ ML service responded with status {response.status_code}")
            return False
    except requests.exceptions.RequestException:
        print("❌ ML service is not reachable")
        return False

def test_backend_service():
    """Test if backend service is running"""
    print("🧪 Testing backend service...")
    
    try:
        response = requests.get("http://localhost:3000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend service is running")
            return True
        else:
            print(f"❌ Backend service responded with status {response.status_code}")
            return False
    except requests.exceptions.RequestException:
        print("❌ Backend service is not reachable")
        return False

def deploy_development():
    """Deploy for development environment"""
    print_header("DEPLOYING PEST DETECTION SYSTEM - DEVELOPMENT")
    
    # Step 1: Check dependencies
    print_step(1, "Checking Dependencies")
    if not check_python_dependencies():
        return False
    
    if not check_node_dependencies():
        return False
    
    # Step 2: Setup directories
    print_step(2, "Setting up Directories")
    setup_directories()
    
    # Step 3: Create configuration
    print_step(3, "Creating Configuration")
    create_env_file()
    
    # Step 4: Instructions
    print_step(4, "Deployment Complete")
    print("🎉 Pest Detection System is ready for development!")
    
    print("\n📋 Next Steps:")
    print("1. Start the ML Service:")
    print("   cd ml-service")
    print("   python start_ml_service.py")
    print()
    print("2. Start the Backend (in a new terminal):")
    print("   cd backend")
    print("   npm start")
    print()
    print("3. Test the system:")
    print("   python test_pest_detection.py")
    print()
    print("4. Access the services:")
    print("   - ML Service: http://localhost:5001")
    print("   - Backend API: http://localhost:3000")
    print("   - Health checks: /health endpoint on both services")
    
    return True

def deploy_production():
    """Deploy for production environment"""
    print_header("DEPLOYING PEST DETECTION SYSTEM - PRODUCTION")
    
    print("⚠️  Production deployment requires additional setup:")
    print("1. Database configuration (MongoDB)")
    print("2. SSL certificates for HTTPS")
    print("3. Reverse proxy setup (Nginx)")
    print("4. Process management (PM2, systemd)")
    print("5. Environment-specific secrets")
    print("6. Monitoring and logging setup")
    print()
    print("For production deployment, please refer to:")
    print("- PEST_DETECTION_README.md")
    print("- Docker configurations")
    print("- Production deployment guides")

def main():
    """Main deployment function"""
    print("🚀 Smart Crop Advisory - Pest Detection Deployment")
    
    while True:
        print("\nSelect deployment option:")
        print("1. Development deployment")
        print("2. Production deployment (guide)")
        print("3. Test existing deployment")
        print("4. Exit")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == '1':
            deploy_development()
            break
        elif choice == '2':
            deploy_production()
            break
        elif choice == '3':
            print_header("TESTING EXISTING DEPLOYMENT")
            
            # Test ML service
            ml_running = test_ml_service()
            
            # Test backend service
            backend_running = test_backend_service()
            
            if ml_running and backend_running:
                print("\n🎉 Both services are running!")
                print("Run the full test suite:")
                print("python test_pest_detection.py")
            else:
                print("\n⚠️  Some services are not running.")
                print("Please start the required services and try again.")
            
            break
        elif choice == '4':
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please try again.")

if __name__ == "__main__":
    main()