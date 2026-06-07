import React, { useState, useRef, Suspense, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Trash2 } from 'lucide-react';
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

    // Limpa o canvas para garantir transparência
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
      
      // Retângulo semitransparente
      ctx.fillStyle = isSelected ? 'rgba(234, 88, 12, 0.5)' : 'rgba(59, 130, 246, 0.3)';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      
      // Borda
      ctx.strokeStyle = isSelected ? 'rgba(234, 88, 12, 1)' : 'rgba(59, 130, 246, 1)';
      ctx.lineWidth = 15;
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // Texto de identificação
      ctx.fillStyle = 'white';
      ctx.font = 'bold 80px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(z.name, 0, 20);
      
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
            newMat.emissiveIntensity = 0.5; // Brilho suave nas zonas
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

  const handleClicarNoModelo = (uv: THREE.Vector2) => {
    if (!idSelecionado) {
      const novaId = crypto.randomUUID();
      const nova: ZonaMarcada = {
        id: novaId,
        name: `ZONA ${zonas.length + 1}`,
        type: 'text',
        uvCenter: [uv.x, uv.y],
        width: 0.15,
        height: 0.05,
        rotation: 0,
      };
      setZonas(prev => [...prev, nova]);
      setIdSelecionado(novaId);
    } else {
      setZonas(prev => prev.map(z => z.id === idSelecionado ? { ...z, uvCenter: [uv.x, uv.y] } : z));
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-[60] flex flex-col font-sans">
      <div className="flex justify-between items-center p-4 bg-[#111] border-b border-[#222]">
        <h1 className="text-white font-bold">Editor de Áreas</h1>
        <div className="flex gap-2">
          <button onClick={() => onSave(zonas)} className="bg-orange-600 text-white py-2 px-6 rounded-lg">Salvar</button>
          <button onClick={onClose} className="bg-[#333] text-white py-2 px-6 rounded-lg">Sair</button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 bg-[#111] border-r border-[#222] p-4 flex flex-col gap-4 overflow-y-auto">
          {zonas.map(z => (
            <div 
              key={z.id}
              onClick={() => setIdSelecionado(z.id)}
              className={`p-3 rounded-lg cursor-pointer border ${idSelecionado === z.id ? 'border-orange-600' : 'border-[#222] bg-[#1a1a1a]'}`}
            >
              <p className="text-white font-medium">{z.name}</p>
            </div>
          ))}
          <button onClick={() => setIdSelecionado(null)} className="py-2 text-blue-400">+ Nova Zona</button>
        </div>
        <div className="w-80 bg-[#111] border-l border-[#222] p-6 flex flex-col gap-6 overflow-y-auto text-white">
          {zonaSelecionada ? (
            <>
              <h2 className="font-bold text-lg border-b border-[#222] pb-3">Propriedades</h2>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xs font-bold uppercase">Nome</label>
                  <input 
                    type="text"
                    value={zonaSelecionada.name}
                    onChange={e => updateZona(zonaSelecionada.id, { name: e.target.value })}
                    className="bg-[#1a1a1a] border border-[#333] p-2 rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xs font-bold uppercase">Tipo</label>
                  <select 
                    value={zonaSelecionada.type}
                    onChange={e => updateZona(zonaSelecionada.id, { type: e.target.value as any })}
                    className="bg-[#1a1a1a] border border-[#333] p-2 rounded"
                  >
                    {TIPOS_ZONA.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xs font-bold uppercase">Largura ({zonaSelecionada.width.toFixed(2)})</label>
                  <input 
                    type="range" min="0.01" max="0.5" step="0.01"
                    value={zonaSelecionada.width}
                    onChange={e => updateZona(zonaSelecionada.id, { width: parseFloat(e.target.value) })}
                    className="accent-orange-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xs font-bold uppercase">Altura ({zonaSelecionada.height.toFixed(2)})</label>
                  <input 
                    type="range" min="0.01" max="0.5" step="0.01"
                    value={zonaSelecionada.height}
                    onChange={e => updateZona(zonaSelecionada.id, { height: parseFloat(e.target.value) })}
                    className="accent-orange-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xs font-bold uppercase">Rotação ({zonaSelecionada.rotation}°)</label>
                  <input 
                    type="range" min="-180" max="180" step="1"
                    value={zonaSelecionada.rotation}
                    onChange={e => updateZona(zonaSelecionada.id, { rotation: parseInt(e.target.value) })}
                    className="accent-orange-600"
                  />
                </div>
                <button 
                  onClick={() => {
                    setZonas(prev => prev.filter(z => z.id !== idSelecionado));
                    setIdSelecionado(null);
                  }}
                  className="w-full py-2 border border-red-900/50 text-red-500 rounded hover:bg-red-500/10 transition-colors mt-4"
                >
                  Excluir Zona
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
              Selecione uma zona para editar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const updateZonaFn = (id: string, updates: Partial<ZonaMarcada>, setZonas: React.Dispatch<React.SetStateAction<ZonaMarcada[]>>) => {
  setZonas(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
};
