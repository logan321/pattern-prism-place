import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from 'react-error-boundary';

function Model({ url, textureUrl }: { url: string; textureUrl?: string }) {
  console.log('Tentando carregar GLB:', url);
  const { scene } = useGLTF(url);
  console.log('GLB carregado com sucesso:', scene);

  useEffect(() => {
    if (!textureUrl) return;
    const loader = new THREE.TextureLoader();
    loader.load(textureUrl, (texture) => {
      texture.flipY = false;
      scene.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh && mesh.material) {
          const material = mesh.material as THREE.MeshStandardMaterial;
          material.map = texture;
          material.needsUpdate = true;
        }
      });
    });
  }, [scene, textureUrl]);

  return <primitive object={scene} />;
}

function FallbackError({ error }: { error: { message: string } }) {
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
