import { Header } from '../layout/Header'
import { ThreeViewer } from './ThreeViewer'
import { CustomizerPanel } from './CustomizerPanel'

export function SimulatorContainer() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <Header />
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Visualizador 3D - Ocupa o centro/esquerda */}
        <div className="flex-1 relative bg-gray-200">
          <ThreeViewer />
        </div>
        
        {/* Painel de Customização - Lado direito */}
        <aside className="w-full md:w-[400px] border-l border-gray-200 bg-white overflow-y-auto">
          <CustomizerPanel />
        </aside>
      </main>
    </div>
  )
}
