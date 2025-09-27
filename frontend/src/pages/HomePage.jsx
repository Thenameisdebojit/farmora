import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, Cloud, TrendingUp, Bug, Droplets, Video, MessageSquare,
  BarChart3, Users, Award, ArrowRight, Play, CheckCircle,
  Star, MapPin, Calendar, Bell, Zap, Brain, Globe,
  Smartphone, Wifi, Shield, Clock, Target, Heart,
  ChevronDown, Menu, X, PhoneCall, Mail, MessageCircle,
  Sparkles, Eye, ChevronRight, Thermometer, DollarSign,
  Activity, User, LogIn, UserPlus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [backendStatus, setBackendStatus] = useState('checking');
  const [activeDemo, setActiveDemo] = useState(null);
  const [stats, setStats] = useState({
    users: 1247,
    farms: 856,
    predictions: 12400,
    accuracy: 94.2
  });
  
  const navigate = useNavigate();
  
  // Safely use useAuth with error handling
  let isAuthenticated = false;
  let user = null;
  
  try {
    const authData = useAuth();
    isAuthenticated = authData?.isAuthenticated || false;
    user = authData?.user || null;
  } catch (error) {
    console.warn('useAuth hook error:', error);
    // Fallback to checking localStorage directly
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        user = JSON.parse(savedUser);
        isAuthenticated = true;
      }
    } catch (storageError) {
      console.warn('localStorage error:', storageError);
    }
  }

  useEffect(() => {
    try {
      const timer = setInterval(() => {
        try {
          setCurrentTime(new Date());
        } catch (error) {
          console.warn('Time update error:', error);
        }
      }, 1000);
      return () => clearInterval(timer);
    } catch (error) {
      console.warn('Timer setup error:', error);
    }
  }, []);

  useEffect(() => {
    try {
      // Check backend status
      fetch('/api/status')
        .then(response => response.json())
        .then(data => {
          setBackendStatus('connected');
        })
        .catch(error => {
          console.log('Backend check:', error);
          setBackendStatus('disconnected');
        });
    } catch (error) {
      console.warn('Backend status check error:', error);
      setBackendStatus('disconnected');
    }
  }, []);

  // Animated stats counter
  useEffect(() => {
    try {
      const interval = setInterval(() => {
        try {
          setStats(prev => ({
            users: prev.users + Math.floor(Math.random() * 3),
            farms: prev.farms + Math.floor(Math.random() * 2),
            predictions: prev.predictions + Math.floor(Math.random() * 5),
            accuracy: Math.min(99.9, prev.accuracy + Math.random() * 0.1)
          }));
        } catch (error) {
          console.warn('Stats update error:', error);
        }
      }, 5000);
      return () => clearInterval(interval);
    } catch (error) {
      console.warn('Stats timer setup error:', error);
    }
  }, []);

  const features = [
    {
      id: 'weather',
      icon: Cloud,
      title: 'Smart Weather Analytics',
      subtitle: 'AI-Powered Forecasting',
      description: 'Real-time weather monitoring with machine learning predictions',
      highlights: ['7-day forecasts', 'Storm alerts', 'Microclimate analysis'],
      route: '/weather',
      demo: 'weather',
      color: 'from-blue-400 to-cyan-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      id: 'advisory',
      icon: Leaf,
      title: 'Personalized AI Assistant',
      subtitle: 'Smart Crop Advisory',
      description: 'AI-powered recommendations tailored to your farming needs',
      highlights: ['Crop optimization', 'Planting schedules', 'Yield predictions'],
      route: '/chat',
      demo: 'ai',
      color: 'from-green-400 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      id: 'detection',
      icon: Bug,
      title: 'Advanced Pest Detection',
      subtitle: 'Computer Vision AI',
      description: 'Cutting-edge image analysis for pest and disease identification',
      highlights: ['95% accuracy', 'Instant diagnosis', 'Treatment suggestions'],
      route: '/pest-detection',
      demo: 'pest',
      color: 'from-red-400 to-rose-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      id: 'market',
      icon: BarChart3,
      title: 'Live Market Intelligence',
      subtitle: 'Real-Time Pricing',
      description: 'Get instant market data and selling recommendations',
      highlights: ['Live prices', 'Market trends', 'Profit forecasts'],
      route: '/market',
      demo: 'market',
      color: 'from-purple-400 to-violet-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      id: 'irrigation',
      icon: Droplets,
      title: 'Smart Irrigation System',
      subtitle: 'Water Management',
      description: 'Automated irrigation scheduling based on AI analysis',
      highlights: ['Water savings', 'Soil monitoring', 'Auto scheduling'],
      route: '/irrigation',
      demo: 'irrigation',
      color: 'from-cyan-400 to-teal-600',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600'
    },
    {
      id: 'consultation',
      icon: Video,
      title: 'Expert Video Consultations',
      subtitle: 'Connect with Experts',
      description: 'One-on-one sessions with agricultural professionals',
      highlights: ['HD video calls', 'Screen sharing', 'Expert network'],
      route: '/consultation',
      demo: 'video',
      color: 'from-indigo-400 to-blue-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    }
  ];

  const demoData = {
    weather: {
      title: 'Weather Analytics',
      metrics: [
        { label: 'Temperature', value: '24°C', trend: '+2°' },
        { label: 'Humidity', value: '68%', trend: '-5%' },
        { label: 'Rainfall', value: '12mm', trend: '+8mm' }
      ]
    },
    ai: {
      title: 'AI Assistant Chat',
      messages: [
        { role: 'user', text: 'What should I plant this season?' },
        { role: 'ai', text: 'Based on your soil analysis and weather patterns, I recommend tomatoes and corn for maximum yield.' }
      ]
    },
    market: {
      title: 'Market Prices',
      prices: [
        { crop: 'Wheat', price: '$245/ton', change: '+3.2%' },
        { crop: 'Corn', price: '$198/ton', change: '+1.8%' },
        { crop: 'Rice', price: '$312/ton', change: '-0.5%' }
      ]
    }
  };

  const achievements = [
    { icon: Users, value: stats.users.toLocaleString(), label: 'Active Farmers' },
    { icon: MapPin, value: stats.farms.toLocaleString(), label: 'Farms Monitored' },
    { icon: Target, value: stats.predictions.toLocaleString(), label: 'AI Predictions' },
    { icon: TrendingUp, value: `${stats.accuracy.toFixed(1)}%`, label: 'Accuracy Rate' }
  ];

  const testimonials = [
    {
      name: 'John Martinez',
      role: 'Organic Farmer',
      location: 'California, USA',
      quote: 'Farmora increased my crop yield by 35% in just one season. The AI recommendations are incredibly accurate.',
      avatar: '👨‍🌾'
    },
    {
      name: 'Sarah Johnson',
      role: 'Agricultural Consultant',
      location: 'Texas, USA',
      quote: 'The pest detection feature saved my clients thousands in potential crop losses. Amazing technology!',
      avatar: '👩‍🌾'
    },
    {
      name: 'Michael Chen',
      role: 'Sustainable Farmer',
      location: 'Oregon, USA',
      quote: 'The water management system helped me reduce irrigation costs by 40% while maintaining optimal growth.',
      avatar: '👨‍💼'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Status Bar */}
            <motion.div 
              className="inline-flex items-center space-x-4 bg-white rounded-full px-6 py-3 shadow-lg border mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  backendStatus === 'connected' ? 'bg-green-500' : 
                  backendStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <span className="text-sm font-medium text-gray-700">
                  {backendStatus === 'connected' ? 'All Systems Online' : 
                   backendStatus === 'disconnected' ? 'Backend Offline' : 'Checking...'}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{currentTime.toLocaleTimeString()}</span>
              </div>
            </motion.div>

            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-center mb-6">
                <Leaf className="w-16 h-16 text-green-600" />
                <Sparkles className="w-8 h-8 text-yellow-500 ml-2 animate-pulse" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Farmora
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
                The future of agriculture is here. Experience AI-powered farming with real-time insights, 
                expert consultations, and smart automation that transforms how you grow.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                {isAuthenticated ? (
                  <Link 
                    to="/dashboard"
                    className="group bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/auth?mode=register"
                      className="group bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center"
                    >
                      <UserPlus className="w-5 h-5 mr-2" />
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link 
                      to="/auth?mode=login"
                      className="group bg-white text-gray-700 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center border-2 border-gray-200 hover:border-green-300"
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In
                    </Link>
                  </>
                )}
                <button 
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="group text-gray-600 hover:text-green-600 font-medium flex items-center transition-colors"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {achievements.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <stat.icon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Farming
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how Farmora's cutting-edge technology transforms traditional farming into smart agriculture
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="p-8">
                  {/* Icon and Title */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${feature.bgColor}`}>
                      <feature.icon className={`w-8 h-8 ${feature.textColor}`} />
                    </div>
                    <button
                      onClick={() => setActiveDemo(activeDemo === feature.demo ? null : feature.demo)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 mb-3">
                    {feature.subtitle}
                  </p>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Highlights */}
                  <ul className="space-y-2 mb-6">
                    {feature.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-3" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  
                  {/* Demo Preview */}
                  <AnimatePresence>
                    {activeDemo === feature.demo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 bg-gray-50 rounded-lg border"
                      >
                        {demoData[feature.demo] && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {demoData[feature.demo].title}
                            </h4>
                            {feature.demo === 'weather' && (
                              <div className="space-y-2">
                                {demoData.weather.metrics.map((metric, i) => (
                                  <div key={i} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{metric.label}</span>
                                    <span className="font-medium">{metric.value} {metric.trend}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {feature.demo === 'market' && (
                              <div className="space-y-2">
                                {demoData.market.prices.map((price, i) => (
                                  <div key={i} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{price.crop}</span>
                                    <span className="font-medium">{price.price} <span className="text-green-600">{price.change}</span></span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Action Button */}
                  <Link
                    to={feature.route}
                    className={`w-full bg-gradient-to-r ${feature.color} text-white py-3 px-4 rounded-lg font-semibold text-center block hover:shadow-lg transform hover:scale-105 transition-all duration-200 group-hover:scale-105`}
                  >
                    Explore {feature.title}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Farmers Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our farming community says about Farmora
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Farm?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
              Join thousands of farmers who are already using Farmora to increase yields, 
              reduce costs, and farm more sustainably.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated && (
                <>
                  <Link 
                    to="/auth?mode=register"
                    className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Get Started Free
                  </Link>
                  <Link 
                    to="/auth?mode=login"
                    className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-green-600 transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <Link 
                  to="/dashboard"
                  className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                >
                  <User className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;