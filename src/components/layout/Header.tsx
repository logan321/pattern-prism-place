import { Link } from '@tanstack/react-router'
import { Settings } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
          <span className="text-white font-black text-xl">M</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tighter text-gray-900 leading-none">
            MACRO <span className="text-orange-600">MASTER</span>
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Simulador 3D Profissional</span>
        </div>
      </div>
      
      <nav className="hidden md:flex items-center gap-8">
        <Link to="/" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-orange-600 transition-colors">Simulador</Link>
        <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-orange-600 transition-colors flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" />
          Configurar
        </Link>
        <a href="#" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-orange-600 transition-colors">Ajuda</a>
      </nav>

      <div className="flex items-center gap-4">
        <button className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-orange-700 active:scale-95 transition-all shadow-md shadow-orange-600/10">
          Salvar Simulação
        </button>
      </div>
    </header>
  )
}

