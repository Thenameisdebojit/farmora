// backend/src/controllers/chatbotController.js
const axios = require('axios');

// Chat with AI assistant
exports.chatWithBot = async (req, res) => {
  try {
    const { message, userId, sessionId, language = 'en' } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get user context for personalized responses
    const userContext = await getUserContext(userId);
    
    // Generate AI response
    const botResponse = await generateAIResponse(message, userContext, language);
    
    // Save chat history
    await saveChatHistory(userId, sessionId, message, botResponse);

    res.json({
      success: true,
      data: {
        response: botResponse.text,
        suggestions: botResponse.suggestions,
        sessionId: sessionId || generateSessionId(),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process your message',
      data: {
        response: getFallbackResponse(language),
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Get chat history
exports.getChatHistory = async (req, res) => {
  try {
    const { userId, sessionId, limit = 50 } = req.query;
    
    const history = await getChatHistoryFromDB(userId, sessionId, limit);
    
    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat history'
    });
  }
};

// Get suggested questions
exports.getSuggestedQuestions = async (req, res) => {
  try {
    const { cropType, season, language = 'en' } = req.query;
    
    const suggestions = getSuggestionsForContext(cropType, season, language);
    
    res.json({
      success: true,
      data: {
        suggestions,
        context: { cropType, season }
      }
    });

  } catch (error) {
    console.error('Suggested questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions'
    });
  }
};

// Voice to text processing
exports.processVoiceInput = async (req, res) => {
  try {
    const { audioData, language = 'en' } = req.body;
    
    // Mock speech-to-text processing
    const transcription = await processVoiceToText(audioData, language);
    
    res.json({
      success: true,
      data: {
        transcription,
        confidence: 0.95
      }
    });

  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process voice input'
    });
  }
};

// Get farming tips
exports.getFarmingTips = async (req, res) => {
  try {
    const { category, cropType, language = 'en' } = req.query;
    
    const tips = await getFarmingTipsByCategory(category, cropType, language);
    
    res.json({
      success: true,
      data: {
        category,
        cropType,
        tips,
        totalTips: tips.length
      }
    });

  } catch (error) {
    console.error('Farming tips error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get farming tips'
    });
  }
};

// Helper functions
async function getUserContext(userId) {
  if (!userId) return {};
  
  // Mock user context - replace with actual user data
  return {
    location: 'Maharashtra, India',
    primaryCrops: ['wheat', 'cotton', 'soybean'],
    farmSize: 5.5,
    experience: 'intermediate',
    preferences: {
      organicFarming: true,
      language: 'en'
    }
  };
}

async function generateAIResponse(message, userContext, language) {
  try {
    // Check if it's a simple question that can be answered from knowledge base
    const simpleResponse = getSimpleResponse(message, language);
    if (simpleResponse) {
      return simpleResponse;
    }

    // For complex queries, you would integrate with OpenAI or other AI services
    // Mock AI response for now
    const response = {
      text: generateMockResponse(message, userContext, language),
      suggestions: [
        "Tell me about pest control",
        "What's the weather forecast?",
        "Market prices for wheat",
        "Irrigation schedule advice"
      ]
    };

    return response;

  } catch (error) {
    console.error('AI response generation error:', error);
    return {
      text: getFallbackResponse(language),
      suggestions: []
    };
  }
}

function generateMockResponse(message, userContext, language) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('pest') || lowerMessage.includes('insect')) {
    return language === 'hi' ? 
      'कीट नियंत्रण के लिए पहले कीट की पहचान करना जरूरी है। आप हमारे कीट डिटेक्शन फीचर का उपयोग करके फोटो अपलोड कर सकते हैं। आमतौर पर नीम का तेल और जैविक कीटनाशक सुरक्षित विकल्प हैं।' :
      'For pest control, it\'s important to first identify the specific pest. You can use our pest detection feature to upload a photo. Generally, neem oil and organic pesticides are safe first options.';
  }
  
  if (lowerMessage.includes('weather') || lowerMessage.includes('rain')) {
    return language === 'hi' ?
      'मौसम की योजना बनाना खेती के लिए बहुत महत्वपूर्ण है। विस्तृत पूर्वानुमान के लिए हमारा मौसम सेक्शन देखें। आमतौर पर हवा या बारिश के दौरान छिड़काव से बचें।' :
      'Weather planning is crucial for farming. Check our weather section for detailed forecasts. Generally, avoid spraying during windy or rainy conditions.';
  }
  
  if (lowerMessage.includes('fertilizer') || lowerMessage.includes('nutrition')) {
    return language === 'hi' ?
      'उचित उर्वरीकरण आपकी मिट्टी के प्रकार और फसल पर निर्भर करता है। मैं पहले मिट्टी परीक्षण कराने की सलाह देता हूं। अधिकांश फसलों के लिए एनपीके संतुलन आवश्यक है।' :
      'Proper fertilization depends on your soil type and crop. I recommend getting a soil test first. NPK balance is essential for most crops.';
  }
  
  if (lowerMessage.includes('market') || lowerMessage.includes('price')) {
    return language === 'hi' ?
      'बाजार की कीमतें दैनिक आधार पर बदलती रहती हैं। वर्तमान दरों के लिए हमारा मार्केट सेक्शन देखें। बिक्री की योजना बनाते समय भंडारण और परिवहन लागत का भी ध्यान रखें।' :
      'Market prices fluctuate daily. Check our market section for current rates. Consider storage and transportation costs when planning sales.';
  }
  
  return language === 'hi' ?
    'मैं आपके खेती के सवालों में मदद के लिए यहां हूं। आप मुझसे फसलों, कीटों, मौसम, उर्वरकों, या बाजार की जानकारी के बारे में पूछ सकते हैं।' :
    'I\'m here to help with your farming questions. You can ask me about crops, pests, weather, fertilizers, or market information.';
}

function getSimpleResponse(message, language) {
  const lowerMessage = message.toLowerCase();
  
  const simpleResponses = {
    'hello': language === 'hi' ? 'नमस्ते! मैं आपकी खेती में कैसे मदद कर सकता हूं?' : 'Hello! How can I help you with your farming today?',
    'hi': language === 'hi' ? 'नमस्ते! मैं आपकी खेती में कैसे मदद कर सकता हूं?' : 'Hi! How can I help you with your farming today?',
    'thanks': language === 'hi' ? 'आपका स्वागत है! क्या कोई और सवाल है?' : 'You\'re welcome! Any other questions?',
    'thank you': language === 'hi' ? 'आपका स्वागत है! क्या कोई और सवाल है?' : 'You\'re welcome! Any other questions?'
  };
  
  for (const [key, response] of Object.entries(simpleResponses)) {
    if (lowerMessage.includes(key)) {
      return {
        text: response,
        suggestions: getSuggestionsForContext(null, null, language)
      };
    }
  }
  
  return null;
}

function getFallbackResponse(language) {
  return language === 'hi' ?
    'क्षमा करें, मुझे आपका संदेश समझने में कुछ समस्या हो रही है। कृपया बाद में फिर से कोशिश करें।' :
    'I apologize, but I\'m having trouble understanding your message. Please try again later.';
}

function getSuggestionsForContext(cropType, season, language) {
  const suggestions = {
    en: [
      'How to control pests naturally?',
      'Best time for sowing wheat?',
      'Soil preparation techniques',
      'Weather forecast for farming',
      'Market prices today',
      'Irrigation best practices'
    ],
    hi: [
      'प्राकृतिक तरीके से कीट नियंत्रण कैसे करें?',
      'गेहूं बोने का सबसे अच्छा समय?',
      'मिट्टी तैयार करने की तकनीक',
      'खेती के लिए मौसम पूर्वानुमान',
      'आज के बाजार भाव',
      'सिंचाई की बेहतरीन प्रथाएं'
    ]
  };
  
  return suggestions[language] || suggestions.en;
}

async function saveChatHistory(userId, sessionId, userMessage, botResponse) {
  // Mock save to database
  console.log(`Saving chat: User ${userId}, Session ${sessionId}`);
  console.log(`User: ${userMessage}`);
  console.log(`Bot: ${botResponse.text}`);
}

async function getChatHistoryFromDB(userId, sessionId, limit) {
  // Mock chat history
  return [
    {
      id: '1',
      sessionId,
      userMessage: 'How to control aphids?',
      botResponse: 'For aphid control, you can use neem oil spray or insecticidal soap. These are organic options that are safe for your crops.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      sessionId,
      userMessage: 'What about chemical treatment?',
      botResponse: 'Chemical treatments include Imidacloprid or Thiamethoxam. Always follow label instructions and maintain pre-harvest intervals.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  ];
}

function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

async function processVoiceToText(audioData, language) {
  // Mock voice processing - integrate with actual speech-to-text service
  return 'How to control pests in tomato plants?';
}

async function getFarmingTipsByCategory(category, cropType, language) {
  const tips = {
    pest_control: {
      en: [
        'Regular monitoring is key to early pest detection',
        'Use yellow sticky traps to catch flying insects',
        'Encourage beneficial insects by planting diverse crops',
        'Neem oil is effective against many soft-bodied pests'
      ],
      hi: [
        'नियमित निगरानी कीट की प्रारंभिक पहचान की कुंजी है',
        'उड़ने वाले कीड़ों को पकड़ने के लिए पीले चिपचिपे जाल का उपयोग करें',
        'विविध फसल लगाकर लाभकारी कीटों को बढ़ावा दें',
        'नीम का तेल कई मुलायम कीड़ों के खिलाफ प्रभावी है'
      ]
    },
    irrigation: {
      en: [
        'Water early morning or evening to reduce evaporation',
        'Check soil moisture before irrigating',
        'Use drip irrigation for water efficiency',
        'Mulching helps retain soil moisture'
      ],
      hi: [
        'वाष्पीकरण कम करने के लिए सुबह या शाम को पानी दें',
        'सिंचाई से पहले मिट्टी की नमी की जांच करें',
        'पानी की दक्षता के लिए ड्रिप सिंचाई का उपयोग करें',
        'मल्चिंग मिट्टी की नमी बनाए रखने में मदद करती है'
      ]
    }
  };
  
  const categoryTips = tips[category];
  if (!categoryTips) return [];
  
  return categoryTips[language] || categoryTips.en;
}
