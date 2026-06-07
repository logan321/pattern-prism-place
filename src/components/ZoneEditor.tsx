import React, { useState, useRef, Suspense, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, TransformControls } from '@react-three/drei';
import * as THREE from 'three';

// ---- TIPOS ----
interface ZonaMarcada {
  id: string;
  name: string;
  type: 'text' | 'logo' | 'sponsor' | 'number';
  uvCenter: [number, number];
  width: number;
  height: number;
  rotation: number;
  // Campos auxiliares para renderização 3D no editor
  point: [number, number, number];
  normal: [number, number, number];
}

// ---- POSIÇÕES PADRÃO ----
const TIPOS_ZONA = [
  { id: 'logo', label: 'Logo / Escudo' },
  { id: 'text', label: 'Texto / Nome' },
  { id: 'number', label: 'Número' },
  { id: 'sponsor', label: 'Patrocinador' },
];

// ---- RETÂNGULO 3D EDITÁVEL ----
function ZonaVisual({ 
  zona, 
  onUpdate, 
  isSelected, 
  onSelect 
}: { 
  zona: ZonaMarcada; 
  onUpdate: (updates: Partial<ZonaMarcada>) => void;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Posiciona e orienta o plano com base no ponto e normal
  useEffect(() => {
    if (meshRef.current) {
      const pos = new THREE.Vector3(...zona.point);
      const normal = new THREE.Vector3(...zona.normal);
      
      // Offset para evitar z-fighting
      meshRef.current.position.copy(pos.clone().addScaledVector(normal, 0.005));
      
      // Orienta o plano para a normal
      const lookAtTarget = pos.clone().add(normal);
      meshRef.current.lookAt(lookAtTarget);
      
      // Aplica a rotação do usuário (em torno do eixo Z local do plano)
      meshRef.current.rotateZ(zona.rotation * (Math.PI / 180));
    }
  }, [zona.point, zona.normal, zona.rotation]);

  // Escala o plano com base no width/height
  // Usamos um fator de escala arbitrário para converter UV width/height em unidades 3D visíveis
  // Geralmente, o modelo tem cerca de 1-2 unidades de altura
  const scaleX = zona.width * 2; 
  const scaleY = zona.height * 2;

  return (
    <mesh 
      ref={meshRef} 
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <planeGeometry args={[scaleX, scaleY]} />
      <meshBasicMaterial 
        color={isSelected ? "#ea580c" : "#3b82f6"} 
        transparent 
        opacity={0.5} 
        side={THREE.DoubleSide}
        depthTest={false}
      />
      <Html
        center
        distanceFactor={1.5}
        style={{
          pointerEvents: 'none',
          background: isSelected ? '#ea580c' : '#3b82f6',
          color: 'white',
          padding: '2px 6px',
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          opacity: 0.9
        }}
      >
        {zona.name}
      </Html>
      
      {/* Bordas */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(scaleX, scaleY)]} />
        <lineBasicMaterial color={isSelected ? "#ffffff" : "#3b82f6"} />
      </lineSegments>
    </mesh>
  );
}

// ---- MODELO INTERATIVO ----
function ModeloInterativo({
  url,
  onClicar,
  onDrag,
  isDragging
}: {
  url: string;
  onClicar: (point: THREE.Vector3, normal: THREE.Vector3, uv: THREE.Vector2) => void;
  onDrag: (point: THREE.Vector3, normal: THREE.Vector3, uv: THREE.Vector2) => void;
  isDragging: boolean;
}) {
  const { scene } = useGLTF(url);
  const mouseDownTime = useRef(0);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m: any) => {
          m = m.clone();
          m.map = null;
          m.color = new THREE.Color(0xdddddd);
          m.needsUpdate = true;
          if (Array.isArray(mesh.material)) {
            const index = mesh.material.indexOf(m);
            if (index !== -1) mesh.material[index] = m;
          } else {
            mesh.material = m;
          }
        });
      }
    });
    return clone;
  }, [scene]);

  return (
    <primitive
      object={clonedScene}
      onPointerDown={(e: any) => {
        mouseDownTime.current = Date.now();
      }}
      onPointerUp={(e: any) => {
        const duration = Date.now() - mouseDownTime.current;
        if (duration < 200 && e.face && e.uv) {
          e.stopPropagation();
          onClicar(e.point, e.face.normal, e.uv);
        }
      }}
      onPointerMove={(e: any) => {
        if (isDragging && e.face && e.uv) {
          onDrag(e.point, e.face.normal, e.uv);
        }
      }}
    />
  );
}

// ---- COMPONENTE PRINCIPAL ----
export default function ZoneEditor({ modelUrl, initialZones = [], onSave, onClose }: any) {
  const [zonas, setZonas] = useState<ZonaMarcada[]>(() => {
    return initialZones.map((z: any) => ({
      id: z.id || crypto.randomUUID(),
      name: z.name || 'Nova Zona',
      type: z.type || 'text',
      uvCenter: z.uvCenter || z.uv || [0.5, 0.5],
      width: z.width || 0.1,
      height: z.height || 0.1,
      rotation: z.rotation || 0,
      point: z.point || [0, 0, 0],
      normal: z.normal || [0, 1, 0],
    }));
  });

  const [idSelecionado, setIdSelecionado] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const zonaSelecionada = zonas.find(z => z.id === idSelecionado);

  const handleClicarNoModelo = (point: THREE.Vector3, normal: THREE.Vector3, uv: THREE.Vector2) => {
    // Se não houver nada selecionado, cria uma nova zona
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
        point: point.toArray() as [number, number, number],
        normal: normal.toArray() as [number, number, number],
      };
      setZonas(prev => [...prev, nova]);
      setIdSelecionado(novaId);
    } else {
      // Se houver selecionado, move para o ponto clicado
      updateZona(idSelecionado, {
        uvCenter: [uv.x, uv.y],
        point: point.toArray() as [number, number, number],
        normal: normal.toArray() as [number, number, number],
      });
    }
  };

  const handleDragNoModelo = (point: THREE.Vector3, normal: THREE.Vector3, uv: THREE.Vector2) => {
    if (idSelecionado && isDragging) {
      updateZona(idSelecionado, {
        uvCenter: [uv.x, uv.y],
        point: point.toArray() as [number, number, number],
        normal: normal.toArray() as [number, number, number],
      });
    }
  };

  const updateZona = (id: string, updates: Partial<ZonaMarcada>) => {
    setZonas(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
  };

  const handleSalvar = () => {
    onSave(zonas);
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-[60] flex flex-col font-sans">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-[#111] border-b border-[#222]">
        <div className="flex items-center gap-3">
          <h1 className="text-white font-bold text-lg">Editor de Áreas Editáveis</h1>
          <span className="text-gray-500 text-sm">| Clique no modelo para criar ou mover</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSalvar}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Salvar Áreas
          </button>
          <button 
            onClick={onClose}
            className="bg-[#333] hover:bg-[#444] text-white py-2 px-6 rounded-lg transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Painel Esquerdo: Lista de Zonas */}
        <div className="w-72 bg-[#111] border-r border-[#222] p-4 flex flex-col gap-4 overflow-y-auto">
          <button
            onClick={() => setIdSelecionado(null)}
            className={`w-full py-2 px-4 rounded-lg border-2 transition-all ${!idSelecionado ? 'border-orange-600 bg-orange-600/10 text-orange-600' : 'border-[#333] text-gray-400'}`}
          >
            + Criar Nova Área
          </button>

          <div className="space-y-2">
            <h2 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Zonas Ativas ({zonas.length})</h2>
            {zonas.map(z => (
              <div 
                key={z.id}
                onClick={() => setIdSelecionado(z.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${idSelecionado === z.id ? 'border-orange-600 bg-orange-600/10' : 'border-[#222] bg-[#1a1a1a] hover:border-[#444]'}`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${idSelecionado === z.id ? 'text-white' : 'text-gray-300'}`}>{z.name}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setZonas(prev => prev.filter(item => item.id !== z.id));
                      if (idSelecionado === z.id) setIdSelecionado(null);
                    }}
                    className="text-gray-600 hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="text-[10px] text-gray-500 mt-1 uppercase">{z.type}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Centro: Canvas 3D */}
        <div className="flex-1 relative">
          <Canvas camera={{ position: [0, 0.5, 2.5], fov: 35 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <ModeloInterativo 
                url={modelUrl} 
                onClicar={handleClicarNoModelo}
                onDrag={handleDragNoModelo}
                isDragging={isDragging}
              />
              {zonas.map(z => (
                <ZonaVisual 
                  key={z.id} 
                  zona={z} 
                  isSelected={idSelecionado === z.id}
                  onSelect={() => setIdSelecionado(z.id)}
                  onUpdate={(updates) => updateZona(z.id, updates)}
                />
              ))}
              <OrbitControls enabled={!isDragging} enablePan={false} />
            </Suspense>
          </Canvas>

          {idSelecionado && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-orange-600/30 p-2 rounded-full flex items-center gap-4 px-6 text-white text-sm shadow-2xl">
               <div className="flex items-center gap-2">
                 <input 
                  type="checkbox" 
                  checked={isDragging} 
                  onChange={e => setIsDragging(e.target.checked)}
                  id="drag-mode"
                  className="w-4 h-4 accent-orange-600"
                 />
                 <label htmlFor="drag-mode" className="cursor-pointer select-none">Modo Arrastar</label>
               </div>
               <div className="w-px h-4 bg-gray-700"></div>
               <span className="text-gray-400">Clique e arraste no modelo para posicionar</span>
            </div>
          )}
        </div>

        {/* Painel Direito: Propriedades da Zona Selecionada */}
        <div className="w-80 bg-[#111] border-l border-[#222] p-6 flex flex-col gap-6 overflow-y-auto">
          {zonaSelecionada ? (
            <>
              <h2 className="text-white font-bold text-lg border-b border-[#222] pb-3">Propriedades</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xs font-bold uppercase">Nome da Zona</label>
                  <input 
                    type="text"
                    value={zonaSelecionada.name}
                    onChange={e => updateZona(zonaSelecionada.id, { name: e.target.value })}
                    className="bg-[#1a1a1a] border border-[#333] text-white p-2 rounded focus:border-orange-600 outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xs font-bold uppercase">Tipo de Conteúdo</label>
                  <select 
                    value={zonaSelecionada.type}
                    onChange={e => updateZona(zonaSelecionada.id, { type: e.target.value as any })}
                    className="bg-[#1a1a1a] border border-[#333] text-white p-2 rounded focus:border-orange-600 outline-none"
                  >
                    {TIPOS_ZONA.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-[#222] space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between">
                      <label className="text-gray-400 text-xs font-bold uppercase">Largura</label>
                      <span className="text-orange-600 text-xs font-mono">{zonaSelecionada.width.toFixed(2)}</span>
                    </div>
                    <input 
                      type="range" min="0.01" max="0.5" step="0.01"
                      value={zonaSelecionada.width}
                      onChange={e => updateZona(zonaSelecionada.id, { width: parseFloat(e.target.value) })}
                      className="accent-orange-600 h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between">
                      <label className="text-gray-400 text-xs font-bold uppercase">Altura</label>
                      <span className="text-orange-600 text-xs font-mono">{zonaSelecionada.height.toFixed(2)}</span>
                    </div>
                    <input 
                      type="range" min="0.01" max="0.5" step="0.01"
                      value={zonaSelecionada.height}
                      onChange={e => updateZona(zonaSelecionada.id, { height: parseFloat(e.target.value) })}
                      className="accent-orange-600 h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between">
                      <label className="text-gray-400 text-xs font-bold uppercase">Rotação</label>
                      <span className="text-orange-600 text-xs font-mono">{zonaSelecionada.rotation}°</span>
                    </div>
                    <input 
                      type="range" min="-180" max="180" step="1"
                      value={zonaSelecionada.rotation}
                      onChange={e => updateZona(zonaSelecionada.id, { rotation: parseInt(e.target.value) })}
                      className="accent-orange-600 h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#222]">
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>UV X: {zonaSelecionada.uvCenter[0].toFixed(4)}</span>
                    <span>UV Y: {zonaSelecionada.uvCenter[1].toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 gap-4">
              <div className="w-12 h-12 rounded-full border border-gray-800 flex items-center justify-center">
                <span className="text-2xl">?</span>
              </div>
              <p className="text-sm px-4">Selecione uma zona no modelo ou na lista para editar suas propriedades.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
