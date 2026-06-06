import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  position: [number, number, number];
  rotation?: [number, number, number];
}

function ModelWithClick({ url, onPointSelect, zones }: { url: string, onPointSelect: (point: THREE.Vector3) => void, zones: Zone[] }) {
  const { scene } = useGLTF(url);
  
  return (
    <group>
      <primitive 
        object={scene} 
        onClick={(e: any) => {
          e.stopPropagation();
          onPointSelect(e.point);
        }}
      />
      {zones.map((zone) => (
        <group key={zone.id} position={zone.position}>
          <mesh>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color="#ea580c" />
          </mesh>
          <Html distanceFactor={10} position={[0, 0.05, 0]}>
            <div className="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap font-bold shadow-lg">
              {zone.name}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

export default function ZoneEditor({ modelUrl, initialZones = [], onSave, onClose }: { 
  modelUrl: string, 
  initialZones?: Zone[], 
  onSave: (zones: Zone[]) => void,
  onClose: () => void 
}) {
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [selectedPoint, setSelectedPoint] = useState<THREE.Vector3 | null>(null);
  const [newZoneName, setNewZoneName] = useState('');

  const handleAddZone = () => {
    if (!selectedPoint || !newZoneName) return;
    
    const newZone: Zone = {
      id: Math.random().toString(36).substr(2, 9),
      name: newZoneName,
      position: [selectedPoint.x, selectedPoint.y, selectedPoint.z]
    };
    
    setZones([...zones, newZone]);
    setSelectedPoint(null);
    setNewZoneName('');
  };

  const removeZone = (id: string) => {
    setZones(zones.filter(z => z.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col">
      <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-lg">Editor de Zonas 3D</h3>
          <p className="text-gray-400 text-xs">Clique no modelo para marcar uma nova zona de estampa</p>
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
        {/* Sidebar de Zonas */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 p-6 flex flex-col">
          <div className="mb-8">
            <h4 className="text-gray-400 text-[10px] font-bold uppercase mb-4">Adicionar Nova Zona</h4>
            {selectedPoint ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="bg-orange-600/10 border border-orange-600/20 p-3 rounded-lg">
                  <p className="text-orange-500 text-[10px] font-bold">PONTO SELECIONADO</p>
                  <p className="text-white text-xs truncate font-mono">
                    {selectedPoint.x.toFixed(3)}, {selectedPoint.y.toFixed(3)}, {selectedPoint.z.toFixed(3)}
                  </p>
                </div>
                <input 
                  type="text"
                  placeholder="Nome da Zona (ex: Escudo)"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-1 focus:ring-orange-500"
                  value={newZoneName}
                  onChange={e => setNewZoneName(e.target.value)}
                />
                <button 
                  onClick={handleAddZone}
                  className="w-full bg-white text-black font-bold py-2 rounded-lg text-sm flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Confirmar Zona</span>
                </button>
              </div>
            ) : (
              <div className="bg-gray-800/50 border border-gray-700 border-dashed p-6 rounded-xl text-center">
                <p className="text-gray-500 text-xs italic">Clique em qualquer parte do modelo 3D para selecionar a posição da zona.</p>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <h4 className="text-gray-400 text-[10px] font-bold uppercase mb-4">Zonas Mapeadas ({zones.length})</h4>
            <div className="space-y-2">
              {zones.map(zone => (
                <div key={zone.id} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between group">
                  <div>
                    <p className="text-white font-bold text-xs">{zone.name}</p>
                    <p className="text-gray-500 text-[10px] font-mono">XYZ: {zone.position.map(p => p.toFixed(2)).join(', ')}</p>
                  </div>
                  <button 
                    onClick={() => removeZone(zone.id)}
                    className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {zones.length === 0 && (
                <p className="text-gray-600 text-center text-xs py-8">Nenhuma zona marcada ainda.</p>
              )}
            </div>
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 bg-black relative">
          <Canvas camera={{ position: [0, 0, 2], fov: 45 }}>
            <Suspense fallback={null}>
              <Stage intensity={0.5} environment="city" shadows="contact" adjustCamera={false}>
                <ModelWithClick url={modelUrl} onPointSelect={setSelectedPoint} zones={zones} />
              </Stage>
              <OrbitControls makeDefault />
            </Suspense>
          </Canvas>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-4">
            <div className="bg-gray-900/80 backdrop-blur px-4 py-2 rounded-full border border-gray-700">
              <p className="text-white text-xs font-medium">Use o botão esquerdo para girar e clique para marcar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
