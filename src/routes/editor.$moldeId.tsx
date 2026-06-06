import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { moldes as staticMoldes } from "@/data/moldes";
import { ThreeViewer } from "@/components/editor/ThreeViewer";

export const Route = createFileRoute("/editor/$moldeId")({
  head: () => ({
    meta: [{ title: "Editor — Simulador de Camisas" }],
  }),
  loader: ({ params }) => {
    const saved = localStorage.getItem("moldes");
    const dynamicMoldes = saved ? JSON.parse(saved).map((m: any) => ({
      id: m.id,
      nome: m.nome,
      thumbnail: m.pngUrl,
      glbUrl: m.glbUrl
    })) : [];
    
    const allMoldes = [...staticMoldes, ...dynamicMoldes];
    const molde = allMoldes.find((m) => m.id === params.moldeId);
    if (!molde) throw notFound();
    return { molde };
  },
  component: EditorPage,
});

type TabId = "modelos" | "cores" | "nome" | "escudo";
const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: "modelos", label: "Modelos", icon: "👕" },
  { id: "cores", label: "Cores", icon: "🎨" },
  { id: "nome", label: "Nome/Nº", icon: "🔤" },
  { id: "escudo", label: "Escudo", icon: "🛡️" },
];

type View = "frente" | "costas" | "lateral";

function EditorPage() {
  const { molde } = Route.useLoaderData();
  const [tab, setTab] = useState<TabId>("modelos");
  const [view, setView] = useState<View>("frente");

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-semibold">
            ← Simulador
          </Link>
          <span className="text-sm text-muted-foreground">/ {molde.nome}</span>
        </div>
        <a
          href="https://wa.me/?text=Quero%20um%20or%C3%A7amento"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Enviar Orçamento
        </a>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className="flex w-[300px] flex-col border-r border-border">
          <nav className="flex border-b border-border">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 px-2 py-3 text-xs font-medium transition ${
                  tab === t.id
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="text-lg">{t.icon}</div>
                <div>{t.label}</div>
              </button>
            ))}
          </nav>
          <div className="flex-1 overflow-y-auto p-4">
            <TabContent tab={tab} />
          </div>
        </aside>

        {/* 3D viewer */}
        <main className="relative flex-1 bg-muted">
          <ThreeViewer />
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 rounded-full border border-border bg-card/95 p-1 shadow-md backdrop-blur">
            {(["frente", "costas", "lateral"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition ${
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function TabContent({ tab }: { tab: TabId }) {
  if (tab === "modelos")
    return (
      <div className="text-sm text-muted-foreground">
        Selecione uma estampa (em breve).
      </div>
    );
  if (tab === "cores")
    return (
      <div className="text-sm text-muted-foreground">
        Escolha uma estampa para editar cores.
      </div>
    );
  if (tab === "nome")
    return (
      <div className="space-y-3">
        <input
          placeholder="Nome"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          placeholder="Número"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    );
  return (
    <input
      type="file"
      accept="image/png"
      className="block w-full text-xs text-muted-foreground"
    />
  );
}