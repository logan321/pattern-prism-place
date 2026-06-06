import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulatorStore } from '@/store/useSimulatorStore';

function Piece({ position, size, color, name, label }: { position: [number, number, number], size: [number, number, number], color: string, name: string, label: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { nameText, numberText, textColor, activePieces } = useSimulatorStore();

  if (!activePieces[name as keyof typeof activePieces]) return null;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      
      {/* Simulation of name/number on the piece */}
      <Html position={[0, size[1]/2 + 0.1, 0.51]} center transform>
        <div style={{ color: textColor, textAlign: 'center', pointerEvents: 'none' }}>
          <div className="font-bold text-xs">{nameText.camisa}</div>
          <div className="font-bold text-lg">{numberText.camisa}</div>
        </div>
      </Html>
      
      <Text
        position={[0, -size[1]/2 - 0.2, 0]}
        fontSize={0.1}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

export function SimulatorCanvas() {
  const { colors, activePieces } = useSimulatorStore();

  return (
    <div className="w-full h-full bg-gray-100">
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Environment preset="city" />
        
        <group position={[0, 0, 0]}>
          {/* Camisa */}
          <Piece 
            position={[0, 1, 0]} 
            size={[1.2, 1.5, 0.4]} 
            color={colors.camisa} 
            name="camisa" 
            label="Camisa"
          />
          
          {/* Calção */}
          <Piece 
            position={[0, -0.6, 0]} 
            size={[1, 0.8, 0.45]} 
            color={colors.calcao} 
            name="calcao" 
            label="Calção"
          />
          
          {/* Meião */}
          <Piece 
            position={[0, -1.8, 0]} 
            size={[0.4, 1, 0.4]} 
            color={colors.meiao} 
            name="meiao" 
            label="Meião"
          />
        </group>

        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
        <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} makeDefault />
      </Canvas>
    </div>
  );
}
