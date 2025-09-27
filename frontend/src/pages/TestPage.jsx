import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🌾 Farmora Test Page
        </h1>
        <p className="text-gray-600 mb-6">
          If you can see this page, the React app is working correctly!
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800">✅ React is loaded</h3>
            <p className="text-green-600 text-sm">The component system is working</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800">✅ Tailwind CSS is loaded</h3>
            <p className="text-blue-600 text-sm">Styles are being applied correctly</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-800">✅ Vite dev server is working</h3>
            <p className="text-purple-600 text-sm">Hot reload should be active</p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestPage;