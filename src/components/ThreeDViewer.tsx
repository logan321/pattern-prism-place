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
        texture.colorSpace = THREE.SRGBColorSpace;
        scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const material = mesh.material as THREE.MeshStandardMaterial;
              // Clone the material to avoid affecting other meshes that share it
              const newMaterial = material.clone();
              newMaterial.map = texture;
              newMaterial.needsUpdate = true;
              mesh.material = newMaterial;
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
