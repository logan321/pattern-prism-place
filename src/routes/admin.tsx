import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

interface Molde {
  id: string;
  nome: string;
  pngUrl: string;
  glbUrl: string;
}

interface EstampaCor {
  hex: string;
  nome: string;
}

interface Estampa {
  id: string;
  moldeId: string;
  nome: string;
  pngUrl: string;
  svgUrl: string;
  cores: EstampaCor[];
}

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"moldes" | "estampas">("moldes");

  const [moldes, setMoldes] = useState<Molde[]>([]);
  const [estampas, setEstampas] = useState<Estampa[]>([]);

  // Form states for Molde
  const [moldeNome, setMoldeNome] = useState("");
  const [moldePng, setMoldePng] = useState("");
  const [moldeGlb, setMoldeGlb] = useState("");

  // Form states for Estampa
  const [estampaNome, setEstampaNome] = useState("");
  const [estampaMoldeId, setEstampaMoldeId] = useState("");
  const [estampaPng, setEstampaPng] = useState("");
  const [estampaSvg, setEstampaSvg] = useState("");
  const [extractedColors, setExtractedColors] = useState<EstampaCor[]>([]);

  useEffect(() => {
    const savedMoldes = localStorage.getItem("moldes");
    const savedEstampas = localStorage.getItem("estampas");
    if (savedMoldes) setMoldes(JSON.parse(savedMoldes));
    if (savedEstampas) setEstampas(JSON.parse(savedEstampas));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("Senha incorreta");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const saveMolde = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moldeNome || !moldePng || !moldeGlb) return alert("Preencha tudo");

    const novoMolde: Molde = {
      id: crypto.randomUUID(),
      nome: moldeNome,
      pngUrl: moldePng,
      glbUrl: moldeGlb,
    };

    const updated = [...moldes, novoMolde];
    setMoldes(updated);
    localStorage.setItem("moldes", JSON.stringify(updated));
    setMoldeNome("");
    setMoldePng("");
    setMoldeGlb("");
    alert("Molde salvo!");
  };

  const handleSvgUpload = async (file: File) => {
    const base64 = await fileToBase64(file);
    setEstampaSvg(base64);

    // Read colors from SVG
    const svgText = atob(base64.split(",")[1]);
    const hexRegex = /fill\s*[:=]\s*['"]?(#[a-fA-F0-9]{6})['"]?/gi;
    const matches = svgText.matchAll(hexRegex);
    const colors = Array.from(new Set(Array.from(matches).map(m => m[1])));
    
    setExtractedColors(colors.map(hex => ({ hex, nome: "" })));
  };

  const saveEstampa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estampaNome || !estampaMoldeId || !estampaPng || !estampaSvg) return alert("Preencha tudo");
    if (extractedColors.some(c => !c.nome)) return alert("Dê nome para todas as regiões de cores");

    const novaEstampa: Estampa = {
      id: crypto.randomUUID(),
      moldeId: estampaMoldeId,
      nome: estampaNome,
      pngUrl: estampaPng,
      svgUrl: estampaSvg,
      cores: extractedColors,
    };

    const updated = [...estampas, novaEstampa];
    setEstampas(updated);
    localStorage.setItem("estampas", JSON.stringify(updated));
    setEstampaNome("");
    setEstampaPng("");
    setEstampaSvg("");
    setExtractedColors([]);
    alert("Estampa salva!");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
          <input
            type="password"
            placeholder="Senha"
            className="w-full border p-2 mb-4 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Simulador Admin</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab("moldes")}
            className={`px-4 py-2 rounded ${activeTab === "moldes" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Moldes
          </button>
          <button 
            onClick={() => setActiveTab("estampas")}
            className={`px-4 py-2 rounded ${activeTab === "estampas" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Estampas
          </button>
        </div>
      </header>

      <main className="p-8 max-w-6xl mx-auto">
        {activeTab === "moldes" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white p-6 rounded shadow">
              <h2 className="text-lg font-bold mb-4">Novo Molde</h2>
              <form onSubmit={saveMolde} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded" 
                    value={moldeNome}
                    onChange={e => setMoldeNome(e.target.value)}
                    placeholder="Ex: Camisa Clássica"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Imagem PNG (Placeholder)</label>
                  <input 
                    type="file" 
                    accept="image/png"
                    onChange={async e => e.target.files?.[0] && setMoldePng(await fileToBase64(e.target.files[0]))}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Modelo GLB (3D)</label>
                  <input 
                    type="file" 
                    accept=".glb"
                    onChange={async e => e.target.files?.[0] && setMoldeGlb(await fileToBase64(e.target.files[0]))}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                  Salvar Molde
                </button>
              </form>
            </section>

            <section className="bg-white p-6 rounded shadow overflow-y-auto max-h-[600px]">
              <h2 className="text-lg font-bold mb-4">Moldes Cadastrados ({moldes.length})</h2>
              <div className="space-y-4">
                {moldes.map(m => (
                  <div key={m.id} className="flex items-center gap-4 border-b pb-4">
                    <img src={m.pngUrl} className="w-16 h-16 object-contain bg-gray-100 border" />
                    <div>
                      <p className="font-medium">{m.nome}</p>
                      <p className="text-xs text-gray-500">ID: {m.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white p-6 rounded shadow">
              <h2 className="text-lg font-bold mb-4">Nova Estampa</h2>
              <form onSubmit={saveEstampa} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Molde Alvo</label>
                  <select 
                    className="w-full border p-2 rounded"
                    value={estampaMoldeId}
                    onChange={e => setEstampaMoldeId(e.target.value)}
                  >
                    <option value="">Selecione um molde</option>
                    {moldes.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nome da Estampa</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded" 
                    value={estampaNome}
                    onChange={e => setEstampaNome(e.target.value)}
                    placeholder="Ex: Estampa Azul/Preta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thumbnail (PNG)</label>
                  <input 
                    type="file" 
                    accept="image/png"
                    onChange={async e => e.target.files?.[0] && setEstampaPng(await fileToBase64(e.target.files[0]))}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mapa UV (SVG)</label>
                  <input 
                    type="file" 
                    accept="image/svg+xml"
                    onChange={e => e.target.files?.[0] && handleSvgUpload(e.target.files[0])}
                    className="w-full border p-2 rounded"
                  />
                </div>

                {extractedColors.length > 0 && (
                  <div className="bg-gray-100 p-4 rounded space-y-3">
                    <h3 className="font-bold text-sm">Regiões detectadas:</h3>
                    {extractedColors.map((color, idx) => (
                      <div key={color.hex} className="flex items-center gap-2">
                        <div className="w-6 h-6 border rounded" style={{ backgroundColor: color.hex }}></div>
                        <span className="text-xs font-mono">{color.hex}</span>
                        <input 
                          type="text" 
                          placeholder="Nome da região"
                          className="flex-1 border p-1 text-sm rounded"
                          value={color.nome}
                          onChange={e => {
                            const newColors = [...extractedColors];
                            newColors[idx].nome = e.target.value;
                            setExtractedColors(newColors);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                  Salvar Estampa
                </button>
              </form>
            </section>

            <section className="bg-white p-6 rounded shadow overflow-y-auto max-h-[600px]">
              <h2 className="text-lg font-bold mb-4">Estampas Cadastradas ({estampas.length})</h2>
              <div className="space-y-4">
                {estampas.map(e => (
                  <div key={e.id} className="flex items-center gap-4 border-b pb-4">
                    <img src={e.pngUrl} className="w-16 h-16 object-contain bg-gray-100 border" />
                    <div>
                      <p className="font-medium">{e.nome}</p>
                      <p className="text-xs text-gray-500">Molde: {moldes.find(m => m.id === e.moldeId)?.nome}</p>
                      <div className="flex gap-1 mt-1">
                        {e.cores.map(c => (
                          <div key={c.hex} className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} title={c.nome}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
