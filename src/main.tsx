import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => (
  <div style={{ 
    display: 'flex', 
    height: '100vh', 
    width: '100vw', 
    justifyContent: 'center', 
    alignItems: 'center',
    background: '#f0f0f0',
    fontFamily: 'sans-serif'
  }}>
    <h1>Projeto Zerado - Pronto para recomeçar</h1>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
