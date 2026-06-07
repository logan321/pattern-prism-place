import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Simulator from './pages/Simulator';
import Admin from './pages/Admin';
import { Zone3DEditor } from './components/Zone3DEditor';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppContextProvider } from './context/AppContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Simulator />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/editor-3d" element={<Zone3DEditor />} />
          </Routes>
        </Router>
      </AppContextProvider>
    </QueryClientProvider>
  );
}

export default App;
