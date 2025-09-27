// frontend/src/components/AdvisoryCard.jsx
import React, { useState } from 'react';
import { 
  Lightbulb, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Info,
  ChevronRight,
  ChevronDown,
  Star,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Calendar
} from 'lucide-react';

const AdvisoryCard = ({ advisory, loading }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 0, helpful: null });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleFeedback = (type, value) => {
    setFeedback(prev => ({ ...prev, [type]: value }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'urgent':
        return <AlertCircle className="text-red-500" size={18} />;
      case 'completed':
        return <CheckCircle className="text-green-500" size={18} />;
      default:
        return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Lightbulb className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Crop Advisory</h2>
              <p className="text-sm text-gray-600">
                {advisory?.cropInfo?.name && `${advisory.cropInfo.name} - ${advisory.cropInfo.currentStage}`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock size={16} />
            <span>Updated 2 hours ago</span>
          </div>
        </div>
      </div>

      {advisory && (
        <div className="p-6">
          {/* Current Stage Information */}
          {advisory.cropAnalysis && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Current Growth Stage</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900">{advisory.cropAnalysis.stage}</span>
                  <span className="text-sm text-blue-700">{advisory.cropAnalysis.duration}</span>
                </div>
                <p className="text-blue-800 text-sm">{advisory.cropAnalysis.description}</p>
                {advisory.cropAnalysis.keyActivities && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-blue-900 mb-2">Key Activities:</p>
                    <div className="flex flex-wrap gap-2">
                      {advisory.cropAnalysis.keyActivities.map((activity, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommendations Sections */}
          {advisory.recommendations && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Recommendations</h3>
              
              {/* Irrigation Recommendations */}
              {advisory.recommendations.irrigation && (
                <div className="border rounded-lg">
                  <button
                    onClick={() => toggleSection('irrigation')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded">
                        <Info className="text-blue-600" size={16} />
                      </div>
                      <span className="font-medium">Irrigation Management</span>
                    </div>
                    {expandedSection === 'irrigation' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                  
                  {expandedSection === 'irrigation' && (
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Frequency</p>
                          <p className="text-gray-600">{advisory.recommendations.irrigation.frequency}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Amount</p>
                          <p className="text-gray-600">{advisory.recommendations.irrigation.amount}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Timing</p>
                          <p className="text-gray-600">{advisory.recommendations.irrigation.timing}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Method</p>
                          <p className="text-gray-600">{advisory.recommendations.irrigation.method}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Fertilization Recommendations */}
              {advisory.recommendations.fertilization && (
                <div className="border rounded-lg">
                  <button
                    onClick={() => toggleSection('fertilization')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded">
                        <Info className="text-green-600" size={16} />
                      </div>
                      <span className="font-medium">Fertilization</span>
                    </div>
                    {expandedSection === 'fertilization' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                  
                  {expandedSection === 'fertilization' && (
                    <div className="px-4 pb-4">
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Recommended Type</p>
                          <p className="text-gray-600">{advisory.recommendations.fertilization.type}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Application Timing</p>
                          <p className="text-gray-600">{advisory.recommendations.fertilization.timing}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Application Method</p>
                          <p className="text-gray-600">{advisory.recommendations.fertilization.application}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Organic Alternative</p>
                          <p className="text-gray-600">{advisory.recommendations.fertilization.organic}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pest Management */}
              {advisory.recommendations.pestManagement && (
                <div className="border rounded-lg">
                  <button
                    onClick={() => toggleSection('pest')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded">
                        <AlertCircle className="text-red-600" size={16} />
                      </div>
                      <span className="font-medium">Pest Management</span>
                    </div>
                    {expandedSection === 'pest' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                  
                  {expandedSection === 'pest' && (
                    <div className="px-4 pb-4">
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Monitoring</p>
                          <p className="text-gray-600">{advisory.recommendations.pestManagement.monitoring}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Prevention</p>
                          <p className="text-gray-600">{advisory.recommendations.pestManagement.prevention}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Treatment</p>
                          <p className="text-gray-600">{advisory.recommendations.pestManagement.treatment}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Organic Options</p>
                          <p className="text-gray-600">{advisory.recommendations.pestManagement.organic}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Items */}
          {advisory.actionItems && advisory.actionItems.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Immediate Action Items</h4>
              <div className="space-y-2">
                {advisory.actionItems.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    {getStatusIcon('urgent')}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {advisory.nextSteps && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Next Steps</h4>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="text-green-600" size={18} />
                  <span className="font-medium text-green-800">
                    Next Stage: {advisory.nextSteps.nextStage}
                  </span>
                </div>
                <p className="text-green-700 text-sm mb-3">
                  Estimated in {advisory.nextSteps.estimatedDays} days
                </p>
                {advisory.nextSteps.preparationNeeded && (
                  <div>
                    <p className="font-medium text-green-800 mb-2">Preparation Required:</p>
                    <ul className="space-y-1">
                      {advisory.nextSteps.preparationNeeded.map((prep, index) => (
                        <li key={index} className="text-green-700 text-sm flex items-start space-x-2">
                          <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
                          <span>{prep}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tips */}
          {advisory.tips && advisory.tips.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Seasonal Tips</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {advisory.tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                    <BookOpen className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-blue-800 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Section */}
          <div className="mt-8 pt-6 border-t">
            <h4 className="font-semibold text-gray-900 mb-3">Was this advisory helpful?</h4>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Rating:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleFeedback('rating', star)}
                      className={`p-1 ${
                        feedback.rating >= star ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      <Star size={20} fill="currentColor" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleFeedback('helpful', true)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                    feedback.helpful === true
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ThumbsUp size={16} />
                  <span className="text-sm">Helpful</span>
                </button>
                
                <button
                  onClick={() => handleFeedback('helpful', false)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                    feedback.helpful === false
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ThumbsDown size={16} />
                  <span className="text-sm">Not Helpful</span>
                </button>
              </div>
            </div>
            
            {(feedback.rating > 0 || feedback.helpful !== null) && (
              <div className="mt-3">
                <textarea
                  placeholder="Share your feedback or suggestions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows="3"
                />
                <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Submit Feedback
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisoryCard;
