import { create } from 'zustand';

interface CustomizerState {
  selectedModel: string | null;
  selectedPattern: string | null;
  syncShirtShorts: boolean;
  activeTab: string;
  subTab: string;
  
  setSelectedModel: (id: string | null) => void;
  setSelectedPattern: (id: string | null) => void;
  setSyncShirtShorts: (sync: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSubTab: (tab: string) => void;
}

export const useCustomizerStore = create<CustomizerState>((set) => ({
  selectedModel: null,
  selectedPattern: null,
  syncShirtShorts: true,
  activeTab: 'Modelo',
  subTab: 'Camisa',
  
  setSelectedModel: (id) => set({ selectedModel: id }),
  setSelectedPattern: (id) => set({ selectedPattern: id }),
  setSyncShirtShorts: (sync) => set({ syncShirtShorts: sync }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSubTab: (tab) => set({ subTab: tab }),
}));
