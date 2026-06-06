import { useState } from 'react'
import { Palette, Layers, Shirt, Type, Image as ImageIcon } from 'lucide-react'

export function CustomizerPanel() {
  const [activeTab, setActiveTab] = useState('model')

  const tabs = [
    { id: 'model', icon: Shirt, label: 'Modelo' },
    { id: 'print', icon: Layers, label: 'Estampa' },
    { id: 'colors', icon: Palette, label: 'Cores' },
    { id: 'logos', icon: ImageIcon, label: 'Logos' },
    { id: 'text', icon: Type, label: 'Texto' },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Navegação por abas lateral/topo */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-4 px-2 min-w-[70px] transition-colors ${
              activeTab === tab.id 
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo da aba */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'model' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-900">Estilos de Camisa</h3>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <button 
                  key={i}
                  className="group relative aspect-[3/4] bg-gray-100 rounded-xl border-2 border-transparent hover:border-orange-500 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs italic p-4 text-center">
                    PNG do Modelo {i}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-white/90 p-2 text-[10px] font-bold text-center">
                    Gola V Slim
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'print' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-900">Estampas Disponíveis</h3>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <button 
                  key={i}
                  className="aspect-square bg-gray-200 rounded-lg border-2 border-transparent hover:border-orange-500 transition-all overflow-hidden"
                >
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                    UV {i}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Outras abas em breve */}
        {['colors', 'logos', 'text'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <p className="text-sm italic">Opções em desenvolvimento...</p>
          </div>
        )}
      </div>

      {/* Rodapé do painel */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full py-3 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors">
          Continuar para Pedido
        </button>
      </div>
    </div>
  )
}
