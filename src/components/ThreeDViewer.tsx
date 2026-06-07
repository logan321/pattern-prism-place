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
  tipo?: string;
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
  
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              mat.emissive = new THREE.Color(0x000000);
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
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    if (zones && zones.length > 0) {
      console.log('ThreeDViewer: Zonas recebidas:', zones.map(z => `${z.id} (${z.uv?.[0].toFixed(2)}, ${z.uv?.[1].toFixed(2)})`));
    } else {
      console.log('ThreeDViewer: Nenhuma zona recebida nas props.');
    }

    // console.log('DRAW zones:', zones);
    // console.log('DRAW formation:', formation);
    // console.log('DRAW name:', name);
    // console.log('DRAW number:', number);
    // console.log('DRAW shieldUrl:', shieldUrl);

    const regras = FORMACOES[formation || ''] ?? FORMACOES['escudo-esq-nome-dir'];
    // console.log('DRAW regras:', regras);

    const getZona = (posId: string | null) => {
      if (!posId) return null;
      // Normalizar IDs e nomes para comparação (remover hifens e converter para minúsculo)
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normPosId = normalize(posId);
      
      return zones?.find(z => {
        if (!z.id && !z.name) return false;
        return normalize(z.id || '') === normPosId || 
               normalize(z.name || '') === normPosId;
      });
    };

    const logoZone   = getZona(regras.logo);
    const nameZone   = getZona(regras.nome);
    const numberZone = getZona(regras.numero || regras.number);

    console.log('ThreeDViewer: Mapeamento de zonas:', {
      logo: logoZone ? 'Encontrado' : 'Não encontrado',
      name: nameZone ? 'Encontrado' : 'Não encontrado',
      number: numberZone ? 'Encontrado' : 'Não encontrado',
      formation: formation || 'padrão'
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Debug: preencher fundo com cor semitransparente para ver se o canvas está sendo aplicado
    // ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const getCoord = (uv: [number, number]): [number, number] => {
      return [uv[0] * canvas.width, (1 - uv[1]) * canvas.height];
    };


    // 1. Desenhar Logo ou Placeholder
    if (logoZone?.uv) {
      const [sx, sy] = getCoord(logoZone.uv as [number, number]);
      const size = 180;
      
      if (shieldUrl) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = shieldUrl;
          });
          ctx.drawImage(img, sx - size / 2, sy - size / 2, size, size);
        } catch (e) {
          console.warn("Logo não carregou:", e);
        }
      } else {
        // Placeholder circular para o escudo (conforme pedido pelo cliente)
        ctx.save();
        ctx.beginPath();
        ctx.arc(sx, sy, size / 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 5]); // Pontilhado para parecer marcação
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
        
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('ESCUDO', sx, sy);
        ctx.restore();
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
      // Limitar largura para não extrapolar a zona do peito
      const maxWidth = 400;
      ctx.fillText(name.toUpperCase(), tx, ty, maxWidth);
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

    if (!textureRef.current) {
      const uvTexture = new THREE.CanvasTexture(canvas);
      uvTexture.flipY = false;
      uvTexture.colorSpace = THREE.SRGBColorSpace;
      textureRef.current = uvTexture;
    } else {
      textureRef.current.needsUpdate = true;
    }

    const uvTexture = textureRef.current;
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const meshName = mesh.name.toLowerCase();
        
        // Pular aviamentos ao aplicar o emissive (nomes/números)
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
            const matName = mat.name.toLowerCase();
            if (matName.includes('zipper') || matName.includes('ziper') || matName.includes('button') || matName.includes('trim')) return;

            mat.emissiveMap = uvTexture;
            mat.emissive.set(0xffffff); 
            mat.emissiveIntensity = 2.0; // Aumentado para garantir visibilidade sobre o tecido
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
              const matName = mat.name.toLowerCase();
              if (matName.includes('zipper') || matName.includes('ziper') || matName.includes('button') || matName.includes('trim')) return;

              mat.map = tex;
              // Se não tiver textura, definir uma cor base neutra/branca para o tecido
              if (!tex) mat.color.set(0xffffff);
              mat.needsUpdate = true;
            }
          });
        }
      });
    };

    if (!textureUrl || typeof textureUrl !== 'string') {
      applyTexture(null);
      return;
    }

    const loadAndApply = (url: string) => {
      loader.load(url, (tex) => {
        tex.flipY = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        applyTexture(tex);
      });
    };

    if (textureUrl.includes('svg')) {
      fetch(textureUrl)
        .then(r => r.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          loadAndApply(url);
          return () => URL.revokeObjectURL(url);
        })
        .catch(err => console.error("Erro ao carregar SVG:", err));
    } else {
      loadAndApply(textureUrl);
    }
  }, [textureUrl, clonedScene]);

  // Adicionar uma key ao primitive para forçar o React Three Fiber a remontar se o modelo mudar drasticamente
  return <primitive key={url} object={clonedScene} />;
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