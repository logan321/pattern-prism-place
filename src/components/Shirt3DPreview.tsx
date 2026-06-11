import React, { useRef, useState, useEffect, useMemo, Suspense, useContext } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Decal, Center } from '@react-three/drei';
import * as THREE from 'three';
import { AppContext } from '../context/AppContext';
import { 
  RotateCw, 
  Maximize, 
  ChevronRight, 
  ChevronLeft, 
  Layout, 
  User, 
  Sidebar,
  RefreshCw
} from 'lucide-react';

interface CustomizationState {
  name: string;
  number: string;
  nameColor: string;
  numberColor: string;
  nameFont: string;
}

function ZoneDecal({ zone, customization }: { zone: any; customization: CustomizationState }) {
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 512;
    canvas.height = 512;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (zone.pathData && zone.pathData.length > 2) {
      ctx.beginPath();
      zone.pathData.forEach((point: { x: number; y: number }, index: number) => {
        const x = (point.x / 100) * canvas.width;
        const y = (point.y / 100) * canvas.height;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.clip();
    }

    const name = zone.name.toLowerCase();
    let content = '';
    let color = '#ffffff';
    let fontSize = 40;

    if (name.includes('nome') || name.includes('name')) {
      content = customization.name || 'NOME';
      color = customization.nameColor;
      fontSize = 60;
    } else if (name.includes('número') || name.includes('number')) {
      content = customization.number || '00';
      color = customization.numberColor;
      fontSize = 120;
    } else {
      content = zone.name;
    }

    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(content, canvas.width / 2, canvas.height / 2);

    const newTexture = new THREE.CanvasTexture(canvas);
    newTexture.needsUpdate = true;
    setTexture(newTexture);
  }, [zone, customization]);

  if (!texture || !zone.position3d) return null;

  const position = new THREE.Vector3(...zone.position3d);
  const normal = zone.normal3d ? new THREE.Vector3(...zone.normal3d) : new THREE.Vector3(0, 0, 1);
  const rotation = new THREE.Euler(0, 0, 0);
  
  const lookAtMatrix = new THREE.Matrix4().lookAt(
    new THREE.Vector3(0, 0, 0),
    normal,
    new THREE.Vector3(0, 1, 0)
  );
  rotation.setFromRotationMatrix(lookAtMatrix);

  if (zone.rotation3d) {
    rotation.z += zone.rotation3d;
  }

  const scale = zone.size3d || 0.2;

  return (
      <Decal
        position={position}
        rotation={rotation}
        scale={[scale, scale, 0.1]}
      >
        <meshStandardMaterial
          map={texture}
          transparent
          polygonOffset
          polygonOffsetFactor={-1}
          roughness={1}
          metalness={0}
        />
      </Decal>
  );
}

function Model({ url, zones, customization }: { url: string; zones: any[]; customization: CustomizationState }) {
  const { scene } = useGLTF(url);
  
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  const positionedZones = useMemo(() => 
    zones.filter(z => z.position3d), 
    [zones]
  );

  return (
    <Center fit>
      <group>
        <primitive object={scene} />
        {positionedZones.map((zone) => (
          <ZoneDecal 
            key={zone.id} 
            zone={zone} 
            customization={customization} 
          />
        ))}
      </group>
    </Center>
  );
}

export function Shirt3DPreview({ 
  modelUrl = "https://vjhzocuofmbtmgyfxtqy.supabase.co/storage/v1/object/public/models/GOLA_PADRE_otimizado.glb",
  customization = {
    name: 'NOME',
    number: '10',
    nameColor: '#ffffff',
    numberColor: '#ffffff',
    nameFont: 'sans-serif'
  }
}: { 
  modelUrl?: string;
  customization?: CustomizationState;
}) {
  const controlsRef = useRef<any>(null);
  const context = useContext(AppContext);
  const zones = context?.zones || [];
  const [autoRotate, setAutoRotate] = useState(false);

  const setView = (position: [number, number, number]) => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      controls.object.position.set(...position);
      controls.target.set(0, 0, 0);
      controls.update();
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/10 group">
      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 0, 2], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Suspense fallback={<Html center className="text-white text-xs font-bold flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
            CARREGANDO MODELO...
          </Html>}>
            <Model url={modelUrl} zones={zones} customization={customization} />
          </Suspense>

          <OrbitControls 
            ref={controlsRef}
            makeDefault 
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            enableZoom={false}
          />
        </Canvas>
      </div>

      {/* Controles Flutuantes */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-lg border transition-all ${
            autoRotate 
              ? 'bg-orange-600 border-orange-500 text-white' 
              : 'bg-black/60 border-white/10 text-gray-400 hover:bg-black/80'
          }`}
          title="Auto Rotação"
        >
          <RotateCw className={`w-5 h-5 ${autoRotate ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Quick Views */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full z-10">
        <button 
          onClick={() => setView([0, 0, 2])}
          className="px-3 py-1 text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
        >
          FRENTE
        </button>
        <div className="w-px h-3 bg-white/10" />
        <button 
          onClick={() => setView([0, 0, -2])}
          className="px-3 py-1 text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
        >
          COSTAS
        </button>
        <div className="w-px h-3 bg-white/10" />
        <button 
          onClick={() => setView([-2, 0, 0])}
          className="px-3 py-1 text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
        >
          ESQ.
        </button>
        <div className="w-px h-3 bg-white/10" />
        <button 
          onClick={() => setView([2, 0, 0])}
          className="px-3 py-1 text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
        >
          DIR.
        </button>
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-4 left-4 p-2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 text-[9px] text-gray-400 font-medium uppercase tracking-widest">
          <Maximize className="w-3 h-3" /> Arraste para girar • Scroll para zoom
        </div>
      </div>
    </div>
  );
}
