import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth Provider
import { AuthProvider } from './hooks/useAuth.jsx';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Core Pages (Basic versions that should exist)
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Weather from './pages/Weather';
import Advisory from './pages/Advisory';
import Market from './pages/Market';
import PestDetection from './pages/PestDetection';
import Irrigation from './pages/Irrigation';
import Consultation from './pages/Consultation';
import Notifications from './pages/Notifications';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Advanced Components (Lazy loaded for better performance)
const EnhancedDashboard = React.lazy(() => import('./components/Dashboard/EnhancedDashboard'));
const WeatherDashboard = React.lazy(() => import('./components/Weather/WeatherDashboard'));
const InteractiveAIAdvisory = React.lazy(() => import('./components/Advisory/InteractiveAIAdvisory'));
const MarketIntelligenceDashboard = React.lazy(() => import('./components/Market/MarketIntelligenceDashboard'));
const VideoConsultation = React.lazy(() => import('./components/Consultation/VideoConsultation'));
const AIChat = React.lazy(() => import('./components/Chat/AIChat'));

// Loading Component
const Loading = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">{message}</p>
      <p className="text-sm text-gray-500 mt-2">Smart Crop Advisory System</p>
    </div>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Smart Crop Advisory - Error caught:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                🌾 Smart Crop Advisory
              </h1>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h2 className="text-lg font-semibold text-red-800 mb-2">
                  Application Error
                </h2>
                <p className="text-red-600 text-sm mb-4">
                  We encountered an issue loading this component. The application is still running,
                  you can try navigating to a different page or refreshing.
                </p>
                {this.props.showDetails && this.state.error && (
                  <details className="text-left mt-2">
                    <summary className="cursor-pointer text-red-700 font-medium text-sm">
                      Technical Details
                    </summary>
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto text-red-800">
                      {this.state.error.toString()}
                    </pre>
                  </details>
                )}
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Reload Application
                </button>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Safe Component Wrapper
const SafeComponent = ({ children, fallback = null, name = "Component" }) => (
  <ErrorBoundary>
    <Suspense fallback={fallback || <Loading message={`Loading ${name}...`} />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

const AppContent = () => {
  useEffect(() => {
    console.log('🌾 Smart Crop Advisory System - Starting...');
    
    // Initialize service worker for PWA (optional)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('ℹ️ Service Worker registration failed:', error);
        });
    }
  }, []);

  const ProtectedRoute = ({ children }) => {
    // For demo purposes, allow access to all features
    // In production, implement proper authentication
    return children;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ErrorBoundary>
        <Navbar />
      </ErrorBoundary>
      
      <main className="min-h-screen">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <ErrorBoundary>
              <Welcome />
            </ErrorBoundary>
          } />
          <Route path="/welcome" element={
            <ErrorBoundary>
              <Welcome />
            </ErrorBoundary>
          } />
          <Route path="/login" element={
            <ErrorBoundary>
              <LoginPage />
            </ErrorBoundary>
          } />
          <Route path="/register" element={
            <ErrorBoundary>
              <RegisterPage />
            </ErrorBoundary>
          } />
          
          {/* Enhanced Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <SafeComponent name="Enhanced Dashboard">
                <EnhancedDashboard />
              </SafeComponent>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard-basic" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Weather Routes */}
          <Route path="/weather" element={
            <ProtectedRoute>
              <SafeComponent name="Weather Dashboard">
                <WeatherDashboard />
              </SafeComponent>
            </ProtectedRoute>
          } />
          
          <Route path="/weather-basic" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Weather />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Advisory Routes */}
          <Route path="/advisory" element={
            <ProtectedRoute>
              <SafeComponent name="AI Advisory">
                <InteractiveAIAdvisory />
              </SafeComponent>
            </ProtectedRoute>
          } />
          
          <Route path="/advisory-basic" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Advisory />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Market Routes */}
          <Route path="/market" element={
            <ProtectedRoute>
              <SafeComponent name="Market Intelligence">
                <MarketIntelligenceDashboard />
              </SafeComponent>
            </ProtectedRoute>
          } />
          
          <Route path="/market-basic" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Market />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Other Feature Routes */}
          <Route path="/pest-detection" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <PestDetection />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          <Route path="/irrigation" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Irrigation />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          <Route path="/consultation" element={
            <ProtectedRoute>
              <SafeComponent name="Video Consultation">
                <VideoConsultation />
              </SafeComponent>
            </ProtectedRoute>
          } />
          
          <Route path="/consultation-basic" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Consultation />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          <Route path="/chat" element={
            <ProtectedRoute>
              <SafeComponent name="AI Chat">
                <AIChat />
              </SafeComponent>
            </ProtectedRoute>
          } />
          
          <Route path="/notifications" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Notifications />
              </ErrorBoundary>
            </ProtectedRoute>
          } />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
      
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
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;