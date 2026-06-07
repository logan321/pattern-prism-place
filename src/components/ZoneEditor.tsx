import React, { useState, useRef, Suspense, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  position: [number, number, number];
  uv?: [number, number];
}

const POSICOES_ZONA = [
  { id: 'peito-esquerdo',  label: 'Peito Esquerdo' },
  { id: 'peito-direito',   label: 'Peito Direito' },
  { id: 'peito-centro',    label: 'Peito Centro' },
  { id: 'costas-topo',     label: 'Costas Topo' },
  { id: 'costas-centro',   label: 'Costas Centro' },
  { id: 'costas-base',     label: 'Costas Base' },
  { id: 'manga-esquerda',  label: 'Manga Esquerda' },
  { id: 'manga-direita',   label: 'Manga Direita' },
];

function ModelWithUVClick({ url, onPointSelect, zones }: { 
  url: string, 
  onPointSelect: (point: THREE.Vector3, uv: THREE.Vector2) => void, 
  zones: Zone[] 
}) {
  const { scene } = useGLTF(url);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const sceneRef = useRef<THREE.Object3D | null>(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const mouseDownPos = useRef({ x: 0, y: 0 });
  
  // Clonar a scene para não mutar a cache do useGLTF
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(m => m.clone());
        } else {
          mesh.material = (mesh.material as THREE.Material).clone();
        }
      }
    });
    return clone;
  }, [scene]);

  useEffect(() => {
    if (clonedScene) {
      sceneRef.current = clonedScene;
      
      // Aplicar materiais neutros iniciais
      clonedScene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat: any) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              mat.map = null;
              mat.normalMap = null;
              mat.roughnessMap = null;
              mat.metalnessMap = null;
              mat.aoMap = null;
              mat.color = new THREE.Color(0xcccccc);
              mat.needsUpdate = true;
            }
          });
        }
      });
    }
  }, [clonedScene]);

  const redrawTexture = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    zones.forEach((zone) => {
      if (!zone.uv) return;
      const x = zone.uv[0] * canvas.width;
      const y = (1 - zone.uv[1]) * canvas.height;

      // Desenhar círculo laranja
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#ea580c';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Label
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(zone.id.toUpperCase(), x, y - 45);
    });

    if (!textureRef.current) {
      const tex = new THREE.CanvasTexture(canvas);
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      textureRef.current = tex;

      sceneRef.current?.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat: any) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              mat.emissiveMap = textureRef.current;
              mat.emissive = new THREE.Color(0xffffff);
              mat.emissiveIntensity = 1.2;
              mat.needsUpdate = true;
            }
          });
        }
      });
    } else {
      textureRef.current.needsUpdate = true;
    }
  }, [zones]);

  useEffect(() => {
    redrawTexture();
  }, [zones, redrawTexture]);

  
  return (
    <primitive 
      object={clonedScene} 
      onPointerDown={(e: any) => {
        mouseDownPos.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e: any) => {
        const dx = Math.abs(e.clientX - mouseDownPos.current.x);
        const dy = Math.abs(e.clientY - mouseDownPos.current.y);
        if (dx < 5 && dy < 5) {
          // Foi clique real, não drag
          e.stopPropagation();
          if (e.uv) {
            onPointSelect(e.point, e.uv);
          } else {
            console.warn('UV não disponível neste ponto do mesh');
          }
        }
      }}
    />
  );
}

export default function ZoneEditor({ modelUrl, initialZones = [], onSave, onClose }: { 
  modelUrl: string, 
  initialZones?: Zone[], 
  onSave: (zones: Zone[]) => void,
  onClose: () => void 
}) {
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [selectedData, setSelectedData] = useState<{ pos: THREE.Vector3, uv: THREE.Vector2 } | null>(null);
  const [posicaoSelecionada, setPosicaoSelecionada] = useState(POSICOES_ZONA[0].id);

  const handlePointSelect = (pos: THREE.Vector3, uv: THREE.Vector2) => {
    setSelectedData({ pos, uv });
  };

  const handleAddZone = () => {
    console.log('GRAVANDO ZONA:', {
      id: posicaoSelecionada,
      uv: [selectedData?.uv.x, selectedData?.uv.y]
    });
    if (!selectedData) return;
    
    const newZone: Zone = {
      id: posicaoSelecionada,
      name: posicaoSelecionada,
      position: [selectedData.pos.x, selectedData.pos.y, selectedData.pos.z],
      uv: [selectedData.uv.x, selectedData.uv.y]
    };
    
    // Evitar duplicatas da mesma posição
    setZones(prev => [...prev.filter(z => z.id !== posicaoSelecionada), newZone]);
    setSelectedData(null);
  };

  const removeZone = (id: string) => {
    setZones(zones.filter(z => z.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col font-sans">
      <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-lg">Editor de Zonas UV (Marcação Real)</h3>
          <p className="text-gray-400 text-xs">As marcas são renderizadas diretamente na textura do modelo usando coordenadas UV.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onSave(zones)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Marcações</span>
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 p-6 flex flex-col">
          <div className="mb-8">
            <h4 className="text-gray-400 text-[10px] font-bold uppercase mb-4 tracking-widest">Nova Zona na Malha</h4>
            {selectedData ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="bg-orange-600/10 border border-orange-600/20 p-4 rounded-xl">
                  <p className="text-orange-500 text-[10px] font-bold uppercase mb-2">Coordenadas UV Detectadas</p>
                  <div className="grid grid-cols-2 gap-2 text-white font-mono text-xs">
                    <div>U: {selectedData.uv.x.toFixed(4)}</div>
                    <div>V: {selectedData.uv.y.toFixed(4)}</div>
                  </div>
                </div>
                <select
                  value={posicaoSelecionada}
                  onChange={(e) => setPosicaoSelecionada(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none"
                >
                  {POSICOES_ZONA.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
                <button 
                  onClick={handleAddZone}
                  className="w-full bg-white text-black font-bold py-3 rounded-xl text-sm flex items-center justify-center space-x-2 hover:bg-gray-100 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Gravar na Textura</span>
                </button>
              </div>
            ) : (
              <div className="bg-gray-800/30 border-2 border-gray-700 border-dashed p-8 rounded-2xl text-center">
                <p className="text-gray-500 text-xs italic leading-relaxed">Clique em qualquer parte da camisa 3D para capturar a coordenada UV exata.</p>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <h4 className="text-gray-400 text-[10px] font-bold uppercase mb-4 tracking-widest">Zonas Gravadas ({zones.length})</h4>
            <div className="space-y-3">
              {zones.map(zone => (
                <div key={zone.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between group hover:bg-gray-800 transition-all">
                  <div>
                    <p className="text-white font-bold text-sm">{zone.name}</p>
                    <p className="text-gray-500 text-[10px] font-mono mt-1">UV: {zone.uv?.[0].toFixed(3)}, {zone.uv?.[1].toFixed(3)}</p>
                  </div>
                  <button 
                    onClick={() => removeZone(zone.id)}
                    className="text-gray-500 hover:text-red-500 p-2 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {zones.length === 0 && (
                <div className="text-gray-600 text-center text-xs py-12">Nenhuma zona vinculada ao UV Map ainda.</div>
              )}
            </div>
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 bg-[#0a0a0a] relative">
          <Canvas shadows camera={{ position: [0, 0.5, 2], fov: 40 }} dpr={[1, 2]}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <Stage intensity={0.5} environment="city" shadows="contact" adjustCamera={false}>
                <ModelWithUVClick url={modelUrl} onPointSelect={handlePointSelect} zones={zones} />
              </Stage>
              <OrbitControls minDistance={0.5} maxDistance={5} enablePan={false} />
            </Suspense>
          </Canvas>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-3 pointer-events-none">
            <div className="bg-gray-900/90 backdrop-blur-md px-6 py-2.5 rounded-full border border-gray-700 shadow-2xl flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <p className="text-white text-xs font-bold tracking-tight uppercase">Modo de Mapeamento UV Ativo</p>
            </div>
            <p className="text-gray-500 text-[10px] font-medium">As marcações seguem a topologia exata exportada do CLO3D</p>
          </div>
        </div>
      </div>
    </div>
  );
}
