import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Plus, Save, X, Move, Maximize, RotateCcw, Eye, Layers } from 'lucide-react';
import { generateFinalTexture, UVZone } from '../lib/textureGenerator';

const TIPOS_ZONA = [
  { id: 'logo', label: 'Logo / Escudo' },
  { id: 'text', label: 'Texto / Nome' },
  { id: 'number', label: 'Número' },
  { id: 'sponsor', label: 'Patrocinador' },
];

export default function ZoneEditor({ referenceUrl, initialZones = [], onSave, onClose }: any) {
  const [zonas, setZonas] = useState<UVZone[]>(initialZones);
  const [idSelecionado, setIdSelecionado] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.3);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const canvasSize = 2048;
  const zonaSelecionada = zonas.find(z => z.id === idSelecionado);


  const updateZona = (id: string, updates: Partial<UVZone>) => {
    setZonas(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (idSelecionado) return; // Don't create if one is selected, we might be dragging
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / canvasSize);
    const y = (e.clientY - rect.top) / (rect.height / canvasSize);

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

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-[60] flex flex-col font-sans">
      <header className="flex justify-between items-center p-4 bg-[#111] border-b border-[#222]">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-bold text-lg">Editor de Gabarito UV</h1>
          <span className="text-gray-500 text-xs">Clique no mapa para posicionar áreas</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onSave(zonas)} className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded-xl flex items-center gap-2 transition-all">
            <Save className="w-4 h-4" /> Salvar Gabarito
          </button>
          <button onClick={onClose} className="bg-[#222] hover:bg-[#333] text-white py-2 px-6 rounded-xl flex items-center gap-2 transition-all">
            <X className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Painel Esquerdo */}
        <div className="w-72 bg-[#111] border-r border-[#222] p-4 flex flex-col gap-4 overflow-y-auto">
          <button 
            onClick={() => setIdSelecionado(null)}
            className="w-full py-3 bg-[#1a1a1a] border border-dashed border-gray-700 text-gray-400 rounded-xl flex items-center justify-center gap-2 hover:border-orange-600 hover:text-orange-600 transition-all"
          >
            <Plus className="w-4 h-4" /> Nova Área
          </button>

          <div className="space-y-2 mt-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">Zonas ({zonas.length})</p>
            {zonas.map(z => (
              <div 
                key={z.id}
                onClick={() => setIdSelecionado(z.id)}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${idSelecionado === z.id ? 'border-orange-600 bg-orange-600/10' : 'border-[#222] bg-[#161616] hover:bg-[#1a1a1a]'}`}
              >
                <div className="flex justify-between items-center">
                  <p className={`font-bold text-sm ${idSelecionado === z.id ? 'text-white' : 'text-gray-400'}`}>{z.name}</p>
                  <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-gray-500">{z.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Viewport 2D */}
        <div className="flex-1 relative bg-[#050505] overflow-auto flex items-center justify-center p-20" ref={containerRef}>
          <div 
            className="relative shadow-2xl bg-[#111] overflow-hidden"
            style={{ 
              width: canvasSize * zoom, 
              height: canvasSize * zoom,
              backgroundColor: '#111',
              position: 'relative'
            }}
            onClick={handleCanvasClick}
          >
            {/* Background Image (UV Template) */}
            {referenceUrl && (
              <img 
                src={referenceUrl} 
                alt="UV Template" 
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{ 
                  filter: 'invert(1) contrast(1.5)', 
                  opacity: 0.6,
                  backgroundColor: '#ffffff'
                }}
              />
            )}

            
            {/* Grid Helper */}
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{ 
              backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)',
              backgroundSize: `${(canvasSize * zoom) / 20}px ${(canvasSize * zoom) / 20}px`
            }}></div>
            {zonas.map(z => {
              const isSelected = z.id === idSelecionado;
              return (
                <div
                  key={z.id}
                  onClick={(e) => { e.stopPropagation(); setIdSelecionado(z.id); }}
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
                    zIndex: isSelected ? 10 : 1
                  }}
                >
                  <span className="text-[10px] font-bold text-white bg-black/50 px-1 rounded pointer-events-none">
                    {z.name}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Zoom Control */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
             <button onClick={() => setZoom(prev => Math.min(prev + 0.1, 1))} className="p-2 bg-[#222] text-white rounded-lg hover:bg-[#333]"><Maximize className="w-4 h-4"/></button>
             <button onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.1))} className="p-2 bg-[#222] text-white rounded-lg hover:bg-[#333]"><RotateCcw className="w-4 h-4"/></button>
          </div>
        </div>

        {/* Painel Direito */}
        <div className="w-80 bg-[#111] border-l border-[#222] p-6 flex flex-col gap-6 overflow-y-auto">
          {zonaSelecionada ? (
            <div className="space-y-6">
              <h2 className="text-white font-bold text-lg border-b border-white/5 pb-4">Ajustes da Área</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Identificador</label>
                  <input 
                    type="text"
                    value={zonaSelecionada.name}
                    onChange={e => updateZona(zonaSelecionada.id, { name: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] text-white p-3 rounded-xl outline-none focus:border-orange-600 transition-all text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Tipo de Dado</label>
                  <select 
                    value={zonaSelecionada.type}
                    onChange={e => updateZona(zonaSelecionada.id, { type: e.target.value as any })}
                    className="w-full bg-[#1a1a1a] border border-[#333] text-white p-3 rounded-xl outline-none focus:border-orange-600 transition-all text-sm"
                  >
                    {TIPOS_ZONA.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Posição X</label>
                    <input 
                      type="number"
                      value={Math.round(zonaSelecionada.x)}
                      onChange={e => updateZona(zonaSelecionada.id, { x: parseInt(e.target.value) })}
                      className="w-full bg-[#1a1a1a] border border-[#333] text-white p-2 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Posição Y</label>
                    <input 
                      type="number"
                      value={Math.round(zonaSelecionada.y)}
                      onChange={e => updateZona(zonaSelecionada.id, { y: parseInt(e.target.value) })}
                      className="w-full bg-[#1a1a1a] border border-[#333] text-white p-2 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Largura (px)</label>
                      <span className="text-orange-600 font-mono text-xs">{Math.round(zonaSelecionada.width)}</span>
                    </div>
                    <input 
                      type="range" min="10" max="1000" step="1"
                      value={zonaSelecionada.width}
                      onChange={e => updateZona(zonaSelecionada.id, { width: parseInt(e.target.value) })}
                      className="w-full accent-orange-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Altura (px)</label>
                      <span className="text-orange-600 font-mono text-xs">{Math.round(zonaSelecionada.height)}</span>
                    </div>
                    <input 
                      type="range" min="10" max="1000" step="1"
                      value={zonaSelecionada.height}
                      onChange={e => updateZona(zonaSelecionada.id, { height: parseInt(e.target.value) })}
                      className="w-full accent-orange-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Rotação</label>
                      <span className="text-orange-600 font-mono text-xs">{zonaSelecionada.rotation}°</span>
                    </div>
                    <input 
                      type="range" min="-180" max="180" step="1"
                      value={zonaSelecionada.rotation}
                      onChange={e => updateZona(zonaSelecionada.id, { rotation: parseInt(e.target.value) })}
                      className="w-full accent-orange-600"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if(window.confirm('Excluir esta área?')) {
                      setZonas(prev => prev.filter(z => z.id !== idSelecionado));
                      setIdSelecionado(null);
                    }
                  }}
                  className="w-full py-4 flex items-center justify-center gap-2 border border-red-900/30 text-red-500 rounded-xl hover:bg-red-500/10 transition-all mt-8 text-sm font-bold"
                >
                  <Trash2 className="w-4 h-4" /> Excluir Área
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-4">
                <Move className="w-6 h-6 text-gray-700" />
              </div>
              <p className="text-gray-400 text-sm font-medium">Nenhuma área selecionada</p>
              <p className="text-gray-600 text-[10px] mt-2">Clique no mapa UV para criar uma nova zona editável.</p>
            </div>
          )}
        </div>
      </div>
      {/* Modal de Preview */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-10">
          <div className="bg-[#111] rounded-2xl overflow-hidden max-w-4xl w-full flex flex-col max-h-full border border-white/10 shadow-2xl">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-orange-500" />
                <h3 className="text-white font-bold">Preview da Textura Composta (2048x2048)</h3>
              </div>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-[#050505] flex items-center justify-center">
              <div className="relative">
                <img src={previewUrl} alt="Preview Final" className="max-w-full h-auto shadow-2xl border border-white/5" />
                <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                  TEXTURA FINAL GERADA
                </div>
              </div>
            </div>
            <div className="p-6 bg-[#161616] flex justify-between items-center">
              <p className="text-gray-500 text-xs italic">
                Esta é a imagem exata que será enviada para o modelo 3D. 
                Se o texto "TESTE" e o retângulo vermelho estiverem aqui, a composição está funcionando.
              </p>
              <button onClick={() => setShowPreview(false)} className="bg-orange-600 text-white px-8 py-2 rounded-xl font-bold">
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function handleCanvasClick(this: any, e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    const canvasSize = 2048;
    // @ts-ignore
    const zoom = this.zoom || 0.3; // This is a bit hacky because I moved it out, let me fix the structure
}

