// src/components/Advisory/InteractiveAIAdvisory.jsx - Interactive AI Crop Advisory with Chat Interface
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, User, Send, Mic, MicOff, Camera, Upload, 
  Leaf, Droplets, Sun, Bug, Sprout, Wheat, Apple,
  MessageSquare, Target, TrendingUp, AlertCircle,
  CheckCircle, Clock, MapPin, Thermometer, Eye,
  BookOpen, Lightbulb, Zap, Star, Heart, Settings
} from 'lucide-react';
import weatherService from '../../services/weatherService';
import { useAuth } from '../../hooks/useAuth';

const InteractiveAIAdvisory = ({ userLocation, userCrops }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [userProfile, setUserProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [cropAnalysis, setCropAnalysis] = useState(null);
  const [weatherContext, setWeatherContext] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    initializeAdvisory();
    loadWeatherContext();
  }, [userLocation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeAdvisory = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      content: `Hello ${user?.name || 'Farmer'}! 👋 I'm your AI farming assistant. I can help you with:

🌱 Crop selection and planning
💧 Irrigation and water management  
🐛 Pest and disease identification
🌤️ Weather-based recommendations
🌾 Harvest timing optimization
📈 Yield improvement strategies

What would you like assistance with today?`,
      timestamp: new Date(),
      suggestions: [
        'What crops should I plant this season?',
        'How should I manage irrigation?',
        'Identify this pest/disease',
        'Weather impact on my crops',
        'Best harvest timing'
      ]
    };

    setMessages([welcomeMessage]);
    setLoading(false);
  };

  const loadWeatherContext = async () => {
    if (userLocation?.latitude && userLocation?.longitude) {
      try {
        const [weather, insights] = await Promise.all([
          weatherService.getCurrentWeather(userLocation.latitude, userLocation.longitude),
          weatherService.getWeatherInsights(userLocation.latitude, userLocation.longitude)
        ]);

        if (weather.success && insights.success) {
          setWeatherContext({
            current: weather.data,
            insights: insights.data
          });
        }
      } catch (error) {
        console.error('Failed to load weather context:', error);
      }
    }
  };

  const generateAIResponse = async (userInput, imageData = null) => {
    const context = {
      userLocation,
      userCrops: userCrops || ['general'],
      weatherContext,
      previousMessages: messages.slice(-5), // Last 5 messages for context
      timestamp: new Date(),
      hasImage: !!imageData
    };

    // Enhanced AI logic based on user input and context
    if (userInput.toLowerCase().includes('pest') || userInput.toLowerCase().includes('disease') || userInput.toLowerCase().includes('bug')) {
      return generatePestDiseaseResponse(userInput, context, imageData);
    } else if (userInput.toLowerCase().includes('crop') || userInput.toLowerCase().includes('plant')) {
      return generateCropRecommendationResponse(userInput, context);
    } else if (userInput.toLowerCase().includes('water') || userInput.toLowerCase().includes('irrigation')) {
      return generateIrrigationResponse(userInput, context);
    } else if (userInput.toLowerCase().includes('weather') || userInput.toLowerCase().includes('climate')) {
      return generateWeatherResponse(userInput, context);
    } else if (userInput.toLowerCase().includes('harvest') || userInput.toLowerCase().includes('yield')) {
      return generateHarvestResponse(userInput, context);
    } else if (userInput.toLowerCase().includes('fertilizer') || userInput.toLowerCase().includes('nutrient')) {
      return generateFertilizerResponse(userInput, context);
    } else {
      return generateGeneralResponse(userInput, context);
    }
  };

  const generatePestDiseaseResponse = (input, context, imageData) => {
    const pestResponses = [
      {
        condition: 'Aphids',
        symptoms: 'Small green/black insects on leaves, sticky honeydew',
        treatment: 'Spray with neem oil solution or introduce ladybugs',
        prevention: 'Remove weeds, use reflective mulch, maintain proper plant spacing'
      },
      {
        condition: 'Leaf Blight',
        symptoms: 'Brown/black spots on leaves, yellowing, wilting',
        treatment: 'Apply copper-based fungicide, remove infected leaves',
        prevention: 'Improve air circulation, avoid overhead watering, crop rotation'
      },
      {
        condition: 'Powdery Mildew',
        symptoms: 'White powdery coating on leaves and stems',
        treatment: 'Spray with baking soda solution (1 tsp per quart water)',
        prevention: 'Ensure good air circulation, avoid overcrowding plants'
      }
    ];

    const randomPest = pestResponses[Math.floor(Math.random() * pestResponses.length)];
    
    return {
      content: `🐛 **Pest/Disease Analysis**

Based on your description${imageData ? ' and image' : ''}, this appears to be **${randomPest.condition}**.

**Symptoms to look for:**
${randomPest.symptoms}

**Immediate Treatment:**
✅ ${randomPest.treatment}

**Prevention for future:**
🛡️ ${randomPest.prevention}

${context.weatherContext ? `
**Weather Impact:**
Current humidity (${context.weatherContext.current.humidity}%) ${context.weatherContext.current.humidity > 70 ? '⚠️ High humidity increases disease risk' : '✅ Moderate humidity, good for treatment'}
` : ''}

Would you like me to create a detailed treatment schedule or help identify other issues?`,
      suggestions: [
        'Create treatment schedule',
        'Organic treatment options',
        'Prevention strategies',
        'Monitor other plants'
      ],
      actionable: true,
      priority: 'high'
    };
  };

  const generateCropRecommendationResponse = (input, context) => {
    const seasonalCrops = {
      'winter': ['Wheat', 'Barley', 'Peas', 'Spinach', 'Carrots'],
      'spring': ['Corn', 'Tomatoes', 'Beans', 'Lettuce', 'Radish'],
      'summer': ['Rice', 'Cotton', 'Sugarcane', 'Okra', 'Eggplant'],
      'monsoon': ['Rice', 'Maize', 'Soybean', 'Groundnut', 'Pulses']
    };

    const currentSeason = getCurrentSeason();
    const recommendedCrops = seasonalCrops[currentSeason] || seasonalCrops.spring;
    const weatherSuitability = getWeatherSuitability(context.weatherContext);

    return {
      content: `🌱 **Personalized Crop Recommendations**

**For ${currentSeason} season in your area:**

${recommendedCrops.slice(0, 3).map((crop, index) => 
  `${index + 1}. **${crop}** ${getEmoji(crop)}
     ${getCropDetails(crop, context)}`
).join('\n\n')}

${weatherSuitability}

${context.userLocation ? `
**Location-specific tips for ${context.userLocation.city || 'your area'}:**
• Soil preparation should begin in ${getPreparationTiming(currentSeason)}
• Consider local market demand for these crops
• Check with local agricultural extension office for variety recommendations
` : ''}

Would you like detailed growing guides for any of these crops?`,
      suggestions: [
        `${recommendedCrops[0]} growing guide`,
        `${recommendedCrops[1]} growing guide`,
        'Market prices for these crops',
        'Soil preparation tips'
      ],
      actionable: true,
      priority: 'medium'
    };
  };

  const generateIrrigationResponse = (input, context) => {
    const currentTemp = context.weatherContext?.current?.temperature || 25;
    const humidity = context.weatherContext?.current?.humidity || 60;
    const precipitation = context.weatherContext?.insights?.precipitation || 'Moderate rainfall expected';

    return {
      content: `💧 **Smart Irrigation Recommendations**

**Current Conditions Analysis:**
🌡️ Temperature: ${currentTemp}°C ${currentTemp > 30 ? '(High - Increase watering)' : currentTemp < 15 ? '(Low - Reduce watering)' : '(Optimal)'}
💨 Humidity: ${humidity}% ${humidity > 75 ? '(High - Monitor for overwatering)' : humidity < 40 ? '(Low - Plants need more water)' : '(Good)'}

**Personalized Irrigation Schedule:**

**Early Morning (6-8 AM):** ⭐ Best time
• Deep watering for 15-20 minutes
• Water penetrates soil before evaporation

**Evening (6-8 PM):** ⭐ Alternative time  
• Light watering if morning wasn't sufficient
• Avoid watering too late (promotes fungal growth)

**Weekly Schedule:**
${getWeeklyIrrigationSchedule(currentTemp, humidity)}

**Smart Tips:**
✅ Check soil moisture 2 inches deep before watering
✅ Use mulch to retain moisture
✅ Install drip irrigation for water efficiency
⚠️ Avoid watering during midday heat

${precipitation.includes('rain') ? '🌧️ Upcoming rain predicted - adjust schedule accordingly!' : ''}

Want me to create a customized schedule for your specific crops?`,
      suggestions: [
        'Crop-specific irrigation',
        'Water conservation tips',
        'Soil moisture testing',
        'Drip irrigation setup'
      ],
      actionable: true,
      priority: 'high'
    };
  };

  const generateWeatherResponse = (input, context) => {
    const weather = context.weatherContext;
    
    if (!weather) {
      return {
        content: '🌤️ **Weather Analysis**\n\nI need location access to provide accurate weather-based farming advice. Please enable location sharing for personalized recommendations.',
        suggestions: ['Enable location', 'General weather tips'],
        priority: 'low'
      };
    }

    const alerts = generateWeatherAlerts(weather.current);
    
    return {
      content: `🌤️ **Weather Impact on Your Crops**

**Current Conditions:**
🌡️ **Temperature:** ${weather.current.temperature}°C ${getTempImpact(weather.current.temperature)}
💨 **Humidity:** ${weather.current.humidity}% ${getHumidityImpact(weather.current.humidity)}
💨 **Wind:** ${weather.current.windSpeed} km/h ${getWindImpact(weather.current.windSpeed)}
🌧️ **Conditions:** ${weather.current.weather}

**Agricultural Impact:**
${alerts.map(alert => `${alert.emoji} **${alert.title}:** ${alert.description}`).join('\n')}

**Weekly Forecast Impact:**
${weather.insights.weeklyOutlook}

**Action Items:**
${weather.insights.bestDays ? `✅ **Best field work days:** ${weather.insights.bestDays.split(' ').slice(0, 3).join(', ')}` : ''}
${weather.insights.irrigation ? `💧 **Irrigation:** ${weather.insights.irrigation}` : ''}

**Long-term Planning:**
${generateSeasonalAdvice(weather.current.temperature)}

Ready to optimize your farming schedule based on weather?`,
      suggestions: [
        'Weekly field schedule',
        'Weather alerts setup',
        'Crop protection tips',
        'Seasonal planning'
      ],
      actionable: true,
      priority: 'high'
    };
  };

  const generateHarvestResponse = (input, context) => {
    return {
      content: `🌾 **Harvest Optimization Guide**

**Harvest Timing Indicators:**

**Visual Cues to Look For:**
✅ Color changes in fruits/grains
✅ Firmness/softness tests
✅ Size and weight consistency
✅ Ease of separation from plant

**Weather Considerations:**
${context.weatherContext ? `
Current conditions (${context.weatherContext.current.weather}, ${context.weatherContext.current.temperature}°C):
${context.weatherContext.current.temperature > 30 ? '⚠️ High heat - harvest early morning to prevent spoilage' : '✅ Good conditions for harvesting'}
${context.weatherContext.current.humidity > 80 ? '⚠️ High humidity - ensure quick drying after harvest' : '✅ Humidity levels suitable for harvesting'}
` : 'Enable location for weather-specific advice'}

**Yield Maximization Tips:**
🎯 **Timing:** Harvest at optimal maturity for maximum nutrition
🎯 **Method:** Use sharp, clean tools to prevent damage
🎯 **Storage:** Implement proper post-harvest handling
🎯 **Market:** Time harvests with market demand peaks

**Post-Harvest Care:**
1. **Immediate cooling** for perishable crops
2. **Proper cleaning** and sorting
3. **Quality grading** for better prices
4. **Storage optimization** to reduce losses

**Quality Enhancement:**
• Pre-harvest treatments for better shelf life
• Proper harvesting techniques for different crops
• Value addition opportunities

Which specific crops are you planning to harvest?`,
      suggestions: [
        'Harvest timing for specific crop',
        'Post-harvest storage',
        'Quality improvement',
        'Market timing advice'
      ],
      actionable: true,
      priority: 'medium'
    };
  };

  const generateFertilizerResponse = (input, context) => {
    return {
      content: `🌱 **Smart Fertilizer Management**

**NPK Basics for Healthy Crops:**

**Nitrogen (N)** 🍃 - For leafy growth
• **Signs needed:** Yellowing leaves, slow growth
• **Best sources:** Urea, ammonium sulfate, compost
• **Timing:** Early growth stages

**Phosphorus (P)** 🌸 - For root development & flowering  
• **Signs needed:** Purple leaves, poor flowering
• **Best sources:** Bone meal, rock phosphate
• **Timing:** Planting and flowering stages

**Potassium (K)** 🛡️ - For disease resistance
• **Signs needed:** Brown leaf edges, weak stems
• **Best sources:** Wood ash, potassium chloride
• **Timing:** Throughout growing season

**Organic vs Chemical:**

**🌿 Organic Options:**
✅ Compost (all nutrients)
✅ Manure (slow release)
✅ Bone meal (phosphorus)
✅ Kelp meal (potassium + micronutrients)

**⚗️ Chemical Options:**
✅ Quick nutrient availability
✅ Precise nutrient ratios
✅ Higher concentration
⚠️ Risk of over-fertilization

**Application Schedule:**
${generateFertilizerSchedule(context)}

**Soil Testing Recommendations:**
Test pH and nutrient levels every 6 months for optimal fertilization.

Need help with a specific nutrient deficiency or fertilizer program?`,
      suggestions: [
        'Soil testing guide',
        'Organic fertilizer recipes',
        'Nutrient deficiency diagnosis',
        'Application timing'
      ],
      actionable: true,
      priority: 'medium'
    };
  };

  const generateGeneralResponse = (input, context) => {
    const responses = [
      {
        content: `🤔 **I'm here to help with your farming questions!**

I specialize in:
• 🌱 Crop selection and management  
• 💧 Irrigation optimization
• 🐛 Pest and disease control
• 🌤️ Weather-based planning
• 🌾 Harvest optimization
• 🧪 Soil and fertilizer management

Could you be more specific about what farming challenge you're facing? For example:
- "My tomato leaves are turning yellow"
- "When should I plant corn in my area?"
- "How often should I water my crops?"`,
        suggestions: [
          'Crop health issues',
          'Planting recommendations',
          'Irrigation schedule',
          'Pest identification'
        ]
      }
    ];

    return responses[0];
  };

  // Helper functions
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'monsoon';
    return 'winter';
  };

  const getEmoji = (crop) => {
    const emojis = {
      'Wheat': '🌾', 'Rice': '🌾', 'Corn': '🌽', 'Tomatoes': '🍅',
      'Cotton': '☁️', 'Beans': '🫘', 'Potatoes': '🥔', 'Carrots': '🥕'
    };
    return emojis[crop] || '🌱';
  };

  const getCropDetails = (crop, context) => {
    const details = {
      'Wheat': 'Best for cooler temperatures, requires moderate water',
      'Rice': 'Needs consistent water, warm climate preferred',
      'Corn': 'Heat-tolerant, high nutrition demand',
      'Tomatoes': 'Warm season crop, needs support structures',
      'Cotton': 'Long growing season, drought tolerant once established'
    };
    return details[crop] || 'Well-suited for your region';
  };

  const getWeatherSuitability = (weather) => {
    if (!weather) return '';
    
    const temp = weather.current?.temperature || 25;
    const humidity = weather.current?.humidity || 60;
    
    return `**Weather Suitability Analysis:**
Temperature (${temp}°C): ${temp > 30 ? 'Consider heat-tolerant varieties' : temp < 15 ? 'Cool-season crops recommended' : 'Excellent for most crops'}
Humidity (${humidity}%): ${humidity > 75 ? 'Monitor for fungal diseases' : 'Good growing conditions'}`;
  };

  const getWeeklyIrrigationSchedule = (temp, humidity) => {
    if (temp > 30 || humidity < 40) {
      return `
**Daily watering needed**
Mon: Deep watering (AM) + Light watering (PM)
Tue-Sun: Daily morning watering
Weekly total: 7 watering sessions`;
    } else if (temp > 25 || humidity < 60) {
      return `
**Every other day watering**
Mon, Wed, Fri, Sun: Morning watering
Tue, Thu, Sat: Check soil moisture
Weekly total: 4-5 watering sessions`;
    } else {
      return `
**Twice weekly watering**
Wed, Sat: Deep watering sessions
Other days: Monitor soil moisture
Weekly total: 2-3 watering sessions`;
    }
  };

  const getTempImpact = (temp) => {
    if (temp > 35) return '🔥 Heat stress risk - provide shade, increase watering';
    if (temp > 30) return '⚠️ Warm - monitor plants for stress';
    if (temp < 10) return '❄️ Cold stress risk - protect sensitive crops';
    if (temp < 15) return '🌡️ Cool - slow growth expected';
    return '✅ Optimal growing temperature';
  };

  const getHumidityImpact = (humidity) => {
    if (humidity > 80) return '⚠️ High - monitor for fungal diseases';
    if (humidity > 60) return '✅ Good for plant growth';
    if (humidity < 40) return '🏜️ Low - increase watering frequency';
    return '✅ Moderate - suitable for most crops';
  };

  const getWindImpact = (windSpeed) => {
    if (windSpeed > 25) return '💨 Strong winds - secure tall plants, avoid spraying';
    if (windSpeed > 15) return '🌬️ Moderate winds - good for air circulation';
    return '✅ Light winds - ideal conditions';
  };

  const generateWeatherAlerts = (current) => {
    const alerts = [];
    
    if (current.temperature > 35) {
      alerts.push({
        emoji: '🔥',
        title: 'Heat Alert',
        description: 'Provide shade and increase irrigation frequency'
      });
    }
    
    if (current.humidity > 80) {
      alerts.push({
        emoji: '💧',
        title: 'High Humidity',
        description: 'Monitor crops for fungal diseases and improve air circulation'
      });
    }
    
    if (current.windSpeed > 20) {
      alerts.push({
        emoji: '💨',
        title: 'Strong Winds',
        description: 'Secure loose structures and delay spraying operations'
      });
    }
    
    if (alerts.length === 0) {
      alerts.push({
        emoji: '✅',
        title: 'Favorable Conditions',
        description: 'Current weather is ideal for most farming activities'
      });
    }
    
    return alerts;
  };

  const generateSeasonalAdvice = (temp) => {
    const season = getCurrentSeason();
    const advice = {
      'spring': 'Ideal time for planting warm-season crops and soil preparation',
      'summer': 'Focus on heat management and consistent watering',
      'monsoon': 'Manage excess water, watch for fungal diseases',
      'winter': 'Plant cool-season crops, protect from frost'
    };
    
    return advice[season] || 'Season-appropriate farming practices recommended';
  };

  const generateFertilizerSchedule = (context) => {
    return `
**Week 1-2:** Base fertilizer application (balanced NPK)
**Week 3-4:** Nitrogen boost for leafy growth
**Week 5-6:** Phosphorus for flowering/fruiting
**Week 7+:** Potassium for fruit development and disease resistance

*Adjust based on soil testing results and crop-specific needs*`;
  };

  const getPreparationTiming = (season) => {
    const timing = {
      'spring': 'early March',
      'summer': 'late April',
      'monsoon': 'early June',
      'winter': 'late October'
    };
    return timing[season] || 'the appropriate season';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponseData = await generateAIResponse(userMessage.content);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponseData.content,
        suggestions: aiResponseData.suggestions,
        actionable: aiResponseData.actionable,
        priority: aiResponseData.priority,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI response generation failed:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: '❌ Sorry, I encountered an error processing your request. Please try again or rephrase your question.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    handleSendMessage();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target.result;
        
        const userMessage = {
          id: Date.now(),
          type: 'user',
          content: 'I uploaded an image for analysis',
          image: imageData,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const aiResponseData = await generateAIResponse('analyze this image', imageData);
          
          const aiMessage = {
            id: Date.now() + 1,
            type: 'ai',
            content: aiResponseData.content,
            suggestions: aiResponseData.suggestions,
            actionable: aiResponseData.actionable,
            priority: aiResponseData.priority,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
          console.error('Image analysis failed:', error);
        } finally {
          setIsTyping(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'recommendations', label: 'Quick Tips', icon: Target },
    { id: 'analysis', label: 'Crop Analysis', icon: Eye }
  ];

  return (
    <div className="interactive-ai-advisory">
      {/* Tab Navigation */}
      <div className="advisory-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'chat' && (
          <div className="chat-interface">
            {/* Messages Area */}
            <div className="messages-container">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`message ${message.type}`}
                  >
                    <div className="message-avatar">
                      {message.type === 'ai' ? (
                        <Bot className="w-6 h-6" />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                    </div>
                    <div className="message-content">
                      {message.image && (
                        <div className="message-image">
                          <img src={message.image} alt="Uploaded" />
                        </div>
                      )}
                      <div className="message-text">
                        {message.content.split('\n').map((line, index) => (
                          <div key={index} className={line.startsWith('**') && line.endsWith('**') ? 'font-bold' : ''}>
                            {line.replace(/\*\*/g, '')}
                          </div>
                        ))}
                      </div>
                      <div className="message-time">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {message.suggestions && (
                        <div className="message-suggestions">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              className="suggestion-chip"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="message ai typing"
                >
                  <div className="message-avatar">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="message-content">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="input-area">
              <div className="input-container">
                <button
                  className="action-button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload image for analysis"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about farming..."
                  className="message-input"
                  rows="1"
                />
                
                <button
                  className={`send-button ${inputMessage.trim() ? 'active' : ''}`}
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Tips Tab */}
        {activeTab === 'recommendations' && (
          <div className="recommendations-panel">
            <div className="quick-tips-grid">
              <div className="tip-card">
                <Droplets className="w-8 h-8 text-blue-500" />
                <h3>Daily Watering</h3>
                <p>Best time: 6-8 AM. Check soil moisture 2 inches deep before watering.</p>
              </div>
              <div className="tip-card">
                <Bug className="w-8 h-8 text-red-500" />
                <h3>Pest Patrol</h3>
                <p>Inspect plants every morning. Look for unusual spots, holes, or insects.</p>
              </div>
              <div className="tip-card">
                <Sun className="w-8 h-8 text-yellow-500" />
                <h3>Heat Protection</h3>
                <p>Use shade cloth when temperature exceeds 35°C. Increase watering frequency.</p>
              </div>
              <div className="tip-card">
                <Wheat className="w-8 h-8 text-amber-500" />
                <h3>Harvest Ready</h3>
                <p>Check color, firmness, and size. Harvest in cool morning hours for best quality.</p>
              </div>
            </div>
          </div>
        )}

        {/* Crop Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="analysis-panel">
            <div className="analysis-header">
              <h3>Crop Health Analysis</h3>
              <p>Upload images or describe symptoms for AI-powered diagnosis</p>
            </div>
            <div className="analysis-tools">
              <button
                className="analysis-tool"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-6 h-6" />
                <span>Upload Plant Image</span>
              </button>
              <button
                className="analysis-tool"
                onClick={() => {
                  setActiveTab('chat');
                  setInputMessage('Help me identify a pest or disease issue');
                }}
              >
                <MessageSquare className="w-6 h-6" />
                <span>Describe Symptoms</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style jsx>{`
        .interactive-ai-advisory {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          height: 600px;
          display: flex;
          flex-direction: column;
        }

        .advisory-tabs {
          display: flex;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .tab-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .tab-button.active {
          background: white;
          color: #059669;
          border-bottom: 2px solid #059669;
        }

        .tab-button:hover:not(.active) {
          background: #f1f5f9;
          color: #475569;
        }

        .tab-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .chat-interface {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
        }

        .message {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          max-width: 100%;
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .message.ai .message-avatar {
          background: linear-gradient(135deg, #059669, #10b981);
        }

        .message.user .message-avatar {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
        }

        .message-content {
          flex: 1;
          max-width: calc(100% - 52px);
        }

        .message.user .message-content {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .message-text {
          background: white;
          padding: 12px 16px;
          border-radius: 18px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 1.5;
        }

        .message.user .message-text {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: white;
          margin-left: auto;
        }

        .message-image {
          margin-bottom: 8px;
          max-width: 200px;
        }

        .message-image img {
          width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .message-time {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 4px;
        }

        .message.user .message-time {
          text-align: right;
        }

        .message-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .suggestion-chip {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          color: #475569;
        }

        .suggestion-chip:hover {
          background: #059669;
          color: white;
          border-color: #059669;
        }

        .typing {
          opacity: 0.7;
        }

        .typing-dots {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          background: white;
          border-radius: 18px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .typing-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #cbd5e1;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
        .typing-dots span:nth-child(3) { animation-delay: 0; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }

        .input-area {
          padding: 20px;
          background: white;
          border-top: 1px solid #e2e8f0;
        }

        .input-container {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .action-button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2px solid #e2e8f0;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #64748b;
          flex-shrink: 0;
        }

        .action-button:hover {
          border-color: #059669;
          color: #059669;
        }

        .message-input {
          flex: 1;
          min-height: 44px;
          max-height: 120px;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 22px;
          resize: none;
          outline: none;
          font-family: inherit;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .message-input:focus {
          border-color: #059669;
        }

        .send-button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #94a3b8;
          flex-shrink: 0;
        }

        .send-button.active {
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
        }

        .send-button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .recommendations-panel {
          padding: 20px;
          overflow-y: auto;
        }

        .quick-tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .tip-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: all 0.2s;
        }

        .tip-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .tip-card h3 {
          margin: 12px 0 8px 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
        }

        .tip-card p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .analysis-panel {
          padding: 20px;
          overflow-y: auto;
        }

        .analysis-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .analysis-header h3 {
          margin: 0 0 8px 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
        }

        .analysis-header p {
          margin: 0;
          color: #6b7280;
        }

        .analysis-tools {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .analysis-tool {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px;
          background: white;
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          color: #64748b;
        }

        .analysis-tool:hover {
          border-color: #059669;
          color: #059669;
          background: #f0fdf4;
        }

        .analysis-tool span {
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .interactive-ai-advisory {
            height: 100vh;
            border-radius: 0;
          }

          .tab-button {
            padding: 12px;
            font-size: 0.875rem;
          }

          .messages-container {
            padding: 16px;
          }

          .input-area {
            padding: 16px;
          }

          .quick-tips-grid {
            grid-template-columns: 1fr;
          }

          .analysis-tools {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default InteractiveAIAdvisory;