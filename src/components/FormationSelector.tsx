import React from 'react';
import { useCustomizerStore } from '../store/useCustomizerStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FormationIcon = ({ type, active }: { type: 'A' | 'B' | 'C' | 'D', active: boolean }) => {
  // Cores simplificadas para o ícone
  const color = active ? '#ea580c' : '#9ca3af';
  
  return (
    <svg viewBox="0 0 100 120" className="w-12 h-14" xmlns="http://www.w3.org/2000/svg">
      {/* Corpo da Camisa */}
      <path d="M20 20 L80 20 L95 40 L85 50 L75 40 L75 110 L25 110 L25 40 L15 50 L5 40 Z" fill="none" stroke={color} strokeWidth="2" />
      
      {/* Elementos baseados no tipo */}
      {type === 'A' && (
        <>
          <rect x="35" y="30" width="30" height="6" rx="1" fill={color} opacity="0.6" /> {/* NOME TOPO */}
          <text x="50" y="75" textAnchor="middle" fill={color} fontSize="28" fontWeight="bold">10</text>
        </>
      )}
      {type === 'B' && (
        <>
          <rect x="35" y="90" width="30" height="6" rx="1" fill={color} opacity="0.6" /> {/* NOME FUNDO */}
          <text x="50" y="65" textAnchor="middle" fill={color} fontSize="28" fontWeight="bold">10</text>
        </>
      )}
      {type === 'C' && (
        <>
          <rect x="30" y="35" width="18" height="4" rx="1" fill={color} opacity="0.6" /> {/* NOME ESQ */}
          <circle cx="65" cy="37" r="6" stroke={color} fill="none" strokeWidth="1.5" /> {/* ESCUDO DIR */}
        </>
      )}
      {type === 'D' && (
        <>
          <circle cx="35" cy="37" r="6" stroke={color} fill="none" strokeWidth="1.5" /> {/* ESCUDO ESQ */}
          <rect x="52" y="35" width="18" height="4" rx="1" fill={color} opacity="0.6" /> {/* NOME DIR */}
        </>
      )}
    </svg>
  );
};

export const FormationSelector = () => {
  const { formationCostas, setFormationCostas, formationFrente, setFormationFrente } = useCustomizerStore();

  return (
    <div className="space-y-6 py-2">
      <div>
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Layout Costas</h3>
        <div className="flex gap-4">
          <button 
            onClick={() => setFormationCostas('A')}
            className={cn(
              "flex flex-col items-center p-2 rounded-lg border transition-all",
              formationCostas === 'A' ? "border-orange-500 bg-orange-50 shadow-sm" : "border-gray-100 hover:border-gray-200"
            )}
          >
            <FormationIcon type="A" active={formationCostas === 'A'} />
            <span className="text-[9px] font-bold mt-1 text-gray-500">OPÇÃO A</span>
          </button>
          
          <button 
            onClick={() => setFormationCostas('B')}
            className={cn(
              "flex flex-col items-center p-2 rounded-lg border transition-all",
              formationCostas === 'B' ? "border-orange-500 bg-orange-50 shadow-sm" : "border-gray-100 hover:border-gray-200"
            )}
          >
            <FormationIcon type="B" active={formationCostas === 'B'} />
            <span className="text-[9px] font-bold mt-1 text-gray-500">OPÇÃO B</span>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Layout Frente</h3>
        <div className="flex gap-4">
          <button 
            onClick={() => setFormationFrente('C')}
            className={cn(
              "flex flex-col items-center p-2 rounded-lg border transition-all",
              formationFrente === 'C' ? "border-orange-500 bg-orange-50 shadow-sm" : "border-gray-100 hover:border-gray-200"
            )}
          >
            <FormationIcon type="C" active={formationFrente === 'C'} />
            <span className="text-[9px] font-bold mt-1 text-gray-500">OPÇÃO C</span>
          </button>
          
          <button 
            onClick={() => setFormationFrente('D')}
            className={cn(
              "flex flex-col items-center p-2 rounded-lg border transition-all",
              formationFrente === 'D' ? "border-orange-500 bg-orange-50 shadow-sm" : "border-gray-100 hover:border-gray-200"
            )}
          >
            <FormationIcon type="D" active={formationFrente === 'D'} />
            <span className="text-[9px] font-bold mt-1 text-gray-500">OPÇÃO D</span>
          </button>
        </div>
      </div>
    </div>
  );
};