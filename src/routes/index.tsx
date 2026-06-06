import { createFileRoute, Link } from "@tanstack/react-router";
import { moldes } from "@/data/moldes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Simulador de Camisas Esportivas" },
      { name: "description", content: "Escolha um molde e personalize sua camisa em 3D." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-8 py-5">
        <h1 className="text-xl font-semibold">Simulador de Camisas</h1>
      </header>
      <main className="mx-auto max-w-6xl px-8 py-10">
        <h2 className="mb-6 text-2xl font-bold">Escolha um molde</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {moldes.map((m) => (
            <Link
              key={m.id}
              to="/editor/$moldeId"
              params={{ moldeId: m.id }}
              className="group block overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary hover:shadow-md"
            >
              <div className="aspect-square bg-muted">
                <img src={m.thumbnail} alt={m.nome} className="h-full w-full object-contain" />
              </div>
              <div className="border-t border-border px-4 py-3">
                <p className="text-sm font-medium">{m.nome}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
