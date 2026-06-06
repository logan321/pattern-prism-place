import { create } from 'zustand';

export interface Template {
  id: string;
  name: string;
  image: string;
  type: 'gola_padre' | 'gola_o' | 'v_neck' | string;
}

export interface Design {
  id: string;
  name: string;
  thumbnail: string;
  uvMap: string;
}

interface SimulatorState {
  templates: Template[];
  designs: Design[];
  selectedTemplate: Template | null;
  selectedDesign: Design | null;
  
  // Actions
  addTemplate: (template: Template) => void;
  addDesign: (design: Design) => void;
  selectTemplate: (template: Template) => void;
  selectDesign: (design: Design) => void;
}

export const useSimulatorStore = create<SimulatorState>((set) => ({
  templates: [
    { id: '1', name: 'Gola Padre', image: '/uploads/colado-1780761035664.png', type: 'gola_padre' },
  ],
  designs: [
    { id: 'd1', name: 'Design 1', thumbnail: '/uploads/colado-1780761035664.png', uvMap: '/placeholder-uv.png' },
  ],
  selectedTemplate: null,
  selectedDesign: null,

  addTemplate: (template) => set((state) => ({ templates: [...state.templates, template] })),
  addDesign: (design) => set((state) => ({ designs: [...state.designs, design] })),
  selectTemplate: (template) => set({ selectedTemplate: template }),
  selectDesign: (design) => set({ selectedDesign: design }),
}));
