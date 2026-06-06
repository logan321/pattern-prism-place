import { create } from 'zustand';

export interface SimulatorState {
  // Peças
  activePieces: { camisa: boolean; calcao: boolean; meiao: boolean };
  syncColors: boolean;

  // Aparência
  colors: { 
    camisa: string; 
    calcao: string; 
    meiao: string; 
    gola: string;
    punho: string;
  };
  patterns: { camisa: string | null; calcao: string | null };

  // Acabamentos
  golaType: 'v' | 'redonda' | 'polo';
  punhoType: 'sem' | 'simples' | 'duplo';
  mangaType: 'tradicional' | 'raglan';
  hasBolso: boolean;

  // Textos
  nameText: { camisa: string; calcao: string };
  numberText: { camisa: string; calcao: string };
  fontFamily: string;
  textColor: string;

  // Imagens
  escudo: { position: string; url: string | null };
  patrocinios: Array<{ position: string; url: string }>;

  // Ações
  setColor: (piece: string, color: string) => void;
  setPattern: (piece: string, pattern: string | null) => void;
  togglePiece: (piece: string) => void;
  setSyncColors: (sync: boolean) => void;
  setGolaType: (type: 'v' | 'redonda' | 'polo') => void;
  setPunhoType: (type: 'sem' | 'simples' | 'duplo') => void;
  setMangaType: (type: 'tradicional' | 'raglan') => void;
  setHasBolso: (has: boolean) => void;
  setText: (piece: 'camisa' | 'calcao', type: 'name' | 'number', value: string) => void;
  setFontFamily: (font: string) => void;
  setTextColor: (color: string) => void;
  setEscudo: (position: string, url: string | null) => void;
  addPatrocinio: (position: string, url: string) => void;
  reset: () => void;
}

const initialState = {
  activePieces: { camisa: true; calcao: true; meiao: true },
  syncColors: true,
  colors: { 
    camisa: '#F26522', 
    calcao: '#F26522', 
    meiao: '#F26522', 
    gola: '#FFFFFF',
    punho: '#FFFFFF'
  },
  patterns: { camisa: null, calcao: null },
  golaType: 'v' as const,
  punhoType: 'sem' as const,
  mangaType: 'tradicional' as const,
  hasBolso: false,
  nameText: { camisa: '', calcao: '' },
  numberText: { camisa: '', calcao: '' },
  fontFamily: 'Inter',
  textColor: '#FFFFFF',
  escudo: { position: 'Peito esquerdo', url: null },
  patrocinios: [],
};

export const useSimulatorStore = create<SimulatorState>((set) => ({
  ...initialState,

  setColor: (piece, color) => set((state) => {
    if (state.syncColors && (piece === 'camisa' || piece === 'calcao')) {
      return { 
        colors: { ...state.colors, camisa: color, calcao: color } 
      };
    }
    return { 
      colors: { ...state.colors, [piece]: color } 
    };
  }),

  setPattern: (piece, pattern) => set((state) => ({
    patterns: { ...state.patterns, [piece]: pattern }
  })),

  togglePiece: (piece) => set((state) => ({
    activePieces: { 
      ...state.activePieces, 
      [piece]: !state.activePieces[piece as keyof typeof state.activePieces] 
    }
  })),

  setSyncColors: (sync) => set({ syncColors: sync }),
  setGolaType: (type) => set({ golaType: type }),
  setPunhoType: (type) => set({ punhoType: type }),
  setMangaType: (type) => set({ mangaType: type }),
  setHasBolso: (has) => set({ hasBolso: has }),
  
  setText: (piece, type, value) => set((state) => ({
    [type === 'name' ? 'nameText' : 'numberText']: {
      ...state[type === 'name' ? 'nameText' : 'numberText'],
      [piece]: value
    }
  })),

  setFontFamily: (font) => set({ fontFamily: font }),
  setTextColor: (color) => set({ textColor: color }),
  setEscudo: (position, url) => set({ escudo: { position, url } }),
  addPatrocinio: (position, url) => set((state) => ({
    patrocinios: [...state.patrocinios, { position, url }]
  })),

  reset: () => set(initialState),
}));
