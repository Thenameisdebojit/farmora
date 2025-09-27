import React from 'react';
import HomePage from './HomePage';

// Legacy Welcome component redirects to new HomePage
const Welcome = () => {
  return <HomePage />;
};

export default Welcome;
