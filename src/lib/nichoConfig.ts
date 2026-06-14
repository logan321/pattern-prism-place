import golaPadreAsset from "../assets/GOLA_PADRE_otimizado.glb.asset.json";

export type Nicho = 'pesca' | 'agro' | 'esportivo';

export interface NichoConfig {
  id: Nicho;
  label: string;
  defaultModelId: string;
  defaultModelUrl: string;
  collars: { id: string; name: string }[];
  sleeves: { id: string; name: string }[];
  cuffs?: { id: string; name: string }[];
}

export const NICHO_CONFIG: Record<Nicho, NichoConfig> = {
  pesca: {
    id: 'pesca',
    label: 'Pesca',
    defaultModelId: 'local-gola-padre',
    defaultModelUrl: golaPadreAsset.url,
    collars: [
      { id: 'padre', name: 'Padre' },
      { id: 'careca', name: 'Careca' },
    ],
    sleeves: [
      { id: 'curta', name: 'Curta' },
      { id: 'longa', name: 'Longa' },
    ],
    cuffs: [
      { id: 'com-dedal', name: 'Com dedal' },
      { id: 'sem-dedal', name: 'Sem dedal' },
    ],
  },
  agro: {
    id: 'agro',
    label: 'Agro',
    defaultModelId: 'local-gola-padre',
    defaultModelUrl: golaPadreAsset.url,
    collars: [
      { id: 'padre', name: 'Padre' },
      { id: 'careca', name: 'Careca' },
    ],
    sleeves: [
      { id: 'curta', name: 'Curta' },
      { id: 'longa', name: 'Longa' },
    ],
    cuffs: [
      { id: 'com-dedal', name: 'Com dedal' },
      { id: 'sem-dedal', name: 'Sem dedal' },
    ],
  },
  esportivo: {
    id: 'esportivo',
    label: 'Esportivo',
    defaultModelId: 'local-gola-padre',
    defaultModelUrl: golaPadreAsset.url,
    collars: [
      { id: 'careca', name: 'Careca' },
      { id: 'v', name: 'V' },
      { id: 'esportiva', name: 'Esportiva' },
    ],
    sleeves: [
      { id: 'curta', name: 'Curta' },
      { id: 'longa', name: 'Longa' },
      { id: 'regata', name: 'Regata' },
    ],
  },
};