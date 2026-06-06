import { Link } from '@tanstack/react-router'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">M</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">
          MACRO <span className="text-orange-600">MASTER</span>
        </span>
      </div>
      
      <nav className="hidden md:flex items-center gap-6">
        <Link to="/" className="text-sm font-medium text-gray-600 hover:text-orange-600">Simulador</Link>
        <Link to="/" className="text-sm font-medium text-gray-600 hover:text-orange-600">Modelos</Link>
        <Link to="/" className="text-sm font-medium text-gray-600 hover:text-orange-600">Minha Conta</Link>
      </nav>

      <div className="flex items-center gap-4">
        <button className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors">
          Salvar Simulação
        </button>
      </div>
    </header>
  )
}
