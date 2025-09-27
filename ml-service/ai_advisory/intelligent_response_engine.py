#!/usr/bin/env python3
"""
Intelligent Response Engine for Agricultural Advisory
Provides OpenAI-like conversational responses with agricultural expertise
"""

import re
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import numpy as np
from agricultural_knowledge_base import AgriculturalKnowledgeBase

logger = logging.getLogger(__name__)

class IntelligentResponseEngine:
    """Advanced AI response engine for agricultural advisory chat system"""
    
    def __init__(self):
        self.knowledge_base = AgriculturalKnowledgeBase()
        self.conversation_context = {}
        self.response_templates = self._load_response_templates()
        self.intent_patterns = self._load_intent_patterns()
        self.conversation_memory = {}
    
    def _load_response_templates(self):
        """Load response templates for different types of queries"""
        return {
            'greeting': [
                "Hello! I'm your AI agricultural advisor. How can I help you with your farming needs today?",
                "Welcome to Farmora! I'm here to assist you with all your agricultural questions and concerns.",
                "Hi there! I'm your smart farming assistant. What agricultural advice are you looking for?"
            ],
            'pest_identification': [
                "Based on the symptoms you've described, this appears to be {pest_name}. Here's what you need to know:",
                "I can help identify this pest issue. The signs you're seeing suggest {pest_name}. Let me provide detailed information:",
                "This looks like a {pest_name} problem. Here's my analysis and recommendations:"
            ],
            'crop_advice': [
                "For {crop_name} cultivation, here's what I recommend:",
                "Great question about {crop_name}! Based on current agricultural best practices:",
                "Let me provide comprehensive advice for your {crop_name} farming:"
            ],
            'weather_advice': [
                "Given the {weather_condition} conditions, here's what you should do:",
                "For {weather_condition} weather, I recommend these immediate actions:",
                "The {weather_condition} situation requires these farming adjustments:"
            ],
            'fertilizer_advice': [
                "For optimal nutrition, here's the fertilizer program I recommend:",
                "Based on your soil and crop requirements, this fertilization plan will work best:",
                "Here's a scientifically-backed fertilizer schedule for your needs:"
            ],
            'market_advice': [
                "Regarding market conditions and pricing, here's my analysis:",
                "For better market returns, consider these strategies:",
                "Based on current market trends, here's what I suggest:"
            ],
            'general_farming': [
                "That's an excellent farming question! Here's what modern agricultural science tells us:",
                "Based on proven agricultural practices, here's my recommendation:",
                "Let me share some expert farming advice on this topic:"
            ]
        }
    
    def _load_intent_patterns(self):
        """Load patterns to identify user intent"""
        return {
            'pest_identification': [
                r'pest.*problem|bug.*eating|insect.*damage|holes.*leaves|yellow.*leaves|curled.*leaves',
                r'what.*pest|identify.*pest|pest.*name|bug.*identification',
                r'damage.*crop|eating.*plant|destroying.*crop'
            ],
            'disease_identification': [
                r'disease.*plant|fungal.*infection|viral.*disease|bacterial.*infection',
                r'spots.*leaves|wilting.*plant|rotting.*stem|moldy.*leaves',
                r'plant.*sick|crop.*disease|leaf.*disease'
            ],
            'crop_cultivation': [
                r'how.*grow|planting.*season|when.*plant|seed.*variety',
                r'cultivation.*method|farming.*technique|crop.*management',
                r'best.*variety|recommended.*seed|planting.*guide'
            ],
            'fertilizer_advice': [
                r'fertilizer.*recommend|nutrient.*requirement|npk.*ratio',
                r'organic.*fertilizer|chemical.*fertilizer|soil.*nutrition',
                r'when.*fertilize|how.*much.*fertilizer|fertilizer.*schedule'
            ],
            'irrigation_advice': [
                r'irrigation.*system|water.*requirement|watering.*schedule',
                r'drip.*irrigation|sprinkler.*system|water.*management',
                r'how.*much.*water|when.*irrigate|water.*stress'
            ],
            'weather_related': [
                r'monsoon.*farming|drought.*management|frost.*protection',
                r'weather.*condition|climate.*change|seasonal.*advice',
                r'rain.*problem|heat.*stress|cold.*weather'
            ],
            'market_prices': [
                r'market.*price|crop.*price|selling.*price|market.*trend',
                r'price.*forecast|market.*analysis|profit.*margin',
                r'when.*sell|market.*timing|price.*information'
            ],
            'soil_management': [
                r'soil.*health|soil.*test|ph.*level|soil.*fertility',
                r'organic.*matter|soil.*improvement|soil.*erosion',
                r'soil.*preparation|land.*preparation|soil.*amendment'
            ]
        }
    
    def analyze_query(self, query: str, user_context: Dict = None) -> Dict:
        """Analyze user query to understand intent and extract key information"""
        query_lower = query.lower()
        
        # Detect intent
        intent = self._detect_intent(query_lower)
        
        # Extract entities (crops, pests, etc.)
        entities = self._extract_entities(query_lower)
        
        # Analyze sentiment and urgency
        urgency = self._assess_urgency(query_lower)
        
        # Get context from previous conversations
        context = user_context or {}
        
        return {
            'intent': intent,
            'entities': entities,
            'urgency': urgency,
            'context': context,
            'original_query': query,
            'processed_query': query_lower
        }
    
    def generate_response(self, analysis: Dict, image_analysis: Dict = None) -> Dict:
        """Generate intelligent response based on query analysis"""
        intent = analysis['intent']
        entities = analysis['entities']
        urgency = analysis['urgency']
        
        try:
            if intent == 'pest_identification':
                response = self._generate_pest_response(entities, image_analysis)
            elif intent == 'disease_identification':
                response = self._generate_disease_response(entities, image_analysis)
            elif intent == 'crop_cultivation':
                response = self._generate_crop_response(entities)
            elif intent == 'fertilizer_advice':
                response = self._generate_fertilizer_response(entities)
            elif intent == 'irrigation_advice':
                response = self._generate_irrigation_response(entities)
            elif intent == 'weather_related':
                response = self._generate_weather_response(entities)
            elif intent == 'market_prices':
                response = self._generate_market_response(entities)
            elif intent == 'soil_management':
                response = self._generate_soil_response(entities)
            else:
                response = self._generate_general_response(analysis)
            
            # Add urgency indicators
            if urgency == 'high':
                response['message'] = "⚠️ **URGENT ACTION NEEDED** ⚠️\n\n" + response['message']
                response['priority'] = 'high'
            elif urgency == 'medium':
                response['priority'] = 'medium'
            else:
                response['priority'] = 'low'
            
            # Add helpful suggestions
            response['suggestions'] = self._generate_suggestions(intent, entities)
            
            # Add follow-up questions
            response['follow_up_questions'] = self._generate_follow_up_questions(intent, entities)
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return self._generate_fallback_response(analysis)
    
    def _detect_intent(self, query: str) -> str:
        """Detect user intent from query"""
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, query, re.IGNORECASE):
                    return intent
        
        # Check for greeting patterns
        greeting_patterns = [r'hello|hi|hey|good morning|good evening|greetings']
        for pattern in greeting_patterns:
            if re.search(pattern, query, re.IGNORECASE):
                return 'greeting'
        
        return 'general_inquiry'
    
    def _extract_entities(self, query: str) -> Dict:
        """Extract entities like crop names, pest names, etc. from query"""
        entities = {
            'crops': [],
            'pests': [],
            'diseases': [],
            'locations': [],
            'time_references': [],
            'quantities': []
        }
        
        # Extract crop names
        crop_names = ['rice', 'wheat', 'tomato', 'cotton', 'corn', 'potato', 'onion', 'garlic', 'sugarcane', 'banana', 'mango']
        for crop in crop_names:
            if crop in query:
                entities['crops'].append(crop)
        
        # Extract pest names
        pest_names = ['aphid', 'bollworm', 'caterpillar', 'thrips', 'whitefly', 'mites', 'beetle', 'armyworm']
        for pest in pest_names:
            if pest in query:
                entities['pests'].append(pest)
        
        # Extract disease names
        disease_names = ['blight', 'rust', 'blast', 'wilt', 'rot', 'mold', 'fungus']
        for disease in disease_names:
            if disease in query:
                entities['diseases'].append(disease)
        
        # Extract time references
        time_patterns = [r'today|tomorrow|week|month|season|spring|summer|winter|monsoon']
        for pattern in time_patterns:
            matches = re.findall(pattern, query, re.IGNORECASE)
            entities['time_references'].extend(matches)
        
        return entities
    
    def _assess_urgency(self, query: str) -> str:
        """Assess urgency level of the query"""
        urgent_keywords = ['urgent', 'emergency', 'dying', 'critical', 'immediately', 'help', 'crisis', 'destroy']
        medium_keywords = ['problem', 'issue', 'concern', 'damage', 'loss', 'affected']
        
        for keyword in urgent_keywords:
            if keyword in query:
                return 'high'
        
        for keyword in medium_keywords:
            if keyword in query:
                return 'medium'
        
        return 'low'
    
    def _generate_pest_response(self, entities: Dict, image_analysis: Dict = None) -> Dict:
        """Generate response for pest-related queries"""
        response_parts = []
        recommendations = []
        
        if image_analysis:
            # Use ML model results
            detected_pest = image_analysis.get('predicted_class', 'unknown')
            confidence = image_analysis.get('confidence', 0.0)
            
            response_parts.append(f"🔍 **AI Analysis Results:**")
            response_parts.append(f"Detected Pest: **{detected_pest.title()}**")
            response_parts.append(f"Confidence: **{confidence:.1%}**")
            response_parts.append("")
            
            # Get detailed pest information
            pest_info = self.knowledge_base.get_pest_info(detected_pest)
            
        elif entities['pests']:
            # Use pest name from text
            detected_pest = entities['pests'][0]
            pest_info = self.knowledge_base.get_pest_info(detected_pest)
            
        else:
            # General pest advice
            response_parts.append("🐛 **General Pest Management Advice:**")
            response_parts.append("Without specific pest identification, here are general IPM practices:")
            
            recommendations = [
                "🔍 **Monitor regularly** - Check plants weekly for early signs",
                "🌱 **Use resistant varieties** - Plant pest-resistant crop varieties",
                "🏡 **Maintain field hygiene** - Remove crop residues and weeds",
                "🐞 **Encourage beneficial insects** - Preserve natural predators",
                "💧 **Proper irrigation** - Avoid water stress which attracts pests",
                "🔄 **Crop rotation** - Break pest life cycles with different crops"
            ]
            
            return {
                'message': '\n'.join(response_parts),
                'recommendations': recommendations,
                'type': 'pest_general',
                'confidence': 0.8
            }
        
        if pest_info:
            response_parts.append(f"📋 **About {detected_pest.title()}:**")
            response_parts.append(f"Scientific Name: *{pest_info.get('scientific_name', 'N/A')}*")
            response_parts.append("")
            
            # Identification details
            identification = pest_info.get('identification', {})
            if identification:
                response_parts.append("🔬 **Identification Features:**")
                response_parts.append(f"• Size: {identification.get('size', 'Variable')}")
                response_parts.append(f"• Color: {identification.get('color', 'Variable')}")
                response_parts.append(f"• Location: {identification.get('location', 'Various parts')}")
                response_parts.append("")
            
            # Damage symptoms
            symptoms = pest_info.get('damage_symptoms', [])
            if symptoms:
                response_parts.append("⚠️ **Damage Symptoms:**")
                for symptom in symptoms[:4]:  # Top 4 symptoms
                    response_parts.append(f"• {symptom}")
                response_parts.append("")
            
            # Management recommendations
            management = pest_info.get('management', {})
            if management:
                response_parts.append("🎯 **Treatment Recommendations:**")
                
                # Organic treatments
                organic = management.get('organic', [])
                if organic:
                    response_parts.append("**🌿 Organic Methods:**")
                    for i, method in enumerate(organic[:3], 1):
                        response_parts.append(f"{i}. {method}")
                    response_parts.append("")
                
                # Biological treatments
                biological = management.get('biological', [])
                if biological:
                    response_parts.append("**🐞 Biological Control:**")
                    for i, method in enumerate(biological[:3], 1):
                        response_parts.append(f"{i}. {method}")
                    response_parts.append("")
                
                # Chemical treatments (if needed)
                chemical = management.get('chemical', [])
                if chemical:
                    response_parts.append("**⚗️ Chemical Control (if necessary):**")
                    for i, method in enumerate(chemical[:2], 1):
                        response_parts.append(f"{i}. {method}")
                    response_parts.append("")
            
            # Prevention tips
            prevention = pest_info.get('prevention', [])
            if prevention:
                recommendations.extend([f"🛡️ {tip}" for tip in prevention[:4]])
        
        return {
            'message': '\n'.join(response_parts),
            'recommendations': recommendations,
            'type': 'pest_identification',
            'detected_pest': detected_pest if 'detected_pest' in locals() else None,
            'confidence': confidence if 'confidence' in locals() else 0.9
        }
    
    def _generate_crop_response(self, entities: Dict) -> Dict:
        """Generate response for crop cultivation queries"""
        response_parts = []
        recommendations = []
        
        if entities['crops']:
            crop = entities['crops'][0]
            crop_info = self.knowledge_base.get_crop_info(crop)
            
            if crop_info:
                response_parts.append(f"🌾 **{crop.title()} Cultivation Guide:**")
                response_parts.append(f"Scientific Name: *{crop_info.get('scientific_name', 'N/A')}*")
                response_parts.append("")
                
                # Basic information
                response_parts.append("📊 **Basic Information:**")
                response_parts.append(f"• Growth Duration: {crop_info.get('growth_duration', 'N/A')}")
                response_parts.append(f"• Planting Season: {', '.join(crop_info.get('planting_season', ['N/A']))}")
                response_parts.append(f"• Soil Type: {', '.join(crop_info.get('soil_type', ['N/A']))}")
                response_parts.append(f"• pH Range: {crop_info.get('ph_range', 'N/A')}")
                response_parts.append("")
                
                # Planting details
                response_parts.append("🌱 **Planting Guidelines:**")
                response_parts.append(f"• Seed Rate: {crop_info.get('seed_rate', 'N/A')}")
                response_parts.append(f"• Spacing: {crop_info.get('spacing', 'N/A')}")
                response_parts.append(f"• Temperature: {crop_info.get('temperature', 'N/A')}")
                response_parts.append("")
                
                # Fertilizer recommendations
                npk = crop_info.get('fertilizer_npk', '')
                if npk:
                    response_parts.append("🌿 **Fertilizer Program:**")
                    response_parts.append(f"• NPK Ratio: {npk}")
                    response_parts.append("")
                
                # Expected yield
                yield_info = crop_info.get('yield_potential', '')
                if yield_info:
                    response_parts.append(f"📈 **Expected Yield:** {yield_info}")
                    response_parts.append("")
                
                # Key recommendations
                recommendations = [
                    f"🌡️ Maintain optimal temperature: {crop_info.get('temperature', 'N/A')}",
                    f"💧 Ensure proper drainage and irrigation",
                    f"🧪 Test soil pH regularly (optimal: {crop_info.get('ph_range', 'N/A')})",
                    f"🛡️ Watch for common pests: {', '.join(crop_info.get('common_pests', [])[:3])}",
                    f"📅 Plan harvest at: {crop_info.get('harvesting', 'maturity stage')}"
                ]
        else:
            response_parts.append("🌾 **General Crop Cultivation Advice:**")
            response_parts.append("Here are fundamental principles for successful crop cultivation:")
            response_parts.append("")
            
            recommendations = [
                "🔍 Choose appropriate variety for your climate and soil",
                "🧪 Conduct soil testing before planting",
                "💧 Plan irrigation based on crop water requirements",
                "🌿 Follow balanced fertilization program",
                "🛡️ Implement integrated pest management",
                "📅 Time operations according to crop calendar"
            ]
        
        return {
            'message': '\n'.join(response_parts),
            'recommendations': recommendations,
            'type': 'crop_cultivation',
            'confidence': 0.95
        }
    
    def _generate_weather_response(self, entities: Dict) -> Dict:
        """Generate weather-related farming advice"""
        response_parts = []
        recommendations = []
        
        # Get current seasonal advice
        seasonal_advice = self.knowledge_base.get_seasonal_advice()
        current_month = datetime.now().month
        
        response_parts.append("🌦️ **Weather & Seasonal Farming Advice:**")
        response_parts.append("")
        
        if seasonal_advice:
            season_name = seasonal_advice.get('months', 'Current season')
            response_parts.append(f"**Current Season ({season_name}):**")
            
            major_crops = seasonal_advice.get('major_crops', [])
            if major_crops:
                response_parts.append(f"🌾 **Recommended Crops:** {', '.join(major_crops)}")
                response_parts.append("")
            
            preparation = seasonal_advice.get('preparation', [])
            if preparation:
                response_parts.append("📋 **Season Preparation:**")
                for i, prep in enumerate(preparation, 1):
                    response_parts.append(f"{i}. {prep}")
                response_parts.append("")
        
        # General weather advice
        recommendations = [
            "📱 Monitor weather forecasts daily",
            "💧 Prepare drainage systems for heavy rains",
            "🌡️ Protect crops during extreme temperatures",
            "💨 Install windbreaks for storm protection",
            "🌊 Harvest rainwater for irrigation",
            "📊 Adjust fertilizer timing based on rainfall"
        ]
        
        return {
            'message': '\n'.join(response_parts),
            'recommendations': recommendations,
            'type': 'weather_advice',
            'confidence': 0.9
        }
    
    def _generate_disease_response(self, entities: Dict, image_analysis: Dict = None) -> Dict:
        """Generate response for disease-related queries"""
        response_parts = []
        recommendations = []
        
        if image_analysis:
            # Use ML model results for disease detection
            detected_issue = image_analysis.get('predicted_class', 'unknown')
            confidence = image_analysis.get('confidence', 0.0)
            
            response_parts.append(f"🔬 **AI Disease Analysis:**")
            response_parts.append(f"Detected Issue: **{detected_issue.title()}**")
            response_parts.append(f"Confidence: **{confidence:.1%}**")
            response_parts.append("")
        
        if entities['diseases']:
            disease_name = entities['diseases'][0]
            disease_info = self.knowledge_base.get_disease_info(disease_name)
            
            if disease_info:
                response_parts.append(f"🦠 **About {disease_name.title()}:**")
                response_parts.append(f"Pathogen: *{disease_info.get('pathogen', 'N/A')}*")
                response_parts.append("")
                
                symptoms = disease_info.get('symptoms', [])
                if symptoms:
                    response_parts.append("⚠️ **Disease Symptoms:**")
                    for symptom in symptoms[:4]:
                        response_parts.append(f"• {symptom}")
                    response_parts.append("")
                
                management = disease_info.get('management', {})
                if management:
                    response_parts.append("💊 **Disease Management:**")
                    
                    resistant_vars = management.get('resistant_varieties', [])
                    if resistant_vars:
                        response_parts.append(f"**🌱 Resistant Varieties:** {', '.join(resistant_vars)}")
                    
                    fungicides = management.get('fungicides', [])
                    if fungicides:
                        response_parts.append(f"**🧪 Fungicides:** {', '.join(fungicides[:3])}")
                    
                    cultural = management.get('cultural_practices', [])
                    if cultural:
                        response_parts.append("**🏡 Cultural Practices:**")
                        for practice in cultural[:3]:
                            response_parts.append(f"• {practice}")
        else:
            response_parts.append("🦠 **General Disease Management:**")
            response_parts.append("For effective disease prevention and control:")
            
            recommendations = [
                "🌱 Use certified, disease-free seeds",
                "🔄 Practice crop rotation to break disease cycles",
                "💧 Ensure proper drainage to avoid waterlogging",
                "🌬️ Maintain good air circulation between plants",
                "🧹 Remove and destroy infected plant material",
                "⏰ Apply preventive fungicides during favorable conditions"
            ]
        
        return {
            'message': '\n'.join(response_parts),
            'recommendations': recommendations,
            'type': 'disease_identification',
            'confidence': 0.85
        }
    
    def _generate_irrigation_response(self, entities: Dict) -> Dict:
        """Generate irrigation management advice"""
        response_parts = []
        recommendations = []
        
        response_parts.append("💧 **Irrigation Management Guide:**")
        response_parts.append("")
        
        irrigation_info = self.knowledge_base.knowledge_base['irrigation']
        
        methods = irrigation_info.get('methods', {})
        if methods:
            response_parts.append("**🚰 Irrigation Methods:**")
            for method, details in methods.items():
                efficiency = details.get('efficiency', 'N/A')
                crops = ', '.join(details.get('suitable_crops', []))
                response_parts.append(f"• **{method.replace('_', ' ').title()}**: {efficiency} efficiency")
                response_parts.append(f"  Suitable for: {crops}")
            response_parts.append("")
        
        recommendations = [
            "📊 Monitor soil moisture levels regularly",
            "⏰ Schedule irrigation based on crop growth stage",
            "💰 Choose water-efficient irrigation methods",
            "🌡️ Adjust watering frequency based on weather",
            "🔧 Maintain irrigation equipment properly",
            "📝 Keep records of water usage and crop response"
        ]
        
        return {
            'message': '\n'.join(response_parts),
            'recommendations': recommendations,
            'type': 'irrigation_advice',
            'confidence': 0.9
        }
    
    def _generate_market_response(self, entities: Dict) -> Dict:
        """Generate market and pricing advice"""
        response_parts = []
        recommendations = []
        
        response_parts.append("💰 **Market Analysis & Pricing Guide:**")
        response_parts.append("")
        
        market_info = self.knowledge_base.knowledge_base['market_info']
        
        price_trends = market_info.get('price_trends', {})
        if price_trends:
            response_parts.append("📈 **Market Insights:**")
            for key, value in price_trends.items():
                if isinstance(value, str):
                    response_parts.append(f"• {key.replace('_', ' ').title()}: {value}")
                elif isinstance(value, list):
                    response_parts.append(f"• {key.replace('_', ' ').title()}: {', '.join(value)}")
            response_parts.append("")
        
        recommendations = [
            "📊 Monitor daily market prices for your crops",
            "📦 Focus on quality and proper grading",
            "⏰ Time your sales to avoid price crashes",
            "🤝 Consider contract farming for price stability",
            "📱 Use mobile apps for real-time price information",
            "💼 Explore value-addition opportunities"
        ]
        
        return {
            'message': '\n'.join(response_parts),
            'recommendations': recommendations,
            'type': 'market_advice',
            'confidence': 0.8
        }
    
    def _generate_soil_response(self, entities: Dict) -> Dict:
        """Generate soil management advice"""
        response_parts = []
        recommendations = []
        
        response_parts.append("🌍 **Soil Health Management:**")
        response_parts.append("")
        
        soil_info = self.knowledge_base.knowledge_base['soil_management']
        
        soil_testing = soil_info.get('soil_testing', {})
        if soil_testing:
            response_parts.append("🧪 **Soil Testing Guidelines:**")
            response_parts.append(f"• Test Frequency: {soil_testing.get('frequency', 'N/A')}")
            response_parts.append(f"• Parameters: {', '.join(soil_testing.get('parameters', []))}")
            response_parts.append("")
        
        organic_matter = soil_info.get('organic_matter', {})
        if organic_matter:
            response_parts.append("🌱 **Organic Matter Management:**")
            response_parts.append(f"• Importance: {organic_matter.get('importance', 'N/A')}")
            response_parts.append(f"• Target Level: {organic_matter.get('target_level', 'N/A')}")
            response_parts.append("")
        
        recommendations = [
            "🧪 Test soil every 2-3 years for nutrient status",
            "🌾 Add organic matter through crop residues and compost",
            "🔄 Practice crop rotation to maintain fertility",
            "🛡️ Prevent soil erosion with cover crops",
            "⚖️ Balance soil pH for optimal nutrient availability",
            "💧 Maintain proper soil moisture levels"
        ]
        
        return {
            'message': '\n'.join(response_parts),
            'recommendations': recommendations,
            'type': 'soil_management',
            'confidence': 0.9
        }
    
    def _generate_fertilizer_response(self, entities: Dict) -> Dict:
        """Generate fertilizer advice"""
        response_parts = []
        recommendations = []
        
        response_parts.append("🌿 **Fertilizer Management Guide:**")
        response_parts.append("")
        
        fertilizer_info = self.knowledge_base.knowledge_base['fertilizers']
        
        # Nitrogen sources
        nitrogen = fertilizer_info.get('nitrogen_sources', {})
        if nitrogen:
            response_parts.append("**🟦 Nitrogen Sources:**")
            for fertilizer, info in list(nitrogen.items())[:3]:
                content = info.get('nitrogen_content', 0)
                response_parts.append(f"• {fertilizer.title()}: {content}% N")
            response_parts.append("")
        
        # Organic options
        organic = fertilizer_info.get('organic_fertilizers', {})
        if organic:
            response_parts.append("**🌱 Organic Fertilizers:**")
            for fertilizer, info in organic.items():
                npk = info.get('npk', 'N/A')
                rate = info.get('application_rate', 'N/A')
                response_parts.append(f"• {fertilizer.title()}: NPK {npk}, Rate: {rate}")
            response_parts.append("")
        
        recommendations = [
            "🧪 Conduct soil test before fertilizer application",
            "📅 Apply fertilizers in split doses for better efficiency",
            "💧 Ensure adequate moisture for nutrient uptake",
            "🌿 Combine organic and inorganic sources",
            "⏰ Time application with crop growth stages",
            "🔄 Maintain records of fertilizer use"
        ]
        
        return {
            'message': '\n'.join(response_parts),
            'recommendations': recommendations,
            'type': 'fertilizer_advice',
            'confidence': 0.9
        }
    
    def _generate_general_response(self, analysis: Dict) -> Dict:
        """Generate general farming advice"""
        query = analysis['original_query']
        
        # Search knowledge base
        search_results = self.knowledge_base.search_knowledge(query)
        
        response_parts = []
        recommendations = []
        
        if search_results:
            top_result = search_results[0]
            category = top_result['category']
            key = top_result['key']
            data = top_result['data']
            
            response_parts.append(f"🧠 **Agricultural Knowledge - {category.title()}:**")
            response_parts.append("")
            response_parts.append(f"**{key.title()}:**")
            
            if isinstance(data, dict):
                for sub_key, sub_value in list(data.items())[:5]:
                    if isinstance(sub_value, (str, int, float)):
                        response_parts.append(f"• {sub_key.title()}: {sub_value}")
                    elif isinstance(sub_value, list):
                        response_parts.append(f"• {sub_key.title()}: {', '.join(map(str, sub_value[:3]))}")
            elif isinstance(data, list):
                response_parts.append("Key points:")
                for item in data[:5]:
                    response_parts.append(f"• {item}")
            else:
                response_parts.append(str(data))
            
            recommendations = [
                "📚 Consult local agricultural extension services",
                "🧪 Conduct relevant tests (soil, water, plant tissue)",
                "📱 Use agricultural apps for monitoring",
                "🤝 Connect with other farmers in your area",
                "📊 Keep detailed farm records",
                "🎓 Attend agricultural training programs"
            ]
        else:
            response_parts.append("🌾 **General Farming Guidance:**")
            response_parts.append("I'm here to help with your agricultural needs! Here are some general best practices:")
            response_parts.append("")
            
            recommendations = [
                "🔍 Regular field monitoring and observation",
                "💧 Efficient water management and conservation",
                "🌿 Integrated nutrient management",
                "🛡️ Preventive pest and disease management",
                "📊 Record keeping and data analysis",
                "🌱 Sustainable farming practices"
            ]
        
        return {
            'message': '\n'.join(response_parts),
            'recommendations': recommendations,
            'type': 'general_advice',
            'confidence': 0.7
        }
    
    def _generate_suggestions(self, intent: str, entities: Dict) -> List[str]:
        """Generate helpful suggestions based on intent"""
        suggestions = {
            'pest_identification': [
                "Take clear photos of affected plants for better diagnosis",
                "Monitor pest population levels regularly",
                "Consider biological control methods first",
                "Apply treatments during early morning or evening"
            ],
            'crop_cultivation': [
                "Plan crop rotation for next season",
                "Test soil before planting",
                "Select climate-appropriate varieties",
                "Prepare irrigation schedule"
            ],
            'weather_related': [
                "Set up weather monitoring alerts",
                "Prepare contingency plans for extreme weather",
                "Adjust planting dates based on weather patterns",
                "Install protective structures if needed"
            ]
        }
        
        return suggestions.get(intent, [
            "Keep detailed farm records",
            "Consult local agricultural experts",
            "Stay updated with latest farming techniques",
            "Join farmer groups for knowledge sharing"
        ])
    
    def _generate_follow_up_questions(self, intent: str, entities: Dict) -> List[str]:
        """Generate relevant follow-up questions"""
        questions = {
            'pest_identification': [
                "What crop is affected by this pest?",
                "How long have you noticed this problem?",
                "What is the extent of damage (percentage of crop affected)?",
                "Have you tried any treatments so far?"
            ],
            'crop_cultivation': [
                "What is your farm size and location?",
                "What soil type do you have?",
                "Do you have irrigation facilities?",
                "What's your target market for this crop?"
            ],
            'fertilizer_advice': [
                "Have you conducted a soil test recently?",
                "What crop are you planning to fertilize?",
                "What's your budget for fertilizers?",
                "Do you prefer organic or chemical fertilizers?"
            ]
        }
        
        return questions.get(intent, [
            "What specific aspect would you like to know more about?",
            "Do you need help with any other farming topics?",
            "Would you like location-specific advice?",
            "Are there any other crops you're planning to grow?"
        ])
    
    def _generate_fallback_response(self, analysis: Dict) -> Dict:
        """Generate fallback response when specific analysis fails"""
        return {
            'message': "I understand you need agricultural advice! While I'm processing your specific question, here are some general farming tips that might help:",
            'recommendations': [
                "🌱 Monitor your crops daily for early problem detection",
                "💧 Maintain proper irrigation and drainage",
                "🌿 Follow integrated pest management practices",
                "🧪 Test your soil regularly for optimal nutrition",
                "📚 Stay updated with latest agricultural techniques",
                "🤝 Connect with local agricultural extension services"
            ],
            'type': 'fallback',
            'confidence': 0.5,
            'suggestions': [
                "Try rephrasing your question with more specific details",
                "Include information about your crop, location, or specific problem",
                "Upload an image if you're asking about pest or disease identification"
            ],
            'follow_up_questions': [
                "What specific farming challenge are you facing?",
                "Which crop or aspect of farming do you need help with?",
                "Can you provide more details about your situation?"
            ]
        }
    
    def update_context(self, user_id: str, query: str, response: Dict):
        """Update conversation context for better follow-up responses"""
        if user_id not in self.conversation_memory:
            self.conversation_memory[user_id] = {
                'conversations': [],
                'context': {},
                'last_active': datetime.now()
            }
        
        self.conversation_memory[user_id]['conversations'].append({
            'query': query,
            'response_type': response.get('type', 'unknown'),
            'timestamp': datetime.now(),
            'entities': response.get('entities', {})
        })
        
        # Keep only last 10 conversations
        if len(self.conversation_memory[user_id]['conversations']) > 10:
            self.conversation_memory[user_id]['conversations'] = \
                self.conversation_memory[user_id]['conversations'][-10:]
        
        self.conversation_memory[user_id]['last_active'] = datetime.now()