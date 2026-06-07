import React, { Suspense, useEffect, useRef, useImperativeHandle, forwardRef, useMemo, useState, useContext } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Decal } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { AppContext } from '../context/AppContext';

export interface ThreeDViewerRef {
  setView: (view: 'front' | 'back' | 'left' | 'right') => void;
  zoom: (direction: 'in' | 'out') => void;
}

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
    let color = customization.nameColor || '#ffffff';
    let fontSize = 40;

    if (name.includes('nome') || name.includes('name')) {
      content = customization.name || '';
      color = customization.nameColor;
      fontSize = 60;
    } else if (name.includes('número') || name.includes('number')) {
      content = customization.number || '';
      color = customization.numberColor;
      fontSize = 120;
    } else {
      content = zone.name;
    }

    if (!content) return;

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
  
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  rotation.setFromQuaternion(quaternion);

  if (zone.rotation3d) {
    rotation.z += zone.rotation3d;
  }

  const scale = zone.size3d || 0.2;

  return (
    <Decal
      position={position}
      rotation={rotation}
      scale={[scale, scale, 1]}
      map={texture}
    />
  );
}

function Model({ url, finalTexture, customization }: { url: string; finalTexture?: THREE.Texture; customization: CustomizationState }) {
  const { scene } = useGLTF(url);
  const context = useContext(AppContext);
  const zones = context?.zones || [];

  const clonedScene = useMemo(() => {
    console.log('ThreeDViewer: Clonando cena para o modelo:', url);
    return scene.clone();
  }, [scene, url]);

  useEffect(() => {
    if (!clonedScene) return;
    
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              if (finalTexture) {
                finalTexture.needsUpdate = true;
                mat.map = finalTexture;
                mat.color.set(0xffffff);
                mat.needsUpdate = true;
              } else {
                mat.color.set(0xcccccc);
              }
            }
          });
        }
      }
    });
  }, [clonedScene, finalTexture]);

  const positionedZones = useMemo(() => 
    zones.filter(z => z.position3d), 
    [zones]
  );

  return (
    <group>
      <primitive object={clonedScene} />
      {positionedZones.map((zone) => (
        <ZoneDecal 
          key={zone.id} 
          zone={zone} 
          customization={customization} 
        />
      ))}
    </group>
  );
}

export const ThreeDViewer = forwardRef<ThreeDViewerRef, { 
  modelUrl?: string; 
  finalTexture?: THREE.Texture;
  customization?: CustomizationState;
}>(({ modelUrl, finalTexture, customization = { name: '', number: '', nameColor: '#ffffff', numberColor: '#ffffff', nameFont: 'Arial' } }, ref) => {
  const orbitRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    setView: (view) => {
      if (!orbitRef.current) return;
      const controls = orbitRef.current;
      const defaultDistance = 2.0;
      let targetTheta = 0;
      let targetPhi = Math.PI / 2;
      switch (view) {
        case 'front': targetTheta = 0; break;
        case 'back': targetTheta = Math.PI; break;
        case 'left': targetTheta = -Math.PI / 2; break;
        case 'right': targetTheta = Math.PI / 2; break;
      }
      const proxy = { 
        theta: controls.getAzimuthalAngle(), 
        phi: controls.getPolarAngle(),
        distance: controls.getDistance()
      };
      let endTheta = targetTheta;
      const diff = endTheta - proxy.theta;
      if (diff > Math.PI) endTheta -= 2 * Math.PI;
      if (diff < -Math.PI) endTheta += 2 * Math.PI;
      gsap.to(proxy, {
        theta: endTheta,
        phi: targetPhi,
        distance: defaultDistance,
        duration: 0.8,
        ease: 'power2.inOut',
        onUpdate: () => {
          const sinPhi = Math.sin(proxy.phi);
          const x = proxy.distance * sinPhi * Math.sin(proxy.theta);
          const y = proxy.distance * Math.cos(proxy.phi);
          const z = proxy.distance * sinPhi * Math.cos(proxy.theta);
          controls.object.position.set(x, y, z);
          controls.update();
        }
      });
    },
    zoom: (direction) => {
      const controls = orbitRef.current;
      if (!controls) return;
      const currentDistance = controls.getDistance();
      const factor = direction === 'in' ? 0.85 : 1.15;
      const newDistance = Math.min(Math.max(currentDistance * factor, 1.2), 5);
      const proxy = { distance: currentDistance };
      gsap.to(proxy, {
        distance: newDistance,
        duration: 0.5,
        ease: 'power2.out',
        onUpdate: () => {
          const distance = controls.getDistance();
          if (distance === 0) return;
          const ratio = proxy.distance / distance;
          controls.object.position.multiplyScalar(ratio);
          controls.update();
        }
      });
    }
  }));

  if (!modelUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
        Selecione um modelo para visualizar
      </div>
    );
  }

  return (
    <div className="w-full h-full relative group">
      <Canvas shadows camera={{ position: [0, 0, 2], fov: 45 }} gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
          <directionalLight position={[-5, 5, -5]} intensity={0.8} />
          <pointLight position={[0, -5, 0]} intensity={0.5} />
          <Model url={modelUrl} finalTexture={finalTexture} customization={customization} />
          <OrbitControls 
            ref={orbitRef}
            enablePan={false}
            minDistance={1.2}
            maxDistance={5}
            makeDefault
          />
        </Suspense>
      </Canvas>
    </div>
  );
});
