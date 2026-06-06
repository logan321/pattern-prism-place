import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SimulatorPage from './pages/simulator/SimulatorPage';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/simulador/futebol_masculino_3d" element={<SimulatorPage />} />
        {/* Placeholder for other routes */}
        <Route path="/clientes" element={<HomePage />} />
        <Route path="/institucional_simulador" element={<HomePage />} />
        <Route path="/anuncios" element={<HomePage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
