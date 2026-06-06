import { create } from 'zustand';
import { UniformConfig, Peca, CorConfig, AcabamentoConfig, TextoConfig } from '../types/simulator';

interface UniformState {
  config: UniformConfig;
  activeTab: string;
  activePeca: Peca;
  modaisAbertos: Record<string, boolean>;
  user: any | null;
  
  // Actions
  setConfig: (config: Partial<UniformConfig>) => void;
  updatePecaConfig: (peca: Peca, update: Partial<import('../types/simulator').PecaConfig>) => void;
  setActiveTab: (tab: string) => void;
  setActivePeca: (peca: Peca) => void;
  setModalOpen: (modalId: string, isOpen: boolean) => void;
  setUser: (user: any) => void;
}

const initialPecaConfig = (peca: Peca) => ({
  modeloId: '',
  cores: {
    base: '#ffffff',
    cores: ['#000000', '#000000', '#000000', '#000000', '#000000'],
  },
  acabamentos: {
    gola: 'Redonda',
    manga: 'Padrão',
    punho: 'Simples',
  },
  nome: {
    texto: '',
    fonte: 'Canvas',
    posicao: { x: 0.5, y: 0.5 },
    tamanho: 1,
  },
  numero: {
    texto: '',
    fonte: 'Canvas',
    posicao: { x: 0.5, y: 0.5 },
    tamanho: 1,
  },
});

export const useUniformStore = create<UniformState>((set) => ({
  config: {
    Camisa: initialPecaConfig('Camisa'),
    Calção: initialPecaConfig('Calção'),
    Meião: initialPecaConfig('Meião'),
    sincronizado: true,
  },
  activeTab: 'Modelo',
  activePeca: 'Camisa',
  modaisAbertos: {},
  user: null,

  setConfig: (update) => set((state) => ({ 
    config: { ...state.config, ...update } 
  })),

  updatePecaConfig: (peca, update) => set((state) => {
    const newConfig = { ...state.config };
    newConfig[peca] = { ...newConfig[peca], ...update };
    
    if (state.config.sincronizado && (peca === 'Camisa' || peca === 'Calção')) {
      const outraPeca = peca === 'Camisa' ? 'Calção' : 'Camisa';
      // Sync colors if needed, but usually specific per app logic
    }
    
    return { config: newConfig };
  }),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setActivePeca: (peca) => set({ activePeca: peca }),
  setModalOpen: (modalId, isOpen) => set((state) => ({
    modaisAbertos: { ...state.modaisAbertos, [modalId]: isOpen }
  })),
  setUser: (user) => set({ user }),
}));
