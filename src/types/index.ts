export interface Modelo {
  id: string;
  nome: string;
  glb_url: string;
  thumbnail_url: string | null;
  pecas: string[];
  categoria_id: string | null;
  created_at: string;
}

export interface UVMatriz {
  id: string;
  name: string;
  modelo_id: string;
  zones: Record<string, any>;
  svg_url: string | null;
  created_at: string;
}

export interface Estampa {
  id: string;
  name: string;
  image_url: string;
  svg_url: string;
  category: string | null;
  uv_matriz_id: string | null;
  created_at: string;
}
