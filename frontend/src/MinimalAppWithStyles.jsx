import React from 'react';

const MinimalAppWithStyles = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: '#333',
          fontSize: '36px',
          marginBottom: '20px'
        }}>
          🌾 Farmora Debug Test
        </h1>
        
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          ✅ React is working correctly!
        </div>
        
        <div style={{
          backgroundColor: '#cce7ff',
          color: '#0056b3',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #99d6ff'
        }}>
          📱 This page uses inline styles (no external CSS needed)
        </div>
        
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '30px',
          border: '1px solid #ffeaa7'
        }}>
          🔍 If you can see this, the app routing and components are working
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            <strong>Debug Information:</strong>
          </p>
          <ul style={{
            textAlign: 'left',
            color: '#555',
            listStyle: 'none',
            padding: 0
          }}>
            <li style={{ marginBottom: '8px' }}>✅ React: {React.version}</li>
            <li style={{ marginBottom: '8px' }}>✅ Components: Rendering</li>
            <li style={{ marginBottom: '8px' }}>✅ JavaScript: Active</li>
            <li style={{ marginBottom: '8px' }}>✅ Styles: Inline (working)</li>
          </ul>
        </div>
        
        <button 
          onClick={() => alert('Button clicked! Event handling works.')}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default MinimalAppWithStyles;