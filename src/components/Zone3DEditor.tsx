import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Center, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useAppContext, Zone3D } from '../context/AppContext';
import { 
  ChevronLeft, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Maximize, 
  RotateCw,
  Trash2,
  Box,
  Compass,
  Undo2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import golaModelAsset from '@/assets/GOLA_PADRE_otimizado.glb.asset.json';

function Model({ url, onPointerDown }: { url: string; onPointerDown: (e: any) => void }) {
  const { scene } = useGLTF(url);
  
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} onPointerDown={onPointerDown} />;
}

function ZonePreview({ zone }: { zone: Zone3D }) {
  if (!zone.position3d || !zone.normal3d) return null;

  const position = new THREE.Vector3(...zone.position3d);
  const normal = new THREE.Vector3(...zone.normal3d);
  const size = zone.size3d || 0.3;
  const rotation = zone.rotation3d || 0;

  // Orientar o plano de acordo com a normal
  const lookAtPos = position.clone().add(normal);
  
  return (
    <mesh position={position} lookAt={lookAtPos as any}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial 
        color="#ea580c" 
        transparent 
        opacity={0.6} 
        side={THREE.DoubleSide}
        depthTest={false}
        polygonOffset
        polygonOffsetFactor={-4}
      />
      <group rotation={[0, 0, rotation]}>
        <mesh>
          <ringGeometry args={[size * 0.45, size * 0.5, 32]} />
          <meshStandardMaterial color="#ea580c" emissive="#ea580c" emissiveIntensity={2} />
        </mesh>
      </group>
    </mesh>
  );
}

function Scene({ modelUrl, onPointSelected, zones, orbitRef }: { 
  modelUrl: string; 
  onPointSelected: (point: THREE.Vector3, normal: THREE.Vector3) => void;
  zones: Zone3D[];
  orbitRef: React.RefObject<any>;
}) {
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (e.face) {
      const point = e.point;
      const normal = e.face.normal.clone();
      // Converter normal para espaço global se necessário (para modelos complexos pode precisar da matriz normal do mesh)
      // Aqui usamos a normal do evento que o R3F já calcula
      onPointSelected(point, normal);
    }
  };

  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <Suspense fallback={<Html center>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-white text-xs font-bold uppercase tracking-widest">Carregando Modelo...</span>
        </div>
      </Html>}>
        <Center>
          <Model url={modelUrl} onPointerDown={handlePointerDown} />
          {zones.map(z => (
            <ZonePreview key={z.id} zone={z} />
          ))}
        </Center>
        <ContactShadows position={[0, -0.8, 0]} opacity={0.4} scale={10} blur={2.5} far={0.8} />
      </Suspense>

      <OrbitControls 
        ref={orbitRef}
        makeDefault 
        minDistance={1} 
        maxDistance={4} 
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
}

export function Zone3DEditor({ 
  modelUrl: propModelUrl, 
  onZonePositioned,
  hideBackButton = false
}: { 
  modelUrl?: string;
  onZonePositioned?: (zoneId: string, data: Partial<Zone3D>) => void;
  hideBackButton?: boolean;
}) {
  const { zones, selectedZoneId, updateZone, setSelectedZoneId } = useAppContext();
  const orbitRef = useRef<any>(null);
  const [modelUrl] = useState(propModelUrl || golaModelAsset.url);
  
  const selectedZone = zones.find(z => z.id === selectedZoneId);

  const handlePointSelected = (point: THREE.Vector3, normal: THREE.Vector3) => {
    if (!selectedZoneId) return;
    
    const updateData = {
      position3d: [point.x, point.y, point.z] as [number, number, number],
      normal3d: [normal.x, normal.y, normal.z] as [number, number, number],
      size3d: selectedZone?.size3d || 0.3,
      rotation3d: selectedZone?.rotation3d || 0
    };

    updateZone(selectedZoneId, updateData);
    if (onZonePositioned) {
      onZonePositioned(selectedZoneId, updateData);
    }
  };

  const clearPosition = () => {
    if (!selectedZoneId) return;
    updateZone(selectedZoneId, {
      position3d: undefined,
      normal3d: undefined,
      size3d: undefined,
      rotation3d: undefined
    });
  };

  const resetCamera = () => {
    if (orbitRef.current) {
      const controls = orbitRef.current;
      const proxy = { 
        x: controls.object.position.x,
        y: controls.object.position.y,
        z: controls.object.position.z,
        tx: controls.target.x,
        ty: controls.target.y,
        tz: controls.target.z
      };

      gsap.to(proxy, {
        x: 0, y: 0, z: 2,
        tx: 0, ty: 0, tz: 0,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => {
          controls.object.position.set(proxy.x, proxy.y, proxy.z);
          controls.target.set(proxy.tx, proxy.ty, proxy.tz);
          controls.update();
        }
      });
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Sidebar Esquerda - Lista de Zonas */}
      <div className="w-80 border-r border-white/10 flex flex-col shrink-0 bg-[#0f0f0f]">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!hideBackButton && (
              <Link to="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </Link>
            )}
            <h2 className="font-bold text-lg">Zonas 3D</h2>
          </div>
          <Box className="w-5 h-5 text-orange-500" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {zones.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Nenhuma zona 2D encontrada.</p>
              <p className="text-xs">Crie zonas no editor 2D primeiro.</p>
            </div>
          ) : (
            zones.map(zone => (
              <button
                key={zone.id}
                onClick={() => setSelectedZoneId(zone.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                  selectedZoneId === zone.id 
                    ? 'bg-orange-600/10 border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.1)]' 
                    : 'bg-white/5 border-transparent hover:bg-white/10'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{zone.name}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">{zone.side}</span>
                </div>
                {zone.position3d ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Target className="w-4 h-4 text-orange-400 animate-pulse" />
                )}
              </button>
            ))
          )}
        </div>

        {selectedZone && (
          <div className="p-4 bg-white/5 border-t border-white/10 space-y-4">
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-widest flex items-center gap-2">
              Ajustes: {selectedZone.name}
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>TAMANHO (3D)</span>
                  <span className="text-orange-500">{(selectedZone.size3d || 0.3).toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.05" 
                  max="1.5" 
                  step="0.01"
                  value={selectedZone.size3d || 0.3}
                  onChange={(e) => updateZone(selectedZone.id, { size3d: parseFloat(e.target.value) })}
                  className="w-full accent-orange-600 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>ROTAÇÃO (3D)</span>
                  <span className="text-orange-500">{( (selectedZone.rotation3d || 0) * 180 / Math.PI ).toFixed(0)}°</span>
                </div>
                <input 
                  type="range" 
                  min="-3.14" 
                  max="3.14" 
                  step="0.01"
                  value={selectedZone.rotation3d || 0}
                  onChange={(e) => updateZone(selectedZone.id, { rotation3d: parseFloat(e.target.value) })}
                  className="w-full accent-orange-600 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={clearPosition}
                className="flex-1 py-2 px-3 border border-orange-500/30 text-orange-500 text-[10px] font-bold uppercase rounded hover:bg-orange-500/10 transition-colors flex items-center justify-center gap-2"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Resetar Pos. 3D
              </button>
              <button 
                onClick={clearPosition}
                className="flex-1 py-2 px-3 border border-red-500/30 text-red-500 text-[10px] font-bold uppercase rounded hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Deletar do 3D
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Area do Visualizador 3D */}
      <div className="flex-1 relative">
        {!selectedZoneId && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 text-center shadow-2xl max-w-xs">
              <Target className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Selecione uma zona</h3>
              <p className="text-sm text-gray-400">
                Escolha uma zona na lista ao lado e depois clique no modelo 3D para posicioná-la.
              </p>
            </div>
          </div>
        )}

        {selectedZoneId && !selectedZone?.position3d && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-orange-600 rounded-full text-xs font-bold shadow-lg animate-bounce pointer-events-none">
            CLIQUE NO MODELO PARA POSICIONAR "{selectedZone?.name}"
          </div>
        )}

        <div className="w-full h-full">
          <Canvas 
            shadows 
            camera={{ position: [0, 0, 1.2], fov: 35 }}
            gl={{ antialias: true, alpha: true }}
          >
            <Scene 
              modelUrl={modelUrl} 
              onPointSelected={handlePointSelected}
              zones={zones}
              orbitRef={orbitRef}
            />
          </Canvas>
        </div>

        {/* Camera Reset Button */}
        <button 
          onClick={resetCamera}
          className="absolute top-6 right-6 p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full hover:bg-orange-600 transition-all group"
          title="Resetar Câmera"
        >
          <Compass className="w-5 h-5 text-white group-hover:rotate-180 transition-transform duration-500" />
        </button>

        {/* Info Box */}
        <div className="absolute bottom-6 left-6 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-[10px] space-y-2 pointer-events-none">
          <div className="flex items-center gap-2 text-gray-400">
            <RotateCw className="w-3 h-3" /> Botão Esquerdo: Rotacionar
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Maximize className="w-3 h-3" /> Scroll: Zoom
          </div>
          <div className="flex items-center gap-2 text-orange-500 font-bold">
            <Target className="w-3 h-3" /> Clique no Modelo: Definir Ponto
          </div>
        </div>
      </div>
    </div>
  );
}
