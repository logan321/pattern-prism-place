import { createFileRoute } from '@tanstack/react-router'
import { AdminPanel } from '../../components/admin/AdminPanel'

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
})

function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Administração do Simulador</h1>
      <AdminPanel />
    </div>
  )
}
