import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Save, X, Move, Maximize, RotateCcw, Eye, Layers, Square, Crosshair, Target } from 'lucide-react';
import { UVZone, generateFinalTexture } from '../lib/textureGenerator';

const TIPOS_ZONA = [
  { id: 'logo', label: 'Logo / Escudo' },
  { id: 'text', label: 'Texto / Nome' },
  { id: 'number', label: 'Número' },
  { id: 'sponsor', label: 'Patrocinador' },
];

export default function ZoneEditor({ referenceUrl, initialZones = [], onSave, onClose }: any) {
  useEffect(() => {
    console.log('ZoneEditor: referenceUrl is', referenceUrl);
    console.log('ZoneEditor: initialZones count:', initialZones.length);
  }, [referenceUrl, initialZones]);
  const [zonas, setZonas] = useState<UVZone[]>(initialZones);
  const [idSelecionado, setIdSelecionado] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.4);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const canvasSize = 2048;
  const zonaSelecionada = zonas.find(z => z.id === idSelecionado);

  const updateZona = (id: string, updates: Partial<UVZone>) => {
    setZonas(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only create new if clicking on background
    if (e.target !== e.currentTarget) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const novaId = crypto.randomUUID();
    const nova: UVZone = {
      id: novaId,
      name: `ZONA ${zonas.length + 1}`,
      type: 'text',
      x,
      y,
      width: 200,
      height: 100,
      rotation: 0,
    };
    setZonas(prev => [...prev, nova]);
    setIdSelecionado(novaId);
  };

  const handleGeneratePreview = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateFinalTexture({
        baseTextureUrl: referenceUrl,
        zones: zonas,
        customizations: {
          name: 'JOGADOR',
          number: '10',
          nameColor: '#ffffff',
          numberColor: '#ffffff',
          nameFont: 'Arial'
        }
      });
      setPreviewUrl(canvas.toDataURL());
      setShowPreview(true);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar preview');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-[70] flex flex-col animate-in fade-in duration-300">
      <header className="flex justify-between items-center p-4 bg-[#111] border-b border-[#222]">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-lg">
            <Crosshair className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">Gabarito UV Master</h1>
            <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest font-bold">Posicionamento Técnico de Personalização</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleGeneratePreview}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-xl flex items-center gap-2 transition-all font-bold text-sm disabled:opacity-50"
          >
            <Eye className="w-4 h-4" /> {isGenerating ? 'Processando...' : 'Preview Técnico'}
          </button>
          <button onClick={() => onSave(zonas)} className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded-xl flex items-center gap-2 transition-all font-bold text-sm">
            <Save className="w-4 h-4" /> Salvar Gabarito
          </button>
          <button onClick={onClose} className="bg-[#222] hover:bg-[#333] text-white py-2 px-4 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Layer List */}
        <div className="w-72 bg-[#111] border-r border-[#222] p-4 flex flex-col gap-4">
           <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Camadas / Zonas</span>
              <span className="text-[10px] bg-orange-600/20 text-orange-600 px-2 py-0.5 rounded-full font-bold">{zonas.length}</span>
           </div>
           
           <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {zonas.map(z => (
                <div 
                  key={z.id}
                  onClick={() => setIdSelecionado(z.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${idSelecionado === z.id ? 'border-orange-600 bg-orange-600/10' : 'border-[#222] bg-[#161616] hover:bg-[#1a1a1a]'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${idSelecionado === z.id ? 'bg-orange-600 text-white' : 'bg-[#222] text-gray-500'}`}>
                      {z.type === 'text' || z.type === 'number' ? <Layers className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-white">{z.name}</p>
                      <p className="text-[9px] text-gray-500 uppercase font-bold">{z.type}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {zonas.length === 0 && (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#222] rounded-2xl">
                   <p className="text-gray-600 text-xs italic">Nenhuma zona criada.<br/>Clique no mapa para começar.</p>
                </div>
              )}
           </div>
        </div>

        {/* Center - UV Map Canvas */}
        <div className="flex-1 relative bg-[#050505] overflow-auto flex items-center justify-center p-20 select-none">
          <div 
            className="relative bg-white shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-transform duration-200"
            style={{ 
              width: canvasSize * zoom, 
              height: canvasSize * zoom,
              backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)',
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`
            }}
            onClick={handleCanvasClick}
          >
            {referenceUrl ? (
              <img 
                src={referenceUrl} 
                alt="UV Matrix" 
                className="absolute inset-0 w-full h-full object-fill pointer-events-none opacity-100 mix-blend-multiply"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  console.error('Failed to load UV reference image:', referenceUrl);
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                  <Target className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Aguardando Matriz UV...</p>
                </div>
              </div>
            )}
            
            {zonas.map(z => {
              const isSelected = z.id === idSelecionado;
              return (
                <div
                  key={z.id}
                  onPointerDown={(e) => { e.stopPropagation(); setIdSelecionado(z.id); }}
                  style={{
                    position: 'absolute',
                    left: (z.x - z.width/2) * zoom,
                    top: (z.y - z.height/2) * zoom,
                    width: z.width * zoom,
                    height: z.height * zoom,
                    transform: `rotate(${z.rotation}deg)`,
                    border: isSelected ? '2px solid #ea580c' : '1px solid #3b82f6',
                    backgroundColor: isSelected ? 'rgba(234, 88, 12, 0.3)' : 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'move',
                    zIndex: isSelected ? 10 : 1,
                    boxShadow: isSelected ? '0 0 15px rgba(234, 88, 12, 0.5)' : 'none'
                  }}
                >
                  <div className="flex flex-col items-center gap-1 pointer-events-none">
                    <span className="text-[10px] font-bold text-white bg-black/80 px-2 py-0.5 rounded-full shadow-lg">
                      {z.name}
                    </span>
                    <div className="flex gap-1">
                      <span className="text-[8px] font-bold text-gray-400 bg-black/50 px-1 rounded">{Math.round(z.x)}, {Math.round(z.y)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Zoom Controls Overlay */}
          <div className="absolute bottom-8 right-8 flex flex-col gap-2">
             <button onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))} className="p-3 bg-[#111] text-white rounded-xl hover:bg-[#222] border border-[#333] shadow-xl"><Maximize className="w-5 h-5"/></button>
             <button onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.1))} className="p-3 bg-[#111] text-white rounded-xl hover:bg-[#222] border border-[#333] shadow-xl"><RotateCcw className="w-5 h-5"/></button>
             <div className="bg-[#111] px-4 py-2 rounded-xl border border-[#333] text-white text-[10px] font-bold text-center">
                {Math.round(zoom * 100)}%
             </div>
          </div>
        </div>

        {/* Right Panel - Adjustments */}
        <div className="w-80 bg-[#111] border-l border-[#222] p-6 flex flex-col gap-6 overflow-y-auto">
          {zonaSelecionada ? (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between border-b border-[#222] pb-4">
                 <h2 className="text-white font-bold text-lg">Ajustes da Zona</h2>
                 <button onClick={() => {
                   if(confirm('Excluir zona?')) {
                     setZonas(prev => prev.filter(z => z.id !== idSelecionado));
                     setIdSelecionado(null);
                   }
                 }} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nome Identificador</label>
                  <input 
                    type="text"
                    value={zonaSelecionada.name}
                    onChange={e => updateZona(zonaSelecionada.id, { name: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] text-white p-3 rounded-xl outline-none focus:border-orange-600 transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tipo de Personalização</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIPOS_ZONA.map(t => (
                      <button
                        key={t.id}
                        onClick={() => updateZona(zonaSelecionada.id, { type: t.id as any })}
                        className={`p-2 rounded-lg text-[10px] font-bold transition-all border ${zonaSelecionada.type === t.id ? 'bg-orange-600 border-orange-600 text-white' : 'bg-[#1a1a1a] border-[#333] text-gray-500 hover:border-gray-700'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Eixo X</label>
                    <input 
                      type="number"
                      value={Math.round(zonaSelecionada.x)}
                      onChange={e => updateZona(zonaSelecionada.id, { x: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#1a1a1a] border border-[#333] text-white p-2 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Eixo Y</label>
                    <input 
                      type="number"
                      value={Math.round(zonaSelecionada.y)}
                      onChange={e => updateZona(zonaSelecionada.id, { y: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#1a1a1a] border border-[#333] text-white p-2 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-5 pt-4 border-t border-[#222]">
                   <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Largura</label>
                        <span className="text-orange-500 text-[10px] font-mono">{Math.round(zonaSelecionada.width)}px</span>
                      </div>
                      <input type="range" min="10" max="1000" value={zonaSelecionada.width} onChange={e => updateZona(zonaSelecionada.id, { width: parseInt(e.target.value) })} className="w-full h-1.5 bg-[#222] rounded-lg appearance-none cursor-pointer accent-orange-600" />
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Altura</label>
                        <span className="text-orange-500 text-[10px] font-mono">{Math.round(zonaSelecionada.height)}px</span>
                      </div>
                      <input type="range" min="10" max="1000" value={zonaSelecionada.height} onChange={e => updateZona(zonaSelecionada.id, { height: parseInt(e.target.value) })} className="w-full h-1.5 bg-[#222] rounded-lg appearance-none cursor-pointer accent-orange-600" />
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Rotação</label>
                        <span className="text-orange-500 text-[10px] font-mono">{zonaSelecionada.rotation}°</span>
                      </div>
                      <input type="range" min="-180" max="180" value={zonaSelecionada.rotation} onChange={e => updateZona(zonaSelecionada.id, { rotation: parseInt(e.target.value) })} className="w-full h-1.5 bg-[#222] rounded-lg appearance-none cursor-pointer accent-orange-600" />
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mb-4 border border-[#222]">
                <Move className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-white font-bold text-sm">Nenhuma Zona Ativa</h3>
              <p className="text-gray-500 text-[10px] mt-2 leading-relaxed uppercase tracking-tighter">
                Selecione uma zona na lista ao lado ou clique no mapa UV para criar um novo gabarito.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-10 backdrop-blur-md animate-in zoom-in-95 duration-200">
           <div className="bg-[#111] rounded-3xl overflow-hidden max-w-5xl w-full flex flex-col max-h-full border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#161616]">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600/10 rounded-xl flex items-center justify-center">
                       <Layers className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                       <h3 className="text-white font-bold text-lg">Preview Final da Textura</h3>
                       <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Resultado da composição 2048x2048</p>
                    </div>
                 </div>
                 <button onClick={() => setShowPreview(false)} className="bg-[#222] text-white p-2 rounded-full hover:bg-[#333] transition-all">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="flex-1 overflow-auto p-12 bg-black flex items-center justify-center">
                 <img src={previewUrl} alt="Preview Final" className="max-w-full h-auto shadow-[0_0_50px_rgba(234,88,12,0.2)] border border-white/5 bg-white" />
              </div>
              <div className="p-8 bg-[#161616] flex justify-between items-center border-t border-white/5">
                 <div className="max-w-md">
                    <p className="text-white font-bold text-sm mb-1 text-orange-500">Validação Completa</p>
                    <p className="text-gray-500 text-xs">Esta imagem representa exatamente como os itens serão renderizados sobre a malha 3D. Verifique o alinhamento das zonas.</p>
                 </div>
                 <button onClick={() => setShowPreview(false)} className="bg-white text-black px-10 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all shadow-xl">
                    Fechar Visualização
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
