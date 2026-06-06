import React from 'react';
import { useUniformStore } from '../../store/useUniformStore';
import { Send, Download } from 'lucide-react';

export const Footer = () => {
  const { setModalOpen } = useUniformStore();

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 z-40 px-4 md:px-6 flex items-center justify-between">
      <div className="flex-1 hidden md:block text-sm text-gray-500">
        Simule e envie para um orçamento via WhatsApp.
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button 
          onClick={() => setModalOpen('salvar', true)}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Download size={20} />
          <span>Salvar Simulação</span>
        </button>
        
        <button 
          onClick={() => setModalOpen('orcamento', true)}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
        >
          <Send size={20} />
          <span>Enviar Orçamento</span>
        </button>
      </div>
    </footer>
  );
};
