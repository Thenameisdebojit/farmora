// Simple Video Consultation Component - Working without complex dependencies
import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageCircle,
  Settings,
  Users,
  Calendar,
  Clock,
  Star,
  User,
  Camera,
  Maximize,
  Minimize
} from 'lucide-react';

const SimpleVideoConsultation = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [localStream, setLocalStream] = useState(null);
  const [showDemoCall, setShowDemoCall] = useState(false);
  
  const localVideoRef = useRef(null);

  // Simple demo consultations
  const demoConsultations = [
    {
      id: 1,
      expert: {
        name: "Dr. Rajesh Kumar",
        specialty: "Crop Disease Specialist",
        rating: 4.9,
        image: null
      },
      scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      topic: "Wheat crop disease identification",
      status: "scheduled",
      duration: 30
    },
    {
      id: 2,
      expert: {
        name: "Dr. Priya Sharma", 
        specialty: "Soil & Fertility Expert",
        rating: 4.8,
        image: null
      },
      scheduledTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      topic: "Soil fertility management",
      status: "completed",
      duration: 45,
      rating: 5
    }
  ];

  const demoExperts = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      specialty: "Crop Disease Specialist", 
      experience: 15,
      rating: 4.9,
      reviews: 234,
      languages: ["Hindi", "English", "Marathi"],
      location: "Pune, Maharashtra",
      availability: "Available Now",
      price: 500
    },
    {
      id: 2,
      name: "Dr. Priya Sharma",
      specialty: "Soil & Fertility Expert",
      experience: 12,
      rating: 4.8,
      reviews: 189,
      languages: ["Hindi", "English", "Gujarati"], 
      location: "Gandhinagar, Gujarat",
      availability: "Available from 2 PM",
      price: 450
    }
  ];

  // Start local video
  const startLocalVideo = async () => {
    try {
      console.log('Starting local video...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      console.log('Local video started successfully');
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Unable to access camera/microphone. Please allow permissions and try again.');
      throw error;
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Start consultation
  const startConsultation = async (consultationId) => {
    try {
      console.log('Starting consultation:', consultationId);
      await startLocalVideo();
      setIsCallActive(true);
      setConnectionStatus('connected');
      setCurrentView('consultation');
      setShowDemoCall(true);
      
      // Simulate connection process
      setTimeout(() => {
        setConnectionStatus('connected');
        alert('Video consultation started successfully! (Demo Mode)');
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start consultation:', error);
      setConnectionStatus('disconnected');
    }
  };

  // End consultation
  const endConsultation = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    setIsCallActive(false);
    setConnectionStatus('disconnected');
    setCurrentView('dashboard');
    setShowDemoCall(false);
    alert('Consultation ended successfully!');
  };

  // Book consultation
  const bookConsultation = (expert) => {
    const newConsultation = {
      id: Date.now(),
      expert: expert,
      scheduledTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      topic: 'General Agricultural Consultation',
      status: 'scheduled',
      duration: 30
    };
    
    alert(`Consultation booked with ${expert.name} successfully!`);
    setCurrentView('dashboard');
  };

  // Dashboard view
  const renderDashboard = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Consultation</h1>
        <p className="text-gray-600">Connect with agricultural experts for personalized advice</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
          <div className="text-sm text-gray-600">Total Consultations</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600 mb-1">3</div>
          <div className="text-sm text-gray-600">This Month</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600 mb-1">4.8</div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600 mb-1">2</div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button 
          onClick={() => setCurrentView('experts')}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Users className="mr-2" size={20} />
          Find Experts
        </button>
        <button 
          onClick={() => setCurrentView('experts')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Calendar className="mr-2" size={20} />
          Book Consultation
        </button>
      </div>

      {/* Consultations */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Consultations</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {demoConsultations.map(consultation => (
            <div key={consultation.id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <User className="text-gray-500" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{consultation.expert.name}</h3>
                    <p className="text-sm text-gray-600">{consultation.expert.specialty}</p>
                    <div className="flex items-center mt-1">
                      <Star className="text-yellow-500" size={14} fill="currentColor" />
                      <span className="text-sm text-gray-600 ml-1">{consultation.expert.rating}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  consultation.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                  consultation.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {consultation.status.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={14} className="mr-2" />
                  <span>{consultation.scheduledTime.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={14} className="mr-2" />
                  <span>{consultation.duration} minutes</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MessageCircle size={14} className="mr-2" />
                  <span>{consultation.topic}</span>
                </div>
              </div>
              
              {consultation.status === 'scheduled' && (
                <div className="flex space-x-2">
                  <button 
                    onClick={() => startConsultation(consultation.id)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Video className="mr-2" size={16} />
                    Join Call
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Reschedule
                  </button>
                </div>
              )}
              
              {consultation.status === 'completed' && consultation.rating && (
                <div className="border-t pt-3">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Your rating:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          size={16} 
                          className={star <= consultation.rating ? 'text-yellow-500' : 'text-gray-300'}
                          fill="currentColor"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Experts view
  const renderExperts = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Available Experts</h1>
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {demoExperts.map(expert => (
          <div key={expert.id} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  <User className="text-gray-500" size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{expert.name}</h3>
                  <p className="text-blue-600 font-medium">{expert.specialty}</p>
                  <div className="flex items-center mt-1">
                    <Star className="text-yellow-500" size={16} fill="currentColor" />
                    <span className="text-sm text-gray-600 ml-1">{expert.rating} ({expert.reviews} reviews)</span>
                  </div>
                </div>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                {expert.availability}
              </span>
            </div>
            
            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock size={14} className="mr-2" />
                <span>{expert.experience} years experience</span>
              </div>
              <div className="flex items-center">
                <Users size={14} className="mr-2" />
                <span>{expert.languages.join(', ')}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📍</span>
                <span>{expert.location}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-lg font-semibold text-gray-900">₹{expert.price}/session</div>
              <button 
                onClick={() => bookConsultation(expert)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Book Session
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Video consultation view
  const renderVideoCall = () => (
    <div className="fixed inset-0 bg-black">
      {/* Main video area */}
      <div className="relative w-full h-full">
        {/* Expert video (simulated) */}
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-32 h-32 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={64} className="text-gray-400" />
            </div>
            <p className="text-xl">Dr. Agricultural Expert</p>
            <p className="text-gray-400">Connected - Demo Mode</p>
          </div>
        </div>
        
        {/* Local video */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-white">
          <video 
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="text-white" size={32} />
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-4 bg-black/50 px-6 py-4 rounded-full">
            <button 
              onClick={toggleAudio}
              className={`p-3 rounded-full ${isAudioEnabled ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'}`}
            >
              {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            
            <button 
              onClick={toggleVideo}
              className={`p-3 rounded-full ${isVideoEnabled ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'}`}
            >
              {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            
            <button 
              onClick={endConsultation}
              className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
            >
              <PhoneOff size={20} />
            </button>
            
            <button className="p-3 rounded-full bg-gray-700 text-white">
              <MessageCircle size={20} />
            </button>
          </div>
        </div>
        
        {/* Connection status */}
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></span>
          {connectionStatus}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'experts' && renderExperts()}
      {currentView === 'consultation' && renderVideoCall()}
    </div>
  );
};

export default SimpleVideoConsultation;