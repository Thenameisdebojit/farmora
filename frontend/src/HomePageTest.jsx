import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BasicHomePage from './BasicHomePage';

const HomePageTest = () => {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="*" element={<BasicHomePage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default HomePageTest;