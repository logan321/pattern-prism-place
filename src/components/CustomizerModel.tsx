import React, { useRef, useState, useEffect, useMemo, useContext } from 'react';
import * as THREE from 'three';
import { Decal, useTexture, useGLTF } from '@react-three/drei';
import { AppContext } from '../context/AppContext';

export interface CustomizationState {
  name: string;
  number: string;
  namePosition: 'left' | 'right' | 'center';
  shieldPosition: 'left' | 'right';
  nameColor: string;
  numberColor: string;
  nameFont: string;
}

function ZoneDecal({ zone, customization }: { zone: any; customization: CustomizationState }) {
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 512;
    canvas.height = 512;

    // Clear background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply pathData mask if present
    if (zone.pathData && zone.pathData.length > 2) {
      ctx.beginPath();
      zone.pathData.forEach((point: { x: number; y: number }, index: number) => {
        const x = (point.x / 100) * canvas.width;
        const y = (point.y / 100) * canvas.height;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.clip();
    }

    // Determine content based on zone name/type
    const name = zone.name.toLowerCase();
    let content = '';
    let color = '#ffffff';
    let fontSize = 40;

    if (name.includes('nome') || name.includes('name')) {
      content = customization.name;
      color = customization.nameColor;
      fontSize = 60;
    } else if (name.includes('número') || name.includes('number')) {
      content = customization.number;
      color = customization.numberColor;
      fontSize = 120;
    } else {
      content = zone.name;
    }

    // Render text
    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(content, canvas.width / 2, canvas.height / 2);

    const newTexture = new THREE.CanvasTexture(canvas);
    newTexture.needsUpdate = true;
    setTexture(newTexture);
  }, [zone, customization]);

  if (!texture || !zone.position3d) return null;

  const position = new THREE.Vector3(...zone.position3d);
  const normal = zone.normal3d ? new THREE.Vector3(...zone.normal3d) : new THREE.Vector3(0, 0, 1);
  const rotation = new THREE.Euler(0, 0, 0);
  
  // Create rotation matrix to align decal with normal
  const up = new THREE.Vector3(0, 1, 0);
  const lookAtMatrix = new THREE.Matrix4().lookAt(
    new THREE.Vector3(0, 0, 0),
    normal,
    up
  );
  rotation.setFromRotationMatrix(lookAtMatrix);

  // Decals are rotated 90 degrees on X by default in some THREE versions/orientations
  // but usually for a vertical surface we need to rotate around the decal's local Z
  if (zone.rotation3d) {
    rotation.z += zone.rotation3d;
  }

  const scale = zone.size3d || 0.2;
  // Use a small depth (0.1 or so) to avoid z-fighting and ensure it wraps
  const decalScale = new THREE.Vector3(scale, scale, 0.1);

  return (
    <Decal
      position={position}
      rotation={rotation}
      scale={decalScale}
      map={texture}
    >
      <meshStandardMaterial
        map={texture}
        transparent
        polygonOffset
        polygonOffsetFactor={-1}
        roughness={1}
        metalness={0}
      />
    </Decal>
  );
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
  const context = useContext(AppContext);
  const zones = context?.zones || [];
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

  const positionedZones = useMemo(() => 
    zones.filter(z => z.position3d), 
    [zones]
  );

  return (
    <group>
      <primitive object={scene} />
      
      {positionedZones.map((zone) => (
        <ZoneDecal 
          key={zone.id} 
          zone={zone} 
          customization={customization} 
        />
      ))}
    </group>
  );
}
