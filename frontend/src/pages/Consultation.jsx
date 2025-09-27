// frontend/src/pages/Consultation.jsx
import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Calendar, 
  Clock, 
  User,
  Star,
  Search,
  Filter,
  Plus,
  MessageCircle,
  PhoneCall,
  CheckCircle,
  AlertCircle,
  MapPin,
  Award,
  BookOpen,
  DollarSign
} from 'lucide-react';
import ConsultationWidget from '../components/ConsultationWidget';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const Consultation = () => {
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
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [consultations, setConsultations] = useState([]);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [activeConsultation, setActiveConsultation] = useState(null);

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: 2 },
    { id: 'experts', label: 'Find Experts', count: null },
    { id: 'history', label: 'History', count: 8 }
  ];

  useEffect(() => {
    fetchConsultations();
    fetchExperts();
  }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first, then fall back to mock data
      try {
        const currentUser = user || JSON.parse(localStorage.getItem('demo_user') || '{}');
        const response = await api.getUserConsultations(currentUser?.id || 'demo-user');
        if (response.success && response.consultations) {
          setConsultations(response.consultations);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError.message);
      }
      
      // Mock consultations data
      const mockConsultations = [
        {
          id: '1',
          farmerId: 'farmer1',
          expertId: 'expert1',
          expert: {
            name: 'Dr. Priya Sharma',
            specialization: 'Crop Management',
            rating: 4.8,
            image: null
          },
          consultationType: 'video_call',
          topic: 'Wheat Disease Management',
          description: 'Need help with identifying and treating yellow rust in wheat crop',
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 30,
          status: 'scheduled',
          price: 500,
          currency: 'INR'
        },
        {
          id: '2',
          farmerId: 'farmer1',
          expertId: 'expert2',
          expert: {
            name: 'Prof. Rajesh Kumar',
            specialization: 'Soil Health',
            rating: 4.9,
            image: null
          },
          consultationType: 'video_call',
          topic: 'Soil Nutrient Analysis',
          description: 'Consultation on soil test results and fertilizer recommendations',
          scheduledDate: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
          duration: 45,
          status: 'scheduled',
          price: 750,
          currency: 'INR'
        },
        {
          id: '3',
          farmerId: 'farmer1',
          expertId: 'expert1',
          expert: {
            name: 'Dr. Priya Sharma',
            specialization: 'Crop Management',
            rating: 4.8,
            image: null
          },
          consultationType: 'video_call',
          topic: 'Pest Control Strategy',
          description: 'Discussed integrated pest management for cotton crop',
          scheduledDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          actualStartTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          actualEndTime: new Date(Date.now() - 47.5 * 60 * 60 * 1000).toISOString(),
          duration: 30,
          actualDuration: 28,
          status: 'completed',
          price: 500,
          currency: 'INR',
          rating: 5,
          feedback: 'Very helpful session. Clear explanations and practical advice.'
        }
      ];
      
      setConsultations(mockConsultations);
    } catch (error) {
      console.error('Failed to fetch consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExperts = async () => {
    try {
      // Try to fetch from API first, then fall back to mock data
      try {
        const response = await api.getAvailableExperts();
        if (response.success && response.experts) {
          setExperts(response.experts);
          return;
        }
      } catch (apiError) {
        console.log('Experts API not available, using mock data:', apiError.message);
      }
      
      // Mock experts data
      const mockExperts = [
        {
          id: 'expert1',
          name: 'Dr. Priya Sharma',
          title: 'Agricultural Scientist',
          specialization: ['Crop Management', 'Plant Pathology', 'Integrated Farming'],
          experience: '15+ years',
          rating: 4.8,
          reviewCount: 324,
          languages: ['English', 'Hindi', 'Marathi'],
          availability: 'Available today',
          priceRange: '₹500-800/session',
          location: 'Mumbai, Maharashtra',
          education: 'Ph.D. in Plant Pathology, IARI New Delhi',
          achievements: ['Best Agricultural Scientist Award 2023', 'Published 45+ research papers'],
          image: null
        },
        {
          id: 'expert2',
          name: 'Prof. Rajesh Kumar',
          title: 'Soil Science Expert',
          specialization: ['Soil Health', 'Nutrient Management', 'Organic Farming'],
          experience: '20+ years',
          rating: 4.9,
          reviewCount: 256,
          languages: ['English', 'Hindi', 'Punjabi'],
          availability: 'Available tomorrow',
          priceRange: '₹600-900/session',
          location: 'Chandigarh, Punjab',
          education: 'Ph.D. in Soil Science, PAU Ludhiana',
          achievements: ['ICAR Fellow', 'Expert in sustainable agriculture'],
          image: null
        },
        {
          id: 'expert3',
          name: 'Dr. Anita Desai',
          title: 'Horticulture Specialist',
          specialization: ['Fruit Crops', 'Vegetable Farming', 'Post Harvest Technology'],
          experience: '12+ years',
          rating: 4.7,
          reviewCount: 189,
          languages: ['English', 'Hindi', 'Gujarati'],
          availability: 'Available now',
          priceRange: '₹400-600/session',
          location: 'Ahmedabad, Gujarat',
          education: 'M.Sc. Horticulture, AAU Anand',
          achievements: ['Best Extension Worker 2022', 'Specialized in precision farming'],
          image: null
        }
      ];
      
      setExperts(mockExperts);
    } catch (error) {
      console.error('Failed to fetch experts:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const ConsultationCard = ({ consultation }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="text-gray-500" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{consultation.expert.name}</h3>
            <p className="text-sm text-gray-600">{consultation.expert.specialization}</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-1">
                <Star className="text-yellow-500" size={14} fill="currentColor" />
                <span className="text-sm text-gray-600">{consultation.expert.rating}</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-600">{consultation.duration} min</span>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(consultation.status)}`}>
          {consultation.status === 'scheduled' && <Calendar size={14} className="inline mr-1" />}
          {consultation.status === 'in_progress' && <Video size={14} className="inline mr-1" />}
          {consultation.status === 'completed' && <CheckCircle size={14} className="inline mr-1" />}
          <span className="capitalize">{consultation.status.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-gray-900">{consultation.topic}</h4>
          <p className="text-sm text-gray-600">{consultation.description}</p>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>{formatDate(consultation.scheduledDate)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign size={14} />
            <span>{consultation.currency} {consultation.price}</span>
          </div>
        </div>

        {consultation.status === 'completed' && consultation.rating && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-gray-600">Your rating:</span>
              <div className="flex space-x-1">
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
            {consultation.feedback && (
              <p className="text-sm text-gray-600 italic">"{consultation.feedback}"</p>
            )}
          </div>
        )}

        <div className="flex items-center space-x-3 pt-3 border-t border-gray-200">
          {consultation.status === 'scheduled' && (
            <>
              <button 
                onClick={() => setActiveConsultation(consultation)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Video size={16} />
                <span>Join Call</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <MessageCircle size={16} />
                <span>Message</span>
              </button>
              <button className="text-sm text-red-600 hover:text-red-800">Reschedule</button>
            </>
          )}
          
          {consultation.status === 'completed' && (
            <>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <BookOpen size={16} />
                <span>View Notes</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Video size={16} />
                <span>Download Recording</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const ExpertCard = ({ expert }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="text-gray-500" size={32} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{expert.name}</h3>
          <p className="text-sm text-gray-600">{expert.title}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Star className="text-yellow-500" size={14} fill="currentColor" />
              <span>{expert.rating} ({expert.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin size={14} />
              <span>{expert.location}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-green-600">{expert.priceRange}</p>
          <p className="text-xs text-gray-500">{expert.availability}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Specializations</h4>
          <div className="flex flex-wrap gap-2">
            {expert.specialization.map((spec, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {spec}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">Experience & Education</h4>
          <p className="text-sm text-gray-600">{expert.experience} • {expert.education}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">Languages</h4>
          <p className="text-sm text-gray-600">{expert.languages.join(', ')}</p>
        </div>

        {expert.achievements && expert.achievements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Achievements</h4>
            <ul className="space-y-1">
              {expert.achievements.map((achievement, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                  <Award size={12} className="text-yellow-500 mt-1 flex-shrink-0" />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button 
            onClick={() => {
              setSelectedExpert(expert);
              setShowBooking(true);
            }}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Book Consultation
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );

  const upcomingConsultations = consultations.filter(c => c.status === 'scheduled');
  const completedConsultations = consultations.filter(c => c.status === 'completed');

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Active Consultation Widget */}
      {activeConsultation && (
        <div className="mb-8">
          <ConsultationWidget 
            consultation={activeConsultation}
            isActive={true}
            onEnd={() => setActiveConsultation(null)}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expert Consultation</h1>
          <p className="text-gray-600 mt-2">
            Connect with agricultural experts for personalized advice
          </p>
        </div>
        <button 
          onClick={() => setShowBooking(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          <span>Book Consultation</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className="bg-gray-200 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'upcoming' && (
          <div>
            {upcomingConsultations.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingConsultations.map(consultation => (
                  <ConsultationCard key={consultation.id} consultation={consultation} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming consultations</h3>
                <p className="text-gray-600 mb-6">Book a session with our agricultural experts to get personalized advice.</p>
                <button 
                  onClick={() => setActiveTab('experts')}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Find Experts
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'experts' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search experts by name or specialization..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option>All Specializations</option>
                  <option>Crop Management</option>
                  <option>Soil Health</option>
                  <option>Pest Control</option>
                  <option>Organic Farming</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option>All Languages</option>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Marathi</option>
                  <option>Gujarati</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {experts.map(expert => (
                <ExpertCard key={expert.id} expert={expert} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {completedConsultations.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {completedConsultations.map(consultation => (
                  <ConsultationCard key={consultation.id} consultation={consultation} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No consultation history</h3>
                <p className="text-gray-600">Your completed consultations will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Book Consultation</h3>
                <button
                  onClick={() => setShowBooking(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {selectedExpert && (
                <div className="space-y-6">
                  {/* Expert Info */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="text-gray-500" size={32} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedExpert.name}</h4>
                      <p className="text-gray-600">{selectedExpert.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Star className="text-yellow-500" size={14} fill="currentColor" />
                        <span className="text-sm text-gray-600">{selectedExpert.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                      <input
                        type="text"
                        placeholder="e.g., Pest control in wheat crop"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        rows="3"
                        placeholder="Provide more details about your query..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                          <option>9:00 AM</option>
                          <option>10:00 AM</option>
                          <option>11:00 AM</option>
                          <option>2:00 PM</option>
                          <option>3:00 PM</option>
                          <option>4:00 PM</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <option value="30">30 minutes - ₹500</option>
                        <option value="45">45 minutes - ₹750</option>
                        <option value="60">60 minutes - ₹1000</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Type</label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input type="radio" name="type" value="video_call" defaultChecked className="mr-3" />
                          <Video size={20} className="mr-2 text-green-600" />
                          <span>Video Call</span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input type="radio" name="type" value="audio_call" className="mr-3" />
                          <PhoneCall size={20} className="mr-2 text-blue-600" />
                          <span>Audio Call</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowBooking(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        // Handle booking submission
                        try {
                          const currentUser = user || JSON.parse(localStorage.getItem('demo_user') || '{}');
                          const bookingData = {
                            expertId: selectedExpert.id,
                            userId: currentUser?.id || 'demo-user',
                            topic: 'General Consultation', // Would come from form
                            scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                            duration: 30,
                            consultationType: 'video_call'
                          };
                          
                          try {
                            const response = await api.bookConsultation(bookingData);
                            if (response.success) {
                              await fetchConsultations();
                              setShowBooking(false);
                              alert('Consultation booked successfully!');
                              return;
                            }
                          } catch (apiError) {
                            console.log('API booking failed, using simulation:', apiError.message);
                          }
                          
                          // Simulate successful booking
                          const newConsultation = {
                            id: Date.now().toString(),
                            farmerId: currentUser?.id || 'demo-user',
                            expertId: selectedExpert.id,
                            expert: {
                              name: selectedExpert.name,
                              specialization: selectedExpert.title,
                              rating: selectedExpert.rating,
                              image: selectedExpert.avatar
                            },
                            consultationType: 'video_call',
                            topic: 'General Consultation',
                            description: 'Scheduled consultation session',
                            scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                            duration: 30,
                            status: 'scheduled',
                            price: selectedExpert.price || 500,
                            currency: 'INR'
                          };
                          
                          setConsultations(prev => [newConsultation, ...prev]);
                          setShowBooking(false);
                          alert('Consultation booked successfully! (Simulated)');
                        } catch (error) {
                          console.error('Booking error:', error);
                          alert('Booking failed. Please try again.');
                        }
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Book & Pay ₹500
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consultation;
