// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Leaf,
  Heart
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Leaf className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Smart Crop Advisory</h3>
                <p className="text-green-400 text-sm">Empowering Farmers with AI</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6 max-w-md">
              Our AI-powered platform provides comprehensive farming solutions including 
              weather insights, pest detection, market intelligence, and expert consultation 
              to help farmers make informed decisions and increase productivity.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com/smartcropadvisory" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://twitter.com/smartcropadvisory" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-400 transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="https://instagram.com/smartcropadvisory" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://linkedin.com/company/smartcropadvisory" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/" className="hover:text-green-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/weather" className="hover:text-green-400 transition-colors">
                  Weather Forecast
                </Link>
              </li>
              <li>
                <Link to="/advisory" className="hover:text-green-400 transition-colors">
                  Crop Advisory
                </Link>
              </li>
              <li>
                <Link to="/market" className="hover:text-green-400 transition-colors">
                  Market Prices
                </Link>
              </li>
              <li>
                <Link to="/pest-detection" className="hover:text-green-400 transition-colors">
                  Pest Detection
                </Link>
              </li>
              <li>
                <Link to="/consultation" className="hover:text-green-400 transition-colors">
                  Expert Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/help" className="hover:text-green-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/tutorials" className="hover:text-green-400 transition-colors">
                  Video Tutorials
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-green-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-green-400 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="hover:text-green-400 transition-colors">
                  Send Feedback
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-green-400 transition-colors">
                  Community Forum
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Mail className="text-green-400 mt-1 flex-shrink-0" size={18} />
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-gray-300">support@smartcropadvisory.com</p>
                <p className="text-sm text-gray-300">info@smartcropadvisory.com</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Phone className="text-green-400 mt-1 flex-shrink-0" size={18} />
              <div>
                <p className="font-medium">Phone Support</p>
                <p className="text-sm text-gray-300">+91 1800-XXX-XXXX (Toll Free)</p>
                <p className="text-sm text-gray-300">Available 24/7</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MapPin className="text-green-400 mt-1 flex-shrink-0" size={18} />
              <div>
                <p className="font-medium">Headquarters</p>
                <p className="text-sm text-gray-300">
                  Smart Crop Advisory Systems<br />
                  Agriculture Technology Hub<br />
                  Bangalore, India - 560001
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <p className="text-sm text-gray-400">
                © {currentYear} Smart Crop Advisory System. All rights reserved.
              </p>
              <div className="flex items-center space-x-1 text-sm text-gray-400">
                <span>Made with</span>
                <Heart className="text-red-500" size={14} />
                <span>for farmers</span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center items-center space-x-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-green-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-green-400 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="hover:text-green-400 transition-colors">
                Cookie Policy
              </Link>
              <Link to="/accessibility" className="hover:text-green-400 transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>

        {/* App Download Section */}
        <div className="border-t border-gray-800 pt-6 mt-6">
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-3">Download Our Mobile App</h4>
            <p className="text-sm text-gray-300 mb-4">
              Get instant access to weather alerts, pest detection, and expert advice on your mobile device
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="#" 
                className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="text-left">
                  <p className="text-xs">Download on the</p>
                  <p className="text-sm font-semibold">App Store</p>
                </div>
              </a>
              <a 
                href="#" 
                className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="text-left">
                  <p className="text-xs">Get it on</p>
                  <p className="text-sm font-semibold">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
