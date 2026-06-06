import React from 'react';
import { useUniformStore } from '../../store/useUniformStore';
import { Palette, Shirt, Settings, Type, Image, Upload } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TABS = [
  { id: 'Modelo', icon: Shirt },
  { id: 'Cores', icon: Palette },
  { id: 'Acabamentos', icon: Settings },
  { id: 'Nome/Número', icon: Type },
  { id: 'Escudo/Patrocínio', icon: Image },
  { id: 'Upload', icon: Upload },
];

export const ConfigPanel = () => {
  const { activeTab, setActiveTab, activePeca, setActivePeca, config, setConfig } = useUniformStore();

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-xl overflow-hidden">
      {/* Mobile Tab Scroll */}
      <div className="flex overflow-x-auto border-b border-gray-200 no-scrollbar md:grid md:grid-cols-3 lg:grid-cols-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[100px] md:min-w-0 py-3 gap-1 transition-all border-b-2",
                isActive ? "border-primary text-primary bg-primary/5" : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon size={20} />
              <span className="text-[11px] font-bold uppercase tracking-wider">{tab.id}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-32">
        {/* Peca Switcher */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
          {['Camisa', 'Calção', 'Meião'].map((peca) => (
            <button
              key={peca}
              onClick={() => setActivePeca(peca as any)}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all",
                activePeca === peca ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {peca}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          {activeTab === 'Modelo' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-sm font-bold text-gray-700">Sincronizar Camisa e Calção</span>
                <button 
                  onClick={() => setConfig({ sincronizado: !config.sincronizado })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    config.sincronizado ? "bg-primary" : "bg-gray-300"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    config.sincronizado ? "left-7" : "left-1"
                  )} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-xl border-2 border-transparent hover:border-primary cursor-pointer overflow-hidden group">
                    <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:text-primary">
                      Estampa {i}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Cores' && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-3 block uppercase tracking-wider">Cor Base</label>
                <div className="flex flex-wrap gap-3">
                  {['#ffffff', '#000000', '#dc2626', '#2563eb', '#16a34a', '#eab308'].map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-transform hover:scale-110",
                        config[activePeca].cores.base === color ? "border-primary scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <label className="text-sm font-bold text-gray-700 mb-3 block uppercase tracking-wider">Detalhes</label>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Cor {i}</span>
                      <div className="w-8 h-8 rounded-lg bg-gray-200 cursor-pointer border border-gray-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Add more tabs content as needed */}
          <div className="py-20 text-center text-gray-400 italic text-sm">
            Configure seu uniforme acima para ver o resultado em tempo real.
          </div>
        </div>
      </div>
    </div>
  );
};
