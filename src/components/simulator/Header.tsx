import React from 'react';
import { useUniformStore } from '../../store/useUniformStore';
import { User, LogIn, Save, Grid } from 'lucide-react';

export const Header = () => {
  const { user, setModalOpen } = useUniformStore();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold">U</div>
        <h1 className="font-bold text-xl hidden md:block">Simulador de Uniformes</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => setModalOpen('selecionar', true)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Grid size={18} />
          <span className="hidden sm:inline">Ver todos</span>
        </button>

        {user ? (
          <button 
            onClick={() => setModalOpen('perfil', true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <User size={18} />
            <span className="hidden sm:inline">{user.nome || 'Minha Conta'}</span>
          </button>
        ) : (
          <button 
            onClick={() => setModalOpen('login', true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogIn size={18} />
            <span className="hidden sm:inline">Entrar</span>
          </button>
        )}

        <button 
          onClick={() => setModalOpen('salvar', true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Save size={18} />
          <span>Salvar</span>
        </button>
      </div>
    </header>
  );
};
