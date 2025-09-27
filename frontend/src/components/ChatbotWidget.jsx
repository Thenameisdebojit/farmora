// frontend/src/components/ChatbotWidget.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Mic, 
  X, 
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Loader,
  Languages
} from 'lucide-react';
import chatbotApi, { ChatbotUtils } from '../services/chatbotApi';

const ChatbotWidget = ({ isOpen, onToggle, userId, context = {} }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [language, setLanguage] = useState('en');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    if (isOpen && !sessionId) {
      const newSessionId = chatbotApi.generateSessionId();
      setSessionId(newSessionId);
      loadChatHistory(newSessionId);
      loadSuggestions();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async (sessionId) => {
    try {
      const response = await chatbotApi.getChatHistory(userId, sessionId, 20);
      if (response.success) {
        setMessages(response.messages.map(ChatbotUtils.formatMessage));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await chatbotApi.getSuggestedQuestions({
        ...context,
        language
      });
      if (response.success) {
        setSuggestions(response.suggestions.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    const sanitizedMessage = ChatbotUtils.sanitizeInput(messageText);
    const messageId = ChatbotUtils.generateMessageId();
    const userMessage = {
      id: messageId,
      text: sanitizedMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      isFromUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setSuggestions([]); // Clear suggestions when user sends message

    try {
      const response = await chatbotApi.sendMessage(
        sanitizedMessage,
        userId,
        sessionId,
        { ...context, language }
      );

      if (response.success) {
        const botMessage = {
          id: response.messageId,
          text: response.message,
          sender: 'bot',
          timestamp: response.timestamp,
          isFromBot: true,
          suggestions: response.suggestions || [],
          actions: response.actions || []
        };

        setMessages(prev => [...prev, botMessage]);
        
        // Load new suggestions based on the conversation
        if (response.suggestions && response.suggestions.length > 0) {
          setSuggestions(response.suggestions);
        }
      }
    } catch (error) {
      const errorMessage = {
        id: ChatbotUtils.generateMessageId(),
        text: "I'm sorry, I'm having trouble responding right now. Please try again.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isFromBot: true,
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioBlob) => {
    setIsLoading(true);
    try {
      const response = await chatbotApi.processVoiceInput(audioBlob, {
        language,
        userId,
        sessionId
      });
      
      if (response.success && response.transcript) {
        setInputMessage(response.transcript);
        // Auto-send the transcribed message
        setTimeout(() => sendMessage(response.transcript), 500);
      }
    } catch (error) {
      console.error('Voice processing failed:', error);
      alert('Failed to process voice input. Please try typing your message.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async (messageId, isHelpful) => {
    try {
      await chatbotApi.submitFeedback(sessionId, messageId, {
        helpful: isHelpful,
        rating: isHelpful ? 4 : 2
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggle}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-colors"
        >
          <MessageCircle size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[32rem] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle size={20} />
          <span className="font-semibold">Farm Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm bg-green-700 border-green-800 rounded px-2 py-1"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
            <option value="gu">Gujarati</option>
          </select>
          <button onClick={onToggle} className="hover:bg-green-700 p-1 rounded">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="mx-auto mb-2" size={32} />
            <p>Hello! I'm here to help with your farming questions.</p>
            <p className="text-sm mt-1">Ask me about crops, weather, pests, or markets!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.isFromUser
                  ? 'bg-green-600 text-white'
                  : message.isError
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs opacity-70">
                  {ChatbotUtils.formatMessageTime(message.timestamp)}
                </span>
                {message.isFromBot && !message.isError && (
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => submitFeedback(message.id, true)}
                      className="text-xs hover:text-green-600"
                    >
                      <ThumbsUp size={12} />
                    </button>
                    <button
                      onClick={() => submitFeedback(message.id, false)}
                      className="text-xs hover:text-red-600"
                    >
                      <ThumbsDown size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <Loader className="animate-spin" size={16} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 pb-2">
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left text-sm px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your farming question..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-lg transition-colors ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            disabled={isLoading}
          >
            <Mic size={16} />
          </button>
          <button
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotWidget;
