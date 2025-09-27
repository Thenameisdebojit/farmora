#!/usr/bin/env python3
"""
Advanced AI Advisory API for Farmora
Provides OpenAI-like conversational responses with agricultural expertise
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import logging
from datetime import datetime
from pathlib import Path
import io
import base64
from PIL import Image
import uuid
import json

# Import our AI components
from agricultural_knowledge_base import AgriculturalKnowledgeBase
from intelligent_response_engine import IntelligentResponseEngine

# Import ML model components
try:
    from simple_api import load_model, preprocess_image, model, pest_classes
except ImportError:
    print("ML model components not available, using fallback mode")
    model = None
    pest_classes = []

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # 32MB max file size

# Initialize AI components
knowledge_base = AgriculturalKnowledgeBase()
response_engine = IntelligentResponseEngine()

# Global variables
conversation_sessions = {}

class FarmoraAIAdvisor:
    """Main AI advisor class that combines ML and knowledge systems"""
    
    def __init__(self):
        self.ml_model_available = model is not None
        self.session_timeout = 3600  # 1 hour
        
    def initialize_ml_model(self):
        """Initialize or reload the ML model"""
        global model
        try:
            if not self.ml_model_available:
                from simple_api import load_model
                load_model()
                self.ml_model_available = True
                logger.info("ML model initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize ML model: {e}")
            self.ml_model_available = False
    
    def process_query(self, user_id: str, message: str, image_data: str = None, 
                     location: dict = None, context: dict = None) -> dict:
        """Process user query and generate intelligent response"""
        try:
            # Initialize session if needed
            if user_id not in conversation_sessions:
                conversation_sessions[user_id] = {
                    'session_id': str(uuid.uuid4()),
                    'created_at': datetime.now(),
                    'last_active': datetime.now(),
                    'message_count': 0,
                    'context': {},
                    'conversation_history': []
                }
            
            session = conversation_sessions[user_id]
            session['last_active'] = datetime.now()
            session['message_count'] += 1
            
            # Analyze the query
            query_analysis = response_engine.analyze_query(
                message, 
                user_context=session['context']
            )
            
            # Process image if provided
            image_analysis = None
            if image_data and self.ml_model_available:
                image_analysis = self._analyze_image(image_data)
            
            # Generate intelligent response
            response = response_engine.generate_response(
                query_analysis,
                image_analysis=image_analysis
            )
            
            # Add contextual information
            response['session_info'] = {
                'session_id': session['session_id'],
                'message_count': session['message_count'],
                'user_id': user_id
            }
            
            # Add location-based advice if available
            if location:
                location_advice = self._get_location_advice(location, query_analysis)
                if location_advice:
                    response['location_advice'] = location_advice
            
            # Update conversation context
            response_engine.update_context(user_id, message, response)
            
            # Store conversation
            session['conversation_history'].append({
                'timestamp': datetime.now().isoformat(),
                'user_message': message,
                'ai_response': response['message'][:200] + "..." if len(response['message']) > 200 else response['message'],
                'intent': query_analysis['intent'],
                'confidence': response.get('confidence', 0.0)
            })
            
            # Keep only last 20 messages
            if len(session['conversation_history']) > 20:
                session['conversation_history'] = session['conversation_history'][-20:]
            
            return {
                'success': True,
                'response': response,
                'timestamp': datetime.now().isoformat(),
                'processing_time': 'instant'
            }
            
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return {
                'success': False,
                'error': str(e),
                'fallback_response': {
                    'message': "I apologize for the technical difficulty. Let me provide some general agricultural guidance that might help:",
                    'recommendations': [
                        "🌱 Monitor your crops daily for early problem detection",
                        "💧 Ensure adequate but not excessive irrigation",
                        "🌿 Follow integrated pest management practices",
                        "🧪 Test soil regularly and adjust fertilization accordingly",
                        "📚 Stay connected with local agricultural extension services"
                    ],
                    'type': 'error_fallback',
                    'confidence': 0.5
                }
            }
    
    def _analyze_image(self, image_data: str) -> dict:
        """Analyze uploaded image using ML model"""
        try:
            # Decode image
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Preprocess image
            img_array = preprocess_image(image)
            
            # Make prediction
            predictions = model.predict(img_array, verbose=0)
            
            # Get results
            predicted_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_idx])
            predicted_class = pest_classes[predicted_idx]
            
            # Get top 3 predictions
            top_indices = np.argsort(predictions[0])[::-1][:3]
            top_predictions = []
            
            for idx in top_indices:
                top_predictions.append({
                    'class': pest_classes[idx],
                    'confidence': float(predictions[0][idx]),
                    'index': int(idx)
                })
            
            return {
                'predicted_class': predicted_class,
                'confidence': confidence,
                'top_predictions': top_predictions,
                'model_status': 'confident' if confidence >= 0.7 else 'uncertain',
                'analysis_type': 'ml_model'
            }
            
        except Exception as e:
            logger.error(f"Image analysis failed: {e}")
            return None
    
    def _get_location_advice(self, location: dict, query_analysis: dict) -> dict:
        """Get location-specific advice"""
        try:
            region = location.get('region', '').lower()
            season_advice = knowledge_base.get_seasonal_advice()
            
            location_specific = {
                'region': location.get('region', 'Unknown'),
                'seasonal_crops': season_advice.get('major_crops', []),
                'regional_tips': []
            }
            
            # Add region-specific tips based on common agricultural zones
            if any(term in region for term in ['north', 'punjab', 'haryana', 'uttar pradesh']):
                location_specific['regional_tips'] = [
                    "Focus on wheat and rice cultivation",
                    "Be prepared for extreme temperature variations",
                    "Manage water efficiently due to groundwater depletion"
                ]
            elif any(term in region for term in ['south', 'karnataka', 'tamil nadu', 'andhra']):
                location_specific['regional_tips'] = [
                    "Utilize monsoon patterns effectively",
                    "Consider drought-resistant varieties",
                    "Take advantage of multiple cropping seasons"
                ]
            elif any(term in region for term in ['west', 'maharashtra', 'gujarat']):
                location_specific['regional_tips'] = [
                    "Focus on water conservation techniques",
                    "Consider cash crops like cotton and sugarcane",
                    "Plan around irregular monsoon patterns"
                ]
            
            return location_specific
            
        except Exception as e:
            logger.error(f"Location advice error: {e}")
            return None
    
    def get_conversation_history(self, user_id: str) -> dict:
        """Get conversation history for a user"""
        if user_id in conversation_sessions:
            session = conversation_sessions[user_id]
            return {
                'session_id': session['session_id'],
                'message_count': session['message_count'],
                'conversation_history': session['conversation_history'][-10:],  # Last 10 messages
                'created_at': session['created_at'].isoformat(),
                'last_active': session['last_active'].isoformat()
            }
        return {'error': 'Session not found'}

# Initialize AI advisor
ai_advisor = FarmoraAIAdvisor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Farmora AI Advisory API',
        'ml_model_available': ai_advisor.ml_model_available,
        'knowledge_base_loaded': True,
        'active_sessions': len(conversation_sessions),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint for conversational AI"""
    try:
        # Parse request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        user_id = data.get('user_id', 'anonymous')
        message = data.get('message', '').strip()
        image_data = data.get('image', None)
        location = data.get('location', None)
        context = data.get('context', {})
        
        if not message and not image_data:
            return jsonify({
                'success': False,
                'error': 'Either message or image must be provided'
            }), 400
        
        # Process the query
        result = ai_advisor.process_query(
            user_id=user_id,
            message=message or "Please analyze this image",
            image_data=image_data,
            location=location,
            context=context
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': 'I apologize for the technical difficulty. Please try again.'
        }), 500

@app.route('/api/chat/history/<user_id>', methods=['GET'])
def get_chat_history(user_id):
    """Get conversation history for a user"""
    try:
        history = ai_advisor.get_conversation_history(user_id)
        return jsonify({
            'success': True,
            'data': history
        })
    except Exception as e:
        logger.error(f"History endpoint error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve conversation history'
        }), 500

@app.route('/api/advisory/quick-advice', methods=['POST'])
def quick_advice():
    """Quick advice endpoint for specific farming queries"""
    try:
        data = request.get_json()
        query_type = data.get('type', 'general')
        crop = data.get('crop', None)
        issue = data.get('issue', None)
        
        # Generate quick advice based on type
        if query_type == 'pest' and issue:
            pest_info = knowledge_base.get_pest_info(issue)
            if pest_info:
                advice = {
                    'pest_name': issue,
                    'management': pest_info.get('management', {}),
                    'prevention': pest_info.get('prevention', [])
                }
            else:
                advice = {'message': 'Pest information not found'}
        
        elif query_type == 'crop' and crop:
            crop_info = knowledge_base.get_crop_info(crop)
            if crop_info:
                advice = {
                    'crop_name': crop,
                    'planting_season': crop_info.get('planting_season', []),
                    'fertilizer_npk': crop_info.get('fertilizer_npk', ''),
                    'common_pests': crop_info.get('common_pests', [])
                }
            else:
                advice = {'message': 'Crop information not found'}
        
        else:
            advice = {
                'message': 'Please specify the type of advice needed (pest/crop) and relevant details'
            }
        
        return jsonify({
            'success': True,
            'advice': advice,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Quick advice error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate advice'
        }), 500

@app.route('/api/advisory/analyze-image', methods=['POST'])
def analyze_image_endpoint():
    """Dedicated endpoint for image analysis"""
    try:
        # Check if image is in files or JSON
        image_file = None
        image_data = None
        
        if 'image' in request.files:
            image_file = request.files['image']
        elif request.is_json:
            data = request.get_json()
            image_data = data.get('image')
        
        if not image_file and not image_data:
            return jsonify({
                'success': False,
                'error': 'No image provided'
            }), 400
        
        # Process image
        if image_file:
            image_bytes = image_file.read()
            image = Image.open(io.BytesIO(image_bytes))
            # Convert to base64 for analysis
            buffer = io.BytesIO()
            image.save(buffer, format='JPEG')
            image_data = base64.b64encode(buffer.getvalue()).decode()
        
        # Analyze image
        if ai_advisor.ml_model_available:
            analysis_result = ai_advisor._analyze_image(image_data)
            if analysis_result:
                # Get detailed pest information
                pest_name = analysis_result['predicted_class']
                pest_info = knowledge_base.get_pest_info(pest_name)
                
                return jsonify({
                    'success': True,
                    'analysis': analysis_result,
                    'pest_info': pest_info,
                    'recommendations': pest_info.get('management', {}) if pest_info else {},
                    'timestamp': datetime.now().isoformat()
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Image analysis failed'
                }), 500
        else:
            return jsonify({
                'success': False,
                'error': 'ML model not available',
                'message': 'Image analysis service is currently unavailable'
            }), 503
            
    except Exception as e:
        logger.error(f"Image analysis endpoint error: {e}")
        return jsonify({
            'success': False,
            'error': 'Image processing failed'
        }), 500

@app.route('/api/advisory/knowledge-search', methods=['POST'])
def knowledge_search():
    """Search the agricultural knowledge base"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        category = data.get('category', None)
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Search query is required'
            }), 400
        
        # Search knowledge base
        results = knowledge_base.search_knowledge(query, category)
        
        return jsonify({
            'success': True,
            'query': query,
            'category': category,
            'results': results[:10],  # Top 10 results
            'total_results': len(results),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Knowledge search error: {e}")
        return jsonify({
            'success': False,
            'error': 'Search failed'
        }), 500

@app.route('/api/advisory/seasonal-advice', methods=['GET'])
def seasonal_advice():
    """Get seasonal agricultural advice"""
    try:
        month = request.args.get('month', None)
        if month:
            month = int(month)
        
        advice = knowledge_base.get_seasonal_advice(month)
        
        return jsonify({
            'success': True,
            'seasonal_advice': advice,
            'current_month': datetime.now().month,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Seasonal advice error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to get seasonal advice'
        }), 500

@app.route('/api/model/reload', methods=['POST'])
def reload_ml_model():
    """Reload the ML model (admin endpoint)"""
    try:
        # Check for admin authentication (in production, use proper auth)
        auth_key = request.headers.get('X-Admin-Key', '')
        if auth_key != 'farmora-admin-key':  # Use proper authentication in production
            return jsonify({
                'success': False,
                'error': 'Unauthorized'
            }), 401
        
        # Reload model
        ai_advisor.initialize_ml_model()
        
        return jsonify({
            'success': True,
            'message': 'ML model reloaded successfully',
            'model_available': ai_advisor.ml_model_available,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Model reload error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to reload model'
        }), 500

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    return jsonify({
        'success': False,
        'error': 'File too large. Maximum size is 32MB.'
    }), 413

@app.errorhandler(404)
def not_found(e):
    """Handle not found error"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'available_endpoints': {
            'chat': 'POST /api/chat',
            'image_analysis': 'POST /api/advisory/analyze-image',
            'knowledge_search': 'POST /api/advisory/knowledge-search',
            'seasonal_advice': 'GET /api/advisory/seasonal-advice',
            'quick_advice': 'POST /api/advisory/quick-advice'
        }
    }), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle internal server error"""
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': 'An unexpected error occurred. Please try again.'
    }), 500

def cleanup_old_sessions():
    """Clean up old conversation sessions"""
    current_time = datetime.now()
    expired_sessions = []
    
    for user_id, session in conversation_sessions.items():
        if (current_time - session['last_active']).seconds > ai_advisor.session_timeout:
            expired_sessions.append(user_id)
    
    for user_id in expired_sessions:
        del conversation_sessions[user_id]
    
    if expired_sessions:
        logger.info(f"Cleaned up {len(expired_sessions)} expired sessions")

if __name__ == '__main__':
    # Initialize ML model
    ai_advisor.initialize_ml_model()
    
    logger.info("🚀 Starting Farmora Advanced AI Advisory API...")
    logger.info("🧠 AI Knowledge Base: Loaded")
    logger.info(f"🤖 ML Model: {'Available' if ai_advisor.ml_model_available else 'Not Available'}")
    logger.info("📋 Available endpoints:")
    logger.info("  - POST /api/chat - Main conversational AI")
    logger.info("  - POST /api/advisory/analyze-image - Image analysis")
    logger.info("  - POST /api/advisory/knowledge-search - Knowledge search")
    logger.info("  - GET  /api/advisory/seasonal-advice - Seasonal advice")
    logger.info("  - POST /api/advisory/quick-advice - Quick farming tips")
    logger.info("  - GET  /health - Health check")
    logger.info("")
    logger.info("🌾 Ready to provide intelligent agricultural advisory!")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5002, debug=False)