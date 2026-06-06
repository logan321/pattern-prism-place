import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Macro Master</h1>
      <p className="mt-4">Projeto resetado. Aguardando novas instruções.</p>
    </div>
  )
}
