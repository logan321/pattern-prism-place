import React, { Suspense, useEffect, useRef, useImperativeHandle, forwardRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from 'react-error-boundary';
import { gsap } from 'gsap';

interface Zone {
  id: string;
  name: string;
  type?: string;
  uvCenter?: [number, number];
  width?: number;
  height?: number;
  rotation?: number;
  // Fallbacks for older data if any still exist
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
  shieldUrl,
  formation
}: { 
  url: string; 
  textureUrl?: string; 
  zones?: Zone[];
  name?: string;
  number?: string;
  nameColor?: string;
  numberColor?: string;
  nameFont?: string;
  shieldUrl?: string | null;
  formation?: string;
}) {
  const { scene } = useGLTF(url);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              const m = mat.clone();
              m.emissive = new THREE.Color(0x000000);
              m.emissiveIntensity = 0;
              mesh.material = m; // Apply the clone back
            }
          });
        }
      }
    });
    return clone;
  }, [scene]);

  const FORMACOES: Record<string, any> = {
    'escudo-esq-nome-dir': { logo: 'peito-esquerdo', nome: 'peito-direito',  numero: 'costas-centro' },
    'escudo-dir-nome-esq': { logo: 'peito-direito',  nome: 'peito-esquerdo', numero: 'costas-centro' },
    'nome-centro':         { logo: null,              nome: 'peito-centro',   numero: 'costas-centro' },
    'so-numero':           { logo: null,              nome: null,             numero: 'costas-centro' },
  };

  const drawOnCanvas = async () => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 2048;
      canvasRef.current.height = 2048;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    // Log all meshes in the scene
    const meshNames: string[] = [];
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshNames.push(child.name);
      }
    });
    console.log('--- DIAGNÓSTICO RENDER ---');
    console.log('Meshes encontrados no GLB:', meshNames);

    const regras = FORMACOES[formation || ''] ?? FORMACOES['escudo-esq-nome-dir'];
    console.log('REGRAS DE FORMAÇÃO:', regras);
    console.log('DRAW zones:', zones);
    console.log('DRAW name:', name);
    console.log('DRAW shieldUrl:', shieldUrl);

    const getZona = (posId: string | null) => {
      if (!posId) return null;
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normPosId = normalize(posId);
      
      const found = zones?.find(z => {
        if (!z.id && !z.name) return false;
        return normalize(z.id || '') === normPosId || 
               normalize(z.name || '') === normPosId;
      });

      if (found) {
        console.log(`Zona encontrada para ${posId}:`, {
          name: found.name,
          uv: found.uvCenter || found.uv,
          width: found.width,
          height: found.height
        });
      } else {
        console.log(`Zona NÃO encontrada para ${posId}`);
      }
      return found;
    };

    const logoZone   = getZona(regras.logo);
    const nameZone   = getZona(regras.nome);
    const numberZone = getZona(regras.numero || regras.number);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const getCoord = (uv: [number, number]): [number, number] => {
      return [uv[0] * canvas.width, (1 - uv[1]) * canvas.height];
    };

    // Helper para desenhar conteúdo rotacionado em uma zona
    const drawZoneContent = async (zone: Zone, drawFn: (w: number, h: number) => Promise<void> | void) => {
      const uv = zone.uvCenter || zone.uv;
      if (!uv) return;

      const [cx, cy] = getCoord(uv as [number, number]);
      const w = (zone.width || 0.1) * canvas.width;
      const h = (zone.height || 0.1) * canvas.height;
      const rotation = (zone.rotation || 0) * (Math.PI / 180);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      await drawFn(w, h);
      ctx.restore();
    };

    // 1. Desenhar Logo
    if (logoZone) {
      await drawZoneContent(logoZone, async (w, h) => {
        if (shieldUrl) {
          try {
            console.log('EXECUTANDO drawImage para logo');
            const img = new Image();
            img.crossOrigin = "anonymous";
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = shieldUrl;
            });
            ctx.drawImage(img, -w / 2, -h / 2, w, h);
          } catch (e) {
            console.warn("ThreeDViewer: Logo não carregou:", e);
          }
        } else {
          ctx.beginPath();
          ctx.rect(-w / 2, -h / 2, w, h);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.setLineDash([10, 5]);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fill();
          ctx.font = `bold ${Math.floor(h * 0.2)}px Arial`;
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.fillText('ESCUDO', 0, 0);
        }
      });
    }

    // 2. Desenhar Nome
    if (name && nameZone) {
      await drawZoneContent(nameZone, async (w, h) => {
        console.log('EXECUTANDO drawText para nome:', name);
        ctx.font = `bold ${Math.floor(h)}px ${nameFont || 'Arial'}`;
        ctx.fillStyle = nameColor || '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Ajuste automático de escala para caber na largura
        const metrics = ctx.measureText(name.toUpperCase());
        const scale = Math.min(1, w / metrics.width);
        if (scale < 1) {
          ctx.scale(scale, 1);
        }
        ctx.fillText(name.toUpperCase(), 0, 0);
      });
    }

    // 3. Desenhar Número
    if (number && numberZone) {
      await drawZoneContent(numberZone, async (w, h) => {
        console.log('EXECUTANDO drawText para número:', number);
        ctx.font = `bold ${Math.floor(h)}px ${nameFont || 'Arial'}`;
        ctx.fillStyle = numberColor || '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(number, 0, 0);
      });
    }

    if (!textureRef.current) {
      console.log('CRIANDO nova CanvasTexture');
      textureRef.current = new THREE.CanvasTexture(canvas);
      textureRef.current.flipY = false;
      textureRef.current.colorSpace = THREE.SRGBColorSpace;
    } else {
      console.log('CHAMANDO texture.needsUpdate = true');
      textureRef.current.needsUpdate = true;
    }

    const uvTexture = textureRef.current;
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const meshName = mesh.name.toLowerCase();
        
        // Ignora partes metálicas/pequenas que não devem receber estampa
        const isHardware = meshName.includes('zipper') || 
                          meshName.includes('ziper') || 
                          meshName.includes('button') || 
                          meshName.includes('botao') ||
                          meshName.includes('puller') ||
                          meshName.includes('slider') ||
                          meshName.includes('trim');
        
        if (isHardware) return;

        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
            console.log(`[SUCCESS] Aplicando emissiveMap à malha: ${mesh.name}`);
            mat.emissiveMap = uvTexture;
            mat.emissive.set(0xffffff); 
            mat.emissiveIntensity = 3.0; // Aumentado para garantir visibilidade
            mat.needsUpdate = true;
          }
        });
      }
    });
  };

  useEffect(() => {
    drawOnCanvas();
  }, [zones, name, number, nameColor, numberColor, nameFont, shieldUrl, clonedScene, formation]);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';

    const applyTexture = (tex: THREE.Texture | null) => {
      clonedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const meshName = mesh.name.toLowerCase();
          
          const isHardware = meshName.includes('zipper') || 
                            meshName.includes('ziper') || 
                            meshName.includes('button') || 
                            meshName.includes('botao') ||
                            meshName.includes('puller') ||
                            meshName.includes('slider') ||
                            meshName.includes('trim');

          if (isHardware) return;

          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              mat.map = tex;
              if (!tex) mat.color.set(0xffffff);
              mat.needsUpdate = true;
            }
          });
        }
      });
    };

    if (!textureUrl) {
      applyTexture(null);
      return;
    }

    loader.load(textureUrl, (tex) => {
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      applyTexture(tex);
    }, undefined, (err) => {
      console.error("ThreeDViewer: Erro ao carregar textura:", textureUrl, err);
    });
  }, [textureUrl, clonedScene]);

  return <primitive object={clonedScene} />;
}

function FallbackError({ error }: { error: any }) {
  console.error('ThreeDViewer Error Boundary:', error);
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 gap-2">
      <p className="text-red-500 font-bold">Erro ao renderizar o modelo 3D</p>
      <p className="text-red-400 text-xs text-center px-4">{error?.message}</p>
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
  shieldUrl?: string | null;
  formation?: string;
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
    shieldUrl,
    formation
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
                shieldUrl={shieldUrl}
                formation={formation}
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