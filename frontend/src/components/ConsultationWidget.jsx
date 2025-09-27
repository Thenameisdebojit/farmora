// frontend/src/components/ConsultationWidget.jsx
import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Calendar, 
  Clock, 
  User,
  Star,
  MessageCircle,
  PhoneCall,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Mic,
  MicOff,
  VideoOff,
  Settings
} from 'lucide-react';

const ConsultationWidget = ({ consultation, onJoin, onEnd, isActive = false }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    if (consultation?.scheduledDate) {
      const timer = setInterval(() => {
        const now = new Date();
        const scheduledTime = new Date(consultation.scheduledDate);
        const diff = scheduledTime - now;

        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          if (hours > 0) {
            setTimeLeft(`${hours}h ${minutes}m`);
          } else if (minutes > 0) {
            setTimeLeft(`${minutes}m ${seconds}s`);
          } else {
            setTimeLeft(`${seconds}s`);
          }
        } else {
          setTimeLeft('Starting now');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [consultation?.scheduledDate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      case 'in_progress':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-gray-600 bg-gray-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Clock size={16} />;
      case 'in_progress':
        return <Play size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!consultation) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <Video className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Consultation</h3>
          <p className="text-gray-600 mb-4">Book a consultation with our agricultural experts</p>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Book Consultation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Video className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Expert Consultation</h3>
              <p className="text-sm text-gray-600">{consultation.topic}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(consultation.status)}`}>
            {getStatusIcon(consultation.status)}
            <span className="capitalize">{consultation.status.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Expert Information */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="text-gray-500" size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Dr. Priya Agricultural Expert</h4>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Star className="text-yellow-500" size={14} fill="currentColor" />
                <span className="text-sm text-gray-600">4.8</span>
              </div>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-600">Crop Management Specialist</span>
            </div>
          </div>
        </div>

        {/* Consultation Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-3 text-sm">
            <Calendar className="text-gray-400" size={16} />
            <span className="text-gray-600">
              {formatDate(consultation.scheduledDate)}
            </span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Clock className="text-gray-400" size={16} />
            <span className="text-gray-600">
              Duration: {consultation.duration} minutes
            </span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <MessageCircle className="text-gray-400" size={16} />
            <span className="text-gray-600">
              Type: {consultation.consultationType.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Consultation Controls */}
        {isActive ? (
          <div className="space-y-4">
            {/* Video Call Interface */}
            <div className="bg-gray-900 rounded-lg aspect-video relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="mx-auto mb-2" size={32} />
                  <p className="text-sm">Video call in progress...</p>
                  <p className="text-xs text-gray-300">
                    Connection: {connectionStatus}
                  </p>
                </div>
              </div>

              {/* Call Controls Overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsAudioOn(!isAudioOn)}
                    className={`p-3 rounded-full ${
                      isAudioOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'
                    }`}
                  >
                    {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
                  </button>

                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`p-3 rounded-full ${
                      isVideoOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'
                    }`}
                  >
                    {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                  </button>

                  <button
                    onClick={onEnd}
                    className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
                  >
                    <PhoneCall size={20} className="transform rotate-[135deg]" />
                  </button>

                  <button className="p-3 rounded-full bg-gray-700 text-white">
                    <Settings size={20} />
                  </button>
                </div>
              </div>

              {/* Call Timer */}
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {consultation.actualStartTime && 
                  `${Math.floor((new Date() - new Date(consultation.actualStartTime)) / 60000)}:${
                    String(Math.floor(((new Date() - new Date(consultation.actualStartTime)) % 60000) / 1000)).padStart(2, '0')
                  }`
                }
              </div>

              {/* Expert Video Thumbnail */}
              <div className="absolute top-4 right-4 w-24 h-16 bg-gray-800 rounded border-2 border-white">
                <div className="w-full h-full flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Chat</span>
                <MessageCircle className="text-gray-400" size={16} />
              </div>
              <div className="space-y-2 max-h-20 overflow-y-auto text-xs">
                <div className="bg-white p-2 rounded">
                  <span className="font-medium">Expert:</span> How can I help you today?
                </div>
              </div>
              <div className="mt-2 flex space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : consultation.status === 'scheduled' ? (
          <div className="space-y-3">
            {/* Countdown Timer */}
            {timeLeft && (
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-sm text-blue-800 font-medium">
                  {timeLeft === 'Starting now' ? 'Ready to join!' : `Starts in ${timeLeft}`}
                </p>
              </div>
            )}

            {/* Join Button */}
            <div className="flex space-x-2">
              <button
                onClick={onJoin}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                disabled={timeLeft && timeLeft !== 'Starting now' && !timeLeft.includes('s')}
              >
                <Video size={16} />
                <span>Join Call</span>
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <MessageCircle size={16} />
              </button>
            </div>

            {/* Pre-call Checklist */}
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-medium">Before joining:</p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={12} />
                  <span>Camera and microphone ready</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={12} />
                  <span>Stable internet connection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={12} />
                  <span>Questions prepared</span>
                </li>
              </ul>
            </div>
          </div>
        ) : consultation.status === 'completed' ? (
          <div className="text-center space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="mx-auto text-green-600 mb-2" size={24} />
              <p className="text-green-800 font-medium">Consultation Completed</p>
              <p className="text-green-700 text-sm">
                Duration: {consultation.actualDuration} minutes
              </p>
            </div>
            
            {/* Rating Section */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Rate this consultation</p>
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} className="text-gray-300 hover:text-yellow-500">
                    <Star size={20} />
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Download Recording
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <AlertCircle className="mx-auto text-gray-400 mb-2" size={24} />
            <p className="text-gray-600 text-sm">
              Consultation {consultation.status.replace('_', ' ')}
            </p>
          </div>
        )}

        {/* Quick Actions */}
        {!isActive && consultation.status === 'scheduled' && (
          <div className="mt-4 pt-4 border-t flex justify-between text-sm">
            <button className="text-blue-600 hover:text-blue-800">
              Reschedule
            </button>
            <button className="text-red-600 hover:text-red-800">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationWidget;
