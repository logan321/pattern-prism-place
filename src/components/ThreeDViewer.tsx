import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from 'react-error-boundary';

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

export function ThreeDViewer({ modelUrl, textureUrl }: { modelUrl?: string; textureUrl?: string }) {
  console.log('=== THREEDVIEWER PROPS ===', { modelUrl, textureUrl });
  if (!modelUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
        Selecione um modelo para visualizar
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={FallbackError}>
      <Canvas shadows camera={{ position: [0, 0, 4], fov: 45 }}>
        <Suspense fallback={null}>
          <Stage intensity={0.5} environment="city" shadows="contact" adjustCamera={1.5} preset="rembrandt">
            <Model url={modelUrl} textureUrl={textureUrl} />
          </Stage>
          <OrbitControls makeDefault />
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  );
}
