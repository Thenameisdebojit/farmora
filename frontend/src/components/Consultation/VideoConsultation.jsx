// src/components/Consultation/VideoConsultation.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageCircle,
  Share,
  Settings,
  Users,
  Calendar,
  Clock,
  Star,
  Award,
  MapPin,
  Languages,
  Camera,
  Monitor,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  RotateCcw,
  Upload,
  Download,
  Send
} from 'lucide-react';
import apiService from '../../services/api';
import { useAuth } from '../../hooks/useAuth.jsx';
import webrtcService from '../../services/webrtcService';
import './VideoConsultation.css';

const VideoConsultation = () => {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, booking, consultation, experts
  const [consultations, setConsultations] = useState([]);
  const [experts, setExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [activeConsultation, setActiveConsultation] = useState(null);
  
  // Video call states
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  
  // WebRTC states
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { user } = useAuth();
  
  // Create demo user for consultation if none exists
  React.useEffect(() => {
    if (!user) {
      const demoUser = {
        id: 'demo-user-' + Date.now(),
        name: 'Demo Farmer',
        email: 'demo@example.com',
        location: 'Demo Location',
        currentCrop: 'wheat'
      };
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      console.log('Created demo user for consultation:', demoUser);
    }
  }, [user]);

  useEffect(() => {
    loadConsultations();
    loadExperts();
    initializeWebRTC();
    
    return () => {
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, []);

  const loadConsultations = async () => {
    try {
      const currentUser = user || JSON.parse(localStorage.getItem('demo_user') || '{}');
      const response = await apiService.getUserConsultations(currentUser?.id || 'demo-user');
      if (response.success) {
        setConsultations(response.consultations || mockConsultations);
      } else {
        console.log('Using mock consultation data');
        setConsultations(mockConsultations);
      }
    } catch (error) {
      console.log('Backend not available, using mock consultation data:', error.message);
      setConsultations(mockConsultations);
    }
  };

  const loadExperts = async () => {
    try {
      const response = await apiService.getAvailableExperts();
      if (response.success) {
        setExperts(response.experts || mockExperts);
      } else {
        console.log('Using mock experts data');
        setExperts(mockExperts);
      }
    } catch (error) {
      console.log('Backend not available, using mock experts data:', error.message);
      setExperts(mockExperts);
    }
  };

  const initializeWebRTC = async () => {
    try {
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      
      const pc = new RTCPeerConnection(configuration);
      
      pc.oniceconnectionstatechange = () => {
        setConnectionStatus(pc.iceConnectionState);
      };
      
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };
      
      setPeerConnection(pc);
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
    }
  };

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Add tracks to peer connection
      if (peerConnection) {
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const startConsultation = async (consultationId) => {
    try {
      await startLocalVideo();
      const response = await apiService.startConsultation(consultationId);
      if (response.success) {
        setActiveConsultation(response.consultation);
        setIsCallActive(true);
        setCurrentView('consultation');
        setConnectionStatus('connecting');
        // Initialize signaling and WebRTC connection here
      }
    } catch (error) {
      console.log('Backend not available for starting consultation, using simulation:', error.message);
      // Simulate starting consultation
      const consultation = consultations.find(c => c.id === consultationId);
      if (consultation) {
        try {
          await startLocalVideo();
        } catch (mediaError) {
          console.log('Media access failed:', mediaError.message);
          alert('Camera/microphone access denied. Please allow access for video consultation.');
          return;
        }
        setActiveConsultation(consultation);
        setIsCallActive(true);
        setCurrentView('consultation');
        setConnectionStatus('connected');
        alert('Video consultation started (simulated mode)');
      }
    }
  };

  const endConsultation = async () => {
    try {
      if (activeConsultation) {
        await apiService.endConsultation(activeConsultation.id);
      }
      
      // Stop local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      // Close peer connection
      if (peerConnection) {
        peerConnection.close();
        initializeWebRTC();
      }
      
      setIsCallActive(false);
      setActiveConsultation(null);
      setConnectionStatus('disconnected');
      setCurrentView('dashboard');
      
    } catch (error) {
      console.error('Error ending consultation:', error);
    }
  };

  const bookConsultation = async (expertId, dateTime, topic) => {
    try {
      const currentUser = user || JSON.parse(localStorage.getItem('demo_user') || '{}');
      const response = await apiService.bookConsultation({
        expertId,
        userId: currentUser?.id || 'demo-user',
        scheduledTime: dateTime,
        topic,
        duration: 30,
        consultationType: 'video'
      });
      
      if (response.success) {
        await loadConsultations();
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.log('Backend not available for booking, using simulation:', error.message);
      // Simulate successful booking
      const newConsultation = {
        id: Date.now(),
        expert: experts.find(e => e.id === expertId),
        scheduledTime: new Date(dateTime),
        topic,
        status: 'scheduled',
        duration: 30
      };
      setConsultations(prev => [newConsultation, ...prev]);
      setCurrentView('dashboard');
      alert('Consultation booked successfully (simulated)');
    }
  };

  const sendChatMessage = () => {
    if (chatInput.trim()) {
      const currentUser = user || JSON.parse(localStorage.getItem('demo_user') || '{}');
      const message = {
        id: Date.now(),
        sender: currentUser?.name || 'You',
        message: chatInput,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, message]);
      setChatInput('');
      // Send message through WebRTC data channel or websocket
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Mock data
  const mockExperts = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      specialty: "Crop Disease Specialist",
      experience: 15,
      rating: 4.9,
      reviews: 234,
      avatar: "/api/placeholder/150/150",
      languages: ["Hindi", "English", "Marathi"],
      location: "Pune, Maharashtra",
      availability: "Available Now",
      price: 500,
      credentials: ["PhD in Plant Pathology", "20+ years experience"],
      specializations: ["Disease Diagnosis", "Pest Management", "Organic Farming"]
    },
    {
      id: 2,
      name: "Dr. Priya Sharma",
      specialty: "Soil & Fertility Expert",
      experience: 12,
      rating: 4.8,
      reviews: 189,
      avatar: "/api/placeholder/150/150",
      languages: ["Hindi", "English", "Gujarati"],
      location: "Gandhinagar, Gujarat",
      availability: "Available from 2 PM",
      price: 450,
      credentials: ["MSc Soil Science", "Agricultural Consultant"],
      specializations: ["Soil Testing", "Nutrient Management", "Sustainable Agriculture"]
    }
  ];

  const mockConsultations = [
    {
      id: 1,
      expert: mockExperts[0],
      scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      topic: "Wheat crop disease identification",
      status: "scheduled",
      duration: 30
    },
    {
      id: 2,
      expert: mockExperts[1],
      scheduledTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      topic: "Soil fertility management",
      status: "completed",
      duration: 45,
      rating: 5,
      feedback: "Very helpful session, got exactly what I needed."
    }
  ];

  const renderDashboard = () => (
    <div className="consultation-dashboard">
      <div className="dashboard-header">
        <h1>Video Consultations</h1>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => setCurrentView('experts')}
          >
            <Calendar className="btn-icon" />
            Book Consultation
          </button>
          <button 
            className="btn-secondary"
            onClick={() => setCurrentView('experts')}
          >
            <Users className="btn-icon" />
            View Experts
          </button>
        </div>
      </div>

      <div className="consultation-stats">
        <div className="stat-card">
          <div className="stat-number">12</div>
          <div className="stat-label">Total Consultations</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">3</div>
          <div className="stat-label">This Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">4.8</div>
          <div className="stat-label">Avg Rating</div>
        </div>
      </div>

      <div className="consultations-section">
        <h2>Your Consultations</h2>
        <div className="consultations-grid">
          {consultations.map(consultation => (
            <div key={consultation.id} className="consultation-card">
              <div className="consultation-header">
                <div className="expert-info">
                  <img 
                    src={consultation.expert.avatar} 
                    alt={consultation.expert.name}
                    className="expert-avatar"
                  />
                  <div>
                    <h3>{consultation.expert.name}</h3>
                    <p>{consultation.expert.specialty}</p>
                  </div>
                </div>
                <div className={`status-badge ${consultation.status}`}>
                  {consultation.status.toUpperCase()}
                </div>
              </div>
              
              <div className="consultation-details">
                <div className="detail-item">
                  <Clock className="detail-icon" />
                  <span>{consultation.scheduledTime.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <MessageCircle className="detail-icon" />
                  <span>{consultation.topic}</span>
                </div>
              </div>
              
              <div className="consultation-actions">
                {consultation.status === 'scheduled' && (
                  <>
                    <button 
                      className="btn-primary"
                      onClick={() => startConsultation(consultation.id)}
                    >
                      <Video className="btn-icon" />
                      Join Call
                    </button>
                    <button className="btn-secondary">
                      Reschedule
                    </button>
                  </>
                )}
                {consultation.status === 'completed' && (
                  <div className="rating-section">
                    <div className="rating">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`star ${i < consultation.rating ? 'filled' : ''}`}
                        />
                      ))}
                    </div>
                    <p className="feedback">{consultation.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderExperts = () => (
    <div className="experts-section">
      <div className="section-header">
        <h1>Available Experts</h1>
        <button 
          className="btn-secondary"
          onClick={() => setCurrentView('dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="experts-grid">
        {experts.map(expert => (
          <div key={expert.id} className="expert-card">
            <div className="expert-header">
              <img 
                src={expert.avatar} 
                alt={expert.name}
                className="expert-avatar"
              />
              <div className="expert-basic-info">
                <h3>{expert.name}</h3>
                <p className="specialty">{expert.specialty}</p>
                <div className="rating-info">
                  <Star className="star filled" />
                  <span>{expert.rating} ({expert.reviews} reviews)</span>
                </div>
              </div>
              <div className="availability-badge">
                {expert.availability}
              </div>
            </div>
            
            <div className="expert-details">
              <div className="detail-row">
                <Award className="detail-icon" />
                <span>{expert.experience} years experience</span>
              </div>
              <div className="detail-row">
                <MapPin className="detail-icon" />
                <span>{expert.location}</span>
              </div>
              <div className="detail-row">
                <Languages className="detail-icon" />
                <span>{expert.languages.join(', ')}</span>
              </div>
            </div>
            
            <div className="specializations">
              {expert.specializations.map((spec, index) => (
                <span key={index} className="specialization-tag">
                  {spec}
                </span>
              ))}
            </div>
            
            <div className="expert-footer">
              <div className="price">₹{expert.price}/session</div>
              <button 
                className="btn-primary"
                onClick={() => {
                  setSelectedExpert(expert);
                  setCurrentView('booking');
                }}
              >
                Book Session
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConsultation = () => (
    <div className="video-consultation-room">
      <div className="video-container">
        <div className="main-video">
          <video 
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />
          {!remoteStream && (
            <div className="no-video-placeholder">
              <div className="placeholder-avatar">
                <User size={64} />
              </div>
              <p>Waiting for expert to join...</p>
            </div>
          )}
        </div>
        
        <div className="local-video-container">
          <video 
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="local-video"
          />
          {!isVideoEnabled && (
            <div className="video-off-overlay">
              <VideoOff size={24} />
            </div>
          )}
        </div>
      </div>
      
      <div className="consultation-controls">
        <div className="control-group">
          <button 
            className={`control-btn ${!isAudioEnabled ? 'disabled' : ''}`}
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <Mic /> : <MicOff />}
          </button>
          <button 
            className={`control-btn ${!isVideoEnabled ? 'disabled' : ''}`}
            onClick={toggleVideo}
          >
            {isVideoEnabled ? <Video /> : <VideoOff />}
          </button>
          <button 
            className="control-btn"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageCircle />
          </button>
          <button 
            className="control-btn"
            onClick={toggleFullScreen}
          >
            {isFullScreen ? <Minimize /> : <Maximize />}
          </button>
        </div>
        
        <div className="control-group">
          <div className="connection-status">
            <div className={`status-indicator ${connectionStatus}`}></div>
            <span>{connectionStatus}</span>
          </div>
        </div>
        
        <div className="control-group">
          <button 
            className="control-btn end-call"
            onClick={endConsultation}
          >
            <PhoneOff />
          </button>
        </div>
      </div>
      
      {showChat && (
        <div className="consultation-chat">
          <div className="chat-header">
            <h3>Chat</h3>
            <button onClick={() => setShowChat(false)}>
              <Minimize size={16} />
            </button>
          </div>
          <div className="chat-messages">
            {chatMessages.map(message => (
              <div key={message.id} className="chat-message">
                <div className="message-sender">{message.sender}</div>
                <div className="message-text">{message.message}</div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
            />
            <button onClick={sendChatMessage}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="video-consultation">
      <AnimatePresence mode="wait">
        {currentView === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {renderDashboard()}
          </motion.div>
        )}
        
        {currentView === 'experts' && (
          <motion.div
            key="experts"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {renderExperts()}
          </motion.div>
        )}
        
        {currentView === 'consultation' && (
          <motion.div
            key="consultation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderConsultation()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoConsultation;