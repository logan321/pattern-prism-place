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
    setSelectedPattern
  } = useCustomizerStore();
  const customName = useCustomizerStore(state => state.name);
  const customNumber = useCustomizerStore(state => state.number);
  const nameColor = useCustomizerStore(state => state.nameColor);
  const numberColor = useCustomizerStore(state => state.numberColor);
  const nameFont = useCustomizerStore(state => state.nameFont);
  const formation = useCustomizerStore(state => state.formation);
  const shieldUrl = useCustomizerStore(state => state.shieldUrl);
  
  const setName = useCustomizerStore(state => state.setName);
  const setNumber = useCustomizerStore(state => state.setNumber);
  const setNameColor = useCustomizerStore(state => state.setNameColor);
  const setNumberColor = useCustomizerStore(state => state.setNumberColor);
  const setNameFont = useCustomizerStore(state => state.setNameFont);
  const setFormation = useCustomizerStore(state => state.setFormation);
  const setShieldUrl = useCustomizerStore(state => state.setShieldUrl);

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
            return parts.length > 1 ? parts[1].split('?')[0] : null;
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
            const { data: thumbData } = await supabase.storage.from('textures').createSignedUrl(thumbPath, 3600, {
              transform: {
                width: 200,
                height: 200,
                resize: 'contain'
              }
            });
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
            return parts.length > 1 ? parts[1].split('?')[0] : null;
          };

          const pngPath = getPath(p.image_url);
          const svgPath = getPath(p.svg_url);

          let signedImageUrl = p.image_url;
          let signedSvgUrl = p.svg_url;

          if (pngPath) {
            const { data: pngData } = await supabase.storage.from('textures').createSignedUrl(pngPath, 3600, {
              transform: {
                width: 200,
                height: 200,
                resize: 'contain'
              }
            });
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

  const { data: uvMatrices } = useQuery({
    queryKey: ['uv_matrices'],
    queryFn: async () => {
      const { data, error } = await supabase.from('uv_matrices').select('*');
      if (error) throw error;
      return data;
    }
  });

  const allModels = React.useMemo(() => [...LOCAL_MODELS, ...(models ?? [])], [models]);
  const currentModel = React.useMemo(() => allModels.find(m => m.id === selectedModel), [allModels, selectedModel]);
  
  const FALLBACK_MODEL_URL = golaPadreAsset.url;
  const currentPattern = React.useMemo(() => patterns?.find(p => p.id === selectedPattern), [patterns, selectedPattern]);
  const modelUrl = currentModel?.glb_url || FALLBACK_MODEL_URL;

  // Encontrar as zonas baseadas na UV Matriz vinculada à estampa
  const activeUVMatriz = React.useMemo(() => uvMatrices?.find(m => m.id === currentPattern?.uv_matriz_id), [uvMatrices, currentPattern]);
  
  // Converter as zonas para o formato esperado pelo viewer
  const currentZones = React.useMemo(() => {
    const rawZones = activeUVMatriz?.zones as any[] || [];
    return rawZones.map(z => ({
      id: z.id,
      name: z.name,
      tipo: z.tipo || 'outro',
      uv: z.uv || [0, 0],
      position: z.position || [0, 0, 0]
    }));
  }, [activeUVMatriz]);

  const textureUrl = React.useMemo(() => 
    currentPattern?.svg_url || currentPattern?.image_url || undefined
  , [currentPattern]);

  // Efeito para trocar a vista automaticamente ao mudar de aba
  useEffect(() => {
    if (activeTab === 'Nome/Número') {
      viewerRef.current?.setView('back');
    } else if (activeTab === 'Escudo') {
      viewerRef.current?.setView('front');
    } else if (activeTab === 'Modelo' || activeTab === 'Cores') {
      viewerRef.current?.setView('front');
    }
  }, [activeTab]);

  console.log('=== CURRENT PATTERN ===', currentPattern);
  console.log('=== ACTIVE UV MATRIZ ===', activeUVMatriz);
  console.log('=== ZONES ===', currentZones);



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
      {/* Header */}
      <header className="bg-orange-600 h-16 flex items-center justify-between px-4 shrink-0 shadow-md">
        <div className="flex items-center">
          <div className="bg-white p-1 rounded font-bold text-xs leading-none text-center mr-4">
            SUA<br/>LOGO<br/>AQUI
          </div>
          <h1 className="text-white text-lg font-bold mr-8 hidden md:block">Simulador de Uniformes 3D Jumptec</h1>
          <div className="flex items-center space-x-4">
             <div className="bg-white/20 p-2 rounded-full cursor-pointer hover:bg-white/30">
               <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                 <div className="w-2 h-2 bg-white rounded-full" />
               </div>
             </div>
             {[1,2,3,4].map(i => (
               <div key={i} className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center text-white/50 text-[10px]">
                 {i}
               </div>
             ))}
             <button className="bg-white text-gray-800 text-xs px-3 py-1 rounded font-medium">ver todos</button>
          </div>
        </div>
        
        <Link to="/admin" className="text-white opacity-80 hover:opacity-100 flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-md transition-all">
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Administração</span>
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Sidebar */}
        <aside className="w-20 bg-white border-r flex flex-col shadow-sm z-10">
          <SidebarItem icon={Shirt} label="Modelo" active={activeTab === 'Modelo'} onClick={() => setActiveTab('Modelo')} />
          <SidebarItem icon={Palette} label="Estampas" active={activeTab === 'Cores'} onClick={() => setActiveTab('Cores')} />
          <SidebarItem icon={Scissors} label="Acabamentos" active={activeTab === 'Acabamentos'} onClick={() => setActiveTab('Acabamentos')} />
          <SidebarItem icon={Type} label="Nome/Número" active={activeTab === 'Nome/Número'} onClick={() => setActiveTab('Nome/Número')} />
          <SidebarItem icon={Shield} label="Escudo" active={activeTab === 'Escudo'} onClick={() => setActiveTab('Escudo')} />
          <SidebarItem icon={Upload} label="Upload" active={activeTab === 'Upload'} onClick={() => setActiveTab('Upload')} />
        </aside>

        {/* Panel Content */}
        <aside className="w-64 bg-white border-r p-4 overflow-y-auto z-10">
          <div className="flex items-center mb-6">
            <Shirt className="w-5 h-5 text-orange-600 mr-2" />
            <h2 className="font-bold text-gray-800">Modelos / Estampas</h2>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] text-gray-600">Sincronizar Camisa e Calção</span>
            <button 
              aria-label={syncShirtShorts ? "Desativar sincronização de camisa e calção" : "Ativar sincronização de camisa e calção"}
              onClick={() => setSyncShirtShorts(!syncShirtShorts)}
              className={cn(
                "w-10 h-5 rounded-full transition-colors relative",
                syncShirtShorts ? "bg-black" : "bg-gray-300"
              )}
            >
              <div className={cn(
                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                syncShirtShorts ? "left-6" : "left-1"
              )} />
            </button>
          </div>

          <div className="flex border-b mb-4">
            {['Camisa', 'Calção', 'Meião'].map(tab => (
              <button 
                key={tab}
                onClick={() => setSubTab(tab)}
                className={cn(
                  "px-3 py-1 text-sm font-medium transition-all relative",
                  subTab === tab ? "text-orange-600" : "text-gray-400"
                )}
              >
                {tab}
                {subTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600" />}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {activeTab === 'Modelo' ? (
              allModels.map(model => (
                <ModelCard 
                  key={model.id} 
                  name={model.nome} 
                  thumbnail={model.thumbnail_url}
                  active={selectedModel === model.id} 
                  onClick={() => setSelectedModel(model.id)} 
                />
              ))
            ) : activeTab === 'Cores' ? (
              patterns?.filter(p => p.image_url).map(pattern => (
                <PatternCard 
                  key={pattern.id}
                  name={pattern.name}
                  imageUrl={pattern.image_url}
                  active={selectedPattern === pattern.id}
                  onClick={() => setSelectedPattern(pattern.id)}
                />
              ))
            ) : activeTab === 'Nome/Número' ? (
              <div className="col-span-2 space-y-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Formação de Escudo e Nome</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setFormation('escudo-esq-nome-dir')}
                      className={cn(
                        "text-[10px] py-2 px-1 border rounded-lg transition-all font-medium",
                        formation === 'escudo-esq-nome-dir' ? "bg-orange-600 text-white border-orange-600 shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                      )}
                    >
                      🛡️ Esq | Nome Dir
                    </button>
                    <button 
                      onClick={() => setFormation('escudo-dir-nome-esq')}
                      className={cn(
                        "text-[10px] py-2 px-1 border rounded-lg transition-all font-medium",
                        formation === 'escudo-dir-nome-esq' ? "bg-orange-600 text-white border-orange-600 shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                      )}
                    >
                      Nome Esq | 🛡️ Dir
                    </button>
                    <button 
                      onClick={() => setFormation('nome-centro')}
                      className={cn(
                        "text-[10px] py-2 px-1 border rounded-lg transition-all font-medium",
                        formation === 'nome-centro' ? "bg-orange-600 text-white border-orange-600 shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                      )}
                    >
                      Nome Centro
                    </button>
                    <button 
                      onClick={() => setFormation('so-numero')}
                      className={cn(
                        "text-[10px] py-2 px-1 border rounded-lg transition-all font-medium",
                        formation === 'so-numero' ? "bg-orange-600 text-white border-orange-600 shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                      )}
                    >
                      Só Número
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Nome</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={customName}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 border rounded p-2 text-sm"
                      placeholder="DIGITE O NOME"
                    />
                    <input 
                      type="color" 
                      value={nameColor}
                      onChange={(e) => setNameColor(e.target.value)}
                      className="w-10 h-9 p-1 rounded border cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Número</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={customNumber}
                      onChange={(e) => setNumber(e.target.value)}
                      className="flex-1 border rounded p-2 text-sm"
                      placeholder="00"
                    />
                    <input 
                      type="color" 
                      value={numberColor}
                      onChange={(e) => setNumberColor(e.target.value)}
                      className="w-10 h-9 p-1 rounded border cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Fonte</label>
                  <select 
                    value={nameFont}
                    onChange={(e) => setNameFont(e.target.value)}
                    className="w-full border rounded p-2 text-sm"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Impact">Impact</option>
                  </select>
                </div>
              </div>
            ) : activeTab === 'Escudo' ? (
              <div className="col-span-2 space-y-4">

            ) : activeTab === 'Escudo' ? (
              <div className="col-span-2 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Posição do Escudo e Nome</label>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => setFormation('escudo-esq-nome-dir')}
                      className={cn(
                        "text-[10px] border p-2 rounded transition-colors",
                        formation === 'escudo-esq-nome-dir' ? "bg-orange-50 border-orange-500 text-orange-700 font-bold" : "hover:bg-gray-50"
                      )}
                    >
                      🛡️ ESQUERDA / NOME DIREITA
                    </button>
                    <button 
                      onClick={() => setFormation('escudo-dir-nome-esq')}
                      className={cn(
                        "text-[10px] border p-2 rounded transition-colors",
                        formation === 'escudo-dir-nome-esq' ? "bg-orange-50 border-orange-500 text-orange-700 font-bold" : "hover:bg-gray-50"
                      )}
                    >
                      🛡️ DIREITA / NOME ESQUERDA
                    </button>
                    <button 
                      onClick={() => setFormation('nome-centro')}
                      className={cn(
                        "text-[10px] border p-2 rounded transition-colors",
                        formation === 'nome-centro' ? "bg-orange-50 border-orange-500 text-orange-700 font-bold" : "hover:bg-gray-50"
                      )}
                    >
                      NOME CENTRO
                    </button>
                  </div>
                </div>
                <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center relative">
                  {shieldUrl ? (
                    <div className="relative group">
                      <img src={shieldUrl} alt="Escudo" className="w-16 h-16 mx-auto object-contain mb-2" />
                      <button 
                        onClick={() => setShieldUrl(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-[10px] text-gray-500">Faça upload do seu escudo (PNG/JPG)</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setShieldUrl(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {!shieldUrl && <button className="mt-2 bg-orange-600 text-white text-[10px] px-3 py-1 rounded">Selecionar Arquivo</button>}
                </div>
                <p className="text-[10px] text-gray-400 italic">
                  * Enquanto não houver upload, uma marcação circular aparecerá no modelo.
                </p>
              </div>
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-400 text-xs">
                Em breve disponível
              </div>
            )}
          </div>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 relative bg-gray-200">
          <div className="absolute inset-0">
            <ThreeDViewer 
              ref={viewerRef}
              modelUrl={modelUrl} 
              textureUrl={textureUrl}
              zones={currentZones as any}
              name={customName}
              number={customNumber}
              nameColor={nameColor}
              numberColor={numberColor}
              nameFont={nameFont}
              shieldUrl={shieldUrl}
              formation={formation}
            />

          </div>


          
          {/* Top Actions */}
          <div className="absolute top-6 right-6 flex space-x-3 z-10">
            <button className="bg-orange-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center hover:bg-orange-700 transition-colors">
              <Send className="w-4 h-4 mr-2" />
              Enviar Orçamento
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center hover:bg-blue-700 transition-colors">
              <Save className="w-4 h-4 mr-2" />
              Salvar Simulação
            </button>
          </div>

          {/* Right Controls */}
          <div className="absolute right-6 bottom-32 flex flex-col space-y-3 z-10">
            {/* View Selector */}
            <div className="bg-white p-2 rounded-lg shadow-md border flex flex-col space-y-2">
              <p className="text-[10px] text-gray-400 font-bold uppercase text-center mb-1">Vistas</p>
              <button 
                onClick={() => viewerRef.current?.setView('front')}
                className="p-2 hover:bg-orange-50 hover:text-orange-600 rounded flex flex-col items-center transition-colors group"
                title="Vista Frontal"
              >
                <User className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
                <span className="text-[8px] font-bold">FRENTE</span>
              </button>
              <button 
                onClick={() => viewerRef.current?.setView('back')}
                className="p-2 hover:bg-orange-50 hover:text-orange-600 rounded flex flex-col items-center transition-colors group"
                title="Vista Costas"
              >
                <div className="relative">
                  <User className="w-5 h-5 text-gray-600 group-hover:text-orange-600 opacity-40" />
                  <RotateCcw className="w-3 h-3 absolute -bottom-1 -right-1 text-orange-600" />
                </div>
                <span className="text-[8px] font-bold">COSTAS</span>
              </button>
              <div className="flex space-x-1">
                <button 
                  onClick={() => viewerRef.current?.setView('left')}
                  className="p-2 hover:bg-orange-50 hover:text-orange-600 rounded flex flex-col items-center transition-colors group flex-1"
                  title="Lateral Esquerda"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
                  <span className="text-[8px] font-bold">ESQ</span>
                </button>
                <button 
                  onClick={() => viewerRef.current?.setView('right')}
                  className="p-2 hover:bg-orange-50 hover:text-orange-600 rounded flex flex-col items-center transition-colors group flex-1"
                  title="Lateral Direita"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
                  <span className="text-[8px] font-bold">DIR</span>
                </button>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="bg-white p-2 rounded-lg shadow-md border flex flex-col space-y-3">
              <button 
                onClick={() => viewerRef.current?.zoom('in')}
                aria-label="Aumentar zoom" 
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ZoomIn className="w-5 h-5 text-gray-600" />
              </button>
              <button 
                onClick={() => viewerRef.current?.zoom('out')}
                aria-label="Diminuir zoom" 
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ZoomOut className="w-5 h-5 text-gray-600" />
              </button>
              <div className="h-px bg-gray-200" />
              <div className="flex items-center justify-between space-x-2">
                <Shirt className="w-4 h-4 text-gray-600" />
                <div className="w-8 h-4 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Whatsapp Floating Button */}
          <div className="absolute right-6 bottom-6 flex items-center bg-green-500 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm cursor-pointer hover:bg-green-600 transition-colors z-10">
            <div className="mr-2">
              <p className="text-[10px] opacity-80 leading-none text-right">Atendimento online</p>
              <p className="leading-tight">WhatsApp</p>
            </div>
            <MessageSquare className="w-6 h-6" />
          </div>
        </main>
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
