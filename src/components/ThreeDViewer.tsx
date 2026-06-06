import React, { Suspense, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from 'react-error-boundary';
import { gsap } from 'gsap';

function Model({ url, textureUrl }: { url: string; textureUrl?: string }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    if (!textureUrl) return;

    const applyTexture = (imageSrc: string) => {
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
            materials.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                // Limpa textura anterior se existir
                if (mat.map) mat.map.dispose();
                
                mat.map = texture;
                mat.roughness = 1;
                mat.metalness = 0;
                mat.needsUpdate = true;
              }
            });
          }
        });
      }, undefined, (err) => {
        console.error('Erro ao carregar textura via TextureLoader:', err);
      });
    };

    const processTexture = () => {
      if (textureUrl.endsWith('.svg') || textureUrl.includes('svg')) {
        fetch(textureUrl)
          .then(r => r.blob())
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            applyTexture(blobUrl);
          })
          .catch(err => console.error('Erro ao processar SVG:', err));
      } else {
        applyTexture(textureUrl);
      }
    };

    // Testa se a URL é acessível antes de carregar
    fetch(textureUrl, { method: 'HEAD' })
      .then(res => {
        if (!res.ok) {
          console.warn('Textura inacessível:', textureUrl, res.status);
          return;
        }
        processTexture();
      })
      .catch(err => {
        console.warn('Erro ao verificar textura:', err);
        // Fallback para tentar carregar mesmo se o HEAD falhar (alguns storages barram HEAD)
        processTexture();
      });
  }, [scene, textureUrl]);


  return <primitive object={scene} />;
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

export const ThreeDViewer = forwardRef<ThreeDViewerRef, { modelUrl?: string; textureUrl?: string }>(
  ({ modelUrl, textureUrl }, ref) => {
    const orbitRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      setView: (view) => {
        if (!orbitRef.current) return;
        
        const controls = orbitRef.current;
        const currentDistance = controls.getDistance();
        
        let targetTheta = 0;
        let targetPhi = Math.PI / 2; // Nível do horizonte (frontal)
        
        switch (view) {
          case 'front': targetTheta = 0; break;
          case 'back': targetTheta = Math.PI; break;
          case 'left': targetTheta = -Math.PI / 2; break;
          case 'right': targetTheta = Math.PI / 2; break;
        }

        const proxy = { 
          theta: controls.getAzimuthalAngle(), 
          phi: controls.getPolarAngle(),
          distance: currentDistance 
        };

        // Calcula o caminho mais curto para a rotação
        let endTheta = targetTheta;
        const diff = endTheta - proxy.theta;
        if (diff > Math.PI) endTheta -= 2 * Math.PI;
        if (diff < -Math.PI) endTheta += 2 * Math.PI;

        gsap.to(proxy, {
          theta: endTheta,
          phi: targetPhi,
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
        const currentDistance = controls.getDistance();
        const factor = direction === 'in' ? 0.85 : 1.15;
        const newDistance = currentDistance * factor;

        if (newDistance < 1.5 || newDistance > 6) return;
        
        gsap.to(controls.object, {
          zoom: 1, // Mantemos zoom da câmera em 1 e alteramos posição
          duration: 0.5,
          ease: 'power2.out',
          onUpdate: () => {
            // Animamos a distância alterando a posição relativa ao alvo
            const ratio = (currentDistance + (newDistance - currentDistance) * gsap.getProperty(controls.object, "progress" || 1)) / currentDistance;
            // Simplificando a animação de zoom para ser direta na posição preservando o ângulo
            if (gsap.isTweening(controls.object.position)) return;
            
            const targetPos = controls.object.position.clone().multiplyScalar(factor);
            controls.object.position.copy(targetPos);
            controls.update();
          }
        });
        
        // Jeito mais limpo de animar zoom mantendo o orbit
        gsap.to(controls, {
          minDistance: newDistance,
          maxDistance: newDistance,
          duration: 0.5,
          onComplete: () => {
            controls.minDistance = 1.5;
            controls.maxDistance = 6;
          },
          onUpdate: () => controls.update()
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
        <Canvas shadows camera={{ position: [0, 0, 2.8], fov: 40 }}>
          <Suspense fallback={null}>
          <Stage intensity={0.5} environment="city" shadows="contact" adjustCamera={false} preset="rembrandt">
            <Model url={modelUrl} textureUrl={textureUrl} />
          </Stage>
          <OrbitControls ref={orbitRef} makeDefault minDistance={1.5} maxDistance={8} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    );
  }
);
