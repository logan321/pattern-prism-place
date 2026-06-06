import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei'
import { Suspense } from 'react'

function ShirtModel() {
  // Placeholder para o modelo 3D da camisa
  // Em um projeto real, usaríamos useGLTF('url-do-clo3d.glb')
  return (
    <mesh position={[0, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[1, 1.5, 0.4]} />
      <meshStandardMaterial color="white" roughness={0.3} />
    </mesh>
  )
}

export function ThreeViewer() {
  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        <Suspense fallback={null}>
          <Stage intensity={0.5} environment="city" adjustCamera={false}>
            <ShirtModel />
          </Stage>
          <Environment preset="city" />
          <ContactShadows 
            opacity={0.4} 
            scale={10} 
            blur={2.4} 
            far={10} 
            resolution={256} 
            color="#000000" 
          />
        </Suspense>
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.5} 
          makeDefault 
        />
      </Canvas>
      
      {/* Indicador de carregamento ou controles flutuantes podem ir aqui */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
        <button className="bg-white/80 backdrop-blur shadow-sm px-4 py-2 rounded-full text-xs font-medium text-gray-700 hover:bg-white transition-colors border border-gray-200">
          Frente
        </button>
        <button className="bg-white/80 backdrop-blur shadow-sm px-4 py-2 rounded-full text-xs font-medium text-gray-700 hover:bg-white transition-colors border border-gray-200">
          Costas
        </button>
      </div>
    </div>
  )
}
