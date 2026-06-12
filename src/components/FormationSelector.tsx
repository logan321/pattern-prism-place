import React from 'react';
import { useCustomizerStore } from '../store/useCustomizerStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FormationIcon = ({ type, active }: { type: 'A' | 'B' | 'C' | 'D', active: boolean }) => {
  const color = active ? '#ea580c' : '#4b5563';
  
  return (
    <div className={cn(
      "relative w-16 h-20 rounded-lg flex items-center justify-center overflow-hidden transition-all",
      active ? "bg-orange-50/50" : "bg-gray-50/50"
    )}>
      <svg viewBox="0 0 100 120" className="w-14 h-16 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
        {/* Sombra da Camisa */}
        <path d="M22 22 L78 22 L93 42 L83 52 L73 42 L73 108 L27 108 L27 42 L17 52 L7 42 Z" fill="rgba(0,0,0,0.05)" />
        
        {/* Corpo da Camisa */}
        <path 
          d="M20 20 L80 20 L95 40 L85 50 L75 40 L75 110 L25 110 L25 40 L15 50 L5 40 Z" 
          fill={active ? "#fff" : "#fefefe"} 
          stroke={color} 
          strokeWidth="2.5" 
          strokeLinejoin="round"
        />
        
        {/* Detalhe da Gola */}
        <path d="M40 20 Q50 30 60 20" fill="none" stroke={color} strokeWidth="2" />
        
        {/* Elementos baseados no tipo */}
        {type === 'A' && (
          <>
            <rect x="30" y="32" width="40" height="5" rx="2.5" fill={color} />
            <text x="50" y="75" textAnchor="middle" fill={color} fontSize="32" fontWeight="900" style={{ fontFamily: 'sans-serif' }}>10</text>
          </>
        )}
        {type === 'B' && (
          <>
            <rect x="30" y="88" width="40" height="5" rx="2.5" fill={color} />
            <text x="50" y="65" textAnchor="middle" fill={color} fontSize="32" fontWeight="900" style={{ fontFamily: 'sans-serif' }}>10</text>
          </>
        )}
        {type === 'C' && (
          <>
            <rect x="25" y="38" width="22" height="4" rx="2" fill={color} />
            <circle cx="65" cy="40" r="8" fill={color} opacity="0.15" />
            <circle cx="65" cy="40" r="8" stroke={color} fill="none" strokeWidth="2" />
            <path d="M62 37 L68 43 M68 37 L62 43" stroke={color} strokeWidth="1.5" />
          </>
        )}
        {type === 'D' && (
          <>
            <circle cx="35" cy="40" r="8" fill={color} opacity="0.15" />
            <circle cx="35" cy="40" r="8" stroke={color} fill="none" strokeWidth="2" />
            <path d="M32 37 L38 43 M38 37 L32 43" stroke={color} strokeWidth="1.5" />
            <rect x="53" y="38" width="22" height="4" rx="2" fill={color} />
          </>
        )}
      </svg>
    </div>
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