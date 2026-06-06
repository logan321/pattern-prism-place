import React from 'react';
import { useUniformStore } from '../../store/useUniformStore';

export const UniformModel = () => {
  const { config, activePeca } = useUniformStore();
  
  // Placeholder Box until real GLB is loaded
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[1, 2, 0.5]} />
      <meshStandardMaterial 
        color={config[activePeca].cores.base} 
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
};
