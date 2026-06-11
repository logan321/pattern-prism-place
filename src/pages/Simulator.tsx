import React, { useRef, useState, useEffect } from 'react';
import { 
  Shirt, 
  Palette, 
  Scissors, 
  Type, 
  Shield, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  MessageSquare,
  Save,
  Send,
  Settings,
  User,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useCustomizerStore } from '../store/useCustomizerStore';
import { ThreeDViewer, type ThreeDViewerRef } from '../components/ThreeDViewer';
import { CustomizerModel } from '../components/CustomizerModel';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { generateFinalTexture, UVZone, UvLayer } from '../lib/textureGenerator';
import * as THREE from 'three';
import { useUvCompositor } from '../hooks/useUvCompositor';
import { FormationSelector } from '../components/FormationSelector';
import golaPadreAsset from '../assets/GOLA_PADRE_otimizado.glb.asset.json';

const LOCAL_MODELS = [
  {
    id: 'local-gola-padre',
    nome: 'Gola Padre (Local)',
    glb_url: golaPadreAsset.url,
    thumbnail_url: null,
    pecas: ['Camisa'],
    categoria_id: null,
    created_at: '',
  },
];

const CMYK_COLORS = [
  '#FFFFFF', '#000000', '#808080', '#C0C0C0', 
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
  '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#008000', '#000080', '#800000', '#808000',
  '#FFC0CB', '#A52A2A', '#002366', '#008080'
];

const ColorSwatch = ({ color, active, onClick }: { color: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-6 h-6 rounded-md border transition-all",
      active ? "border-orange-500 ring-2 ring-orange-500 ring-offset-1 scale-110" : "border-gray-200 hover:border-gray-400"
    )}
    style={{ backgroundColor: color }}
    title={color}
  />
);

const SizeSlider = ({ value, onChange, label }: { value: number, onChange: (val: number) => void, label: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <label className="text-[10px] font-bold text-gray-500 uppercase">{label}</label>
      <span className="text-[10px] text-gray-400">{Math.round(value * 100)}%</span>
    </div>
    <input 
      type="range" 
      min="0.1" 
      max="2" 
      step="0.05"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
    />
  </div>
);



function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center py-4 px-2 w-full transition-colors",
      active ? "text-orange-600 bg-white border-l-4 border-orange-600" : "text-gray-500 hover:bg-gray-50"
    )}
  >
    <Icon className="w-6 h-6 mb-1" />
    <span className="text-[10px] font-medium uppercase tracking-tight text-center leading-none">{label}</span>
  </button>
);

const ModelCard = ({ name, active, onClick, thumbnail }: { name: string, active?: boolean, onClick: () => void, thumbnail?: string | null }) => (
  <div 
    onClick={onClick}
    className={cn(
      "border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md bg-white flex flex-col items-center",
      active ? "border-orange-500 ring-1 ring-orange-500" : "border-gray-200"
    )}
  >
    <div className="w-full aspect-square bg-blue-50 rounded mb-2 flex items-center justify-center overflow-hidden">
      {thumbnail ? (
        <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
      ) : (
        <Shirt className="w-12 h-12 text-blue-400" />
      )}
    </div>
    <span className="text-[10px] text-gray-500 truncate w-full text-center">{name}</span>
  </div>
);

const PatternCard = ({ name, active, onClick, imageUrl }: { name: string, active?: boolean, onClick: () => void, imageUrl: string | null }) => (
  <div 
    onClick={onClick}
    className={cn(
      "border-2 rounded-lg p-1 cursor-pointer transition-all bg-white flex flex-col items-center",
      active 
        ? "border-orange-500 scale-105 shadow-md" 
        : "border-transparent hover:border-gray-300"
    )}
  >
    <div className="w-full aspect-square bg-gray-100 rounded mb-1 overflow-hidden">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            console.error('Erro ao carregar miniatura da estampa:', imageUrl);
            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Erro+Img';
          }}
        />
      ) : (
        <Palette className="w-8 h-8 text-gray-300 m-auto mt-2" />
      )}
    </div>
    <span className="text-[8px] text-gray-500 truncate w-full text-center">{name}</span>
  </div>
);



export default function Simulator() {
  const viewerRef = useRef<ThreeDViewerRef>(null);
  const { 
    activeTab, 
    setActiveTab, 
    subTab, 
    setSubTab, 
    syncShirtShorts, 
    setSyncShirtShorts,
    selectedModel,
    setSelectedModel,
    selectedPattern,
    setSelectedPattern,
    name: customName = 'NOME',
    number: customNumber = '10',
    nameColor,
    numberColor,
    nameFont,
    numberFont,
    formationCostas,
    formationFrente,
    shieldUrl,
    nameSize,
    numberSize,
    shieldSize,
    setName,
    setNumber,
    setNameColor,
    setNumberColor,
    setNameFont,
    setNumberFont,
    setFormationCostas,
    setFormationFrente,
    setShieldUrl,
    setNameSize,
    setNumberSize,
    setShieldSize,
    uvMapZones, 
    uvMapDims, 
    uvLayers, 
    uvTextDrafts, 
    uvBaseUrl,
    setUvMapZones, 
    setUvMapDims, 
    setUvLayers, 
    setUvTextDrafts,
    setUvBaseUrl, 
    clearUvState,
  } = useCustomizerStore();

  const { data: models } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const { data, error } = await supabase.from('modelos').select('*');
      if (error) throw error;
      
      if (!data) return [];

      const modelsWithSignedUrls = await Promise.all(data.map(async (m) => {
        try {
          const getPath = (url: string | null, bucket: string) => {
            if (!url) return null;
            if (url.includes('token=')) return null;
            const marker = `/public/${bucket}/`;
            const parts = url.split(marker);
            if (parts.length <= 1) return null;
            const path = parts[1].split('?')[0];
            return decodeURIComponent(path);
          };

          const glbPath = getPath(m.glb_url, 'models');
          const thumbPath = getPath(m.thumbnail_url, 'textures');

          let signedGlbUrl = m.glb_url;
          let signedThumbUrl = m.thumbnail_url;

          if (glbPath) {
            const { data: glbData } = await supabase.storage.from('models').createSignedUrl(glbPath, 3600);
            if (glbData) signedGlbUrl = glbData.signedUrl;
          }

          if (thumbPath) {
            const { data: thumbData } = await supabase.storage.from('textures').createSignedUrl(thumbPath, 3600);
            if (thumbData) signedThumbUrl = thumbData.signedUrl;
          }

          return {
            ...m,
            glb_url: signedGlbUrl,
            thumbnail_url: signedThumbUrl
          };
        } catch (err) {
          return m;
        }
      }));

      return modelsWithSignedUrls;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  const { data: patterns } = useQuery({
    queryKey: ['patterns'],
    queryFn: async () => {
      const { data, error } = await supabase.from('patterns').select('*');
      if (error) throw error;
      
      if (!data || data.length === 0) return [];

      const patternsWithSignedUrls = await Promise.all(data.map(async (p) => {
        try {
          const getPath = (url: string | null) => {
            if (!url) return null;
            if (url.includes('token=')) return null;
            const marker = '/public/textures/';
            const parts = url.split(marker);
            if (parts.length <= 1) return null;
            const path = parts[1].split('?')[0];
            return decodeURIComponent(path);
          };

          const pngPath = getPath(p.image_url);
          const svgPath = getPath(p.svg_url);

          let signedImageUrl = p.image_url;
          let signedSvgUrl = p.svg_url;

          if (pngPath) {
            const { data: pngData } = await supabase.storage.from('textures').createSignedUrl(pngPath, 3600);
            if (pngData) signedImageUrl = pngData.signedUrl;
          }

          if (svgPath) {
            const { data: svgData } = await supabase.storage.from('textures').createSignedUrl(svgPath, 3600);
            if (svgData) signedSvgUrl = svgData.signedUrl;
          }

          return {
            ...p,
            image_url: signedImageUrl,
            svg_url: signedSvgUrl
          };
        } catch (err) {
          console.error('Erro ao gerar URL assinada para estampa:', p.id, err);
          return p;
        }
      }));

      return patternsWithSignedUrls;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const allModels = React.useMemo(() => [...LOCAL_MODELS, ...(models ?? [])], [models]);
  
  // Auto-selecionar primeiro modelo e estampa se nenhum estiver selecionado
  useEffect(() => {
    if (!selectedModel && allModels.length > 0) {
      setSelectedModel(allModels[0].id);
    }
  }, [allModels, selectedModel, setSelectedModel]);

  useEffect(() => {
    if (!selectedPattern && patterns && patterns.length > 0) {
      setSelectedPattern(patterns[0].id);
    }
  }, [patterns, selectedPattern, setSelectedPattern]);

  const currentPattern = React.useMemo(() => patterns?.find(p => p.id === selectedPattern), [patterns, selectedPattern]);

  const textureUrl = React.useMemo(() => 
    currentPattern?.svg_url || currentPattern?.image_url || undefined
  , [currentPattern]);

  const uvZonesActive = Object.keys(uvMapZones).length > 0;

  const uvComposite = useUvCompositor({
    baseUrl: (textureUrl || uvBaseUrl) || null,
    zones: uvMapZones,
    layers: uvLayers,
    uvWidth: uvMapDims.w,
    uvHeight: uvMapDims.h,
  });

  // Quando o padrão (pattern) selecionado mudar, busca o UV map vinculado
  useEffect(() => {
    let cancelled = false;
    // Usamos uv_matriz_id que já existe no pattern como referência para carregar a matriz se necessário
    // ou se o pattern tiver um uv_map_id (assumindo que pode ser adicionado futuramente)
    const mapId = (currentPattern as any)?.uv_matriz_id;
    if (!mapId) {
      clearUvState();
      return;
    }
    (async () => {
      // Nota: Certifique-se que a tabela 'uv_maps' existe ou use 'uv_matrices' se for o caso
      const { data } = await supabase
        .from('uv_matrices') 
        .select('image_url:reference_url, uv_zones:zones')
        .eq('id', mapId)
        .maybeSingle();
      if (cancelled || !data) return;
      
      const d = data as any;
      setUvBaseUrl(d.image_url ?? null);
      const zonesMap: Record<string, any> = {};
      if (Array.isArray(d.uv_zones)) {
        d.uv_zones.forEach((z: any) => {
          // Converter coordenadas de porcentagem para pixels (canvas do compositor usa pixels)
          const rect = {
            x: (z.xPercent / 100) * 2048,
            y: (z.yPercent / 100) * 2048,
            width: (z.widthPercent / 100) * 2048,
            height: (z.heightPercent / 100) * 2048,
            rotation: (z.rotation || 0) * (Math.PI / 180)
          };
          zonesMap[z.name || z.id] = rect;
        });
      } else if (d.uv_zones && typeof d.uv_zones === 'object') {
        Object.keys(d.uv_zones).forEach(key => {
          const z = d.uv_zones[key];
          zonesMap[key] = {
            x: (z.xPercent / 100) * 2048,
            y: (z.yPercent / 100) * 2048,
            width: (z.widthPercent / 100) * 2048,
            height: (z.heightPercent / 100) * 2048,
            rotation: (z.rotation || 0) * (Math.PI / 180)
          };
        });
      }
      setUvMapZones(zonesMap);
      setUvMapDims({ w: (d as any).uv_width ?? 2048, h: (d as any).uv_height ?? 2048 });
      setUvLayers([]);
      setUvTextDrafts({});

      // Aplicar padrões automáticos solicitados pelo usuário baseados na formação ativa
      
      const autoLayers: UvLayer[] = [];
      const autoDrafts: Record<string, string> = {};

      const DEFAULT_SHIELD = 'https://vjhzocuofmbtmgyfxtqy.supabase.co/storage/v1/object/public/textures/shield_placeholder.png';

      // 1. Lógica FRENTE (Formações C e D)
      if (formationFrente === 'C') {
        // Formação C: NOME na zona PEITO ESQUERDO + ESCUDO na zona PEITO DIREITO
        if (zonesMap['PEITO ESQUERDO']) {
          autoLayers.push({
            id: `PEITO_ESQUERDO_text_${Date.now()}`,
            zoneKey: 'PEITO ESQUERDO',
            type: 'text',
            content: customName || 'NOME',
            color: nameColor,
            fontFamily: nameFont,
            fontWeight: 900,
            scale: nameSize
          } as UvLayer);
          autoDrafts['PEITO ESQUERDO'] = customName || 'NOME';
        }
        if (zonesMap['PEITO DIREITO']) {
          autoLayers.push({
            id: `PEITO_DIREITO_image_${Date.now()}`,
            zoneKey: 'PEITO DIREITO',
            type: 'image',
            url: shieldUrl || DEFAULT_SHIELD,
            scale: shieldSize,
            opacity: 1
          } as UvLayer);
        }
      } else {
        // Formação D: ESCUDO na zona PEITO ESQUERDO + NOME na zona PEITO DIREITO
        if (zonesMap['PEITO ESQUERDO']) {
          autoLayers.push({
            id: `PEITO_ESQUERDO_image_${Date.now()}`,
            zoneKey: 'PEITO ESQUERDO',
            type: 'image',
            url: shieldUrl || DEFAULT_SHIELD,
            scale: shieldSize,
            opacity: 1
          } as UvLayer);
        }
        if (zonesMap['PEITO DIREITO']) {
          autoLayers.push({
            id: `PEITO_DIREITO_text_${Date.now()}`,
            zoneKey: 'PEITO DIREITO',
            type: 'text',
            content: customName || 'NOME',
            color: nameColor,
            fontFamily: nameFont,
            fontWeight: 900,
            scale: nameSize
          } as UvLayer);
          autoDrafts['PEITO DIREITO'] = customName || 'NOME';
        }
      }

      // 2. Lógica COSTAS (Formações A e B)
      // NÚMERO é fixo em CENTRO COSTAS em ambas
      if (zonesMap['CENTRO COSTAS']) {
        autoLayers.push({
          id: `CENTRO_COSTAS_text_${Date.now()}`,
          zoneKey: 'CENTRO COSTAS',
          type: 'text',
          content: customNumber || '10',
          color: numberColor,
          fontFamily: numberFont,
          fontWeight: 900,
          scale: numberSize
        } as UvLayer);
        autoDrafts['CENTRO COSTAS'] = customNumber || '10';
      }

      if (formationCostas === 'A') {
        // Formação A: NOME na zona NOME COSTA TOPO
        if (zonesMap['NOME COSTA TOPO']) {
          autoLayers.push({
            id: `NOME_COSTA_TOPO_text_${Date.now()}`,
            zoneKey: 'NOME COSTA TOPO',
            type: 'text',
            content: customName || 'NOME',
            color: nameColor,
            fontFamily: nameFont,
            fontWeight: 900,
            scale: nameSize
          } as UvLayer);
          autoDrafts['NOME COSTA TOPO'] = customName || 'NOME';
        }
      } else {
        // Formação B: NOME na zona NOME COSTA FUNDO
        if (zonesMap['NOME COSTA FUNDO']) {
          autoLayers.push({
            id: `NOME_COSTA_FUNDO_text_${Date.now()}`,
            zoneKey: 'NOME COSTA FUNDO',
            type: 'text',
            content: customName || 'NOME',
            color: nameColor,
            fontFamily: nameFont,
            fontWeight: 900,
            scale: nameSize
          } as UvLayer);
          autoDrafts['NOME COSTA FUNDO'] = customName || 'NOME';
        }
      }

      setUvLayers(autoLayers);
      setUvTextDrafts(autoDrafts);
    })();
    return () => { cancelled = true; };
  }, [selectedPattern, customName, customNumber, shieldUrl, nameColor, numberColor, nameFont, numberFont, formationCostas, formationFrente, nameSize, numberSize, shieldSize]);

  // Funções para manipular layers de texto
  const uvTextCommitRef = useRef<number | null>(null);

  const setUvLayerText = (zoneKey: string, content: string) => {
    setUvTextDrafts(prev => ({ ...prev, [zoneKey]: content }));
    if (uvTextCommitRef.current != null) window.clearTimeout(uvTextCommitRef.current);
    uvTextCommitRef.current = window.setTimeout(() => {
      uvTextCommitRef.current = null;
      setUvLayers(prev => {
        const existing = prev.find(l => l.zoneKey === zoneKey && l.type === 'text');
        if (existing) {
          if (!content) return prev.filter(l => l !== existing);
          return prev.map(l => l === existing
            ? { ...l, content, color: nameColor, fontFamily: nameFont, fontWeight: 900 } as UvLayer
            : l);
        }
        if (!content) return prev;
        return [...prev, {
          id: `${zoneKey}_${Date.now()}`, zoneKey, type: 'text',
          content, color: nameColor, fontFamily: nameFont, fontWeight: 900
        } as UvLayer];
      });
    }, 180);
  };

  const setUvLayerImage = (zoneKey: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : '';
      if (!url) return;
      setUvLayers(prev => [
        ...prev.filter(l => !(l.zoneKey === zoneKey && l.type === 'image')),
        { id: `${zoneKey}_image_${Date.now()}`, zoneKey, type: 'image', url, scale: 0.9, opacity: 1 } as UvLayer,
      ]);
    };
    reader.readAsDataURL(file);
  };

  const removeUvLayer = (zoneKey: string) => {
    setUvLayers(prev => prev.filter(l => l.zoneKey !== zoneKey));
    setUvTextDrafts(prev => ({ ...prev, [zoneKey]: '' }));
  };


  const { data: uvMatrices } = useQuery({
    queryKey: ['uv_matrices'],
    queryFn: async () => {
      const { data, error } = await supabase.from('uv_matrices').select('*');
      if (error) throw error;
      return data;
    },
    staleTime: 0, // Garante que pegue sempre a versão mais recente ao mudar de página
  });

  const currentModel = React.useMemo(() => allModels.find(m => m.id === selectedModel), [allModels, selectedModel]);
  
  const FALLBACK_MODEL_URL = golaPadreAsset.url;
  const modelUrl = currentModel?.glb_url || FALLBACK_MODEL_URL;

  // Encontrar as zonas baseadas na UV Matriz vinculada à estampa ou modelo
  const activeUVMatriz = React.useMemo(() => {
    if (!uvMatrices) return null;

    // 1. Tentar encontrar a matriz vinculada ao modelo atual (pelo ID)
    let matriz = uvMatrices.find(m => m.modelo_id === selectedModel);
    
    // 2. Se for o modelo local e não achou por ID, tenta a que não tem modelo_id
    if (!matriz && selectedModel === 'local-gola-padre') {
      matriz = uvMatrices.find(m => !m.modelo_id);
    }

    // 3. Tentar pela estampa selecionada
    if (!matriz && currentPattern?.uv_matriz_id) {
      matriz = uvMatrices.find(m => m.id === currentPattern.uv_matriz_id);
    }
    
    // 4. Fallback: Se não encontrou nada específico para o modelo, 
    // e existe uma matriz marcada como "mestra" (sem modelo_id), usamos ela.
    if (!matriz) {
      matriz = uvMatrices.find(m => !m.modelo_id);
    }

    // 5. Último recurso: pega a primeira
    if (!matriz && uvMatrices.length > 0) {
      matriz = uvMatrices[0];
    }
    
    if (matriz) {
      console.log(`Simulator: UV Matriz Ativa: ${matriz.name} (Zonas: ${matriz.zones ? (matriz.zones as any).length : 0})`);
    }
    return matriz;
  }, [uvMatrices, selectedModel, currentPattern]);


  // Efeito para trocar a vista automaticamente ao mudar de aba - REMOVIDO a pedido do usuário
  useEffect(() => {
    // Comportamento de rotação automática desativado para melhorar a experiência de edição manual
  }, [activeTab]);

  const [finalTexture, setFinalTexture] = useState<THREE.CanvasTexture | undefined>(undefined);

  useEffect(() => {
    let active = true;
    const updateTexture = async () => {
      if (!active) return;
      try {
        let canvas: HTMLCanvasElement;
        if (uvZonesActive && uvComposite.canvas && uvComposite.ready) {
          // Novo sistema: usa o canvas do compositor UV
          canvas = uvComposite.canvas;
        } else {
          // Sistema legado: textureGenerator
          canvas = await generateFinalTexture({
            baseTextureUrl: textureUrl,
            zones: (activeUVMatriz?.zones as unknown as UVZone[]) || [],
            customizations: {
              name: customName,
              number: customNumber,
              shieldUrl,
              nameColor,
              numberColor,
              nameFont,
              numberFont,
            },
          });
        }
        if (!active) return;
        const tex = new THREE.CanvasTexture(canvas);
        tex.flipY = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        setFinalTexture(tex);
      } catch (err) {
        console.error('Error generating final texture:', err);
      }
    };
    updateTexture();
    return () => { active = false; };
  }, [
    textureUrl, activeUVMatriz, customName, customNumber,
    shieldUrl, nameColor, numberColor, nameFont, numberFont,
    uvZonesActive, uvComposite.canvas, uvComposite.version, uvComposite.ready
  ]);

  // Logs removidos para evitar poluição no console e possíveis erros de hook indiretos

  // Efeito para sincronizar layers quando os dados de customização mudam
  useEffect(() => {
    if (!uvZonesActive) return;

    setUvLayers(prev => prev.map(layer => {
      if (layer.type === 'text') {
        if (layer.zoneKey.includes('PEITO DIREITO') || layer.zoneKey.includes('PEITO ESQUERDO') || layer.zoneKey.includes('NOME COSTA TOPO') || layer.zoneKey.includes('NOME COSTA FUNDO')) {
          return { ...layer, content: customName || 'NOME', color: nameColor, fontFamily: nameFont, scale: nameSize };
        }
        if (layer.zoneKey.includes('CENTRO COSTAS')) {
          return { ...layer, content: customNumber || '10', color: numberColor, fontFamily: numberFont, scale: numberSize };
        }
      }
      if (layer.type === 'image' && (layer.zoneKey.includes('PEITO ESQUERDO') || layer.zoneKey.includes('PEITO DIREITO'))) {
        const DEFAULT_SHIELD = 'https://vjhzocuofmbtmgyfxtqy.supabase.co/storage/v1/object/public/textures/shield_placeholder.png';
        return { ...layer, url: shieldUrl || DEFAULT_SHIELD, scale: shieldSize };
      }
      return layer;
    }));
  }, [customName, customNumber, shieldUrl, nameColor, numberColor, nameFont, numberFont, nameSize, numberSize, shieldSize, uvZonesActive]);

  return (
    <>

      <Helmet>
        <title>Simulador de Uniformes 3D Jumptec | Macro Master</title>
        <meta name="description" content="Personalize uniformes esportivos em 3D em tempo real com o simulador Macro Master. Escolha cores, padrões, números e logos." />
        <link rel="canonical" href="https://pattern-prism-place.lovable.app/" />
        <meta property="og:title" content="Simulador de Uniformes 3D Jumptec | Macro Master" />
        <meta property="og:description" content="Personalize uniformes esportivos em 3D em tempo real com o simulador Macro Master." />
        <meta property="og:url" content="https://pattern-prism-place.lovable.app/" />
        <meta property="og:type" content="website" />
      </Helmet>
    <div className="flex flex-col h-screen bg-[#f0f0f0] font-sans overflow-hidden">
      {/* Header - Aumentado para mobile */}
      <header className="bg-orange-600 h-14 md:h-16 flex items-center justify-between px-3 shrink-0 shadow-md z-20">
        <div className="flex items-center">
          <div className="bg-white p-1 rounded font-bold text-[8px] md:text-xs leading-none text-center mr-2 md:mr-4">
            SUA<br/>LOGO<br/>AQUI
          </div>
          <h1 className="text-white text-sm md:text-lg font-bold mr-4">Jumptec 3D</h1>
        </div>
        
        <div className="flex items-center space-x-2">
            <button className="bg-white/20 p-2 rounded-full text-white"><Settings className="w-4 h-4"/></button>
            <Link to="/admin" className="text-white bg-white/10 px-3 py-1 rounded text-xs font-medium">Admin</Link>
        </div>
      </header>

      <div className="flex flex-col-reverse md:flex-row flex-1 overflow-hidden">
        {/* Main Sidebar */}
        <aside className="w-full md:w-20 bg-white border-t md:border-t-0 md:border-r flex md:flex-col shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:shadow-none z-30">
          <SidebarItem icon={Shirt} label="Modelo" active={activeTab === 'Modelo'} onClick={() => setActiveTab('Modelo')} />
          <SidebarItem icon={Palette} label="Estampas" active={activeTab === 'Cores'} onClick={() => setActiveTab('Cores')} />
          <SidebarItem icon={Scissors} label="Acab." active={activeTab === 'Acabamentos'} onClick={() => setActiveTab('Acabamentos')} />
          <SidebarItem icon={Type} label="Texto" active={activeTab === 'Nome/Número'} onClick={() => setActiveTab('Nome/Número')} />
          <SidebarItem icon={Shield} label="Escudo" active={activeTab === 'Escudo'} onClick={() => setActiveTab('Escudo')} />
        </aside>

        {/* Panel Content - Ajustado para mobile */}
        <aside className="w-full md:w-80 bg-white md:border-r p-4 overflow-y-auto z-20 h-[35vh] md:h-auto border-b md:border-b-0">
           {/* Conteúdo do painel mantido, mas com ajustes visuais para mobile */}
           {activeTab === 'Modelo' ? (
              <div className="grid grid-cols-3 gap-2">
                {allModels.map(model => (
                    <ModelCard key={model.id} name={model.nome} thumbnail={model.thumbnail_url} active={selectedModel === model.id} onClick={() => setSelectedModel(model.id)} />
                ))}
              </div>
           ) : activeTab === 'Cores' ? (
              <div className="grid grid-cols-4 gap-2">
                {patterns?.filter(p => p.image_url).map(pattern => (
                    <PatternCard key={pattern.id} name={pattern.name} imageUrl={pattern.image_url} active={selectedPattern === pattern.id} onClick={() => setSelectedPattern(pattern.id)} />
                ))}
              </div>
           ) : (
             <div className="text-xs text-gray-500">Selecione uma opção</div>
           )}
        </aside>

        {/* Preview Area */}
        <main className="flex-1 relative bg-gray-200">
          <div className="absolute inset-0 z-0">
            <ThreeDViewer 
              ref={viewerRef}
              modelUrl={modelUrl} 
              finalTexture={finalTexture}
              customization={{ name: customName, number: customNumber, nameColor, numberColor, nameFont, shieldUrl }}
            />
          </div>
          
          {/* Top Actions - Compactadas */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2 z-10">
            <button className="bg-orange-600 text-white p-2 rounded-full shadow-lg"><Send className="w-4 h-4" /></button>
            <button className="bg-blue-600 text-white p-2 rounded-full shadow-lg"><Save className="w-4 h-4" /></button>
          </div>

          {/* Right Controls - Ajustados */}
          <div className="absolute right-3 bottom-4 flex flex-col space-y-2 z-10">
            <button onClick={() => viewerRef.current?.zoom('in')} className="bg-white p-2 rounded-full shadow-md"><ZoomIn className="w-5 h-5"/></button>
            <button onClick={() => viewerRef.current?.zoom('out')} className="bg-white p-2 rounded-full shadow-md"><ZoomOut className="w-5 h-5"/></button>
          </div>
        </main>
      </div>
    </div>

      {/* Footer */}
      <footer className="bg-[#333] text-white h-10 flex items-center justify-center text-[10px] shrink-0 border-t border-gray-700">
        <span className="mr-4">2025 Jumptec. Todos os direitos reservados.</span>
        <div className="font-black italic text-lg tracking-tighter flex items-center">
          JUMP<span className="text-orange-500">TEC</span>
        </div>
      </footer>
    </div>
    </>
  );
}
