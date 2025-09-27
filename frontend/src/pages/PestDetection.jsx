// frontend/src/pages/PestDetection.jsx
import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Bug, 
  AlertTriangle,
  CheckCircle,
  X,
  Image as ImageIcon,
  Loader,
  RefreshCw,
  BookOpen,
  Shield,
  Leaf,
  Zap
} from 'lucide-react';
import api from '../services/api';

const PestDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [cropType, setCropType] = useState('');
  const [detection, setDetection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const cropOptions = [
    { value: 'wheat', label: 'Wheat' },
    { value: 'rice', label: 'Rice' },
    { value: 'cotton', label: 'Cotton' },
    { value: 'tomato', label: 'Tomato' },
    { value: 'potato', label: 'Potato' },
    { value: 'maize', label: 'Maize' },
    { value: 'soybean', label: 'Soybean' },
    { value: 'sugarcane', label: 'Sugarcane' }
  ];

  const handleImageSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage({
          file,
          url: e.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageSelect(e.target.files[0]);
    }
  };

  const detectPest = async () => {
    if (!selectedImage || !cropType) {
      alert('Please select an image and crop type');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('pestImage', selectedImage.file);
      formData.append('cropType', cropType);
      
      const result = await api.detectPest(selectedImage.file, cropType);
      
      setDetection(result.data);
      
      // Add to history
      const historyItem = {
        id: Date.now(),
        image: selectedImage.url,
        cropType,
        pest: result.data.pest,
        confidence: result.data.confidence,
        date: new Date().toISOString()
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep only last 10
      
    } catch (error) {
      console.error('Pest detection failed:', error);
      alert('Failed to detect pest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setDetection(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSeverityColor = (confidence) => {
    if (confidence >= 0.8) return 'text-red-600 bg-red-100';
    if (confidence >= 0.6) return 'text-orange-600 bg-orange-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getSeverityLevel = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pest Detection</h1>
        <p className="text-gray-600 mt-2">
          Upload crop images to identify pests and diseases using AI technology
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Upload Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Upload Area */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Image</h2>
              
              {!selectedImage ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <ImageIcon className="text-gray-400" size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Drop your image here, or browse
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Support for JPG, PNG, GIF files up to 10MB
                      </p>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Upload size={16} />
                          <span>Choose File</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Camera size={16} />
                          <span>Take Photo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="relative">
                    <img
                      src={selectedImage.url}
                      alt="Selected crop"
                      className="w-full h-64 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={clearSelection}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  {/* Crop Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Crop Type
                    </label>
                    <select
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Choose crop type...</option>
                      {cropOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={detectPest}
                      disabled={!cropType || loading}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin" size={16} />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Bug size={16} />
                          <span>Detect Pest</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Detection Results */}
            {detection && (
              <div className="border-t border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detection Results</h3>
                
                <div className="space-y-6">
                  {/* Pest Identification */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{detection.pest || 'Unknown Pest'}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-600">Confidence:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(detection.confidence)}`}>
                            {((detection.confidence || 0) * 100).toFixed(1)}% - {getSeverityLevel(detection.confidence)}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {detection.confidence >= 0.8 ? (
                          <CheckCircle className="text-green-500" size={24} />
                        ) : detection.confidence >= 0.6 ? (
                          <AlertTriangle className="text-orange-500" size={24} />
                        ) : (
                          <AlertTriangle className="text-yellow-500" size={24} />
                        )}
                      </div>
                    </div>
                    
                    {detection.confidence < 0.7 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                          <div>
                            <p className="text-yellow-800 text-sm font-medium">Low Confidence Detection</p>
                            <p className="text-yellow-700 text-sm">
                              Consider uploading a clearer image or consult with an expert for accurate identification.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Treatment Options */}
                  {detection.treatment && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Recommended Treatments</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Organic Treatments */}
                        {detection.treatment.organic && detection.treatment.organic.length > 0 && (
                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <Leaf className="text-green-600" size={18} />
                              <h5 className="font-medium text-green-800">Organic</h5>
                            </div>
                            <ul className="space-y-1 text-sm text-green-700">
                              {detection.treatment.organic.map((treatment, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                  <span>{treatment}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Chemical Treatments */}
                        {detection.treatment.chemical && detection.treatment.chemical.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <Zap className="text-blue-600" size={18} />
                              <h5 className="font-medium text-blue-800">Chemical</h5>
                            </div>
                            <ul className="space-y-1 text-sm text-blue-700">
                              {detection.treatment.chemical.map((treatment, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                  <span>{treatment}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Cultural Treatments */}
                        {detection.treatment.cultural && detection.treatment.cultural.length > 0 && (
                          <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <Shield className="text-purple-600" size={18} />
                              <h5 className="font-medium text-purple-800">Cultural</h5>
                            </div>
                            <ul className="space-y-1 text-sm text-purple-700">
                              {detection.treatment.cultural.map((treatment, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                                  <span>{treatment}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Prevention Tips */}
                  {detection.prevention && detection.prevention.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Prevention Tips</h4>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <ul className="space-y-2 text-sm text-blue-800">
                          {detection.prevention.map((tip, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={14} />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <BookOpen size={16} />
                      <span>Learn More</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <RefreshCw size={16} />
                      <span>Analyze Again</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Detection History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Detections</h3>
            
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <img
                      src={item.image}
                      alt="Detection"
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.pest}</p>
                      <p className="text-sm text-gray-600 capitalize">{item.cropType}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(item.confidence)}`}>
                      {(item.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
                
                {history.length > 5 && (
                  <button className="w-full text-sm text-blue-600 hover:text-blue-800">
                    View All ({history.length})
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bug className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-500 text-sm">No detections yet</p>
              </div>
            )}
          </div>

          {/* Tips & Guidelines */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Photo Guidelines</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <span className="text-gray-700">Take clear, well-lit photos</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <span className="text-gray-700">Focus on affected plant parts</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <span className="text-gray-700">Include leaves, stems, or fruits</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <span className="text-gray-700">Avoid blurry or dark images</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <span className="text-gray-700">Multiple angles help accuracy</span>
              </div>
            </div>
          </div>

          {/* Support Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
            
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <BookOpen className="text-blue-600" size={20} />
                  <div>
                    <p className="font-medium text-blue-800">Pest Guide</p>
                    <p className="text-xs text-blue-600">Common pests & diseases</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <Camera className="text-green-600" size={20} />
                  <div>
                    <p className="font-medium text-green-800">Photo Tips</p>
                    <p className="text-xs text-green-600">How to take better photos</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="text-purple-600" size={20} />
                  <div>
                    <p className="font-medium text-purple-800">Expert Consultation</p>
                    <p className="text-xs text-purple-600">Get professional help</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PestDetection;
