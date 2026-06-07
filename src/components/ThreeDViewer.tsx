import React, { Suspense, useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

export interface ThreeDViewerRef {
  setView: (view: 'front' | 'back' | 'left' | 'right') => void;
  zoom: (direction: 'in' | 'out') => void;
}

function Model({ url, finalTexture }: { url: string; finalTexture?: THREE.Texture }) {
  const { scene } = useGLTF(url);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const newMaterials = materials.map((mat) => {
            const m = mat.clone();
            if (m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhysicalMaterial) {
              m.map = finalTexture || null;
              if (!finalTexture) m.color.set(0xffffff);
              m.needsUpdate = true;
            }
            return m;
          });
          mesh.material = Array.isArray(mesh.material) ? newMaterials : newMaterials[0];
        }
      }
    });
    return clone;
  }, [scene, finalTexture]);

  return <primitive object={clonedScene} />;
}

export const ThreeDViewer = forwardRef<ThreeDViewerRef, { 
  modelUrl?: string; 
  finalTexture?: THREE.Texture;
}>(({ modelUrl, finalTexture }, ref) => {
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
    <div className="w-full h-full relative group">
      <Canvas shadows camera={{ position: [0, 0, 2], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <Model url={modelUrl} finalTexture={finalTexture} />
          <OrbitControls 
            ref={orbitRef}
            enablePan={false}
            minDistance={1.2}
            maxDistance={5}
            makeDefault
          />
        </Suspense>
      </Canvas>
    </div>
  );
});
