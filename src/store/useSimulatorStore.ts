import { create } from 'zustand';

export interface Template {
  id: string;
  name: string;
  image: string;
  type: string;
  glb_url?: string;
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
  setTemplates: (templates: Template[]) => void;
  addTemplate: (template: Template) => void;
  addDesign: (design: Design) => void;
  selectTemplate: (template: Template) => void;
  selectDesign: (design: Design) => void;
}

export const useSimulatorStore = create<SimulatorState>((set) => ({
  templates: [],
  designs: [
    { id: 'd1', name: 'Design 1', thumbnail: '/uploads/colado-1780761035664.png', uvMap: '/placeholder-uv.png' },
  ],
  selectedTemplate: null,
  selectedDesign: null,

  setTemplates: (templates) => set({ templates }),
  addTemplate: (template) => set((state) => ({ templates: [...state.templates, template] })),
  addDesign: (design) => set((state) => ({ designs: [...state.designs, design] })),
  selectTemplate: (template) => set({ selectedTemplate: template }),
  selectDesign: (design) => set({ selectedDesign: design }),
}));
