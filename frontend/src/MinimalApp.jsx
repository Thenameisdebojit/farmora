import React from 'react';

const MinimalApp = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>
          ✅ React is Working!
        </h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          This is a minimal React component with inline styles.
        </p>
        <p style={{ color: '#28a745', fontWeight: 'bold' }}>
          🌾 Farmora Development Server is Running
        </p>
        <div style={{ marginTop: '30px' }}>
          <button 
            onClick={() => alert('Button clicked! JavaScript is working.')}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Test JavaScript
          </button>
        </div>
      </div>
    </div>
  );
};

export default MinimalApp;