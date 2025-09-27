import React from 'react';

const TailwindTest = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🎨 Tailwind CSS Test
          </h1>
          
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            ✅ Tailwind CSS is working!
          </div>
          
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            🎯 Classes are being applied correctly
          </div>
          
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            🚀 Ready to test routing next
          </div>
          
          <button 
            onClick={() => alert('Tailwind button works!')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Test Button
          </button>
          
          <div className="mt-6 text-sm text-gray-600">
            <p>If you can see colors and styling, Tailwind is working properly!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;