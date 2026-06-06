import { useState } from 'react'
import { Palette, Layers, Shirt, Type, Image as ImageIcon, Check } from 'lucide-react'
import { useSimulatorStore } from '../../store/useSimulatorStore'

export function CustomizerPanel() {
  const [activeTab, setActiveTab] = useState('model')
  const { 
    templates, 
    designs, 
    selectedTemplate, 
    selectedDesign, 
    selectTemplate, 
    selectDesign 
  } = useSimulatorStore()

  const tabs = [
    { id: 'model', icon: Shirt, label: 'Modelo' },
    { id: 'print', icon: Layers, label: 'Estampa' },
    { id: 'colors', icon: Palette, label: 'Cores' },
    { id: 'logos', icon: ImageIcon, label: 'Logos' },
    { id: 'text', icon: Type, label: 'Texto' },
  ]

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Navegação por abas lateral/topo */}
      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-4 px-2 min-w-[70px] transition-all ${
              activeTab === tab.id 
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/30' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className={`w-5 h-5 mb-1 ${activeTab === tab.id ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo da aba */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'model' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Estilos de Camisa</h3>
              <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                {templates.length} DISPONÍVEIS
              </span>
            </div>
            
            {templates.length === 0 ? (
              <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 italic">Nenhum modelo 3D cadastrado no painel administrativo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {templates.map((template) => (
                  <button 
                    key={template.id}
                    onClick={() => selectTemplate(template)}
                    className={`group relative aspect-[3/4] rounded-xl border-2 transition-all overflow-hidden ${
                      selectedTemplate?.id === template.id 
                        ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-lg' 
                        : 'border-gray-100 hover:border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <Shirt className={`w-12 h-12 ${selectedTemplate?.id === template.id ? 'text-orange-500' : 'text-gray-300'}`} />
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1 shadow-sm">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <div className={`absolute bottom-0 inset-x-0 p-2 text-[10px] font-bold text-center transition-colors ${
                      selectedTemplate?.id === template.id ? 'bg-orange-500 text-white' : 'bg-white/90 text-gray-700'
                    }`}>
                      {template.name}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'print' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Estampas e Cores</h3>
              <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                {designs.length} DESIGNS
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {designs.map((design) => (
                <button 
                  key={design.id}
                  onClick={() => selectDesign(design)}
                  className={`group relative aspect-square rounded-lg border-2 transition-all overflow-hidden ${
                    selectedDesign?.id === design.id 
                      ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md scale-[0.98]' 
                      : 'border-transparent bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <img src={design.thumbnail} alt={design.name} className="w-full h-full object-cover" />
                  {selectedDesign?.id === design.id && (
                    <div className="absolute inset-0 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                      <div className="bg-orange-500 text-white rounded-full p-0.5 shadow-sm">
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/40 backdrop-blur-[2px] py-1 text-[8px] text-white font-medium text-center truncate px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {design.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {['colors', 'logos', 'text'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4 animate-in zoom-in-95 duration-500">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
              {activeTab === 'colors' && <Palette className="w-6 h-6 text-gray-300" />}
              {activeTab === 'logos' && <ImageIcon className="w-6 h-6 text-gray-300" />}
              {activeTab === 'text' && <Type className="w-6 h-6 text-gray-300" />}
            </div>
            <p className="text-xs font-medium italic tracking-wide">Módulo em desenvolvimento...</p>
          </div>
        )}
      </div>

      {/* Rodapé do painel */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/30">
        <button className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-[0.1em] hover:bg-orange-700 active:scale-[0.98] transition-all shadow-lg shadow-orange-600/20">
          Finalizar Personalização
        </button>
      </div>
    </div>
  )
}

