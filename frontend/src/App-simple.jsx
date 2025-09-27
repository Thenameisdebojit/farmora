import React from 'react';

function App() {
  return (
    <div>
      <h1>🌾 Smart Crop Advisory System</h1>
      <p>The application is working!</p>
      <nav>
        <a href="#dashboard" style={{margin: '10px'}}>Dashboard</a>
        <a href="#weather" style={{margin: '10px'}}>Weather</a>
        <a href="#market" style={{margin: '10px'}}>Market</a>
      </nav>
      <div style={{marginTop: '20px', padding: '20px', backgroundColor: '#f0f9ff'}}>
        <h2>✅ System Status</h2>
        <ul>
          <li>React: Running</li>
          <li>Frontend Server: Active</li>
          <li>Backend Server: Connected</li>
        </ul>
      </div>
    </div>
  );
}

export default App;