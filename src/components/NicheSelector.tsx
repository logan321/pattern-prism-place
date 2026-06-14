import React from "react";
import { Fish, Wheat, Trophy } from "lucide-react";
import { useCustomizerStore } from "../store/useCustomizerStore";
import { NICHO_CONFIG, type Nicho } from "../lib/nichoConfig";

const OPTIONS: { id: Nicho; label: string; icon: React.ReactNode; gradient: string }[] = [
  { id: "pesca", label: "Pesca", icon: <Fish className="w-14 h-14" />, gradient: "from-sky-500 to-blue-700" },
  { id: "agro", label: "Agro", icon: <Wheat className="w-14 h-14" />, gradient: "from-amber-500 to-yellow-700" },
  { id: "esportivo", label: "Esportivo", icon: <Trophy className="w-14 h-14" />, gradient: "from-orange-500 to-red-600" },
];

export const NicheSelector: React.FC = () => {
  const { setNicho, setSelectedModel, setSelectedPattern, clearUvState } = useCustomizerStore();

  const select = (n: Nicho) => {
    clearUvState();
    setSelectedPattern(null);
    setSelectedModel(NICHO_CONFIG[n].defaultModelId);
    setNicho(n);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <h1 className="text-white text-3xl md:text-5xl font-black mb-3">Escolha seu Nicho</h1>
        <p className="text-gray-300 text-sm md:text-base">Selecione o segmento para iniciar a personalização</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => select(opt.id)}
            className={`group bg-gradient-to-br ${opt.gradient} rounded-2xl p-8 flex flex-col items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 transition-transform min-h-[180px]`}
          >
            <div className="mb-4 opacity-90 group-hover:opacity-100">{opt.icon}</div>
            <span className="text-xl md:text-2xl font-bold uppercase tracking-wide">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};