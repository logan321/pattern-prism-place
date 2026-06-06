import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { moldes as staticMoldes, Molde } from "@/data/moldes";

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
  const [moldes, setMoldes] = useState<Molde[]>(staticMoldes);

  useEffect(() => {
    const saved = localStorage.getItem("moldes");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Combine static and dynamic moldes
      const dynamic = parsed.map((m: any) => ({
        id: m.id,
        nome: m.nome,
        thumbnail: m.pngUrl,
      }));
      setMoldes([...staticMoldes, ...dynamic]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-8 py-5">
        <h1 className="text-xl font-semibold">Simulador de Camisas</h1>
        <Link to="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Área do Administrador
        </Link>
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
