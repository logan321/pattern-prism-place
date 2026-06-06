import React from 'react';
import HomePage from './pages/HomePage';

function App() {
  return (
    <div style={{ padding: '20px', background: '#f3f4f6', minHeight: '100vh' }}>
      <header style={{ padding: '20px', background: 'white', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#F26522', margin: 0 }}>MACRO MASTER</h1>
      </header>
      <HomePage />
    </div>
  );
}

export default App;
