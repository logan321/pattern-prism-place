import React, { Suspense, useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
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
  const { scene } = useGLTF(url);
  const clonedScene = React.useMemo(() => scene.clone(), [scene, url]);
  const [uvTexture, setUvTexture] = useState<THREE.CanvasTexture | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  
  const name = useCustomizerStore(state => state.name);
  const number = useCustomizerStore(state => state.number);
  const nameColor = useCustomizerStore(state => state.nameColor);
  const numberColor = useCustomizerStore(state => state.numberColor);
  const nameFont = useCustomizerStore(state => state.nameFont);
  const namePosition = useCustomizerStore(state => state.namePosition);
  const shieldPosition = useCustomizerStore(state => state.shieldPosition);
  const shieldUrl = useCustomizerStore(state => state.shieldUrl);

  useEffect(() => {
    const drawOnCanvas = async () => {
      const canvas = canvasRef.current;
      canvas.width = 2048;
      canvas.height = 2048;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const getCoord = (uv: [number, number]): [number, number] => {
        // Tratar o UV considerando flipY=false no Three.js
        // Se flipY=false, UV(0,0) é Top-Left
        return [uv[0] * canvas.width, uv[1] * canvas.height];
      };

      // Zonas
      const findZone = (search: string) => zones.find(z => z.name.toUpperCase().includes(search.toUpperCase()));
      
      const nameZoneRight = findZone('PEITO DIREITO') || findZone('DIREITO');
      const nameZoneLeft = findZone('PEITO ESQUERDO') || findZone('ESQUERDO');
      const nameZoneTop = findZone('NOME TOPO') || findZone('TOPO');
      const numberZoneCenter = findZone('NUMERO CENTRO') || findZone('NÚMERO CENTRO') || findZone('NUMERO') || findZone('NÚMERO');

      // 1. Escudo
      const targetShieldZone = shieldPosition === 'left' ? nameZoneLeft : nameZoneRight;
      if (targetShieldZone?.uv) {
        const [sx, sy] = getCoord(targetShieldZone.uv);
        
        if (shieldUrl) {
          try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = shieldUrl;
            });
            const size = 120;
            ctx.drawImage(img, sx - size / 2, sy - size / 2, size, size);
          } catch (e) {
            console.error("Erro ao carregar escudo:", e);
          }
        } else {
          // Placeholder do Escudo
          ctx.beginPath();
          ctx.arc(sx, sy, 50, 0, Math.PI * 2);
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 6;
          ctx.stroke();
          
          ctx.font = 'bold 20px Arial';
          ctx.fillStyle = '#ff0000';
          ctx.textAlign = 'center';
          ctx.fillText('ESCUDO', sx, sy + 7);
        }
      }

      // 2. Nome
      if (name) {
        let targetZone = nameZoneTop;
        if (namePosition === 'right') targetZone = nameZoneRight;
        if (namePosition === 'left') targetZone = nameZoneLeft;
        
        if (targetZone?.uv) {
          const [tx, ty] = getCoord(targetZone.uv);
          ctx.font = `bold 80px ${nameFont}`;
          ctx.fillStyle = nameColor;
          ctx.textAlign = 'center';
          // Ajuste fino para não sobrepor o escudo se estiver no mesmo peito
          const offset = (namePosition === 'right' || namePosition === 'left') ? 80 : 0;
          ctx.fillText(name.toUpperCase(), tx, ty + offset);
        }
      }

      // 3. Número
      if (number) {
        if (numberZoneCenter?.uv) {
          const [nx, ny] = getCoord(numberZoneCenter.uv);
          ctx.font = `bold 300px ${nameFont}`;
          ctx.fillStyle = numberColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(number, nx, ny);
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.flipY = false;
      texture.needsUpdate = true;
      setUvTexture(texture);
    };

    drawOnCanvas();
  }, [zones, name, number, nameColor, numberColor, nameFont, namePosition, shieldPosition, shieldUrl]);

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

        clonedScene.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh && mesh.material) {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            console.log("Mesh encontrado:", mesh.name, "Materials count:", materials.length);
            materials.forEach((mat) => {
              console.log("Processando material:", mat.type, "em mesh:", mesh.name);
              if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                // Forçar a textura principal
                if (mat.map) mat.map.dispose();
                mat.map = texture;
                
                // Aplicar a textura UV de sobreposição (Nome/Número/Escudo)
                if (uvTexture) {
                  console.log("Aplicando uvTexture ao material:", mat.name);
                  mat.emissiveMap = uvTexture;
                  mat.emissive = new THREE.Color(0xffffff);
                  mat.emissiveIntensity = 1.5;
                  mat.needsUpdate = true;
                } else {
                  mat.emissiveMap = null;
                  mat.emissive = new THREE.Color(0x000000);
                  mat.emissiveIntensity = 0;
                }
                
                mat.transparent = true;
                mat.alphaTest = 0.5;
                mat.roughness = 0.5;
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
  }, [clonedScene, textureUrl, uvTexture]);


  return (
    <group>
      <primitive object={clonedScene} />
      
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
