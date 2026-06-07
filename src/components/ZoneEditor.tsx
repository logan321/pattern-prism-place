import React, { useState, useRef, useEffect, useContext } from 'react';
import { Trash2, Save, X, Move, Maximize, RotateCcw, Eye, Layers, Square, Crosshair, Target, ExternalLink, PenTool, Share2 } from 'lucide-react';
import { generateFinalTexture } from '../lib/textureGenerator';
import { AppContext, Zone3D } from '../context/AppContext';
import PolygonDrawer from './PolygonDrawer';

const TIPOS_ZONA = [
  { id: 'logo', label: 'Logo / Escudo' },
  { id: 'text', label: 'Texto / Nome' },
  { id: 'number', label: 'Número' },
  { id: 'sponsor', label: 'Patrocinador' },
];

export default function ZoneEditor({ referenceUrl, onClose }: any) {
  const context = useContext(AppContext);
  if (!context) return null;
  const { zones, addZone, updateZone, removeZone, setSelectedZoneId, selectedZoneId } = context;

  const [zoom, setZoom] = useState(0.4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const [showPolygonDrawer, setShowPolygonDrawer] = useState(false);

  const canvasSize = 2048;
  const zonaSelecionada = zones.find((z: Zone3D) => z.id === selectedZoneId);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / (canvasSize * zoom)) * 100;
    const yPercent = ((e.clientY - rect.top) / (canvasSize * zoom)) * 100;

    if (isDrawingPath && zonaSelecionada) {
        const currentPath = zonaSelecionada.pathData || [];
        updateZone(zonaSelecionada.id, { pathData: [...currentPath, { x: xPercent, y: yPercent }] });
        return;
    }
    
    addZone(`ZONA ${zones.length + 1}`, 'front');
  };

  const handleGeneratePreview = async () => {
    setIsGenerating(true);
    try {
      const legacyZones = zones.map((z: Zone3D) => ({
        id: z.id,
        name: z.name,
        type: 'text' as const,
        x: (z.xPercent / 100) * canvasSize,
        y: (z.yPercent / 100) * canvasSize,
        width: (z.widthPercent / 100) * canvasSize,
        height: (z.heightPercent / 100) * canvasSize,
        rotation: z.rotation
      }));

      const canvas = await generateFinalTexture({
        baseTextureUrl: referenceUrl,
        zones: legacyZones,
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
            <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest font-bold">Posicionamento Técnico em Porcentagem</p>
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
          <button onClick={onClose} className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded-xl flex items-center gap-2 transition-all font-bold text-sm">
            <Save className="w-4 h-4" /> Finalizar Edição
          </button>
          <button onClick={onClose} className="bg-[#222] hover:bg-[#333] text-white py-2 px-4 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden p-4 gap-4 bg-[#0a0a0a]">
        {/* Left Panel - Layer List */}
        <div className="w-72 bg-[#161616] rounded-xl border border-[#222] p-4 flex flex-col gap-4 shadow-xl">
           <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Camadas / Zonas</span>
              <span className="text-[10px] bg-orange-600/20 text-orange-600 px-2 py-0.5 rounded-full font-bold">{zones.length}</span>
           </div>
           
           <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {zones.map((z: Zone3D) => (
                <div 
                  key={z.id}
                  onClick={() => setSelectedZoneId(z.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${selectedZoneId === z.id ? 'border-orange-600 bg-orange-600/10' : 'border-[#222] bg-[#161616] hover:bg-[#1a1a1a]'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${selectedZoneId === z.id ? 'bg-orange-600 text-white' : 'bg-[#222] text-gray-500'}`}>
                        {z.shared ? <Share2 className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">{z.name}</p>
                        <p className="text-[9px] text-gray-500 uppercase font-bold">{z.side} {z.shared ? '(Shared)' : ''}</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedZoneId(z.id);
                        window.location.href = '/editor-3d';
                      }}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-orange-500"
                      title="Posicionar no 3D"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {zones.length === 0 && (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#222] rounded-2xl">
                   <p className="text-gray-600 text-xs italic">Nenhuma zona criada.<br/>Clique no mapa para começar.</p>
                </div>
              )}
           </div>
        </div>

        {/* Center - UV Map Canvas */}
        <div className="flex-1 relative bg-[#050505] rounded-xl border border-[#222] overflow-auto flex items-center justify-center p-20 select-none shadow-xl">
          <div 
            className="relative bg-[#f8f8f8] shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-transform duration-200"
            style={{ 
              width: canvasSize * zoom, 
              height: canvasSize * zoom,
              backgroundImage: `
                linear-gradient(45deg, #eee 25%, transparent 25%), 
                linear-gradient(-45deg, #eee 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, #eee 75%), 
                linear-gradient(-45deg, transparent 75%, #eee 75%)
              `,
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
              backgroundPosition: `0 0, 0 ${10 * zoom}px, ${10 * zoom}px -${10 * zoom}px, -${10 * zoom}px 0px`
            }}
            onClick={handleCanvasClick}
          >
            {referenceUrl ? (
              <img 
                src={referenceUrl} 
                alt="UV Matrix" 
                className="absolute inset-0 w-full h-full object-fill pointer-events-none opacity-90"
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
            
            {zones.map((z: Zone3D) => {
              const isSelected = z.id === selectedZoneId;
              const wPixels = (z.widthPercent / 100) * canvasSize;
              const hPixels = (z.heightPercent / 100) * canvasSize;
              const xPixels = (z.xPercent / 100) * canvasSize;
              const yPixels = (z.yPercent / 100) * canvasSize;
              
              return (
                <div
                  key={z.id}
                  onPointerDown={(e) => { e.stopPropagation(); setSelectedZoneId(z.id); }}
                  style={{
                    position: 'absolute',
                    left: (xPixels - wPixels/2) * zoom,
                    top: (yPixels - hPixels/2) * zoom,
                    width: wPixels * zoom,
                    height: hPixels * zoom,
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
                      <span className="text-[8px] font-bold text-gray-400 bg-black/50 px-1 rounded">{Math.round(z.xPercent)}%, {Math.round(z.yPercent)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Path visualization */}
            {zonaSelecionada?.pathData && zonaSelecionada.pathData.length > 0 && (
                <svg 
                    className="absolute inset-0 pointer-events-none" 
                    style={{ width: canvasSize * zoom, height: canvasSize * zoom }}
                >
                    <polyline
                        points={zonaSelecionada.pathData.map(p => `${(p.x/100) * canvasSize * zoom},${(p.y/100) * canvasSize * zoom}`).join(' ')}
                        fill="rgba(234, 88, 12, 0.2)"
                        stroke="#ea580c"
                        strokeWidth="2"
                    />
                    {zonaSelecionada.pathData.map((p, i) => (
                        <circle 
                            key={i} 
                            cx={(p.x/100) * canvasSize * zoom} 
                            cy={(p.y/100) * canvasSize * zoom} 
                            r="3" 
                            fill="#ea580c" 
                        />
                    ))}
                </svg>
            )}
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
        <div className="w-80 bg-[#161616] rounded-xl border border-[#222] p-6 flex flex-col gap-6 overflow-y-auto shadow-xl">
          {zonaSelecionada ? (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between border-b border-[#222] pb-4">
                 <h2 className="text-white font-bold text-lg">Ajustes da Zona</h2>
                 <button onClick={() => {
                   if(confirm('Excluir zona?')) {
                     removeZone(zonaSelecionada.id);
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
                    onChange={e => updateZone(zonaSelecionada.id, { name: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] text-white p-3 rounded-xl outline-none focus:border-orange-600 transition-all text-sm font-medium"
                  />
                </div>

                <div className="flex items-center gap-2 py-2">
                    <button 
                        onClick={() => updateZone(zonaSelecionada.id, { shared: !zonaSelecionada.shared })}
                        className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${zonaSelecionada.shared ? 'bg-orange-600 border-orange-600 text-white' : 'bg-[#1a1a1a] border-[#333] text-gray-500'}`}
                    >
                        <Share2 className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">Compartilhada</span>
                    </button>
                    <button 
                        onClick={() => setShowPolygonDrawer(true)}
                        className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${zonaSelecionada.pathData?.length ? 'bg-orange-600 border-orange-600 text-white' : 'bg-[#1a1a1a] border-[#333] text-gray-500'}`}
                    >
                        <PenTool className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">{zonaSelecionada.pathData?.length ? 'Editar Contorno' : 'Definir Contorno'}</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pos X (%)</label>
                    <input 
                      type="number"
                      value={Math.round(zonaSelecionada.xPercent)}
                      onChange={e => updateZone(zonaSelecionada.id, { xPercent: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#1a1a1a] border border-[#333] text-white p-2 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pos Y (%)</label>
                    <input 
                      type="number"
                      value={Math.round(zonaSelecionada.yPercent)}
                      onChange={e => updateZone(zonaSelecionada.id, { yPercent: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#1a1a1a] border border-[#333] text-white p-2 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-5 pt-4 border-t border-[#222]">
                   <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Largura (%)</label>
                        <span className="text-orange-500 text-[10px] font-mono">{Math.round(zonaSelecionada.widthPercent)}%</span>
                      </div>
                      <input type="range" min="1" max="100" step="0.1" value={zonaSelecionada.widthPercent} onChange={e => updateZone(zonaSelecionada.id, { widthPercent: parseFloat(e.target.value) })} className="w-full h-1.5 bg-[#222] rounded-lg appearance-none cursor-pointer accent-orange-600" />
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Altura (%)</label>
                        <span className="text-orange-500 text-[10px] font-mono">{Math.round(zonaSelecionada.heightPercent)}%</span>
                      </div>
                      <input type="range" min="1" max="100" step="0.1" value={zonaSelecionada.heightPercent} onChange={e => updateZone(zonaSelecionada.id, { heightPercent: parseFloat(e.target.value) })} className="w-full h-1.5 bg-[#222] rounded-lg appearance-none cursor-pointer accent-orange-600" />
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Rotação</label>
                        <span className="text-orange-500 text-[10px] font-mono">{zonaSelecionada.rotation}°</span>
                      </div>
                      <input type="range" min="-180" max="180" value={zonaSelecionada.rotation} onChange={e => updateZone(zonaSelecionada.id, { rotation: parseInt(e.target.value) })} className="w-full h-1.5 bg-[#222] rounded-lg appearance-none cursor-pointer accent-orange-600" />
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
              <div className="p-10 flex items-center justify-center bg-black overflow-hidden flex-1">
                 <img src={previewUrl} className="max-w-full max-h-full object-contain shadow-2xl" alt="Preview" />
              </div>
           </div>
        </div>
      )}
      {showPolygonDrawer && zonaSelecionada && (
        <PolygonDrawer
          imageUrl={referenceUrl}
          initialPoints={zonaSelecionada.pathData || []}
          onSave={(points) => {
            updateZone(zonaSelecionada.id, { pathData: points });
            setShowPolygonDrawer(false);
          }}
          onCancel={() => setShowPolygonDrawer(false)}
        />
      )}
    </div>
  );
}
