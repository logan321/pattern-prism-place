import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Plus, Save, X, Move, Maximize, RotateCcw, Eye, Layers, Square } from 'lucide-react';
import { UVZone } from '../lib/textureGenerator';

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
  const [zoom, setZoom] = useState(0.8);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const canvasSize = 2048;

  const updateZona = (id: string, updates: Partial<UVZone>) => {
    setZonas(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (idSelecionado !== null) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const startX = (e.clientX - rect.left) / zoom;
    const startY = (e.clientY - rect.top) / zoom;

    const novaId = crypto.randomUUID();
    const nova: UVZone = {
      id: novaId,
      name: `ZONA ${zonas.length + 1}`,
      type: 'text',
      x: startX,
      y: startY,
      width: 100,
      height: 50,
      rotation: 0,
    };
    setZonas(prev => [...prev, nova]);
    setIdSelecionado(novaId);
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-[60] flex flex-col font-sans">
      <header className="flex justify-between items-center p-4 bg-[#111] border-b border-[#222]">
        <h1 className="text-white font-bold text-lg">Editor de Gabarito UV</h1>
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
        {/* Left Panel */}
        <div className="w-72 bg-[#111] border-r border-[#222] p-4 flex flex-col gap-4 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">Mapa UV</p>
          <button 
            onClick={() => setIdSelecionado(null)}
            className="w-full py-3 bg-[#1a1a1a] border border-dashed border-gray-700 text-gray-400 rounded-xl flex items-center justify-center gap-2 hover:border-orange-600 hover:text-orange-600 transition-all"
          >
            <Square className="w-4 h-4" /> Clique para criar áreas
          </button>

          <div className="space-y-2 mt-4">
            {zonas.map(z => (
              <div 
                key={z.id}
                onClick={() => setIdSelecionado(z.id)}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${idSelecionado === z.id ? 'border-orange-600 bg-orange-600/10' : 'border-[#222] bg-[#161616]'}`}
              >
                <p className="font-bold text-sm text-white">{z.name}</p>
                <p className="text-[10px] text-gray-500">{z.type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* UV Canvas Area */}
        <div className="flex-1 relative bg-[#050505] overflow-auto flex items-center justify-center p-10">
          <div 
            className="relative bg-white shadow-2xl cursor-crosshair"
            ref={containerRef}
            style={{ 
              width: canvasSize * zoom, 
              height: canvasSize * zoom,
            }}
            onPointerDown={handlePointerDown}
          >
            {referenceUrl && (
              <img 
                src={referenceUrl} 
                alt="UV Template" 
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
            )}
            
            {zonas.map(z => (
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
                  border: idSelecionado === z.id ? '2px solid #ea580c' : '1px solid #3b82f6',
                  backgroundColor: idSelecionado === z.id ? 'rgba(234, 88, 12, 0.3)' : 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'move',
                  zIndex: idSelecionado === z.id ? 10 : 1
                }}
              >
                <span className="text-[10px] font-bold text-white bg-black/50 px-1">{z.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
