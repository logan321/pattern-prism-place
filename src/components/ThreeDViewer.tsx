import React, { Suspense, useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Text, Float, Center } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from 'react-error-boundary';
import { gsap } from 'gsap';
import { useCustomizerStore } from '../store/useCustomizerStore';

function Model({ url, textureUrl, universalUvUrl }: { url: string; textureUrl?: string; universalUvUrl?: string }) {
  const { scene } = useGLTF(url);
  const name = useCustomizerStore(state => state.name);
  const number = useCustomizerStore(state => state.number);
  const namePosition = useCustomizerStore(state => state.namePosition);
  const shieldPosition = useCustomizerStore(state => state.shieldPosition);
  const nameColor = useCustomizerStore(state => state.nameColor);
  const numberColor = useCustomizerStore(state => state.numberColor);
  const nameFont = useCustomizerStore(state => state.nameFont);

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

    processTexture();
  }, [scene, textureUrl]);

  // Positions (Approximated for a standard t-shirt model)
  const posMap = {
    name: {
      left: [-0.2, 0.45, 0.15],
      right: [0.2, 0.45, 0.15],
      center: [0, 0.45, 0.15],
      back: [0, 0.6, -0.15]
    },
    shield: {
      left: [-0.2, 0.35, 0.15],
      right: [0.2, 0.35, 0.15]
    },
    number: {
      back: [0, 0.3, -0.18]
    }
  };

  const namePos = namePosition === 'center' ? posMap.name.center : (namePosition === 'left' ? posMap.name.left : posMap.name.right);

  return (
    <group>
      <primitive object={scene} />
      
      {/* Front Elements */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.1}>
        <Text
          position={namePos as any}
          fontSize={0.04}
          color={nameColor}
          anchorX="center"
          anchorY="middle"
          depthOffset={-1}
        >
          {name}
        </Text>
      </Float>

      {/* Shield Placeholder */}
      <mesh position={(shieldPosition === 'left' ? posMap.shield.left : posMap.shield.right) as any}>
        <circleGeometry args={[0.04, 32]} />
        <meshStandardMaterial color="#FFD700" metalness={0.5} roughness={0.2} />
      </mesh>

      {/* Back Elements */}
      <Text
        position={posMap.name.back as any}
        rotation={[0, Math.PI, 0]}
        fontSize={0.05}
        color={nameColor}
        anchorX="center"
        anchorY="middle"
        depthOffset={-1}
      >
        {name}
      </Text>

      <Text
        position={posMap.number.back as any}
        rotation={[0, Math.PI, 0]}
        fontSize={0.2}
        color={numberColor}
        anchorX="center"
        anchorY="middle"
        depthOffset={-1}
      >
        {number}
      </Text>
    </group>
  );
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

export const ThreeDViewer = forwardRef<ThreeDViewerRef, { modelUrl?: string; textureUrl?: string; universalUvUrl?: string }>(
  ({ modelUrl, textureUrl, universalUvUrl }, ref) => {
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
            <Model url={modelUrl} textureUrl={textureUrl} />
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
