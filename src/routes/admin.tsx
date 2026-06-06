import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

interface Molde {
  id: string;
  nome: string;
  pngBase64: string;
  glbNome: string;
}

interface Estampa {
  id: string;
  moldeId: string;
  nome: string;
  miniaturaBase64: string;
  svgBase64: string;
  cores: { hex: string; nome: string }[];
}

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  // Moldes state
  const [nome, setNome] = useState("");
  const [pngBase64, setPngBase64] = useState("");
  const [glbNome, setGlbNome] = useState("");
  const [moldes, setMoldes] = useState<Molde[]>([]);

  // Estampas state
  const [estampas, setEstampas] = useState<Estampa[]>([]);
  const [step, setStep] = useState(1);
  const [selectedMoldeId, setSelectedMoldeId] = useState("");
  const [estampaNome, setEstampaNome] = useState("");
  const [estampaMiniaturaBase64, setEstampaMiniaturaBase64] = useState("");
  const [estampaSvgBase64, setEstampaSvgBase64] = useState("");
  const [detectedCores, setDetectedCores] = useState<{ hex: string; nome: string }[]>([]);

  useEffect(() => {
    const savedMoldes = localStorage.getItem("moldes");
    if (savedMoldes) {
      const parsed = JSON.parse(savedMoldes);
      setMoldes(parsed);
      if (parsed.length > 0) setSelectedMoldeId(parsed[0].id);
    }
    
    const savedEstampas = localStorage.getItem("estampas");
    if (savedEstampas) {
      setEstampas(JSON.parse(savedEstampas));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("Senha incorreta");
    }
  };

  const handlePngUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPngBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGlbUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGlbNome(file.name);
    }
  };

  const handleSaveMolde = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !pngBase64 || !glbNome) {
      alert("Preencha o nome e selecione os arquivos PNG e GLB");
      return;
    }

    const molde = { id: Date.now().toString(), nome, pngBase64, glbNome };
    const updatedMoldes = [...moldes, molde];
    
    localStorage.setItem("moldes", JSON.stringify(updatedMoldes));
    setMoldes(updatedMoldes);
    
    // Reset form
    setNome("");
    setPngBase64("");
    setGlbNome("");
    const pngInput = document.getElementById("png-upload") as HTMLInputElement;
    if (pngInput) pngInput.value = "";
    const glbInput = document.getElementById("glb-upload") as HTMLInputElement;
    if (glbInput) glbInput.value = "";
    
    alert("Molde salvo com sucesso!");
  };

  const handleEstampaMiniaturaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEstampaMiniaturaBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSvgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const svgContent = reader.result as string;
        setEstampaSvgBase64(svgContent);
        
        const matches = svgContent.match(/fill="(#[a-fA-F0-9]{3,6})"/gi) || [];
        const coresUnicas = [...new Set(matches.map(m => {
          const hexMatch = m.match(/#[a-fA-F0-9]{3,6}/i);
          return hexMatch ? hexMatch[0].toLowerCase() : "";
        }).filter(c => c && c !== '#000000' && c !== '#ffffff' && c !== '#201e1e'))];
        
        setDetectedCores(coresUnicas.map(hex => ({ hex, nome: "" })));
      };
      reader.readAsText(file);
    }
  };

  const handleSaveEstampa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMoldeId || !estampaNome || !estampaMiniaturaBase64 || !estampaSvgBase64) {
      alert("Preencha todos os campos");
      return;
    }

    const novaEstampa: Estampa = {
      id: Date.now().toString(),
      moldeId: selectedMoldeId,
      nome: estampaNome,
      miniaturaBase64: estampaMiniaturaBase64,
      svgBase64: estampaSvgBase64,
      cores: detectedCores
    };

    const updatedEstampas = [...estampas, novaEstampa];
    localStorage.setItem("estampas", JSON.stringify(updatedEstampas));
    setEstampas(updatedEstampas);

    // Reset
    setStep(1);
    setEstampaNome("");
    setEstampaMiniaturaBase64("");
    setEstampaSvgBase64("");
    setDetectedCores([]);
    alert("Estampa salva com sucesso!");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin</h1>
        
        <section className="bg-white p-6 rounded shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Moldes</h2>
          <form onSubmit={handleSaveMolde} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome do molde</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Camisa Polo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload de PNG</label>
              <input
                id="png-upload"
                type="file"
                accept="image/png"
                onChange={handlePngUpload}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload de GLB (Modelo 3D)</label>
              <input
                id="glb-upload"
                type="file"
                accept=".glb"
                onChange={handleGlbUpload}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {(pngBase64 || glbNome) && (
              <div className="mt-2 flex gap-4">
                {pngBase64 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Preview PNG:</p>
                    <img src={pngBase64} alt="Preview" className="h-20 w-20 object-contain border rounded bg-gray-100" />
                  </div>
                )}
                {glbNome && (
                  <div className="flex flex-col justify-center">
                    <p className="text-xs text-green-600 font-medium">✓ GLB: {glbNome}</p>
                  </div>
                )}
              </div>
            )}
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
            >
              Salvar Molde
            </button>
          </form>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Moldes Salvos</h3>
            {moldes.length === 0 ? (
              <p className="text-gray-500">Nenhum molde cadastrado.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {moldes.map((m) => (
                  <div key={m.id} className="border rounded p-4 flex flex-col items-center bg-gray-50">
                    <img src={m.pngBase64} alt={m.nome} className="h-24 w-24 object-contain mb-2 bg-white rounded border" />
                    <span className="font-medium text-center text-sm">{m.nome}</span>
                    {m.glbNome && <span className="text-[10px] text-gray-500 mt-1">GLB: {m.glbNome}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white p-6 rounded shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Estampas</h2>
          
          {step === 1 ? (
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-blue-600">Passo 1: Dados Básicos</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Escolher Molde</label>
                <select 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={selectedMoldeId}
                  onChange={(e) => setSelectedMoldeId(e.target.value)}
                >
                  <option value="">Selecione um molde</option>
                  {moldes.map(m => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome da Estampa</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={estampaNome}
                  onChange={(e) => setEstampaNome(e.target.value)}
                  placeholder="Ex: Estampa Floral"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload de PNG (Thumbnail)</label>
                <input
                  type="file"
                  accept="image/png"
                  onChange={handleEstampaMiniaturaUpload}
                  className="mt-1 block w-full text-sm text-gray-500"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!selectedMoldeId || !estampaNome || !estampaMiniaturaBase64) {
                    alert("Preencha todos os campos do Passo 1");
                    return;
                  }
                  setStep(2);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
              >
                Próximo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-blue-600">Passo 2: SVG e Cores</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload de SVG (UV Map)</label>
                <input
                  type="file"
                  accept=".svg"
                  onChange={handleSvgUpload}
                  className="mt-1 block w-full text-sm text-gray-500"
                />
              </div>

              {detectedCores.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <p className="text-sm font-medium">Cores detectadas (Regiões):</p>
                  {detectedCores.map((cor, index) => (
                    <div key={cor.hex} className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded border shadow-sm" 
                        style={{ backgroundColor: cor.hex }}
                      />
                      <span className="text-xs font-mono">{cor.hex}</span>
                      <input
                        type="text"
                        placeholder="Nome da região"
                        className="flex-1 border border-gray-300 rounded-md p-1 text-sm"
                        value={cor.nome}
                        onChange={(e) => {
                          const newCores = [...detectedCores];
                          newCores[index].nome = e.target.value;
                          setDetectedCores(newCores);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 font-medium"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEstampa}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
                >
                  Salvar Estampa
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-medium mb-4">Estampas Salvas</h3>
            {estampas.length === 0 ? (
              <p className="text-gray-500">Nenhuma estampa cadastrada.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {estampas.map((e) => (
                  <div key={e.id} className="border rounded p-4 flex flex-col items-center bg-gray-50">
                    <img src={e.miniaturaBase64} alt={e.nome} className="h-24 w-24 object-contain mb-2 bg-white rounded border" />
                    <span className="font-medium text-center text-sm">{e.nome}</span>
                    <span className="text-[10px] text-gray-500 mt-1">
                      Molde: {moldes.find(m => m.id === e.moldeId)?.nome || "Desconhecido"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
