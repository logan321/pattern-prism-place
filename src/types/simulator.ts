export type Peca = 'Camisa' | 'Calção' | 'Meião';

export interface CorConfig {
  base: string;
  cores: string[]; // Up to 5 colors
}

export interface AcabamentoConfig {
  gola: string;
  manga: string;
  punho: string;
}

export interface TextoConfig {
  texto: string;
  fonte: string;
  posicao: { x: number; y: number };
  tamanho: number;
}

export interface PecaConfig {
  modeloId: string;
  cores: CorConfig;
  acabamentos: AcabamentoConfig;
  nome: TextoConfig;
  numero: TextoConfig;
  escudo?: string; // URL
  patrocinio?: string; // URL
}

export interface UniformConfig {
  Camisa: PecaConfig;
  Calção: PecaConfig;
  Meião: PecaConfig;
  sincronizado: boolean;
}

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
}
