import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Environment, ContactShadows } from '@react-three/drei';
import { UniformModel } from './UniformModel';

export const Scene3D = () => {
  return (
    <div className="w-full h-full bg-gray-100 relative">
      <Canvas shadows camera={{ position: [0, 0, 4], fov: 45 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5}>
            <UniformModel />
          </Stage>
          <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 1.5}
            makeDefault
          />
        </Suspense>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={[512, 512]} castShadow />
      </Canvas>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <button className="bg-white/80 backdrop-blur p-2 rounded-full shadow hover:bg-white transition-colors">
          ↺
        </button>
      </div>
    </div>
  );
};
