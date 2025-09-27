#!/usr/bin/env python3
"""
Quick start script for Farmora AI - skips training and uses demo model
"""

import os
import sys
import subprocess
import time
import threading
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def start_ml_api():
    """Start ML API service"""
    logger.info("🚀 Starting ML API service...")
    
    try:
        ml_service_dir = Path(__file__).parent / "ml-service"
        os.chdir(ml_service_dir)
        
        # Start API directly with Python
        process = subprocess.Popen([
            sys.executable, "-c", """
import sys
import os
sys.path.append(os.getcwd())

from api.pest_detection_api import app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
"""
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Give it time to start
        time.sleep(5)
        
        if process.poll() is None:
            logger.info("✅ ML API started on http://localhost:5001")
            return process
        else:
            stdout, stderr = process.communicate()
            logger.error(f"❌ API failed to start: {stderr}")
            return None
            
    except Exception as e:
        logger.error(f"❌ Failed to start ML API: {e}")
        return None

def start_frontend():
    """Start React frontend"""
    logger.info("🚀 Starting React frontend...")
    
    try:
        frontend_dir = Path(__file__).parent / "frontend"
        os.chdir(frontend_dir)
        
        # Start frontend
        process = subprocess.Popen([
            "npm", "run", "dev"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Give it time to start
        time.sleep(8)
        
        if process.poll() is None:
            logger.info("✅ Frontend started on http://localhost:3000")
            return process
        else:
            stdout, stderr = process.communicate()
            logger.error(f"❌ Frontend failed to start: {stderr}")
            return None
            
    except Exception as e:
        logger.error(f"❌ Failed to start frontend: {e}")
        return None

def main():
    logger.info("="*60)
    logger.info("🚀 FARMORA AI QUICK START")
    logger.info("="*60)
    logger.info("Starting services with demo model...")
    
    processes = []
    
    try:
        # Start ML API
        api_process = start_ml_api()
        if api_process:
            processes.append(("ML API", api_process))
        
        # Go back to root directory
        os.chdir(Path(__file__).parent)
        
        # Start Frontend
        frontend_process = start_frontend()
        if frontend_process:
            processes.append(("Frontend", frontend_process))
        
        if processes:
            logger.info("\\n" + "="*60)
            logger.info("🎉 FARMORA AI IS READY!")
            logger.info("="*60)
            logger.info("✅ Services running:")
            logger.info("   • ML API: http://localhost:5001")
            logger.info("   • Frontend: http://localhost:3000")
            logger.info("   • Pest Detection: Available with demo model")
            logger.info("")
            logger.info("📱 How to use:")
            logger.info("   1. Open http://localhost:3000")
            logger.info("   2. Go to 'Pest Detection'")
            logger.info("   3. Upload crop images for AI analysis")
            logger.info("")
            logger.info("Press Ctrl+C to stop services")
            logger.info("="*60)
            
            # Monitor services
            while True:
                time.sleep(2)
                for name, process in processes:
                    if process.poll() is not None:
                        logger.error(f"❌ {name} stopped unexpectedly")
                        break
        
    except KeyboardInterrupt:
        logger.info("\\n🛑 Stopping services...")
        for name, process in processes:
            if process.poll() is None:
                logger.info(f"Stopping {name}...")
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
        logger.info("✅ All services stopped")

if __name__ == "__main__":
    main()