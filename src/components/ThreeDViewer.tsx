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
  tipo?: 'nome' | 'numero' | 'logo' | 'estampa' | 'outro';
  position: [number, number, number];
  rotation?: [number, number, number];
  uv?: [number, number];
}

function Model({ 
  url, 
  textureUrl, 
  zones = [],
  name,
  number,
  nameColor,
  numberColor,
  nameFont,
  namePosition,
  shieldPosition,
  shieldUrl
}: { 
  url: string; 
  textureUrl?: string; 
  zones?: Zone[];
  name?: string;
  number?: string;
  nameColor?: string;
  numberColor?: string;
  nameFont?: string;
  namePosition?: string;
  shieldPosition?: string;
  shieldUrl?: string | null;
}) {
  const { scene } = useGLTF(url);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              mat.emissive = new THREE.Color(0xffffff);
              mat.emissiveIntensity = 0;
              mat.needsUpdate = true;
            }
          });
        }
      }
    });
    return clone;
  }, [scene]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawOnCanvas = async () => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 2048;
      canvasRef.current.height = 2048;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    console.log('COMPOSITOR — zones recebidas:', zones);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const getCoord = (uv: [number, number]): [number, number] => {
      return [uv[0] * canvas.width, (1 - uv[1]) * canvas.height];
    };

    // Buscar por TIPO, não por nome
    const logoZone   = zones?.find(z => z.tipo === 'logo');
    const nameZone   = zones?.find(z => z.tipo === 'nome');
    const numberZone = zones?.find(z => z.tipo === 'numero');

    console.log('logoZone:', logoZone);
    console.log('nameZone:', nameZone);
    console.log('numberZone:', numberZone);

    // 1. Desenhar Logo
    if (shieldUrl && logoZone?.uv) {
      try {
        const [sx, sy] = getCoord(logoZone.uv as [number, number]);
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = shieldUrl;
        });
        const size = 180;
        ctx.drawImage(img, sx - size / 2, sy - size / 2, size, size);
      } catch (e) {
        console.warn("Logo não carregou:", e);
      }
    }

    // 2. Desenhar Nome
    if (name && nameZone?.uv) {
      const [tx, ty] = getCoord(nameZone.uv as [number, number]);
      ctx.save();
      ctx.font = `bold 80px ${nameFont || 'Arial'}`;
      ctx.fillStyle = nameColor || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name.toUpperCase(), tx, ty);
      ctx.restore();
    }

    // 3. Desenhar Número
    if (number && numberZone?.uv) {
      const [nx, ny] = getCoord(numberZone.uv as [number, number]);
      ctx.save();
      ctx.font = `bold 350px ${nameFont || 'Arial'}`;
      ctx.fillStyle = numberColor || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(number, nx, ny);
      ctx.restore();
    }

    // Aplicar ou atualizar textura
    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    } else {
      const uvTexture = new THREE.CanvasTexture(canvas);
      uvTexture.flipY = false;
      uvTexture.colorSpace = THREE.SRGBColorSpace;
      textureRef.current = uvTexture;

      clonedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              mat.emissiveMap = uvTexture;
              mat.emissive.set(0xffffff); 
              mat.emissiveIntensity = 1.0;
              mat.transparent = true;
              mat.needsUpdate = true;
            }
          });
        }
      });
    }
  };

  useEffect(() => {
    drawOnCanvas();
  }, [zones, name, number, nameColor, numberColor, nameFont, shieldUrl, clonedScene]);

  // 2. Efeito para carregar a Estampa Principal (textureUrl)
  useEffect(() => {
    if (!textureUrl) return;

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';

    const loadAndApply = (url: string) => {
      loader.load(url, (tex) => {
        tex.flipY = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;

        clonedScene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                if (mat.map) mat.map.dispose();
                mat.map = tex;
                mat.needsUpdate = true;
              }
            });
          }
        });
      });
    };

    if (textureUrl.includes('svg')) {
      fetch(textureUrl)
        .then(r => r.blob())
        .then(blob => loadAndApply(URL.createObjectURL(blob)))
        .catch(err => console.error("Erro ao carregar SVG:", err));
    } else {
      loadAndApply(textureUrl);
    }
  }, [textureUrl, clonedScene]);

  return <primitive object={clonedScene} />;
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

export const ThreeDViewer = forwardRef<ThreeDViewerRef, { 
  modelUrl?: string; 
  textureUrl?: string; 
  zones?: Zone[];
  name?: string;
  number?: string;
  nameColor?: string;
  numberColor?: string;
  nameFont?: string;
  namePosition?: string;
  shieldPosition?: string;
  shieldUrl?: string | null;
}>(
  ({ 
    modelUrl, 
    textureUrl, 
    zones = [],
    name,
    number,
    nameColor,
    numberColor,
    nameFont,
    namePosition,
    shieldPosition,
    shieldUrl
  }, ref) => {
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
            <Model 
              url={modelUrl} 
              textureUrl={textureUrl} 
              zones={zones} 
              name={name}
              number={number}
              nameColor={nameColor}
              numberColor={numberColor}
              nameFont={nameFont}
              namePosition={namePosition}
              shieldPosition={shieldPosition}
              shieldUrl={shieldUrl}
            />
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
