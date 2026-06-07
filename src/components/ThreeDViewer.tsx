import React, { Suspense, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from 'react-error-boundary';
import { gsap } from 'gsap';
import { useCustomizerStore } from '../store/useCustomizerStore';

interface Zone {
  id: string;
  name: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  uv?: [number, number];
}

function Model({ url, textureUrl, zones = [] }: { url: string; textureUrl?: string; zones?: Zone[] }) {
  console.log("Zones recebidas no Model:", zones);
  const { scene } = useGLTF(url);
  const [uvTexture, setUvTexture] = React.useState<THREE.CanvasTexture | null>(null);
  
  const name = useCustomizerStore(state => state.name);
  const number = useCustomizerStore(state => state.number);
  const nameColor = useCustomizerStore(state => state.nameColor);
  const numberColor = useCustomizerStore(state => state.numberColor);
  const nameFont = useCustomizerStore(state => state.nameFont);

  // Efeito para criar a textura de zonas baseada em UV
  useEffect(() => {
    console.log("Criando textura UV para zones e texto:", { zones, name, number, nameColor, numberColor, nameFont });
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar Zonas
    zones.forEach((zone) => {
      if (zone.uv) {
        console.log(`Renderizando visualmente a zona na textura UV: ${zone.name}`, zone.uv);
        const x = zone.uv[0] * canvas.width;
        const y = (1 - zone.uv[1]) * canvas.height;

        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#ea580c';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(zone.name, x, y - 25);
      }
    });

    // Desenhar Nome e Número
    if (name) {
      ctx.font = `bold 120px ${nameFont}`;
      ctx.fillStyle = nameColor;
      ctx.textAlign = 'center';
      // Posicionamento estimado para as costas na UV
      ctx.fillText(name.toUpperCase(), canvas.width * 0.5, canvas.height * 0.2);
    }

    if (number) {
      ctx.font = `bold 300px ${nameFont}`;
      ctx.fillStyle = numberColor;
      ctx.textAlign = 'center';
      // Posicionamento estimado para as costas na UV
      ctx.fillText(number, canvas.width * 0.5, canvas.height * 0.45);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.flipY = false;
    setUvTexture(texture);
  }, [zones, name, number, nameColor, numberColor, nameFont]);

  useEffect(() => {
    const applyTexture = (imageSrc: string) => {
      console.log("Iniciando aplicação de textura:", imageSrc);
      const textureLoader = new THREE.TextureLoader();
      textureLoader.crossOrigin = 'anonymous';
      
      textureLoader.load(imageSrc, (texture) => {
        texture.flipY = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = 16;
        texture.needsUpdate = true;

        scene.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh && mesh.material) {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            console.log("Mesh encontrado:", mesh.name, "Materials count:", materials.length);
            materials.forEach((mat) => {
              console.log("Processando material:", mat.type);
              if (mat instanceof THREE.MeshStandardMaterial) {
                if (mat.map) mat.map.dispose();
                mat.map = texture;
                
                if (uvTexture) {
                  mat.emissiveMap = uvTexture;
                  mat.emissive = new THREE.Color(0xffffff);
                  mat.emissiveIntensity = 2.0;
                } else {
                  mat.emissiveMap = null;
                  mat.emissive = new THREE.Color(0x000000);
                  mat.emissiveIntensity = 0;
                }
                
                mat.roughness = 1;
                mat.metalness = 0;
                mat.needsUpdate = true;
              }
            });
          }
        });
      }, undefined, (err) => {
        console.error("Erro ao carregar textura:", err);
      });
    };

    if (textureUrl) {
      if (textureUrl.endsWith('.svg') || textureUrl.includes('svg')) {
        fetch(textureUrl).then(r => r.blob()).then(blob => applyTexture(URL.createObjectURL(blob)));
      } else {
        applyTexture(textureUrl);
      }
    }
  }, [scene, textureUrl, uvTexture]);

  const name = useCustomizerStore(state => state.name);
  const number = useCustomizerStore(state => state.number);
  const nameColor = useCustomizerStore(state => state.nameColor);
  const numberColor = useCustomizerStore(state => state.numberColor);

  return (
    <group>
      <primitive object={scene} />
      
      {/* Removemos o mapeamento redundante das zonas para evitar duplicação no 3D */}

    </group>
  );
}

function FallbackError({ error }: { error: any }) {
  console.error('Erro ThreeDViewer:', error);
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 gap-2">
      <p className="text-red-500 font-bold">Erro ao carregar o modelo 3D</p>
      <p className="text-red-400 text-sm text-center px-4">{error?.message}</p>
    </div>
  );
}

export interface ThreeDViewerRef {
  setView: (view: 'front' | 'back' | 'left' | 'right') => void;
  zoom: (direction: 'in' | 'out') => void;
}

export const ThreeDViewer = forwardRef<ThreeDViewerRef, { modelUrl?: string; textureUrl?: string; zones?: Zone[] }>(
  ({ modelUrl, textureUrl, zones = [] }, ref) => {
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
      <ErrorBoundary FallbackComponent={FallbackError}>
        <Canvas shadows camera={{ position: [0, 0, 2.0], fov: 45 }}>
          <Suspense fallback={null}>
          <Stage intensity={0.5} environment="city" shadows="contact" adjustCamera={false} preset="rembrandt">
            <Model url={modelUrl} textureUrl={textureUrl} zones={zones} />
          </Stage>
          <OrbitControls 
            ref={orbitRef} 
            makeDefault 
            minDistance={1.0} 
            maxDistance={6} 
            enablePan={false}
          />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    );
  }
);
