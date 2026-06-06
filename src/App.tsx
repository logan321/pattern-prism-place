import React, { useEffect } from 'react';
import { Scene3D } from './components/simulator/Scene3D';
import { ConfigPanel } from './components/simulator/ConfigPanel';
import { Header } from './components/simulator/Header';
import { Footer } from './components/simulator/Footer';

function App() {
  // Check for first visit to show cookie banner
  useEffect(() => {
    const hasConsent = localStorage.getItem('cookie-consent');
    if (!hasConsent) {
      // Logic to show banner
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Header />
      
      <main className="pt-16 pb-20 flex flex-col md:flex-row h-screen">
        {/* Left: 3D Canvas */}
        <section className="h-[50vh] md:h-full md:flex-[0.65] relative border-r border-gray-200">
          <Scene3D />
        </section>

        {/* Right: Config Panel */}
        <section className="flex-1 md:flex-[0.35] h-full overflow-hidden">
          <ConfigPanel />
        </section>
      </main>

      <Footer />

      {/* Cookie Banner */}
      <div id="cookie-banner" className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-gray-900 text-white p-4 rounded-2xl shadow-2xl z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <p className="text-sm text-gray-300">
          Este site utiliza cookies para garantir que você tenha a melhor experiência possível.
        </p>
        <button 
          onClick={() => {
            localStorage.setItem('cookie-consent', 'true');
            document.getElementById('cookie-banner')?.remove();
          }}
          className="w-full bg-primary py-2 px-4 rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Sim, concordo
        </button>
      </div>
    </div>
  );
}

export default App;
