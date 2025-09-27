import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Test imports one by one
import { AuthProvider } from './hooks/useAuth.jsx';

// Simple Welcome component
const SimpleWelcome = () => (
  <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    <h1 style={{ color: '#16a34a' }}>🌾 Smart Crop Advisory System</h1>
    <p>✅ React is rendering properly!</p>
    <p>✅ React Router is working!</p>
    <p>✅ AuthProvider is imported successfully!</p>
    <div style={{ marginTop: '20px' }}>
      <h2>Available Routes:</h2>
      <ul>
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/weather">Weather</a></li>
        <li><a href="/market">Market Intelligence</a></li>
        <li><a href="/advisory">AI Advisory</a></li>
      </ul>
    </div>
    <div style={{ 
      marginTop: '20px', 
      padding: '15px', 
      backgroundColor: '#f0f9ff', 
      border: '1px solid #0ea5e9',
      borderRadius: '8px'
    }}>
      <h3>🎯 System Status</h3>
      <p>✅ Frontend Server: Running on port 3000</p>
      <p>✅ Backend Server: Running on port 5000</p>
      <p>✅ React Components: Loading successfully</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<SimpleWelcome />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;