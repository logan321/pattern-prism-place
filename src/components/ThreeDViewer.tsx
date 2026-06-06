import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from 'react-error-boundary';

function Model({ url, textureUrl }: { url: string; textureUrl?: string }) {
  useEffect(() => {
    const validateModel = async () => {
      console.log('Validando URL do GLB:', url);
      try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`Status GLB: ${response.status} ${response.statusText}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        console.log(`Tamanho: ${response.headers.get('content-length')} bytes`);
        
        if (!response.ok) {
          console.warn('URL do modelo retornou erro, tentando carregar assim mesmo...');
        }
      } catch (err) {
        console.error('Falha ao validar URL do GLB:', err);
      }
    };
    validateModel();
  }, [url]);

  console.log('Iniciando useGLTF para:', url);
  const { scene } = useGLTF(url);
  console.log('GLB carregado com sucesso:', scene);

  useEffect(() => {
    if (!textureUrl) return;
    console.log('Tentando aplicar textura (UV Map):', textureUrl);
    
    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl, 
      (texture) => {
        console.log('Textura UV carregada com sucesso:', textureUrl);
        texture.flipY = false;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        
        scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            console.log('Aplicando textura ao mesh:', mesh.name);
            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((mat) => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.map = texture;
                  mat.roughness = 1; // Ajuste para tecido
                  mat.metalness = 0;
                  mat.needsUpdate = true;
                }
              });
            }
          }
        });
      },
      undefined,
      (err) => {
        console.error('Erro ao carregar textura UV:', textureUrl, err);
      }
    );
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
          <Stage intensity={0.5} environment="city" shadows="contact" adjustCamera={1.5}>
            <Model url={modelUrl} textureUrl={textureUrl} />
          </Stage>
          <OrbitControls makeDefault />
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  );
}
