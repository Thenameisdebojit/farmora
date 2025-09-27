import React, { useState, useCallback } from 'react';
import { Upload, Camera, Loader, AlertCircle, CheckCircle, Info } from 'lucide-react';

const PestDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const API_BASE_URL = 'http://localhost:5001';

  const handleFileSelect = useCallback((file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setPrediction(null);
      setError(null);
    } else {
      setError('Please select a valid image file (JPG, PNG, GIF)');
    }
  }, []);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const analyzePest = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setPrediction(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.status === 'success') {
        setPrediction(data.prediction);
      } else {
        setError(data.error || 'Failed to analyze image');
      }
    } catch (err) {
      setError('Connection error. Please ensure the ML service is running.');
      console.error('Prediction error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'none': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🔍 AI Pest Detection System
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload an image of your crop to detect and identify pests with 97% accuracy using advanced machine learning
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Image Upload Section */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Camera className="h-6 w-6 text-blue-600" />
              Image Upload
            </h2>
          </div>
          <div className="p-6">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                dragOver 
                  ? 'border-blue-500 bg-blue-50 scale-105' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-80 mx-auto rounded-lg shadow-lg object-contain"
                  />
                  <p className="text-sm text-gray-600 font-medium">
                    {selectedImage.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <Upload className="h-16 w-16 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-xl font-medium text-gray-700 mb-2">
                      Drop an image here, or click to select
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports JPG, PNG, GIF up to 16MB
                    </p>
                  </div>
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={analyzePest}
                disabled={!selectedImage || isAnalyzing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader className="animate-spin h-5 w-5" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Analyze for Pests
                  </>
                )}
              </button>
              
              {selectedImage && (
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    setPrediction(null);
                    setError(null);
                  }}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Clear Image
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Info className="h-6 w-6 text-green-600" />
              Detection Results
            </h2>
          </div>
          <div className="p-6">
            {error && (
              <div className="border border-red-200 bg-red-50 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="animate-spin h-12 w-12 text-blue-600 mb-4" />
                <p className="text-lg text-gray-600 mb-2">AI is analyzing your image...</p>
                <p className="text-sm text-gray-500">This may take a few seconds</p>
              </div>
            )}

            {prediction && (
              <div className="space-y-6">
                {/* Main Prediction */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {prediction.predicted_class.replace('_', ' ').toUpperCase()}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(prediction.pest_info.severity)}`}>
                      {prediction.pest_info.severity.toUpperCase()} RISK
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <span className={`text-lg font-semibold ${getConfidenceColor(prediction.confidence)}`}>
                      {(prediction.confidence * 100).toFixed(1)}% Confidence
                    </span>
                  </div>
                  
                  <p className="text-gray-700 text-base leading-relaxed">
                    {prediction.pest_info.description}
                  </p>
                </div>

                {/* Top Predictions */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 text-lg">Alternative Predictions:</h4>
                  <div className="space-y-2">
                    {prediction.top_predictions.slice(1, 3).map((pred, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700 font-medium">
                          {pred.class.replace('_', ' ').charAt(0).toUpperCase() + pred.class.replace('_', ' ').slice(1)}
                        </span>
                        <span className="text-gray-600 font-semibold">
                          {(pred.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Damage Information */}
                {prediction.pest_info.damage !== 'No damage observed' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 text-lg">⚠️ Potential Damage:</h4>
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                      <p className="text-orange-800">{prediction.pest_info.damage}</p>
                    </div>
                  </div>
                )}

                {/* Treatment Recommendations */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 text-lg">💊 Recommended Treatment:</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {prediction.pest_info.treatment.map((treatment, index) => (
                        <li key={index} className="text-green-800 flex items-start gap-3">
                          <span className="text-green-600 font-bold mt-1">•</span>
                          <span>{treatment}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Prevention Tips */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 text-lg">🛡️ Prevention Tips:</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {prediction.pest_info.prevention.map((tip, index) => (
                        <li key={index} className="text-blue-800 flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Metadata */}
                <div className="text-xs text-gray-500 pt-4 border-t border-gray-200 space-y-1">
                  <p>Analysis completed at: {new Date(prediction.timestamp).toLocaleString()}</p>
                  <p>Status: {prediction.status}</p>
                  <p>Model accuracy: 97%+</p>
                </div>
              </div>
            )}

            {!prediction && !isAnalyzing && !error && (
              <div className="text-center py-12 text-gray-500">
                <Camera className="h-20 w-20 mx-auto mb-6 opacity-30" />
                <p className="text-xl mb-2">Upload an image to get started</p>
                <p className="text-sm">Our AI will analyze it for pest detection with 97% accuracy</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-8 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">97%</div>
              <div className="text-sm text-gray-600 font-medium">Accuracy Rate</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">15+</div>
              <div className="text-sm text-gray-600 font-medium">Pest Classes</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600 font-medium">AI Available</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-2">&lt;3s</div>
              <div className="text-sm text-gray-600 font-medium">Analysis Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PestDetection;