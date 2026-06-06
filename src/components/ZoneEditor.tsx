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
  u?: { x: number; y: number }; // Added for compatibility with current usage

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
  const [marcacaoPendente, setMarcacaoPendente] = useState<{
    meshUuid: string;
    faceIndex: number;
    u: number;
    v: number;
    screenX: number;
    screenY: number;
    nome: string;
  } | null>(null);
  
  const mouseStartPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const updateMarkerPos = (id: string, x: number, y: number, visible: boolean) => {
    setZones(prev => prev.map(z => 
      z.id === id ? { ...z, screenX: x, screenY: y, visivel: visible } : z
    ));
  };

  const handlePointSelect = (hit: any, screenPos: { x: number, y: number }) => {
    setMarcacaoPendente({
      meshUuid: hit.object.uuid,
      faceIndex: hit.faceIndex,
      u: hit.uv.x,
      v: hit.uv.y,
      screenX: screenPos.x,
      screenY: screenPos.y,
      nome: '',
    });
  };

  const confirmarMarcacao = () => {
    if (!marcacaoPendente || !marcacaoPendente.nome.trim()) return;
    const nova: Zone = {
      id: crypto.randomUUID(),
      name: marcacaoPendente.nome.trim(),
      meshName: 'Cloth',
      meshUuid: marcacaoPendente.meshUuid,
      u: { x: marcacaoPendente.u, y: marcacaoPendente.v },
      faceIndex: marcacaoPendente.faceIndex,
      screenX: marcacaoPendente.screenX,
      screenY: marcacaoPendente.screenY,
      visivel: true,
    };
    setZones(prev => [...prev, nova]);
    setMarcacaoPendente(null);
  };

  const removeZone = (id: string) => {
    setZones(zones.filter(z => z.id !== id));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const dx = Math.abs(e.clientX - mouseStartPos.current.x);
    const dy = Math.abs(e.clientY - mouseStartPos.current.y);
    
    // Se moveu mais de 5px, é um drag/orbit, não um clique de marcação
    if (dx > 5 || dy > 5) return;

    // O clique real de marcação é tratado pelo ModelWithClick via R3F events
    // Mas precisamos capturar a posição da tela aqui para o popover
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Guardamos para uso no callback do hit
      (window as any)._lastClickPos = { x, y };
    }
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
        <div 
          ref={containerRef}
          className="flex-1 bg-black relative"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <Canvas camera={{ position: [0, 0, 2], fov: 45 }}>
            <Suspense fallback={null}>
              <Stage intensity={0.5} environment="city" shadows="contact" adjustCamera={false}>
                <ModelWithClick 
                  url={modelUrl} 
                  onPointSelect={(hit) => handlePointSelect(hit, (window as any)._lastClickPos || { x: 0, y: 0 })} 
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

          {/* Marcador Pendente */}
          {marcacaoPendente && (
            <div
              style={{
                position: 'absolute',
                left: marcacaoPendente.screenX - 10,
                top: marcacaoPendente.screenY - 10,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'orange',
                border: '2px solid white',
                pointerEvents: 'none',
                zIndex: 11,
              }}
            />
          )}

          {/* Popover de Nomeação */}
          {marcacaoPendente && (
            <div style={{
              position: 'absolute',
              left: marcacaoPendente.screenX + 15,
              top: marcacaoPendente.screenY - 10,
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: '10px 12px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              minWidth: 200,
            }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>Nome da zona</span>
              <input
                autoFocus
                value={marcacaoPendente.nome}
                onChange={(e) => setMarcacaoPendente(prev => ({ ...prev!, nome: e.target.value }))}
                placeholder="Ex: Peito Esquerdo"
                style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #ddd', fontSize: 13, color: '#000' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmarMarcacao();
                  if (e.key === 'Escape') setMarcacaoPendente(null);
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={confirmarMarcacao} 
                  style={{ flex: 1, background: '#f60', color: 'white', border: 'none', borderRadius: 4, padding: '6px 0', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Confirmar
                </button>
                <button 
                  onClick={() => setMarcacaoPendente(null)} 
                  style={{ flex: 1, background: '#eee', color: '#333', border: 'none', borderRadius: 4, padding: '6px 0', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          
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
