import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  position?: [number, number, number]; // Legacy compatibility
  uv?: { x: number; y: number }; 
  meshUuid?: string;
  meshName?: string;
  faceIndex?: number;
}

function uvParaBaricentrico(p: THREE.Vector2, a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2) {
  const v0 = new THREE.Vector2().subVectors(b, a);
  const v1 = new THREE.Vector2().subVectors(c, a);
  const v2 = new THREE.Vector2().subVectors(p, a);
  const d00 = v0.dot(v0);
  const d01 = v0.dot(v1);
  const d11 = v1.dot(v1);
  const d20 = v2.dot(v0);
  const d21 = v2.dot(v1);
  const denom = d00 * d11 - d01 * d01;
  const v = (d11 * d20 - d01 * d21) / denom;
  const w = (d00 * d21 - d01 * d20) / denom;
  const u = 1.0 - v - w;
  return new THREE.Vector3(u, v, w);
}

function uvParaPosicao3DPrecisa(geometry: THREE.BufferGeometry, faceIndex: number, u: number, v: number) {
  const pos = geometry.attributes.position;
  const uvAttr = geometry.attributes.uv;
  const index = geometry.index;

  if (!index || !uvAttr) return new THREE.Vector3();

  const i0 = index.getX(faceIndex * 3);
  const i1 = index.getX(faceIndex * 3 + 1);
  const i2 = index.getX(faceIndex * 3 + 2);

  const uv0 = new THREE.Vector2(uvAttr.getX(i0), uvAttr.getY(i0));
  const uv1 = new THREE.Vector2(uvAttr.getX(i1), uvAttr.getY(i1));
  const uv2 = new THREE.Vector2(uvAttr.getX(i2), uvAttr.getY(i2));

  const p0 = new THREE.Vector3().fromBufferAttribute(pos, i0);
  const p1 = new THREE.Vector3().fromBufferAttribute(pos, i1);
  const p2 = new THREE.Vector3().fromBufferAttribute(pos, i2);

  const bary = uvParaBaricentrico(new THREE.Vector2(u, v), uv0, uv1, uv2);
  return new THREE.Vector3()
    .addScaledVector(p0, bary.x)
    .addScaledVector(p1, bary.y)
    .addScaledVector(p2, bary.z);
}

function ZoneMarker({ zone, scene }: { zone: Zone, scene: THREE.Group }) {
  const markerRef = useRef<THREE.Group>(null);
  const [visible, setVisible] = useState(true);

  useFrame(({ camera }) => {
    if (!markerRef.current || !zone.uv || !zone.meshUuid || zone.faceIndex === undefined) return;

    const mesh = scene.getObjectByProperty('uuid', zone.meshUuid) as THREE.Mesh;
    if (!mesh || !mesh.geometry) return;

    const localPos = uvParaPosicao3DPrecisa(mesh.geometry, zone.faceIndex, zone.uv.x, zone.uv.y);
    const worldPos = localPos.applyMatrix4(mesh.matrixWorld);
    
    markerRef.current.position.copy(worldPos);
    
    // Simple occlusion check
    const ndc = worldPos.clone().project(camera);
    setVisible(ndc.z <= 1);
  });

  if (!visible) return null;

  return (
    <group ref={markerRef}>
      <mesh>
        <sphereGeometry args={[0.01, 16, 16]} />
        <meshStandardMaterial color="#ea580c" emissive="#ea580c" emissiveIntensity={1} depthTest={false} transparent opacity={0.8} />
      </mesh>
      <Html distanceFactor={5} position={[0, 0.02, 0]} center>
        <div className="bg-orange-600 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap font-bold shadow-lg pointer-events-none">
          {zone.name}
        </div>
      </Html>
    </group>
  );
}

function ModelWithClick({ url, onPointSelect, zones }: { url: string, onPointSelect: (hit: any) => void, zones: Zone[] }) {
  const { scene } = useGLTF(url);

  React.useEffect(() => {
    if (scene) {
      const relatorio: any[] = [];
      scene.traverse((obj) => {
        const entry: any = {
          nome: obj.name,
          tipo: obj.type,
          uuid: obj.uuid,
        };

        if (obj instanceof THREE.Mesh) {
          const geo = obj.geometry;
          entry.temUV = !!geo.attributes.uv;
          entry.temIndex = !!geo.index;
          entry.totalVertices = geo.attributes.position?.count ?? 0;
          entry.totalFaces = geo.index ? geo.index.count / 3 : 0;
          entry.materialNome = Array.isArray(obj.material)
            ? obj.material.map((m: any) => m.name)
            : (obj.material as any).name;
          entry.posicaoWorld = obj.getWorldPosition(new THREE.Vector3());
        }
        relatorio.push(entry);
      });
      console.log('=== DIAGNÓSTICO GLB ===');
      console.table(relatorio);
      console.log(JSON.stringify(relatorio, null, 2));
    }
  }, [scene]);
  
  return (
    <group>
      <primitive 
        object={scene} 
        onClick={(e: any) => {
          e.stopPropagation();
          const hit = e.intersections[0];
          if (hit && hit.uv && hit.object) {
            console.log('Hit Mesh:', hit.object.name, 'UUID:', hit.object.uuid);
            onPointSelect(hit);
          }
        }}
      />
      {zones.map((zone) => (
        <ZoneMarker key={zone.id} zone={zone} scene={scene} />
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
  const [selectedHit, setSelectedHit] = useState<any | null>(null);
  const [newZoneName, setNewZoneName] = useState('');

  const handlePointSelect = (hit: any) => {
    setSelectedHit(hit);
  };

  const handleAddZone = () => {
    if (!selectedHit || !newZoneName) return;
    
    const newZone: Zone = {
      id: Math.random().toString(36).substr(2, 9),
      name: newZoneName,
      uv: { x: selectedHit.uv.x, y: selectedHit.uv.y },
      meshUuid: selectedHit.object.uuid,
      meshName: selectedHit.object.name,
      faceIndex: selectedHit.faceIndex,
      position: [selectedHit.point.x, selectedHit.point.y, selectedHit.point.z]
    };
    
    setZones([...zones, newZone]);
    setSelectedHit(null);
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
            {selectedHit ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="bg-orange-600/10 border border-orange-600/20 p-3 rounded-lg">
                  <p className="text-orange-500 text-[10px] font-bold">MESH: {selectedHit.object.name || 'Sem nome'}</p>
                  <p className="text-white text-[10px] truncate font-mono">
                    U: {selectedHit.uv.x.toFixed(3)}, V: {selectedHit.uv.y.toFixed(3)}
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
                  <div className="min-w-0">
                    <p className="text-white font-bold text-xs truncate">{zone.name}</p>
                    {zone.uv ? (
                      <p className="text-orange-500 text-[9px] font-mono">UV: {zone.uv.x.toFixed(2)}, {zone.uv.y.toFixed(2)}</p>
                    ) : (
                      <p className="text-gray-500 text-[9px] font-mono">Legacy POS</p>
                    )}
                  </div>
                  <button 
                    onClick={() => removeZone(zone.id)}
                    className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
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
                <ModelWithClick url={modelUrl} onPointSelect={handlePointSelect} zones={zones} />
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
