import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-orange-600">Macro Master</h1>
      <p className="mt-4 text-gray-700">Projeto resetado. Aguardando novas instruções para o simulador 3D.</p>
    </div>
  )
}
