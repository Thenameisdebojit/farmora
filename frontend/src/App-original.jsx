/* frontend/src/App.jsx */
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth Provider
import { AuthProvider } from './hooks/useAuth.jsx';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Welcome from './pages/Welcome';
// Import existing pages
import Dashboard from './pages/Dashboard';
import Weather from './pages/Weather';
import Advisory from './pages/Advisory';
import Market from './pages/Market';
import PestDetection from './pages/PestDetection';
import Irrigation from './pages/Irrigation';
import Consultation from './pages/Consultation';
import Notifications from './pages/Notifications';

// Import new advanced components
import WeatherDashboard from './components/Weather/WeatherDashboard';
import AIChat from './components/Chat/AIChat';
import VideoConsultation from './components/Consultation/VideoConsultation';
import EnhancedDashboard from './components/Dashboard/EnhancedDashboard';
import MarketIntelligenceDashboard from './components/Market/MarketIntelligenceDashboard';
import InteractiveAIAdvisory from './components/Advisory/InteractiveAIAdvisory';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const AppContent = () => {
  useEffect(() => {
    // Initialize service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Initialize Firebase messaging for push notifications
    // This would be implemented with Firebase SDK
  }, []);

  const ProtectedRoute = ({ children }) => {
    // For demo purposes, allow access to all features
    // In production, this would check authentication status
    return children;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="min-h-screen">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Enhanced Dashboard Route */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <EnhancedDashboard />
            </ProtectedRoute>
          } />
          
          {/* Basic Dashboard Route */}
          <Route path="/dashboard-basic" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/weather" element={
            <ProtectedRoute>
              <WeatherDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/weather-basic" element={
            <ProtectedRoute>
              <Weather />
            </ProtectedRoute>
          } />
          
          <Route path="/advisory" element={
            <ProtectedRoute>
              <InteractiveAIAdvisory />
            </ProtectedRoute>
          } />
          
          <Route path="/advisory-basic" element={
            <ProtectedRoute>
              <Advisory />
            </ProtectedRoute>
          } />
          
          <Route path="/market" element={
            <ProtectedRoute>
              <MarketIntelligenceDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/market-basic" element={
            <ProtectedRoute>
              <Market />
            </ProtectedRoute>
          } />
          
          <Route path="/pest-detection" element={
            <ProtectedRoute>
              <PestDetection />
            </ProtectedRoute>
          } />
          
          <Route path="/irrigation" element={
            <ProtectedRoute>
              <Irrigation />
            </ProtectedRoute>
          } />
          
          <Route path="/consultation" element={
            <ProtectedRoute>
              <VideoConsultation />
            </ProtectedRoute>
          } />
          
          <Route path="/consultation-basic" element={
            <ProtectedRoute>
              <Consultation />
            </ProtectedRoute>
          } />
          
          <Route path="/chat" element={
            <ProtectedRoute>
              <AIChat />
            </ProtectedRoute>
          } />
          
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      
      <Footer />
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
