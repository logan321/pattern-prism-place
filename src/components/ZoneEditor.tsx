import React, { useState, useRef, Suspense, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Trash2, Plus, Save, X } from 'lucide-react';
import * as THREE from 'three';

interface ZonaMarcada {
  id: string;
  name: string;
  type: 'text' | 'logo' | 'sponsor' | 'number';
  uvCenter: [number, number];
  width: number;
  height: number;
  rotation: number;
}

const TIPOS_ZONA = [
  { id: 'logo', label: 'Logo / Escudo' },
  { id: 'text', label: 'Texto / Nome' },
  { id: 'number', label: 'Número' },
  { id: 'sponsor', label: 'Patrocinador' },
];

function ModeloComTextura({
  url,
  zonas,
  onClicar,
  onDrag,
  isDragging,
  idSelecionado
}: {
  url: string;
  zonas: ZonaMarcada[];
  onClicar: (uv: THREE.Vector2) => void;
  onDrag: (uv: THREE.Vector2) => void;
  isDragging: boolean;
  idSelecionado: string | null;
}) {
  const { scene } = useGLTF(url);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    zonas.forEach(z => {
      const isSelected = z.id === idSelecionado;
      const x = z.uvCenter[0] * canvas.width;
      const y = (1 - z.uvCenter[1]) * canvas.height;
      const w = z.width * canvas.width;
      const h = z.height * canvas.height;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((z.rotation * Math.PI) / 180);
      
      // Estilo Gabarito Profissional
      ctx.fillStyle = isSelected ? 'rgba(234, 88, 12, 0.4)' : 'rgba(59, 130, 246, 0.2)';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      
      ctx.strokeStyle = isSelected ? '#ea580c' : '#3b82f6';
      ctx.lineWidth = 10;
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // Label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(z.name.toUpperCase(), 0, 20);
      
      ctx.restore();
    });

    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
  }, [zonas, idSelecionado]);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    const tex = new THREE.CanvasTexture(canvasRef.current);
    tex.flipY = false;
    tex.colorSpace = THREE.SRGBColorSpace;
    textureRef.current = tex;

    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        
        const newMaterials = materials.map(m => {
          const newMat = m.clone();
          if (newMat instanceof THREE.MeshStandardMaterial || newMat instanceof THREE.MeshPhysicalMaterial) {
            newMat.transparent = true;
            newMat.emissiveMap = tex;
            newMat.emissive = new THREE.Color(0xffffff);
            newMat.emissiveIntensity = 0.8;
            newMat.needsUpdate = true;
          }
          return newMat;
        });

        mesh.material = Array.isArray(mesh.material) ? newMaterials : newMaterials[0];
      }
    });
    return clone;
  }, [scene]);

  return (
    <primitive
      object={clonedScene}
      onPointerUp={(e: any) => {
        if (e.uv) {
          e.stopPropagation();
          onClicar(e.uv);
        }
      }}
      onPointerMove={(e: any) => {
        if (isDragging && e.uv) {
          onDrag(e.uv);
        }
      }}
    />
  );
}

export default function ZoneEditor({ modelUrl, initialZones = [], onSave, onClose }: any) {
  const [zonas, setZonas] = useState<ZonaMarcada[]>(initialZones);
  const [idSelecionado, setIdSelecionado] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const zonaSelecionada = zonas.find(z => z.id === idSelecionado);

  const updateZona = (id: string, updates: Partial<ZonaMarcada>) => {
    setZonas(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
  };

  const handleClicarNoModelo = (uv: THREE.Vector2) => {
    if (!idSelecionado) {
      const novaId = crypto.randomUUID();
      const nova: ZonaMarcada = {
        id: novaId,
        name: `ZONA ${zonas.length + 1}`,
        type: 'text',
        uvCenter: [uv.x, uv.y],
        width: 0.15,
        height: 0.10,
        rotation: 0,
      };
      setZonas(prev => [...prev, nova]);
      setIdSelecionado(novaId);
    } else {
      updateZona(idSelecionado, { uvCenter: [uv.x, uv.y] });
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-[60] flex flex-col font-sans">
      <header className="flex justify-between items-center p-4 bg-[#111] border-b border-[#222]">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-bold text-lg">Editor de Gabaritos</h1>
          <span className="text-gray-500 text-xs">Clique na malha para posicionar</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onSave(zonas)} className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded-xl flex items-center gap-2 transition-all">
            <Save className="w-4 h-4" /> Salvar Alterações
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

        {/* Viewport 3D */}
        <div className="flex-1 relative bg-gradient-to-b from-[#0f0f0f] to-[#050505]">
          <Canvas camera={{ position: [0, 0.5, 2.5], fov: 35 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <ModeloComTextura 
                url={modelUrl} 
                zonas={zonas}
                onClicar={handleClicarNoModelo}
                onDrag={(uv) => idSelecionado && updateZona(idSelecionado, { uvCenter: [uv.x, uv.y] })}
                isDragging={isDragging}
                idSelecionado={idSelecionado}
              />
              <OrbitControls enablePan={false} makeDefault />
            </Suspense>
          </Canvas>

          {idSelecionado && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl flex items-center gap-6 px-8 shadow-2xl">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isDragging} 
                  onChange={e => setIsDragging(e.target.checked)} 
                  className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-orange-600 focus:ring-orange-600"
                />
                <span className="text-sm font-medium text-white group-hover:text-orange-500 transition-colors">Modo Arrastar (Real-time)</span>
              </label>
              <div className="w-px h-6 bg-white/10"></div>
              <p className="text-gray-400 text-xs">Ajuste fino clicando na malha</p>
            </div>
          )}
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

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Largura</label>
                      <span className="text-orange-600 font-mono text-xs">{zonaSelecionada.width.toFixed(2)}</span>
                    </div>
                    <input 
                      type="range" min="0.01" max="0.5" step="0.01"
                      value={zonaSelecionada.width}
                      onChange={e => updateZona(zonaSelecionada.id, { width: parseFloat(e.target.value) })}
                      className="w-full accent-orange-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Altura</label>
                      <span className="text-orange-600 font-mono text-xs">{zonaSelecionada.height.toFixed(2)}</span>
                    </div>
                    <input 
                      type="range" min="0.01" max="0.5" step="0.01"
                      value={zonaSelecionada.height}
                      onChange={e => updateZona(zonaSelecionada.id, { height: parseFloat(e.target.value) })}
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
                <Edit3 className="w-6 h-6 text-gray-700" />
              </div>
              <p className="text-gray-400 text-sm font-medium">Nenhuma área selecionada</p>
              <p className="text-gray-600 text-[10px] mt-2">Clique em um ponto do modelo 3D para começar a marcar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Edit3 } from 'lucide-react';
