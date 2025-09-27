import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Cloud, TrendingUp, Bug, Droplets, Video, User, UserPlus, LogIn, Clock } from 'lucide-react';
import { useAuth } from './hooks/useAuth';

const HomePageWithMotion = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Debug info */}
      <motion.div 
        className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <strong>Debug Info:</strong> framer-motion loaded - Time: {currentTime.toLocaleTimeString()}
      </motion.div>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          {/* Status Bar with Animation */}
          <motion.div 
            className="inline-flex items-center space-x-4 bg-white rounded-full px-6 py-3 shadow-lg border mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-gray-700">All Systems Online</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{currentTime.toLocaleTimeString()}</span>
            </div>
          </motion.div>

          {/* Animated Logo */}
          <motion.div
            className="flex items-center justify-center mb-6"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Leaf className="w-16 h-16 text-green-600" />
          </motion.div>
          
          {/* Animated Title */}
          <motion.h1 
            className="text-5xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Welcome to{' '}
            <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Farmora
            </span>
          </motion.h1>
          
          {/* Animated Subtitle */}
          <motion.p 
            className="text-xl text-gray-600 max-w-4xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            The future of agriculture is here. Experience AI-powered farming with real-time insights.
          </motion.p>

          {/* Animated Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {isAuthenticated ? (
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/dashboard"
                  className="group bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
                >
                  <User className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/register"
                    className="group bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Start Free Trial
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/login"
                    className="group bg-white text-gray-700 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-gray-200 hover:border-green-300 flex items-center"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Animated Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: "1,247", label: "Active Farmers" },
              { value: "856", label: "Farms Monitored" },
              { value: "12,400", label: "AI Predictions" },
              { value: "94.2%", label: "Accuracy Rate" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Farming
            </h2>
            <p className="text-xl text-gray-600">
              {isAuthenticated ? `Welcome back, ${user?.name || 'Farmer'}! ` : ''}
              Discover how Farmora transforms traditional farming
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Cloud,
                title: 'Smart Weather Analytics',
                description: 'Real-time weather monitoring with AI predictions',
                route: '/weather'
              },
              {
                icon: Leaf,
                title: 'AI Crop Advisory',
                description: 'Personalized recommendations for your farming needs',
                route: '/advisory'
              },
              {
                icon: Bug,
                title: 'Pest Detection',
                description: 'Advanced image analysis for pest identification',
                route: '/pest-detection'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 p-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="p-3 rounded-xl bg-gray-50 w-fit mb-4">
                  <feature.icon className="w-8 h-8 text-gray-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {feature.description}
                </p>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={feature.route}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-center block hover:shadow-lg transition-all duration-200"
                  >
                    Explore {feature.title}
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePageWithMotion;