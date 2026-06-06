import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Text, Float, Decal, useTexture } from '@react-three/drei';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

export interface CustomizationState {
  name: string;
  number: string;
  namePosition: 'left' | 'right' | 'center';
  shieldPosition: 'left' | 'right';
  nameColor: string;
  numberColor: string;
  nameFont: string;
}

export function CustomizerModel({ 
  url, 
  textureUrl,
  customization 
}: { 
  url: string; 
  textureUrl?: string;
  customization: CustomizationState;
}) {
  const { scene } = useGLTF(url);
  const [mainTexture, setMainTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!textureUrl) return;
    const loader = new THREE.TextureLoader();
    loader.load(textureUrl, (t) => {
      t.flipY = false;
      t.colorSpace = THREE.SRGBColorSpace;
      setMainTexture(t);
    });
  }, [textureUrl]);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material && mainTexture) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach(m => {
            if (m instanceof THREE.MeshStandardMaterial) {
              m.map = mainTexture;
              m.needsUpdate = true;
            }
          });
        }
      }
    });
  }, [scene, mainTexture]);

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
      back: [0, 0.3, -0.15]
    }
  };

  return (
    <group>
      <primitive object={scene} />
      
      {/* Name on Chest/Back depends on logic */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.1}>
        <Text
          position={customization.namePosition === 'center' ? posMap.name.center : (customization.namePosition === 'left' ? posMap.name.left : posMap.name.right) as any}
          fontSize={0.05}
          color={customization.nameColor}
          font={customization.nameFont}
          anchorX="center"
          anchorY="middle"
        >
          {customization.name}
        </Text>
      </Float>

      {/* Number on Back */}
      <Text
        position={posMap.number.back as any}
        rotation={[0, Math.PI, 0]}
        fontSize={0.2}
        color={customization.numberColor}
        anchorX="center"
        anchorY="middle"
      >
        {customization.number}
      </Text>

      {/* Shield (Placeholder for now, could be a Decal or Sprite) */}
      <mesh position={customization.shieldPosition === 'left' ? posMap.shield.left : posMap.shield.right as any}>
        <sphereGeometry args={[0.03, 32, 32]} />
        <meshStandardMaterial color="gold" />
      </mesh>
    </group>
  );
}
