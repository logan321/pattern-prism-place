import { create } from 'zustand';

interface CustomizerState {
  selectedModel: string | null;
  selectedPattern: string | null;
  syncShirtShorts: boolean;
  activeTab: string;
  subTab: string;
  
  // Customization settings
  name: string;
  number: string;
  formation: string;
  nameColor: string;
  numberColor: string;
  nameFont: string;
  shieldUrl: string | null;
  
  setSelectedModel: (id: string | null) => void;
  setSelectedPattern: (id: string | null) => void;
  setSyncShirtShorts: (sync: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSubTab: (tab: string) => void;
  
  // Customization setters
  setName: (name: string) => void;
  setNumber: (num: string) => void;
  setFormation: (formation: string) => void;
  setNameColor: (color: string) => void;
  setNumberColor: (color: string) => void;
  setNameFont: (font: string) => void;
  setShieldUrl: (url: string | null) => void;
}

export const useCustomizerStore = create<CustomizerState>((set) => ({
  selectedModel: null,
  selectedPattern: null,
  syncShirtShorts: true,
  activeTab: 'Modelo',
  subTab: 'Camisa',
  
  name: 'SEU NOME',
  number: '10',
  formation: 'escudo-esq-nome-dir',
  nameColor: '#ffffff',
  numberColor: '#ffffff',
  nameFont: 'Arial',
  shieldUrl: null,
  
  setSelectedModel: (id) => set({ selectedModel: id }),
  setSelectedPattern: (id) => set({ selectedPattern: id }),
  setSyncShirtShorts: (sync) => set({ syncShirtShorts: sync }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSubTab: (tab) => set({ subTab: tab }),

  setName: (name) => set({ name }),
  setNumber: (number) => set({ number }),
  setFormation: (formation) => set({ formation }),
  setNameColor: (nameColor) => set({ nameColor }),
  setNumberColor: (numberColor) => set({ numberColor }),
  setNameFont: (nameFont) => set({ nameFont }),
  setShieldUrl: (shieldUrl) => set({ shieldUrl }),
}));
