import React from 'react';
import HomePage from './pages/HomePage';

function App() {
  console.log("App rendering");
  return (
    <div style={{ padding: '20px', background: 'gray' }}>
      <h1 style={{ color: 'white' }}>APP LOADED</h1>
      <HomePage />
    </div>
  );
}

export default App;
