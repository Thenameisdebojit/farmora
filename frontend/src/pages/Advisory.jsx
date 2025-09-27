// frontend/src/pages/Advisory.jsx
import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Search, 
  Filter,
  Plus,
  BookOpen,
  Calendar,
  MapPin,
  Sprout,
  Target,
  TrendingUp,
  Clock,
  Star,
  Download,
  Share2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import AdvisoryCard from '../components/AdvisoryCard';
import api from '../services/api';

const Advisory = () => {
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cropType: '',
    season: '',
    growthStage: '',
    category: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('personalized');
  const [showFilters, setShowFilters] = useState(false);

  const cropOptions = [
    { value: 'wheat', label: 'Wheat' },
    { value: 'rice', label: 'Rice' },
    { value: 'cotton', label: 'Cotton' },
    { value: 'sugarcane', label: 'Sugarcane' },
    { value: 'maize', label: 'Maize' },
    { value: 'tomato', label: 'Tomato' },
    { value: 'potato', label: 'Potato' },
    { value: 'soybean', label: 'Soybean' }
  ];

  const seasonOptions = [
    { value: 'kharif', label: 'Kharif (Monsoon)' },
    { value: 'rabi', label: 'Rabi (Winter)' },
    { value: 'zaid', label: 'Zaid (Summer)' }
  ];

  const growthStageOptions = [
    { value: 'seed_preparation', label: 'Seed Preparation' },
    { value: 'germination', label: 'Germination' },
    { value: 'seedling', label: 'Seedling' },
    { value: 'vegetative', label: 'Vegetative' },
    { value: 'flowering', label: 'Flowering' },
    { value: 'fruit_formation', label: 'Fruit Formation' },
    { value: 'maturation', label: 'Maturation' },
    { value: 'harvest', label: 'Harvest' }
  ];

  const categoryOptions = [
    { value: 'irrigation', label: 'Irrigation Management' },
    { value: 'fertilization', label: 'Fertilization' },
    { value: 'pest_control', label: 'Pest Control' },
    { value: 'disease_management', label: 'Disease Management' },
    { value: 'soil_health', label: 'Soil Health' },
    { value: 'weather_advisory', label: 'Weather Advisory' }
  ];

  useEffect(() => {
    fetchAdvisories();
  }, [activeTab, filters, searchTerm]);

  const fetchAdvisories = async () => {
    try {
      setLoading(true);
      
      let advisoryData;
      if (activeTab === 'personalized') {
        advisoryData = await api.getPersonalizedAdvisory({
          userId: 'demo-user',
          cropType: filters.cropType || 'wheat',
          growthStage: filters.growthStage || 'flowering',
          issues: []
        });
        setAdvisories([advisoryData.data]);
      } else if (activeTab === 'recommendations') {
        const recommendationsData = await api.getCropRecommendations({
          latitude: 28.6139,
          longitude: 77.2090,
          season: filters.season || 'rabi',
          soilType: 'loam'
        });
        setAdvisories(recommendationsData.data.recommendations || []);
      } else {
        // Mock general advisories
        setAdvisories([
          {
            id: 1,
            title: 'Wheat Crop Management - December',
            category: 'crop_management',
            cropType: 'wheat',
            season: 'rabi',
            content: 'Comprehensive guide for wheat cultivation during winter season...',
            author: 'Dr. Agricultural Expert',
            publishedDate: '2024-12-15',
            rating: 4.8,
            tags: ['wheat', 'winter', 'irrigation', 'fertilizer']
          },
          {
            id: 2,
            title: 'Organic Pest Control Methods',
            category: 'pest_control',
            cropType: 'general',
            content: 'Learn about natural and organic methods to control common pests...',
            author: 'Organic Farming Specialist',
            publishedDate: '2024-12-14',
            rating: 4.6,
            tags: ['organic', 'pest control', 'natural methods']
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch advisories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      cropType: '',
      season: '',
      growthStage: '',
      category: ''
    });
    setSearchTerm('');
  };

  const tabs = [
    { id: 'personalized', label: 'Personalized Advisory', icon: Target },
    { id: 'recommendations', label: 'Crop Recommendations', icon: Sprout },
    { id: 'general', label: 'General Advisories', icon: BookOpen }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crop Advisory</h1>
          <p className="text-gray-600 mt-2">
            Get personalized farming advice and expert recommendations
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus size={16} />
          <span>Request Advisory</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-gray-500"
                >
                  {showFilters ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
              </div>
            </div>

            <div className={`p-4 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search advisories..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Crop Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type</label>
                <select
                  value={filters.cropType}
                  onChange={(e) => handleFilterChange('cropType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Crops</option>
                  {cropOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Season */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
                <select
                  value={filters.season}
                  onChange={(e) => handleFilterChange('season', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Seasons</option>
                  {seasonOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Growth Stage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Growth Stage</label>
                <select
                  value={filters.growthStage}
                  onChange={(e) => handleFilterChange('growthStage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Stages</option>
                  {growthStageOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Results Summary */}
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  {advisories.length} {advisories.length === 1 ? 'advisory' : 'advisories'} found
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select className="text-sm border border-gray-300 rounded px-2 py-1">
                    <option>Relevance</option>
                    <option>Date</option>
                    <option>Rating</option>
                  </select>
                </div>
              </div>

              {/* Advisory Cards */}
              {activeTab === 'personalized' && advisories[0] ? (
                <AdvisoryCard advisory={advisories[0]} loading={false} />
              ) : activeTab === 'recommendations' ? (
                <div className="grid gap-6">
                  {advisories.map((recommendation, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {recommendation.name?.charAt(0).toUpperCase() + recommendation.name?.slice(1)} Cultivation
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <TrendingUp size={14} />
                              <span>Suitability: {recommendation.suitabilityScore}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>Duration: {recommendation.duration}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Expected ROI</p>
                          <p className="text-2xl font-bold text-green-600">
                            {recommendation.expectedROI}%
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Why This Crop?</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {recommendation.reasons?.map((reason, i) => (
                              <li key={i} className="flex items-start space-x-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Investment Required</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Seeds:</span>
                              <span className="font-medium">₹{recommendation.investment?.seeds || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Fertilizers:</span>
                              <span className="font-medium">₹{recommendation.investment?.fertilizers || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Labor:</span>
                              <span className="font-medium">₹{recommendation.investment?.labor || 0}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-semibold">
                              <span>Total:</span>
                              <span>₹{recommendation.investment?.total || recommendation.investment || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`px-3 py-1 rounded-full ${
                            recommendation.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                            recommendation.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {recommendation.riskLevel} Risk
                          </span>
                          <span className="text-gray-600">
                            Expected Yield: {recommendation.yield}
                          </span>
                        </div>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          Get Detailed Plan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {advisories.map((advisory, index) => (
                    <div key={advisory.id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {advisory.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center space-x-1">
                                <BookOpen size={14} />
                                <span>{advisory.category?.replace('_', ' ')}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar size={14} />
                                <span>{new Date(advisory.publishedDate).toLocaleDateString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Star size={14} className="text-yellow-500" fill="currentColor" />
                                <span>{advisory.rating}</span>
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">
                              {advisory.content}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {advisory.tags?.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>By {advisory.author}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-blue-600">
                              <Download size={14} />
                              <span>Download</span>
                            </button>
                            <button className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-green-600">
                              <Share2 size={14} />
                              <span>Share</span>
                            </button>
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                              Read More
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {advisories.length === 0 && (
                <div className="text-center py-12">
                  <Lightbulb className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No advisories found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search terms to find relevant advisories.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Advisory;
