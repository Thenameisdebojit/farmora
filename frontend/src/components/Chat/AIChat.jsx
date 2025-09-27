// src/components/Chat/AIChat.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Image,
  MoreVertical,
  Bot,
  User,
  Loader,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  X,
  Plus,
  Search,
  MessageCircle,
  Sparkles,
  Camera,
  Upload
} from 'lucide-react';
import apiService from '../../services/api';
import chatbotApi from '../../services/chatbotApi';
import { useAuth } from '../../hooks/useAuth';
import './AIChat.css';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [chatMode, setChatMode] = useState('general'); // general, pest, weather, market, advisory
  
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorder = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize chat
  useEffect(() => {
    initializeChat();
    loadChatHistory();
    loadSuggestions();
  }, []);

  const initializeChat = async () => {
    const newSessionId = chatbotApi.generateSessionId();
    setSessionId(newSessionId);
    
    // Add welcome message
    const welcomeMessage = {
      id: Date.now(),
      text: "Hello! I'm your smart farming assistant. I can help you with crop advice, weather insights, pest identification, market information, and much more. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
      suggestions: [
        "What's the best time to plant wheat?",
        "Identify this pest in my crops",
        "Current weather impact on farming",
        "Market prices for my crops"
      ]
    };
    setMessages([welcomeMessage]);
  };

  const loadChatHistory = async () => {
    try {
      const history = await apiService.getChatHistory(user?.id, 10);
      if (history.success && history.data) {
        setChatHistory(history.data);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const suggestionsData = await chatbotApi.getSuggestedQuestions({
        cropType: user?.currentCrop || 'general',
        category: chatMode,
        language: 'en'
      });
      if (suggestionsData.suggestions) {
        setSuggestions(suggestionsData.suggestions);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
      // Fallback suggestions
      setSuggestions([
        "What crops should I plant this season?",
        "How to prevent pest attacks?",
        "Best irrigation schedule for my crops",
        "Current market prices in my area",
        "Weather forecast for farming"
      ]);
    }
  };

  const sendMessage = async (messageText, imageFile = null) => {
    if (!messageText.trim() && !imageFile) return;

    const userMessage = {
      id: Date.now(),
      text: messageText || 'Image uploaded',
      sender: 'user',
      timestamp: new Date(),
      type: imageFile ? 'image' : 'text',
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : null,
      imageFile: imageFile
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setUploadedImage(null);
    setShowSuggestions(false);
    setIsTyping(true);
    setIsLoading(true);

    try {
      let response;
      
      if (imageFile) {
        // Handle image-based queries (pest detection, crop analysis, etc.)
        response = await handleImageMessage(messageText, imageFile);
      } else {
        // Handle text-based queries using real API
        response = await apiService.sendChatMessage(messageText, {
          userId: user?.id,
          sessionId,
          cropType: user?.currentCrop,
          location: user?.location,
          language: 'en',
          mode: chatMode,
          chatHistory: messages.slice(-5) // Send last 5 messages for context
        });
      }

      const botMessage = {
        id: Date.now() + 1,
        text: response.response || response.message || "I'm sorry, I couldn't process that request.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        confidence: response.confidence,
        sources: response.sources,
        actions: response.actions,
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleImageMessage = async (messageText, imageFile) => {
    // Determine the type of image analysis based on context or ask user
    if (chatMode === 'pest' || messageText.toLowerCase().includes('pest') || messageText.toLowerCase().includes('disease')) {
      return await apiService.detectPest(imageFile, user?.currentCrop || 'general');
    } else {
      // General crop image analysis
      return await apiService.analyzeCropImage(imageFile, user?.currentCrop || 'general');
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        try {
          const response = await chatbotApi.processVoiceInput(audioBlob, {
            language: 'en',
            userId: user?.id,
            sessionId: sessionId
          });
          
          if (response.transcription) {
            setInputMessage(response.transcription);
          }
        } catch (error) {
          console.error('Voice processing error:', error);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting voice recording:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
  };

  const provideFeedback = async (messageId, helpful) => {
    try {
      await chatbotApi.submitFeedback(sessionId, messageId, {
        helpful,
        rating: helpful ? 5 : 2,
        comment: helpful ? 'Helpful response' : 'Not helpful'
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(chatbotApi.generateSessionId());
    setShowSuggestions(true);
    initializeChat();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (uploadedImage) {
        sendMessage(inputMessage, uploadedImage);
      } else {
        sendMessage(inputMessage);
      }
    }
  };

  return (
    <div className="ai-chat">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-title">
          <div className="bot-avatar">
            <Bot className="bot-icon" />
            <div className="status-indicator online"></div>
          </div>
          <div className="chat-info">
            <h2>Smart Farm Assistant</h2>
            <span className="status-text">Online • Always here to help</span>
          </div>
        </div>
        
        <div className="chat-actions">
          <div className="mode-selector">
            <select 
              value={chatMode} 
              onChange={(e) => setChatMode(e.target.value)}
              className="mode-select"
            >
              <option value="general">General</option>
              <option value="pest">Pest & Disease</option>
              <option value="weather">Weather</option>
              <option value="market">Market</option>
              <option value="advisory">Advisory</option>
            </select>
          </div>
          
          <button className="action-btn" onClick={startNewChat}>
            <Plus className="action-icon" />
          </button>
          <button className="action-btn">
            <Search className="action-icon" />
          </button>
          <button className="action-btn">
            <MoreVertical className="action-icon" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`message ${message.sender}`}
            >
              <div className="message-avatar">
                {message.sender === 'bot' ? (
                  <div className="bot-avatar small">
                    <Bot className="avatar-icon" />
                  </div>
                ) : (
                  <div className="user-avatar">
                    <User className="avatar-icon" />
                  </div>
                )}
              </div>
              
              <div className="message-content">
                <div className="message-bubble">
                  {message.type === 'image' && message.imageUrl && (
                    <div className="message-image">
                      <img src={message.imageUrl} alt="Uploaded content" />
                    </div>
                  )}
                  
                  <div className="message-text">
                    {message.text}
                  </div>
                  
                  {message.confidence && (
                    <div className="confidence-indicator">
                      <Sparkles className="confidence-icon" />
                      <span>Confidence: {Math.round(message.confidence * 100)}%</span>
                    </div>
                  )}
                  
                  {message.sources && (
                    <div className="message-sources">
                      <small>Sources: {message.sources.join(', ')}</small>
                    </div>
                  )}
                  
                  {message.actions && (
                    <div className="message-actions">
                      {message.actions.map((action, index) => (
                        <button key={index} className="action-button">
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="message-meta">
                  <span className="message-time">
                    {formatMessageTime(message.timestamp)}
                  </span>
                  
                  {message.sender === 'bot' && (
                    <div className="message-controls">
                      <button 
                        className="control-btn"
                        onClick={() => copyMessage(message.text)}
                      >
                        <Copy className="control-icon" />
                      </button>
                      <button 
                        className="control-btn"
                        onClick={() => provideFeedback(message.id, true)}
                      >
                        <ThumbsUp className="control-icon" />
                      </button>
                      <button 
                        className="control-btn"
                        onClick={() => provideFeedback(message.id, false)}
                      >
                        <ThumbsDown className="control-icon" />
                      </button>
                    </div>
                  )}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="message bot"
          >
            <div className="message-avatar">
              <div className="bot-avatar small">
                <Bot className="avatar-icon" />
              </div>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <div className="typing-dots">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
                <span>Assistant is typing...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="suggestions-container"
          >
            <h3>Suggested Questions</h3>
            <div className="suggestions-grid">
              {suggestions.slice(0, 6).map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-card"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <MessageCircle className="suggestion-icon" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {uploadedImage && (
        <div className="image-preview">
          <div className="preview-container">
            <img src={URL.createObjectURL(uploadedImage)} alt="Upload preview" />
            <button 
              className="remove-image"
              onClick={() => setUploadedImage(null)}
            >
              <X className="remove-icon" />
            </button>
          </div>
          <span className="preview-text">Image ready to send</span>
        </div>
      )}

      {/* Input Container */}
      <div className="input-container">
        <div className="input-wrapper">
          <div className="input-actions-left">
            <button 
              className="input-action"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="action-icon" />
            </button>
            <button 
              className="input-action"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="action-icon" />
            </button>
            <button 
              className="input-action"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="action-icon" />
            </button>
          </div>

          <div className="message-input-container">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about farming..."
              className="message-input"
              rows="1"
              disabled={isLoading}
            />
          </div>

          <div className="input-actions-right">
            <button
              className={`voice-btn ${isRecording ? 'recording' : ''}`}
              onMouseDown={startVoiceRecording}
              onMouseUp={stopVoiceRecording}
              onMouseLeave={stopVoiceRecording}
            >
              {isRecording ? (
                <MicOff className="action-icon" />
              ) : (
                <Mic className="action-icon" />
              )}
            </button>

            <button
              className="send-btn"
              onClick={() => uploadedImage ? sendMessage(inputMessage, uploadedImage) : sendMessage(inputMessage)}
              disabled={!inputMessage.trim() && !uploadedImage}
            >
              {isLoading ? (
                <Loader className="action-icon loading" />
              ) : (
                <Send className="action-icon" />
              )}
            </button>
          </div>
        </div>

        <div className="input-hint">
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default AIChat;