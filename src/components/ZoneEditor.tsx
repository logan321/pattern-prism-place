import React, { useState, useRef, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

// ---- TIPOS ----
interface ZonaMarcada {
  id: string;
  posicaoId: string;
  point: [number, number, number];
  normal: [number, number, number];
  uv: [number, number];
}

// ---- POSIÇÕES PADRÃO ----
const POSICOES = [
  { id: 'peito-esquerdo',  label: 'Peito Esquerdo' },
  { id: 'peito-direito',   label: 'Peito Direito' },
  { id: 'peito-centro',    label: 'Peito Centro' },
  { id: 'costas-topo',     label: 'Costas Topo' },
  { id: 'costas-centro',   label: 'Costas Centro' },
  { id: 'costas-base',     label: 'Costas Base' },
  { id: 'manga-esquerda',  label: 'Manga Esquerda' },
  { id: 'manga-direita',   label: 'Manga Direita' },
];

// ---- MARCADOR 3D — esfera laranja colada na superfície ----
function Marcador({ zona }: { zona: ZonaMarcada }) {
  const normal = new THREE.Vector3(...zona.normal);
  const point = new THREE.Vector3(...zona.point);
  // Offset mínimo para não z-fight com o mesh
  const pos = point.clone().addScaledVector(normal, 0.002);

  return (
    <group position={pos.toArray()}>
      {/* Esfera laranja visível */}
      <mesh>
        <sphereGeometry args={[0.008, 16, 16]} />
        <meshBasicMaterial color="#ea580c" depthTest={false} />
      </mesh>
      {/* Label HTML flutuante */}
      <Html
        center
        distanceFactor={1.5}
        style={{
          pointerEvents: 'none',
          background: '#ea580c',
          color: 'white',
          padding: '2px 6px',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          transform: 'translateY(-18px)',
        }}
      >
        {zona.posicaoId}
      </Html>
    </group>
  );
}

// ---- MODELO COM CLIQUE ----
function ModeloInterativo({
  url,
  onClicar,
  zonas,
}: {
  url: string;
  onClicar: (point: THREE.Vector3, normal: THREE.Vector3, uv: THREE.Vector2) => void;
  zonas: ZonaMarcada[];
}) {
  const { scene } = useGLTF(url);
  const mouseDown = useRef({ x: 0, y: 0 });

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    // Modelo cinza neutro — sem textura para ver bem onde clica
    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m: any) => {
          m = m.clone();
          m.map = null;
          m.emissiveMap = null;
          m.emissive = new THREE.Color(0x000000);
          m.color = new THREE.Color(0xdddddd);
          m.needsUpdate = true;
          // Assign back to handle both array and single material cases
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
    <>
      <primitive
        object={clonedScene}
        onPointerDown={(e: any) => {
          mouseDown.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e: any) => {
          const dx = Math.abs(e.clientX - mouseDown.current.x);
          const dy = Math.abs(e.clientY - mouseDown.current.y);
          if (dx < 5 && dy < 5 && e.face && e.uv) {
            e.stopPropagation();
            onClicar(e.point, e.face.normal, e.uv);
          }
        }}
      />
      {/* Renderizar marcadores como meshes 3D — colados na superfície */}
      {zonas.map((z) => (
        <Marcador key={z.id} zona={z} />
      ))}
    </>
  );
}

// ---- COMPONENTE PRINCIPAL ----
export default function ZoneEditor({ modelUrl, initialZones = [], onSave, onClose }: any) {
  const [zonas, setZonas] = useState<ZonaMarcada[]>(() => {
    // Transform initialZones (flat format) to ZonaMarcada format if needed
    return initialZones.map((z: any) => ({
      id: crypto.randomUUID(),
      posicaoId: z.id,
      point: z.point || [0, 0, 0],
      normal: z.normal || [0, 1, 0],
      uv: z.uv || [0, 0],
    }));
  });
  
  const [pendente, setPendente] = useState<{
    point: THREE.Vector3;
    normal: THREE.Vector3;
    uv: THREE.Vector2;
  } | null>(null);
  const [posicaoSelecionada, setPosicaoSelecionada] = useState('peito-esquerdo');

  const handleClicar = (point: THREE.Vector3, normal: THREE.Vector3, uv: THREE.Vector2) => {
    setPendente({ point: point.clone(), normal: normal.clone(), uv: uv.clone() });
  };

  const handleGravar = () => {
    if (!pendente) return;
    const nova: ZonaMarcada = {
      id: crypto.randomUUID(),
      posicaoId: posicaoSelecionada,
      point: pendente.point.toArray() as [number, number, number],
      normal: pendente.normal.toArray() as [number, number, number],
      uv: [pendente.uv.x, pendente.uv.y],
    };
    setZonas((prev) => {
      // Substituir se já existe a mesma posição
      const semDuplicata = prev.filter((z) => z.posicaoId !== posicaoSelecionada);
      return [...semDuplicata, nova];
    });
    setPendente(null);
  };

  const handleSalvar = () => {
    // Converter para formato compatível com o banco
    const zonasParaSalvar = zonas.map((z) => ({
      id: z.posicaoId,
      name: z.posicaoId,
      uv: z.uv,
      point: z.point,
      normal: z.normal,
    }));
    onSave(zonasParaSalvar);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', zIndex: 60, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#111', borderBottom: '1px solid #222' }}>
        <span style={{ color: 'white', fontWeight: 'bold' }}>Editor de Zonas UV</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSalvar} style={{ background: '#ea580c', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>
            Salvar Marcações
          </button>
          <button onClick={onClose} style={{ background: '#333', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>
            Fechar
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Painel lateral */}
        <div style={{ width: 260, background: '#111', padding: 16, borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ color: '#aaa', fontSize: 12 }}>1. Clique no modelo onde quer marcar</div>
          <div style={{ color: '#aaa', fontSize: 12 }}>2. Selecione o tipo de zona</div>
          <div style={{ color: '#aaa', fontSize: 12 }}>3. Clique em Gravar</div>

          <select
            value={posicaoSelecionada}
            onChange={(e) => setPosicaoSelecionada(e.target.value)}
            style={{ padding: '8px', borderRadius: 6, background: '#222', color: 'white', border: '1px solid #444' }}
          >
            {POSICOES.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>

          {pendente && (
            <div style={{ background: '#1a1a1a', border: '1px solid #ea580c', borderRadius: 6, padding: 12 }}>
              <div style={{ color: '#ea580c', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>Ponto detectado</div>
              <div style={{ color: '#aaa', fontSize: 11 }}>
                UV: {pendente.uv.x.toFixed(4)}, {pendente.uv.y.toFixed(4)}
              </div>
            </div>
          )}

          <button
            onClick={handleGravar}
            disabled={!pendente}
            style={{ background: pendente ? '#ea580c' : '#333', color: 'white', border: 'none', borderRadius: 6, padding: '10px', cursor: pendente ? 'pointer' : 'not-allowed' }}
          >
            + Gravar Zona
          </button>

          <div style={{ color: '#666', fontSize: 11, marginTop: 8 }}>ZONAS GRAVADAS ({zonas.length})</div>
          {zonas.map((z) => (
            <div key={z.id} style={{ background: '#1a1a1a', borderRadius: 6, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontSize: 12 }}>{z.posicaoId}</span>
              <button
                onClick={() => setZonas((prev) => prev.filter((x) => x.id !== z.id))}
                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 16 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Canvas 3D */}
        <div style={{ flex: 1 }}>
          <Canvas camera={{ position: [0, 0.5, 2], fov: 40 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[2, 4, 2]} intensity={1} />
              <ModeloInterativo
                url={modelUrl}
                onClicar={handleClicar}
                zonas={zonas}
              />
              <OrbitControls enablePan={false} />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  );
}
