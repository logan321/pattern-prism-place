import React, { useEffect } from 'react';
import { Scene3D } from './components/simulator/Scene3D';
import { ConfigPanel } from './components/simulator/ConfigPanel';
import { Header } from './components/simulator/Header';
import { Footer } from './components/simulator/Footer';
import { Modal } from './components/simulator/Modal';
import { useUniformStore } from './store/useUniformStore';

function App() {
  const { modaisAbertos, setModalOpen } = useUniformStore();
  
  useEffect(() => {
    const hasConsent = localStorage.getItem('cookie-consent');
    if (hasConsent) {
      document.getElementById('cookie-banner')?.remove();
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

      {/* Modals */}
      <Modal 
        isOpen={!!modaisAbertos['login']} 
        onClose={() => setModalOpen('login', false)} 
        title="Entrar"
      >
        <div className="space-y-4">
          <input type="email" placeholder="E-mail" className="w-full p-3 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none" />
          <input type="password" placeholder="Senha" className="w-full p-3 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none" />
          <button className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            Acessar Conta
          </button>
          <div className="text-center text-sm text-gray-500">
            Não tem uma conta? <button onClick={() => { setModalOpen('login', false); setModalOpen('cadastro', true); }} className="text-primary font-bold">Cadastre-se</button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={!!modaisAbertos['orcamento']} 
        onClose={() => setModalOpen('orcamento', false)} 
        title="Enviar Orçamento"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500 italic">Preencha seus dados para receber o orçamento via WhatsApp.</p>
          <input type="text" placeholder="Seu Nome" className="w-full p-3 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none" />
          <input type="tel" placeholder="Seu WhatsApp" className="w-full p-3 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none" />
          <textarea placeholder="Observações adicionais" className="w-full p-3 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-primary h-24 outline-none resize-none" />
          <button className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all">
            Enviar Pedido via WhatsApp
          </button>
        </div>
      </Modal>

      {/* Cookie Banner */}
      <div id="cookie-banner" className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-gray-900 text-white p-5 rounded-3xl shadow-2xl z-50 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 border border-white/10">
        <p className="text-sm text-gray-300 leading-relaxed">
          Este site utiliza cookies para garantir que você tenha a melhor experiência personalizada.
        </p>
        <button 
          onClick={() => {
            localStorage.setItem('cookie-consent', 'true');
            document.getElementById('cookie-banner')?.remove();
          }}
          className="w-full bg-primary py-3 px-4 rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Sim, concordo
        </button>
      </div>
    </div>
  );
}

export default App;
