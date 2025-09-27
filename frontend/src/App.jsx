import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth Provider and Session Manager
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import SessionManager from './components/Session/SessionManager';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Core Pages (Basic versions that should exist)
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import InteractiveDashboard from './pages/InteractiveDashboard';
import SimpleDashboard from './pages/SimpleDashboard';
import EnhancedProductionDashboard from './pages/EnhancedProductionDashboard';
import WorkingEnhancedDashboard from './pages/WorkingEnhancedDashboard';
import SimpleVideoConsultation from './components/Consultation/SimpleVideoConsultation';
import Weather from './pages/Weather';
import Advisory from './pages/Advisory';
import Market from './pages/Market';
import PestDetection from './pages/PestDetection';
import AIPestDetection from './components/PestDetection/PestDetection';
import Irrigation from './pages/Irrigation';
import Consultation from './pages/Consultation';
import Notifications from './pages/Notifications';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductionAuthSystem from './components/auth/ProductionAuthSystem';
import FlashyAuthPage from './components/auth/FlashyAuthPage';

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
                <details className="text-left mt-2" open>
                  <summary className="cursor-pointer text-red-700 font-medium text-sm">
                    Technical Details (Debug Mode)
                  </summary>
                  <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto text-red-800 max-h-32">
                    {this.state.error?.toString() || 'Unknown error'}
                    {this.state.errorInfo?.componentStack && (
                      '\n\nComponent Stack:\n' + this.state.errorInfo.componentStack
                    )}
                  </pre>
                </details>
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
    const { isAuthenticated, loading, user } = useAuth();
    
    // Show loading state while checking authentication
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Checking authentication...</p>
            <p className="text-sm text-gray-500 mt-2">Smart Crop Advisory System</p>
          </div>
        </div>
      );
    }
    
    // If not authenticated, redirect to login with current path as redirect parameter
    if (!isAuthenticated || !user) {
      const currentPath = window.location.pathname;
      const redirectParam = currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">🔒</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              Please log in to access this feature. You'll be redirected back here after signing in.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                to={`/auth?mode=login${redirectParam ? '&' + redirectParam.substring(1) : ''}`}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to={`/auth?mode=register${redirectParam ? '&' + redirectParam.substring(1) : ''}`}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Account
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              <Link to="/" className="text-green-600 hover:text-green-700">← Back to Home</Link>
            </p>
          </div>
        </div>
      );
    }
    
    // User is authenticated, render the protected content
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
          
          {/* Production Authentication System */}
          <Route path="/auth" element={
            <ErrorBoundary>
              <FlashyAuthPage />
            </ErrorBoundary>
          } />
          
          {/* Alternative Auth Routes */}
          <Route path="/auth-production" element={
            <ErrorBoundary>
              <ProductionAuthSystem />
            </ErrorBoundary>
          } />
          
          {/* Enhanced Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <WorkingEnhancedDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard-production" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <EnhancedProductionDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard-interactive" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <InteractiveDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard-simple" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <SimpleDashboard />
              </ErrorBoundary>
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
              <ErrorBoundary>
                <Market />
              </ErrorBoundary>
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
                <AIPestDetection />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          <Route path="/pest-detection-basic" element={
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
          
          {/* Consultation Routes - Made public for demo */}
          <Route path="/consultation" element={
            <ErrorBoundary>
              <SimpleVideoConsultation />
            </ErrorBoundary>
          } />
          
          <Route path="/consultation-advanced" element={
            <ErrorBoundary>
              <SafeComponent name="Advanced Video Consultation">
                <VideoConsultation />
              </SafeComponent>
            </ErrorBoundary>
          } />
          
          <Route path="/consultation-basic" element={
            <ErrorBoundary>
              <Consultation />
            </ErrorBoundary>
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
        <SessionManager>
          <Router>
            <AppContent />
          </Router>
        </SessionManager>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;