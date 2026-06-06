import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SimulatorPage from './pages/simulator/SimulatorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/simulador/futebol_masculino_3d" element={<SimulatorPage />} />
        <Route path="/clientes" element={<HomePage />} />
        <Route path="/institucional_simulador" element={<HomePage />} />
        <Route path="/anuncios" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
