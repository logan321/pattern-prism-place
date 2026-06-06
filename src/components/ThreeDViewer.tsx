import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function Model({ url, textureUrl }: { url: string; textureUrl?: string }) {
  const { scene } = useGLTF(url);
  
  // Apply texture if provided
  React.useEffect(() => {
    if (textureUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(textureUrl, (texture) => {
        texture.flipY = false;
        scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            // Assuming the mesh has a material we want to apply the texture to
            // This is a simplification; in a real app, we might target specific materials
            if (mesh.material) {
              const material = mesh.material as THREE.MeshStandardMaterial;
              material.map = texture;
              material.needsUpdate = true;
            }
          }
        });
      });
    }
  }, [scene, textureUrl]);

  return <primitive object={scene} />;
}

export function ThreeDViewer({ modelUrl, textureUrl }: { modelUrl?: string; textureUrl?: string }) {
  if (!modelUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
        Selecione um modelo 3D para visualizar
      </div>
    );
  }

  return (
    <Canvas shadows camera={{ position: [0, 0, 4], fov: 45 }}>
      <Suspense fallback={null}>
        <Stage intensity={0.5} environment="city" shadows="contact" adjustCamera={1.5}>
          <Model url={modelUrl} textureUrl={textureUrl} />
        </Stage>
        <OrbitControls makeDefault minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.5} />
      </Suspense>
    </Canvas>
  );
}
