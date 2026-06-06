import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
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
  screenX?: number;
  screenY?: number;
  visivel?: boolean;
}

function calcularBaricentrico(p: THREE.Vector2, a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2): THREE.Vector3 {
  const v0 = c.clone().sub(a);
  const v1 = b.clone().sub(a);
  const v2 = p.clone().sub(a);
  const dot00 = v0.dot(v0);
  const dot01 = v0.dot(v1);
  const dot02 = v0.dot(v2);
  const dot11 = v1.dot(v1);
  const dot12 = v1.dot(v2);
  const inv = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * inv;
  const v = (dot00 * dot12 - dot01 * dot02) * inv;
  return new THREE.Vector3(1 - u - v, v, u);
}

function reprojetarMarcacao(marcacao: Zone, camera: THREE.Camera, canvasWidth: number, canvasHeight: number, scene: THREE.Group) {
  if (!marcacao.uv || !marcacao.meshUuid || marcacao.faceIndex === undefined) return null;
  
  const mesh = scene.getObjectByProperty('uuid', marcacao.meshUuid) as THREE.Mesh;
  if (!mesh) return null;

  const geo = mesh.geometry;
  const posAttr = geo.attributes.position;
  const uvAttr = geo.attributes.uv;
  const indexAttr = geo.index!;

  const fi = marcacao.faceIndex * 3;
  const i0 = indexAttr.getX(fi);
  const i1 = indexAttr.getX(fi + 1);
  const i2 = indexAttr.getX(fi + 2);

  const p0 = new THREE.Vector3().fromBufferAttribute(posAttr, i0);
  const p1 = new THREE.Vector3().fromBufferAttribute(posAttr, i1);
  const p2 = new THREE.Vector3().fromBufferAttribute(posAttr, i2);

  const uv0 = new THREE.Vector2(uvAttr.getX(i0), uvAttr.getY(i0));
  const uv1 = new THREE.Vector2(uvAttr.getX(i1), uvAttr.getY(i1));
  const uv2 = new THREE.Vector2(uvAttr.getX(i2), uvAttr.getY(i2));

  const bary = calcularBaricentrico(new THREE.Vector2(marcacao.uv.x, marcacao.uv.y), uv0, uv1, uv2);

  const pos3D = new THREE.Vector3()
    .addScaledVector(p0, bary.x)
    .addScaledVector(p1, bary.y)
    .addScaledVector(p2, bary.z);

  pos3D.applyMatrix4(mesh.matrixWorld);

  const ndc = pos3D.clone().project(camera);
  if (ndc.z > 1) return null;

  return {
    x: (ndc.x * 0.5 + 0.5) * canvasWidth,
    y: (-ndc.y * 0.5 + 0.5) * canvasHeight,
  };
}

function HTMLMarkersUpdater({ zones, scene, onUpdate }: { zones: Zone[], scene: THREE.Group, onUpdate: (id: string, x: number, y: number, visible: boolean) => void }) {
  useFrame(({ camera, gl }) => {
    zones.forEach((zone) => {
      const pos = reprojetarMarcacao(zone, camera, gl.domElement.clientWidth, gl.domElement.clientHeight, scene);
      if (pos) {
        onUpdate(zone.id, pos.x, pos.y, true);
      } else {
        onUpdate(zone.id, 0, 0, false);
      }
    });
  });

  return null;
}

function ModelWithClick({ url, onPointSelect, zones, updateMarkerPos }: { 
  url: string, 
  onPointSelect: (hit: any) => void, 
  zones: Zone[],
  updateMarkerPos: (id: string, x: number, y: number, visible: boolean) => void
}) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    if (scene) {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.updateMatrixWorld(true);
        }
      });
    }
  }, [scene]);
  
  return (
    <group>
      <primitive 
        object={scene} 
        onClick={(e: any) => {
          e.stopPropagation();
          const meshAlvo: THREE.Mesh[] = [];
          scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh && obj.name === 'Cloth') {
              meshAlvo.push(obj);
            }
          });
          
          const raycaster = e.raycaster;
          const intersects = raycaster.intersectObjects(meshAlvo, false);
          
          if (intersects.length > 0) {
            const hit = intersects[0];
            if (hit.uv && hit.faceIndex !== undefined) {
              console.log('Hit Cloth Mesh:', hit.object.name, 'UUID:', hit.object.uuid);
              onPointSelect(hit);
            }
          }
        }}
      />
      <HTMLMarkersUpdater zones={zones} scene={scene} onUpdate={updateMarkerPos} />
    </group>
  );
}

export default function ZoneEditor({ modelUrl, initialZones = [], onSave, onClose }: { 
  modelUrl: string, 
  initialZones?: Zone[], 
  onSave: (zones: Zone[]) => void,
  onClose: () => void 
}) {
  const [zones, setZones] = useState<Zone[]>(initialZones.map(z => ({ ...z, visivel: false, screenX: 0, screenY: 0 })));
  const [selectedHit, setSelectedHit] = useState<any | null>(null);
  const [newZoneName, setNewZoneName] = useState('');

  const updateMarkerPos = (id: string, x: number, y: number, visible: boolean) => {
    setZones(prev => prev.map(z => 
      z.id === id ? { ...z, screenX: x, screenY: y, visivel: visible } : z
    ));
  };

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
      visivel: false,
      screenX: 0,
      screenY: 0
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
                <ModelWithClick 
                  url={modelUrl} 
                  onPointSelect={handlePointSelect} 
                  zones={zones} 
                  updateMarkerPos={updateMarkerPos}
                />
              </Stage>
              <OrbitControls makeDefault />
            </Suspense>
          </Canvas>

          {/* Marcadores HTML sobre o Canvas */}
          {zones.map((m) => (
            m.visivel && (
              <div
                key={m.id}
                style={{
                  position: 'absolute',
                  left: (m.screenX || 0) - 10,
                  top: (m.screenY || 0) - 10,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'orange',
                  border: '2px solid white',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              />
            )
          ))}
          
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
