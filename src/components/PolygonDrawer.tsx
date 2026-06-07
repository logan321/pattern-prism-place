import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Save, Undo, Trash2, Maximize, RotateCcw, X, ZoomIn, ZoomOut, Move, PenTool, Target } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface PolygonDrawerProps {
  imageUrl: string;
  initialPoints?: Point[];
  onSave: (points: Point[]) => void;
  onCancel: () => void;
  width?: number;
  height?: number;
}

export default function PolygonDrawer({
  imageUrl,
  initialPoints = [],
  onSave,
  onCancel,
  width = 2048,
  height = 2048
}: PolygonDrawerProps) {
  const [points, setPoints] = useState<Point[]>(initialPoints);
  const [zoom, setZoom] = useState(0.5);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragPointIndex, setDragPointIndex] = useState<number | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Handle zooming with scroll
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.5), 4));
  };

  const getRelativeCoords = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    
    // Calculate position relative to the SVG, then account for zoom and offset
    const x = (clientX - rect.left) / zoom;
    const y = (clientY - rect.top) / zoom;
    
    // Convert to percentage (0-100)
    return {
      x: (x / width) * 100,
      y: (y / height) * 100
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.altKey || e.button === 1) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }

    const coords = getRelativeCoords(e.clientX, e.clientY);
    
    // Check if clicking near an existing point to drag
    const pointIndex = points.findIndex(p => {
      const dx = (p.x - coords.x) * (width / 100);
      const dy = (p.y - coords.y) * (height / 100);
      return Math.sqrt(dx * dx + dy * dy) < 10 / zoom; // 10px radius
    });

    if (pointIndex !== -1) {
      setDragPointIndex(pointIndex);
      setIsDragging(true);
    } else {
      // Add new point
      setPoints([...points, coords]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isDragging && dragPointIndex !== null) {
      const coords = getRelativeCoords(e.clientX, e.clientY);
      const newPoints = [...points];
      newPoints[dragPointIndex] = coords;
      setPoints(newPoints);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragPointIndex(null);
    setIsPanning(false);
  };

  const handleUndo = () => {
    setPoints(points.slice(0, -1));
  };

  const handleClear = () => {
    if (confirm('Limpar todos os pontos?')) {
      setPoints([]);
    }
  };

  const handleSave = () => {
    onSave(points);
  };

  const polygonPointsString = points
    .map(p => `${(p.x / 100) * width},${(p.y / 100) * height}`)
    .join(' ');

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/95 z-[100] flex flex-col animate-in fade-in duration-300">
      <header className="flex justify-between items-center p-4 bg-[#111] border-b border-[#222]">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-lg text-white">
            <PenTool size={20} />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-none">Editor de Contorno</h2>
            <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest font-bold">Desenhe o polígono sobre a matriz UV</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleUndo} 
            disabled={points.length === 0}
            className="bg-[#222] hover:bg-[#333] text-white py-2 px-4 rounded-xl flex items-center gap-2 transition-all font-bold text-sm disabled:opacity-50"
          >
            <Undo className="w-4 h-4" /> Desfazer
          </button>
          <button 
            onClick={handleClear} 
            disabled={points.length === 0}
            className="bg-[#222] hover:bg-red-900/20 text-red-500 py-2 px-4 rounded-xl flex items-center gap-2 transition-all font-bold text-sm disabled:opacity-50 border border-transparent hover:border-red-900/50"
          >
            <Trash2 className="w-4 h-4" /> Limpar
          </button>
          <div className="w-px h-8 bg-[#222] mx-2" />
          <button 
            onClick={handleSave} 
            className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-lg shadow-orange-600/20"
          >
            <Save className="w-4 h-4" /> Salvar Contorno
          </button>
          <button onClick={onCancel} className="bg-[#222] hover:bg-[#333] text-white py-2 px-4 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden bg-[#050505] cursor-crosshair" onWheel={handleWheel}>
        <div 
          ref={containerRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ 
            transform: `translate(${offset.x}px, ${offset.y}px)`,
          }}
        >
          <div 
            className="relative bg-[#111] shadow-2xl pointer-events-auto"
            style={{ 
              width: width * zoom, 
              height: height * zoom,
            }}
          >
            <img 
              src={imageUrl} 
              alt="UV Template" 
              className="absolute inset-0 w-full h-full object-contain opacity-50 select-none pointer-events-none"
            />
            
            <svg
              ref={svgRef}
              viewBox={`0 0 ${width} ${height}`}
              className="absolute inset-0 w-full h-full"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Grid lines (optional visual aid) */}
              <defs>
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Polygon */}
              {points.length > 2 && (
                <polygon
                  points={polygonPointsString}
                  fill="rgba(234, 88, 12, 0.2)"
                  stroke="#ea580c"
                  strokeWidth={2 / zoom}
                  className="pointer-events-none"
                />
              )}

              {/* Lines connecting points */}
              {points.length > 0 && points.length <= 2 && (
                <polyline
                  points={polygonPointsString}
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth={2 / zoom}
                  className="pointer-events-none"
                />
              )}

              {/* Connecting line to mouse for next point (optional but nice) */}
              
              {/* Points/Handles */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={(p.x / 100) * width}
                    cy={(p.y / 100) * height}
                    r={6 / zoom}
                    fill={dragPointIndex === i ? '#fff' : '#ea580c'}
                    stroke="#fff"
                    strokeWidth={1 / zoom}
                    style={{ cursor: 'move' }}
                  />
                  <text
                    x={(p.x / 100) * width + 10 / zoom}
                    y={(p.y / 100) * height - 10 / zoom}
                    fill="#888"
                    fontSize={10 / zoom}
                    className="select-none pointer-events-none font-mono"
                  >
                    {Math.round(p.x)}%, {Math.round(p.y)}%
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Floating Instruction */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Target size={14} className="text-orange-500" /> Clique para adicionar pontos</span>
          <div className="w-px h-3 bg-white/20" />
          <span className="flex items-center gap-1.5"><Move size={14} className="text-orange-500" /> Alt + arraste para Pan</span>
          <div className="w-px h-3 bg-white/20" />
          <span className="flex items-center gap-1.5"><ZoomIn size={14} className="text-orange-500" /> Scroll para Zoom</span>
        </div>

        {/* HUD Controls */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-2">
          <button 
            onClick={() => setZoom(prev => Math.min(prev + 0.2, 4))} 
            className="p-3 bg-[#111] text-white rounded-xl hover:bg-[#222] border border-[#333] shadow-xl transition-all"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-5 h-5"/>
          </button>
          <button 
            onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))} 
            className="p-3 bg-[#111] text-white rounded-xl hover:bg-[#222] border border-[#333] shadow-xl transition-all"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-5 h-5"/>
          </button>
          <button 
            onClick={() => { setZoom(0.5); setOffset({ x: 0, y: 0 }); }} 
            className="p-3 bg-[#111] text-white rounded-xl hover:bg-[#222] border border-[#333] shadow-xl transition-all"
            title="Resetar Visualização"
          >
            <Maximize className="w-5 h-5"/>
          </button>
          <div className="bg-[#111] px-4 py-2 rounded-xl border border-[#333] text-white text-[10px] font-bold text-center">
            {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}

