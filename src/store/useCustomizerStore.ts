import { create } from 'zustand';
import { UvLayer, UvZoneRect } from '@/lib/textureGenerator';

interface CustomizerState {
  selectedModel: string | null;
  selectedPattern: string | null;
  syncShirtShorts: boolean;
  activeTab: string;
  subTab: string;

  // Customização básica (legado)
  name: string;
  number: string;
  formationCostas: 'A' | 'B';
  formationFrente: 'C' | 'D';
  nameColor: string;
  numberColor: string;
  nameFont: string;
  numberFont: string;
  shieldUrl: string | null;
  nameSize: number;
  numberSize: number;
  shieldSize: number;
  nameOutline: string | null;
  numberOutline: string | null;

  // ─── Sistema UV Zones (novo) ───────────────────────────────────────────
  uvMapZones: Record<string, UvZoneRect>;   // zonas vindas do banco (pixels absolutos)
  uvMapDims: { w: number | null; h: number | null }; // dimensões do UV map
  uvLayers: UvLayer[];                       // layers ativos (texto / imagem)
  uvTextDrafts: Record<string, string>;      // rascunho live do texto (antes do debounce)
  uvBaseUrl: string | null;                  // URL da imagem base do UV map
  patternColorMapping: Record<string, string>; // Mapeamento de cores da estampa ativa (live no simulador)

  setSelectedModel: (id: string | null) => void;
  setSelectedPattern: (id: string | null) => void;
  setSyncShirtShorts: (sync: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSubTab: (tab: string) => void;

  setName: (name: string) => void;
  setNumber: (num: string) => void;
  setFormationCostas: (formation: 'A' | 'B') => void;
  setFormationFrente: (formation: 'C' | 'D') => void;
  setNameColor: (color: string) => void;
  setNumberColor: (color: string) => void;
  setNameFont: (font: string) => void;
  setNumberFont: (font: string) => void;
  setShieldUrl: (url: string | null) => void;
  setNameSize: (size: number) => void;
  setNumberSize: (size: number) => void;
  setShieldSize: (size: number) => void;
  setNameOutline: (color: string | null) => void;
  setNumberOutline: (color: string | null) => void;

  // UV Zones setters
  setUvMapZones: (zones: Record<string, UvZoneRect>) => void;
  setUvMapDims: (dims: { w: number | null; h: number | null }) => void;
  setUvLayers: (layers: UvLayer[] | ((prev: UvLayer[]) => UvLayer[])) => void;
  setUvTextDrafts: (drafts: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  setUvBaseUrl: (url: string | null) => void;
  setPatternColorMapping: (mapping: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  clearUvState: () => void;
}

export const useCustomizerStore = create<CustomizerState>((set) => ({
  selectedModel: 'local-gola-padre',
  selectedPattern: null,
  syncShirtShorts: true,
  activeTab: 'Modelo',
  subTab: 'Camisa',

  name: 'SEU NOME',
  number: '10',
  formationCostas: 'A',
  formationFrente: 'D', // Default: Escudo no Peito Esquerdo + Nome no Peito Direito
  nameColor: '#ffffff',
  numberColor: '#ffffff',
  nameFont: 'Arial',
  numberFont: 'Arial',
  shieldUrl: null,
  nameSize: 0.9,
  numberSize: 0.9,
  shieldSize: 0.9,
  nameOutline: null,
  numberOutline: null,

  // UV zones (inicialmente vazio)
  uvMapZones: {},
  uvMapDims: { w: null, h: null },
  uvLayers: [],
  uvTextDrafts: {},
  uvBaseUrl: null,
  patternColorMapping: {},

  setSelectedModel: (id) => set({ selectedModel: id }),
  setSelectedPattern: (id) => set({ selectedPattern: id, patternColorMapping: {} }),
  setSyncShirtShorts: (sync) => set({ syncShirtShorts: sync }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSubTab: (tab) => set({ subTab: tab }),

  setName: (name) => set({ name }),
  setNumber: (number) => set({ number }),
  setFormationCostas: (formationCostas) => set({ formationCostas }),
  setFormationFrente: (formationFrente) => set({ formationFrente }),
  setNameColor: (nameColor) => set({ nameColor }),
  setNumberColor: (numberColor) => set({ numberColor }),
  setNameFont: (nameFont) => set({ nameFont }),
  setNumberFont: (numberFont) => set({ numberFont }),
  setShieldUrl: (shieldUrl) => set({ shieldUrl }),
  setNameSize: (nameSize) => set({ nameSize }),
  setNumberSize: (numberSize) => set({ numberSize }),
  setShieldSize: (shieldSize) => set({ shieldSize }),
  setNameOutline: (nameOutline) => set({ nameOutline }),
  setNumberOutline: (numberOutline) => set({ numberOutline }),

  setUvMapZones: (uvMapZones) => set({ uvMapZones }),
  setUvMapDims: (uvMapDims) => set({ uvMapDims }),
  setUvLayers: (layers) => set((state) => ({
    uvLayers: typeof layers === 'function' ? layers(state.uvLayers) : layers
  })),
  setUvTextDrafts: (drafts) => set((state) => ({
    uvTextDrafts: typeof drafts === 'function' ? drafts(state.uvTextDrafts) : drafts
  })),
  setUvBaseUrl: (uvBaseUrl) => set({ uvBaseUrl }),
  setPatternColorMapping: (mapping) => set((state) => ({
    patternColorMapping: typeof mapping === 'function' ? mapping(state.patternColorMapping) : mapping
  })),
  clearUvState: () => set({
    uvMapZones: {},
    uvMapDims: { w: null, h: null },
    uvLayers: [],
    uvTextDrafts: {},
    uvBaseUrl: null,
    patternColorMapping: {},
  }),
}));