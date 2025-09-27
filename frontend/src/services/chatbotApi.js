// frontend/src/services/chatbotApi.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ChatbotApiService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/chatbot`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Chatbot API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Main chat functionality
  async sendMessage(message, userId, sessionId = null, context = {}) {
    try {
      const response = await this.api.post('/chat', {
        message,
        userId,
        sessionId: sessionId || this.generateSessionId(),
        context: {
          language: context.language || 'en',
          cropType: context.cropType,
          location: context.location,
          farmSize: context.farmSize,
          experience: context.experience,
          ...context
        },
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw new Error('Failed to send message. Please try again.');
    }
  }

  // Get chat history for a session
  async getChatHistory(userId, sessionId, limit = 50, offset = 0) {
    try {
      const response = await this.api.get('/history', {
        params: { 
          userId, 
          sessionId, 
          limit, 
          offset 
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get chat history error:', error);
      throw new Error('Failed to load chat history.');
    }
  }

  // Get suggested questions based on context
  async getSuggestedQuestions(context = {}) {
    try {
      const response = await this.api.get('/suggestions', {
        params: {
          cropType: context.cropType,
          season: context.season,
          growthStage: context.growthStage,
          language: context.language || 'en',
          category: context.category // general, pest, weather, market, etc.
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get suggestions error:', error);
      return { suggestions: [] }; // Return empty array on error
    }
  }

  // Process voice input
  async processVoiceInput(audioBlob, options = {}) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice_input.wav');
      formData.append('language', options.language || 'en');
      formData.append('userId', options.userId || '');
      formData.append('sessionId', options.sessionId || '');

      const response = await this.api.post('/voice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // Longer timeout for voice processing
      });
      
      return response.data;
    } catch (error) {
      console.error('Voice processing error:', error);
      throw new Error('Failed to process voice input. Please try again.');
    }
  }

  // Get text-to-speech audio
  async getTextToSpeech(text, language = 'en', voice = 'female') {
    try {
      const response = await this.api.post('/tts', {
        text,
        language,
        voice
      }, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Text-to-speech error:', error);
      throw new Error('Failed to generate speech.');
    }
  }

  // Get farming tips by category
  async getFarmingTips(category, context = {}) {
    try {
      const response = await this.api.get('/tips', {
        params: {
          category, // irrigation, fertilizer, pest_control, weather, market, etc.
          cropType: context.cropType,
          season: context.season,
          language: context.language || 'en',
          experience: context.experience || 'intermediate'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get farming tips error:', error);
      return { tips: [] };
    }
  }

  // Get quick responses for common queries
  async getQuickResponses(query, context = {}) {
    try {
      const response = await this.api.post('/quick-response', {
        query,
        context
      });
      return response.data;
    } catch (error) {
      console.error('Quick response error:', error);
      throw new Error('Failed to get quick response.');
    }
  }

  // Submit feedback on bot responses
  async submitFeedback(sessionId, messageId, feedback) {
    try {
      const response = await this.api.post('/feedback', {
        sessionId,
        messageId,
        feedback: {
          helpful: feedback.helpful, // boolean
          rating: feedback.rating, // 1-5
          comment: feedback.comment,
          timestamp: new Date().toISOString()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Submit feedback error:', error);
      // Don't throw error for feedback submission failures
      return { success: false };
    }
  }

  // Get bot analytics and insights
  async getBotAnalytics(userId, period = '7d') {
    try {
      const response = await this.api.get('/analytics', {
        params: {
          userId,
          period // 1d, 7d, 30d, 90d
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get analytics error:', error);
      return { analytics: {} };
    }
  }

  // Search through chat history
  async searchChatHistory(userId, query, limit = 20) {
    try {
      const response = await this.api.get('/search', {
        params: {
          userId,
          query,
          limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Search chat history error:', error);
      return { results: [] };
    }
  }

  // Get supported languages
  async getSupportedLanguages() {
    try {
      const response = await this.api.get('/languages');
      return response.data;
    } catch (error) {
      console.error('Get languages error:', error);
      return { 
        languages: [
          { code: 'en', name: 'English', native: 'English' },
          { code: 'hi', name: 'Hindi', native: 'हिंदी' },
          { code: 'mr', name: 'Marathi', native: 'मराठी' },
          { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' }
        ]
      };
    }
  }

  // Export chat history
  async exportChatHistory(userId, sessionId, format = 'json') {
    try {
      const response = await this.api.get('/export', {
        params: {
          userId,
          sessionId,
          format // json, csv, pdf
        },
        responseType: format === 'json' ? 'json' : 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Export chat history error:', error);
      throw new Error('Failed to export chat history.');
    }
  }

  // Utility methods
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isOnline() {
    return navigator.onLine;
  }

  // Cache management for offline support
  async cacheCommonResponses() {
    try {
      const commonQueries = [
        'weather forecast',
        'crop recommendations',
        'market prices',
        'pest identification',
        'irrigation tips'
      ];
      
      const cachedResponses = {};
      
      for (const query of commonQueries) {
        try {
          const response = await this.getQuickResponses(query);
          cachedResponses[query] = response;
        } catch (error) {
          console.warn(`Failed to cache response for: ${query}`);
        }
      }
      
      localStorage.setItem('cachedBotResponses', JSON.stringify(cachedResponses));
      return cachedResponses;
    } catch (error) {
      console.error('Cache responses error:', error);
    }
  }

  getCachedResponse(query) {
    try {
      const cachedResponses = JSON.parse(localStorage.getItem('cachedBotResponses') || '{}');
      return cachedResponses[query] || null;
    } catch (error) {
      console.error('Get cached response error:', error);
      return null;
    }
  }

  // Format message for display
  formatMessage(message) {
    return {
      ...message,
      timestamp: new Date(message.timestamp),
      formattedTime: new Date(message.timestamp).toLocaleTimeString(),
      isFromUser: message.sender === 'user',
      isFromBot: message.sender === 'bot'
    };
  }

  // Validate message before sending
  validateMessage(message) {
    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty.');
    }
    
    if (message.length > 1000) {
      throw new Error('Message is too long. Please keep it under 1000 characters.');
    }
    
    return message.trim();
  }

  // Detect language of input message
  async detectLanguage(text) {
    try {
      const response = await this.api.post('/detect-language', { text });
      return response.data;
    } catch (error) {
      console.error('Language detection error:', error);
      return { language: 'en', confidence: 0.5 }; // Default to English
    }
  }

  // Get contextual help
  async getContextualHelp(currentPage, userAction = null) {
    try {
      const response = await this.api.get('/contextual-help', {
        params: {
          page: currentPage,
          action: userAction
        }
      });
      return response.data;
    } catch (error) {
      console.error('Contextual help error:', error);
      return { help: [] };
    }
  }
}

// Create and export a singleton instance
const chatbotApi = new ChatbotApiService();

// Additional utility functions for the chatbot
export const ChatbotUtils = {
  // Format messages for display
  formatMessageTime: (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  },

  // Extract keywords from user message
  extractKeywords: (message) => {
    const keywords = message.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    return [...new Set(keywords)]; // Remove duplicates
  },

  // Check if message contains urgent indicators
  isUrgentMessage: (message) => {
    const urgentKeywords = ['urgent', 'emergency', 'dying', 'disease', 'pest attack', 'help', 'problem'];
    const lowerMessage = message.toLowerCase();
    return urgentKeywords.some(keyword => lowerMessage.includes(keyword));
  },

  // Generate message ID
  generateMessageId: () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Sanitize user input
  sanitizeInput: (input) => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/[<>]/g, '') // Remove HTML tags
      .trim();
  }
};

export default chatbotApi;
