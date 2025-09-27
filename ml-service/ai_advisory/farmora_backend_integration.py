#!/usr/bin/env python3
"""
Farmora Backend Integration Controller
Example implementation for integrating AI Advisory with your main backend
"""

import requests
import json
import base64
from datetime import datetime
import logging
from typing import Dict, List, Optional, Any
import asyncio
import aiohttp
from pathlib import Path
import io
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FarmoraAIAdvisoryClient:
    """
    Client for integrating with Farmora AI Advisory API
    Use this in your main backend to communicate with the AI service
    """
    
    def __init__(self, api_base_url: str = "http://localhost:5002"):
        self.api_base_url = api_base_url
        self.timeout = 30
        
    def _make_request(self, endpoint: str, method: str = "GET", data: dict = None) -> dict:
        """Make HTTP request to AI advisory API"""
        url = f"{self.api_base_url}{endpoint}"
        
        try:
            if method == "GET":
                response = requests.get(url, timeout=self.timeout)
            elif method == "POST":
                response = requests.post(url, json=data, timeout=self.timeout)
            
            response.raise_for_status()
            return {
                'success': True,
                'data': response.json(),
                'status_code': response.status_code
            }
            
        except requests.RequestException as e:
            logger.error(f"API request failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'status_code': getattr(e.response, 'status_code', 0) if hasattr(e, 'response') else 0
            }
    
    def check_service_health(self) -> dict:
        """Check if AI advisory service is healthy"""
        return self._make_request("/health")
    
    def chat_with_ai(self, user_id: str, message: str, image_data: str = None, 
                     location: dict = None, context: dict = None) -> dict:
        """Send chat message to AI advisory"""
        payload = {
            "user_id": user_id,
            "message": message
        }
        
        if image_data:
            payload["image"] = image_data
        if location:
            payload["location"] = location
        if context:
            payload["context"] = context
            
        return self._make_request("/api/chat", "POST", payload)
    
    def analyze_crop_image(self, image_data: str) -> dict:
        """Analyze crop/pest image"""
        return self._make_request("/api/advisory/analyze-image", "POST", {"image": image_data})
    
    def search_knowledge(self, query: str, category: str = None) -> dict:
        """Search agricultural knowledge base"""
        payload = {"query": query}
        if category:
            payload["category"] = category
        return self._make_request("/api/advisory/knowledge-search", "POST", payload)
    
    def get_quick_advice(self, advice_type: str, **kwargs) -> dict:
        """Get quick advice for specific queries"""
        payload = {"type": advice_type, **kwargs}
        return self._make_request("/api/advisory/quick-advice", "POST", payload)
    
    def get_seasonal_advice(self, month: int = None) -> dict:
        """Get seasonal agricultural advice"""
        endpoint = "/api/advisory/seasonal-advice"
        if month:
            endpoint += f"?month={month}"
        return self._make_request(endpoint)
    
    def get_chat_history(self, user_id: str) -> dict:
        """Get conversation history for user"""
        return self._make_request(f"/api/chat/history/{user_id}")

class FarmoraBackendController:
    """
    Main backend controller that integrates AI advisory with your Farmora application
    Example implementation - adapt to your backend framework (Django, Flask, FastAPI, etc.)
    """
    
    def __init__(self):
        self.ai_client = FarmoraAIAdvisoryClient()
        self.supported_image_formats = {'jpg', 'jpeg', 'png', 'gif', 'bmp'}
    
    def validate_image(self, image_file) -> tuple[bool, str]:
        """Validate uploaded image"""
        try:
            # Check file size (max 32MB)
            if hasattr(image_file, 'content_length') and image_file.content_length > 32 * 1024 * 1024:
                return False, "Image too large. Maximum size is 32MB."
            
            # Check file extension
            filename = getattr(image_file, 'filename', '') or getattr(image_file, 'name', '')
            if filename:
                ext = filename.lower().split('.')[-1]
                if ext not in self.supported_image_formats:
                    return False, f"Unsupported image format. Supported: {', '.join(self.supported_image_formats)}"
            
            return True, "Valid image"
            
        except Exception as e:
            return False, f"Image validation failed: {str(e)}"
    
    def process_image_to_base64(self, image_file) -> str:
        """Convert image file to base64 string"""
        try:
            # Read image data
            if hasattr(image_file, 'read'):
                image_data = image_file.read()
            else:
                image_data = image_file
            
            # Convert to base64
            return base64.b64encode(image_data).decode('utf-8')
            
        except Exception as e:
            logger.error(f"Image processing failed: {e}")
            raise Exception(f"Failed to process image: {str(e)}")
    
    # === API Endpoint Handlers ===
    # These are example handlers - adapt to your web framework
    
    def handle_chat_request(self, user_id: str, request_data: dict) -> dict:
        """
        Handle chat request from frontend
        Example for Flask/FastAPI/Django endpoint
        """
        try:
            # Extract request data
            message = request_data.get('message', '').strip()
            image_file = request_data.get('image')  # File upload
            location = request_data.get('location')
            user_context = request_data.get('context', {})
            
            # Validate input
            if not message and not image_file:
                return {
                    'success': False,
                    'error': 'Either message or image must be provided'
                }
            
            # Process image if provided
            image_data = None
            if image_file:
                is_valid, validation_message = self.validate_image(image_file)
                if not is_valid:
                    return {
                        'success': False,
                        'error': validation_message
                    }
                image_data = self.process_image_to_base64(image_file)
            
            # Prepare additional context
            enhanced_context = {
                'timestamp': datetime.now().isoformat(),
                'user_agent': request_data.get('user_agent', ''),
                'platform': request_data.get('platform', 'web'),
                **user_context
            }
            
            # Call AI advisory service
            ai_response = self.ai_client.chat_with_ai(
                user_id=user_id,
                message=message or "Please analyze this image",
                image_data=image_data,
                location=location,
                context=enhanced_context
            )
            
            if ai_response['success']:
                # Log successful interaction
                logger.info(f"AI chat successful for user {user_id}")
                
                # Prepare response for frontend
                response_data = ai_response['data']['response']
                
                return {
                    'success': True,
                    'message': response_data.get('message', ''),
                    'recommendations': response_data.get('recommendations', []),
                    'follow_up_questions': response_data.get('follow_up_questions', []),
                    'confidence': response_data.get('confidence', 0.0),
                    'intent': response_data.get('intent', 'general'),
                    'session_info': response_data.get('session_info', {}),
                    'timestamp': datetime.now().isoformat()
                }
            else:
                # Handle AI service error
                logger.error(f"AI service error for user {user_id}: {ai_response.get('error')}")
                return {
                    'success': False,
                    'error': 'AI advisory service temporarily unavailable',
                    'fallback_message': 'Please try again later or contact support.'
                }
                
        except Exception as e:
            logger.error(f"Chat request handler error: {e}")
            return {
                'success': False,
                'error': 'Internal server error',
                'message': 'An unexpected error occurred. Please try again.'
            }
    
    def handle_image_analysis_request(self, request_data: dict) -> dict:
        """Handle dedicated image analysis request"""
        try:
            image_file = request_data.get('image')
            
            if not image_file:
                return {
                    'success': False,
                    'error': 'Image is required'
                }
            
            # Validate and process image
            is_valid, validation_message = self.validate_image(image_file)
            if not is_valid:
                return {
                    'success': False,
                    'error': validation_message
                }
            
            image_data = self.process_image_to_base64(image_file)
            
            # Call AI analysis
            ai_response = self.ai_client.analyze_crop_image(image_data)
            
            if ai_response['success']:
                return {
                    'success': True,
                    'analysis': ai_response['data']['analysis'],
                    'pest_info': ai_response['data'].get('pest_info'),
                    'recommendations': ai_response['data'].get('recommendations', {}),
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return {
                    'success': False,
                    'error': 'Image analysis failed'
                }
                
        except Exception as e:
            logger.error(f"Image analysis error: {e}")
            return {
                'success': False,
                'error': 'Image analysis service unavailable'
            }
    
    def handle_knowledge_search_request(self, request_data: dict) -> dict:
        """Handle knowledge base search request"""
        try:
            query = request_data.get('query', '').strip()
            category = request_data.get('category')
            
            if not query:
                return {
                    'success': False,
                    'error': 'Search query is required'
                }
            
            # Search knowledge base
            ai_response = self.ai_client.search_knowledge(query, category)
            
            if ai_response['success']:
                return {
                    'success': True,
                    'query': query,
                    'results': ai_response['data']['results'],
                    'total_results': ai_response['data']['total_results'],
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return {
                    'success': False,
                    'error': 'Knowledge search failed'
                }
                
        except Exception as e:
            logger.error(f"Knowledge search error: {e}")
            return {
                'success': False,
                'error': 'Search service unavailable'
            }
    
    def handle_quick_advice_request(self, request_data: dict) -> dict:
        """Handle quick advice request"""
        try:
            advice_type = request_data.get('type', 'general')
            
            # Call AI advisory
            ai_response = self.ai_client.get_quick_advice(advice_type, **request_data)
            
            if ai_response['success']:
                return {
                    'success': True,
                    'advice': ai_response['data']['advice'],
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return {
                    'success': False,
                    'error': 'Quick advice service failed'
                }
                
        except Exception as e:
            logger.error(f"Quick advice error: {e}")
            return {
                'success': False,
                'error': 'Advice service unavailable'
            }
    
    def get_user_chat_history(self, user_id: str) -> dict:
        """Get chat history for user"""
        try:
            ai_response = self.ai_client.get_chat_history(user_id)
            
            if ai_response['success']:
                return {
                    'success': True,
                    'history': ai_response['data']['data'],
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to retrieve chat history'
                }
                
        except Exception as e:
            logger.error(f"Chat history error: {e}")
            return {
                'success': False,
                'error': 'Chat history service unavailable'
            }
    
    def get_dashboard_data(self, user_id: str) -> dict:
        """Get AI-powered dashboard data for user"""
        try:
            # Get seasonal advice
            seasonal_response = self.ai_client.get_seasonal_advice()
            
            # Get recent chat history
            history_response = self.ai_client.get_chat_history(user_id)
            
            # Check service health
            health_response = self.ai_client.check_service_health()
            
            return {
                'success': True,
                'seasonal_advice': seasonal_response.get('data', {}).get('seasonal_advice', {}),
                'recent_chats': history_response.get('data', {}).get('data', {}).get('conversation_history', [])[-5:],
                'ai_service_status': 'online' if health_response['success'] else 'offline',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Dashboard data error: {e}")
            return {
                'success': False,
                'error': 'Dashboard service unavailable'
            }

# Example usage with different web frameworks

# === Flask Example ===
def create_flask_routes(app, controller):
    """Example Flask routes using the controller"""
    from flask import request, jsonify, session
    
    @app.route('/api/ai-advisory/chat', methods=['POST'])
    def ai_chat():
        user_id = session.get('user_id', 'anonymous')
        request_data = {
            'message': request.form.get('message') or request.json.get('message') if request.is_json else None,
            'image': request.files.get('image') if request.files else None,
            'location': request.json.get('location') if request.is_json else None,
            'context': request.json.get('context', {}) if request.is_json else {},
            'user_agent': request.headers.get('User-Agent', ''),
            'platform': request.json.get('platform', 'web') if request.is_json else 'web'
        }
        
        result = controller.handle_chat_request(user_id, request_data)
        return jsonify(result)
    
    @app.route('/api/ai-advisory/analyze-image', methods=['POST'])
    def analyze_image():
        request_data = {
            'image': request.files.get('image') if request.files else request.json.get('image') if request.is_json else None
        }
        
        result = controller.handle_image_analysis_request(request_data)
        return jsonify(result)
    
    @app.route('/api/ai-advisory/search', methods=['POST'])
    def knowledge_search():
        request_data = request.get_json()
        result = controller.handle_knowledge_search_request(request_data)
        return jsonify(result)
    
    @app.route('/api/ai-advisory/chat-history', methods=['GET'])
    def chat_history():
        user_id = session.get('user_id', 'anonymous')
        result = controller.get_user_chat_history(user_id)
        return jsonify(result)

# === FastAPI Example ===
def create_fastapi_routes():
    """Example FastAPI routes"""
    from fastapi import FastAPI, UploadFile, File, Depends
    from pydantic import BaseModel
    
    app = FastAPI()
    controller = FarmoraBackendController()
    
    class ChatRequest(BaseModel):
        message: str = None
        location: dict = None
        context: dict = {}
        platform: str = "web"
    
    @app.post("/api/ai-advisory/chat")
    async def ai_chat(request: ChatRequest, image: UploadFile = File(None)):
        user_id = "user123"  # Get from authentication
        request_data = {
            'message': request.message,
            'image': await image.read() if image else None,
            'location': request.location,
            'context': request.context,
            'platform': request.platform
        }
        
        return controller.handle_chat_request(user_id, request_data)
    
    return app

if __name__ == "__main__":
    # Example usage
    controller = FarmoraBackendController()
    
    # Test the integration
    print("🧪 Testing Farmora Backend Integration...")
    
    # Check AI service health
    health = controller.ai_client.check_service_health()
    print(f"AI Service Health: {'✅ Online' if health['success'] else '❌ Offline'}")
    
    if health['success']:
        # Test chat functionality
        chat_result = controller.handle_chat_request("test_user", {
            'message': "Hello, I need help with organic farming practices",
            'context': {'user_type': 'farmer', 'experience': 'intermediate'}
        })
        
        print(f"Chat Test: {'✅ Success' if chat_result['success'] else '❌ Failed'}")
        if chat_result['success']:
            print(f"AI Response: {chat_result['message'][:100]}...")
    
    print("\n🌾 Integration ready! Adapt the controller to your backend framework.")