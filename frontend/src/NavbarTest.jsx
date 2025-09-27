import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

const TestPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-8">
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
      <h1 className="text-3xl font-bold text-purple-800 mb-4">
        🧭 Navbar Test
      </h1>
      
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        ✅ Navbar component loaded successfully!
      </div>
      
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
        🎯 Navigation should be visible at the top
      </div>
      
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
        🔍 Check if all menu items are working
      </div>
      
      <p className="text-sm text-gray-600">
        If you can see the navigation bar at the top with all menu items, 
        then the Navbar component is working correctly!
      </p>
    </div>
  </div>
);

const NavbarTest = () => {
  return (
    <Router>
      <div className="min-h-screen">
        {/* This is your real Navbar component */}
        <Navbar />
        
        {/* Routes */}
        <Routes>
          <Route path="*" element={<TestPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default NavbarTest;