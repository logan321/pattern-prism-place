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
  formation,
  onCanvasUpdate
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
  onCanvasUpdate?: (canvas: HTMLCanvasElement) => void;
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

      if (posId.toUpperCase() === 'PEITO DIREITO' || normPosId === 'peitodireito') {
        console.log('--- FLOW VALIDATION: PEITO DIREITO ---');
        console.log('1. JSON da zona carregada:', found);
      }

      if (found) {
        console.log(`Zona encontrada para ${posId}:`, {
          name: found.name,
          uv: found.uvCenter || found.uv,
          width: found.width,
          height: found.height
        });
        if (posId.toUpperCase() === 'PEITO DIREITO' || normPosId === 'peitodireito') {
          console.log('2. Resultado de getZona:', found);
        }
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
    const drawZoneContent = async (zone: Zone, drawFn: (w: number, h: number) => Promise<void> | void, zoneType: string) => {
      const uv = zone.uvCenter || zone.uv;
      if (!uv) return;

      const [cx, cy] = getCoord(uv as [number, number]);
      const w = (zone.width || 0.1) * canvas.width;
      const h = (zone.height || 0.1) * canvas.height;
      const rotation = (zone.rotation || 0) * (Math.PI / 180);

      const isPeitoDireito = zone.name?.toUpperCase() === 'PEITO DIREITO' || zone.id?.toUpperCase() === 'PEITO DIREITO';
      if (isPeitoDireito) {
        console.log(`3. Coordenadas UV calculadas para ${zone.name}:`, {
          uvOriginal: uv,
          pixelCenter: [cx, cy],
          sizeInPixels: [w, h],
          rotation: zone.rotation
        });
      }

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
            const isPeitoDireito = logoZone.name?.toUpperCase() === 'PEITO DIREITO' || logoZone.id?.toUpperCase() === 'PEITO DIREITO';
            if (isPeitoDireito) {
              console.log('4. EXECUTANDO drawImage para PEITO DIREITO');
              console.log('5. Conteúdo (Logo URL):', shieldUrl);
            } else {
              console.log('EXECUTANDO drawImage para logo');
            }
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
          console.log('LogoZone sem shieldUrl, nada desenhado');
        }
      }, 'logo');
    }

    // 2. Desenhar Nome
    if (name && nameZone) {
      await drawZoneContent(nameZone, async (w, h) => {
        const isPeitoDireito = nameZone.name?.toUpperCase() === 'PEITO DIREITO' || nameZone.id?.toUpperCase() === 'PEITO DIREITO';
        if (isPeitoDireito) {
          console.log('4. EXECUTANDO drawText para PEITO DIREITO (Nome)');
          console.log('5. Conteúdo (Nome):', name);
        } else {
          console.log('EXECUTANDO drawText para nome:', name);
        }
        ctx.font = `bold ${Math.floor(h)}px ${nameFont || 'Arial'}`;
        ctx.fillStyle = nameColor || '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const metrics = ctx.measureText(name.toUpperCase());
        const scale = Math.min(1, w / metrics.width);
        if (scale < 1) {
          ctx.scale(scale, 1);
        }
        ctx.fillText(name.toUpperCase(), 0, 0);
      }, 'nome');
    }

    // 3. Desenhar Número
    if (number && numberZone) {
      await drawZoneContent(numberZone, async (w, h) => {
        const isPeitoDireito = numberZone.name?.toUpperCase() === 'PEITO DIREITO' || numberZone.id?.toUpperCase() === 'PEITO DIREITO';
        if (isPeitoDireito) {
          console.log('4. EXECUTANDO drawText para PEITO DIREITO (Número)');
          console.log('5. Conteúdo (Número):', number);
        } else {
          console.log('EXECUTANDO drawText para número:', number);
        }
        ctx.font = `bold ${Math.floor(h)}px ${nameFont || 'Arial'}`;
        ctx.fillStyle = numberColor || '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(number, 0, 0);
      }, 'numero');
    }

    if (!textureRef.current) {
      console.log('CRIANDO nova CanvasTexture');
      textureRef.current = new THREE.CanvasTexture(canvas);
      textureRef.current.flipY = false;
      textureRef.current.colorSpace = THREE.SRGBColorSpace;
    } else {
      console.log('6. LOG: CHAMANDO texture.needsUpdate = true');
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
            console.log(`7. LOG: [SUCCESS] Aplicando emissiveMap (CanvasTexture) à malha: ${mesh.name}`);
            mat.emissiveMap = uvTexture;
            mat.emissive.set(0xffffff); 
            mat.emissiveIntensity = 3.0; // Aumentado para garantir visibilidade
            mat.needsUpdate = true;
          }
        });
      }
    });

    if (onCanvasUpdate) {
      onCanvasUpdate(canvas);
    }
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
    const [debugCanvas, setDebugCanvas] = useState<HTMLCanvasElement | null>(null);
    const debugCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Efeito para atualizar a pré-visualização de debug
    useEffect(() => {
      if (debugCanvas && debugCanvasRef.current) {
        const ctx = debugCanvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 256, 256);
          // Desenha um fundo quadriculado para ver transparência
          ctx.fillStyle = '#eee';
          ctx.fillRect(0, 0, 256, 256);
          ctx.fillStyle = '#ccc';
          for(let i=0; i<8; i++) {
            for(let j=0; j<8; j++) {
              if((i+j)%2 === 0) ctx.fillRect(i*32, j*32, 32, 32);
            }
          }
          ctx.drawImage(debugCanvas, 0, 0, 256, 256);
        }
      }
    }, [debugCanvas, name, number, shieldUrl]); // Re-render when content changes

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
        <div className="relative w-full h-full">
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
                  onCanvasUpdate={setDebugCanvas}
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

          {/* Painel de Debug do Canvas UV */}
          <div className="absolute bottom-4 right-4 p-2 bg-white/90 border border-gray-300 rounded-lg shadow-xl z-50 pointer-events-none">
            <div className="text-[10px] font-mono mb-1 text-gray-500 flex justify-between">
              <span>CANVAS UV DEBUG (2048x2048)</span>
              <span>{debugCanvas ? 'ATIVE' : 'WAITING...'}</span>
            </div>
            <div className="relative border border-gray-200 bg-gray-100 overflow-hidden rounded">
              <canvas 
                ref={debugCanvasRef} 
                width={256} 
                height={256} 
                className="w-48 h-48 block image-render-pixel"
              />
              {/* Overlay de guia central para facilitar visualização */}
              <div className="absolute inset-0 border border-red-500/10 pointer-events-none flex items-center justify-center">
                <div className="w-full h-[1px] bg-red-500/5 absolute" />
                <div className="h-full w-[1px] bg-red-500/5 absolute" />
              </div>
            </div>
            <div className="text-[9px] mt-1 text-gray-400 italic">
              Este canvas é aplicado como emissiveMap no Three.js
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }
);