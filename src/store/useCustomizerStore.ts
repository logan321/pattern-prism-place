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
  namePosition: 'left' | 'right' | 'center';
  shieldPosition: 'left' | 'right';
  nameColor: string;
  numberColor: string;
  nameFont: string;
  
  setSelectedModel: (id: string | null) => void;
  setSelectedPattern: (id: string | null) => void;
  setSyncShirtShorts: (sync: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSubTab: (tab: string) => void;
  
  // Customization setters
  setName: (name: string) => void;
  setNumber: (num: string) => void;
  setNamePosition: (pos: 'left' | 'right' | 'center') => void;
  setShieldPosition: (pos: 'left' | 'right') => void;
  setNameColor: (color: string) => void;
  setNumberColor: (color: string) => void;
  setNameFont: (font: string) => void;
  
  // High-level formation setter
  setFormation: (type: 'left-shield' | 'right-shield' | 'center-name') => void;
}

export const useCustomizerStore = create<CustomizerState>((set) => ({
  selectedModel: null,
  selectedPattern: null,
  syncShirtShorts: true,
  activeTab: 'Modelo',
  subTab: 'Camisa',
  
  name: 'SEU NOME',
  number: '10',
  namePosition: 'left',
  shieldPosition: 'right',
  nameColor: '#ffffff',
  numberColor: '#ffffff',
  nameFont: 'Arial',
  
  setSelectedModel: (id) => set({ selectedModel: id }),
  setSelectedPattern: (id) => set({ selectedPattern: id }),
  setSyncShirtShorts: (sync) => set({ syncShirtShorts: sync }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSubTab: (tab) => set({ subTab: tab }),

  setName: (name) => set({ name }),
  setNumber: (number) => set({ number }),
  setNamePosition: (namePosition) => set({ namePosition }),
  setShieldPosition: (shieldPosition) => set({ shieldPosition }),
  setNameColor: (nameColor) => set({ nameColor }),
  setNumberColor: (numberColor) => set({ numberColor }),
  setNameFont: (nameFont) => set({ nameFont }),

  setFormation: (type) => {
    if (type === 'left-shield') {
      set({ namePosition: 'right', shieldPosition: 'left' });
    } else if (type === 'right-shield') {
      set({ namePosition: 'left', shieldPosition: 'right' });
    } else {
      set({ namePosition: 'center' });
    }
  }
}));
