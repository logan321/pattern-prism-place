import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Stage, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import { useSimulatorStore } from '../../store/useSimulatorStore'

function ShirtModel() {
  const { selectedDesign } = useSimulatorStore()
  
  // Carrega o UV Map se houver um design selecionado
  const texture = useLoader(
    THREE.TextureLoader, 
    selectedDesign?.uvMap || '/placeholder-uv.png'
  )

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      side: THREE.DoubleSide
    })
  }, [texture])

  return (
    <mesh position={[0, 0, 0]} castShadow receiveShadow material={material}>
      <boxGeometry args={[1, 1.5, 0.4]} />
    </mesh>
  )
}

export function ThreeViewer() {
  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        <Suspense fallback={null}>
          <Stage intensity={0.5} environment="city" adjustCamera={false}>
            <ShirtModel />
          </Stage>
          <Environment preset="city" />
          <ContactShadows 
            opacity={0.3} 
            scale={10} 
            blur={2} 
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
          autoRotate={false}
        />
      </Canvas>
      
      <div className="absolute top-6 left-6">
        <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-white/50 animate-in fade-in slide-in-from-left-4 duration-500">
          <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">Visualização 3D Realista</p>
          <p className="text-xs text-gray-500">Arraste para girar • Scroll para zoom</p>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {['Frente', 'Lado', 'Costas'].map((view) => (
          <button 
            key={view}
            className="bg-white/80 hover:bg-white backdrop-blur shadow-lg px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-700 transition-all border border-white/50 active:scale-95"
          >
            {view}
          </button>
        ))}
      </div>
    </div>
  )
}

