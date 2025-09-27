import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Navbar from './components/Navbar';
import HomePageWithMotion from './HomePageWithMotion';

const AuthTest = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Navbar />
          <Routes>
            <Route path="*" element={<HomePageWithMotion />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default AuthTest;