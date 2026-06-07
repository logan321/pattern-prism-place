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
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone();
    // Preparar materiais para aceitar emissive (overlay)
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              mat.emissive = new THREE.Color(0xffffff);
              mat.emissiveIntensity = 0; // Começa desligado
            }
          });
        }
      }
    });
    return clone;
  }, [scene]);

  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  
  const name = useCustomizerStore(state => state.name);
  const number = useCustomizerStore(state => state.number);
  const nameColor = useCustomizerStore(state => state.nameColor);
  const numberColor = useCustomizerStore(state => state.numberColor);
  const nameFont = useCustomizerStore(state => state.nameFont);
  const namePosition = useCustomizerStore(state => state.namePosition);
  const shieldPosition = useCustomizerStore(state => state.shieldPosition);
  const shieldUrl = useCustomizerStore(state => state.shieldUrl);

  // 1. Efeito para desenhar o Overlay (Nome/Número/Escudo) no Canvas
  useEffect(() => {
    let isMounted = true;
    const drawOnCanvas = async () => {
      const canvas = canvasRef.current;
      if (canvas.width !== 2048) {
        canvas.width = 2048;
        canvas.height = 2048;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const getCoord = (uv: [number, number]): [number, number] => {
        return [uv[0] * canvas.width, (1 - uv[1]) * canvas.height];
      };

      const effectiveZones = zones && zones.length > 0 ? zones : [
        { name: 'PEITO DIREITO', uv: [0.35, 0.65] },
        { name: 'PEITO ESQUERDO', uv: [0.65, 0.65] },
        { name: 'NOME TOPO', uv: [0.5, 0.85] },
        { name: 'NUMERO CENTRO', uv: [0.5, 0.5] }
      ];

      const findZone = (search: string) => {
        return (effectiveZones as any[]).find(z => 
          z.name?.toUpperCase().includes(search.toUpperCase())
        );
      };
      
      const zonePeitoDireito = findZone('PEITO DIREITO') || findZone('DIREITO');
      const zonePeitoEsquerdo = findZone('PEITO ESQUERDO') || findZone('ESQUERDO');
      const zoneNomeTopo = findZone('NOME TOPO') || findZone('TOPO');
      const zoneNumeroCentro = findZone('NUMERO CENTRO') || findZone('NÚMERO CENTRO') || findZone('NUMERO') || findZone('NÚMERO');

      // Escudo
      const targetShieldZone = shieldPosition === 'left' ? zonePeitoEsquerdo : zonePeitoDireito;
      if (targetShieldZone?.uv) {
        const [sx, sy] = getCoord(targetShieldZone.uv as [number, number]);
        if (shieldUrl) {
          try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = shieldUrl;
            });
            if (!isMounted) return;
            const size = 180;
            ctx.drawImage(img, sx - size / 2, sy - size / 2, size, size);
          } catch (e) {
            console.error("Erro ao carregar escudo:", e);
          }
        } else {
          ctx.beginPath();
          ctx.arc(sx, sy, 60, 0, Math.PI * 2);
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 8;
          ctx.stroke();
          ctx.font = 'bold 24px Arial';
          ctx.fillStyle = '#ff0000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('ESCUDO', sx, sy);
        }
      }

      // Nome
      if (name) {
        let targetZone = zoneNomeTopo;
        if (namePosition === 'right') targetZone = zonePeitoDireito;
        if (namePosition === 'left') targetZone = zonePeitoEsquerdo;
        
        if (targetZone?.uv) {
          const [tx, ty] = getCoord(targetZone.uv as [number, number]);
          ctx.font = `bold 100px ${nameFont}`;
          ctx.fillStyle = nameColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const offset = (namePosition === 'right' || namePosition === 'left') ? 100 : 0;
          ctx.fillText(name.toUpperCase(), tx, ty + offset);
        }
      }

      // Número
      if (number && zoneNumeroCentro?.uv) {
        const [nx, ny] = getCoord(zoneNumeroCentro.uv as [number, number]);
        ctx.font = `bold 350px ${nameFont}`;
        ctx.fillStyle = numberColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(number, nx, ny);
      }

      const uvTexture = new THREE.CanvasTexture(canvas);
      uvTexture.flipY = false;
      uvTexture.needsUpdate = true;

      clonedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              if (mat.emissiveMap) mat.emissiveMap.dispose();
              mat.emissiveMap = uvTexture;
              mat.emissiveIntensity = 1.5;
              mat.needsUpdate = true;
            }
          });
        }
      });
    };

    const timeoutId = setTimeout(drawOnCanvas, 100);
    return () => { 
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [zones, name, number, nameColor, numberColor, nameFont, namePosition, shieldPosition, shieldUrl, clonedScene]);

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
