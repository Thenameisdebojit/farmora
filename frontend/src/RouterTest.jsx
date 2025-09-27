import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const HomePage = () => (
  <div className="min-h-screen bg-green-100 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
      <h1 className="text-3xl font-bold text-green-800 mb-4">🏠 Home Page</h1>
      <p className="text-gray-600 mb-4">React Router is working!</p>
      <Link to="/about" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Go to About
      </Link>
    </div>
  </div>
);

const AboutPage = () => (
  <div className="min-h-screen bg-blue-100 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">📋 About Page</h1>
      <p className="text-gray-600 mb-4">Routing is working perfectly!</p>
      <Link to="/" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        Go to Home
      </Link>
    </div>
  </div>
);

const RouterTest = () => {
  return (
    <Router>
      <div className="min-h-screen">
        {/* Simple Navigation */}
        <nav className="bg-gray-800 text-white p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">🌾 Router Test</h1>
            <div className="space-x-4">
              <Link to="/" className="hover:text-green-400">Home</Link>
              <Link to="/about" className="hover:text-blue-400">About</Link>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={
            <div className="min-h-screen bg-red-100 flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <h1 className="text-3xl font-bold text-red-800 mb-4">❌ 404 Not Found</h1>
                <p className="text-gray-600 mb-4">This page doesn't exist</p>
                <Link to="/" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Go Home
                </Link>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default RouterTest;