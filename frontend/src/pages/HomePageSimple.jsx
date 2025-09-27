import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Cloud, TrendingUp, Bug, Droplets, Video } from 'lucide-react';

const HomePageSimple = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Leaf className="w-16 h-16 text-green-600" />
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Farmora
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            The future of agriculture is here. Experience AI-powered farming with real-time insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link 
              to="/register"
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Start Free Trial
            </Link>
            <Link 
              to="/login"
              className="bg-white text-gray-700 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-2 border-gray-200 hover:border-green-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Farming
            </h2>
            <p className="text-xl text-gray-600">
              Discover how Farmora transforms traditional farming
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Cloud,
                title: 'Smart Weather Analytics',
                description: 'Real-time weather monitoring with AI predictions',
                route: '/weather',
                color: 'from-blue-400 to-cyan-600'
              },
              {
                icon: Leaf,
                title: 'AI Crop Advisory',
                description: 'Personalized recommendations for your farming needs',
                route: '/advisory',
                color: 'from-green-400 to-emerald-600'
              },
              {
                icon: Bug,
                title: 'Pest Detection',
                description: 'Advanced image analysis for pest identification',
                route: '/pest-detection',
                color: 'from-red-400 to-rose-600'
              },
              {
                icon: TrendingUp,
                title: 'Market Intelligence',
                description: 'Real-time market data and selling recommendations',
                route: '/market',
                color: 'from-purple-400 to-violet-600'
              },
              {
                icon: Droplets,
                title: 'Smart Irrigation',
                description: 'Automated irrigation scheduling with AI',
                route: '/irrigation',
                color: 'from-cyan-400 to-teal-600'
              },
              {
                icon: Video,
                title: 'Expert Consultations',
                description: 'Video sessions with agricultural professionals',
                route: '/consultation',
                color: 'from-indigo-400 to-blue-600'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 p-8"
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
                
                <Link
                  to={feature.route}
                  className={`w-full bg-gradient-to-r ${feature.color} text-white py-3 px-4 rounded-lg font-semibold text-center block hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                >
                  Explore {feature.title}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePageSimple;