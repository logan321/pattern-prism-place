import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

interface Molde {
  id: string;
  nome: string;
  pngBase64: string;
  glbBase64: string;
}

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [pngBase64, setPngBase64] = useState("");
  const [glbBase64, setGlbBase64] = useState("");
  const [moldes, setMoldes] = useState<Molde[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("moldes");
    if (saved) {
      setMoldes(JSON.parse(saved));
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setGlbBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMolde = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !pngBase64 || !glbBase64) {
      alert("Preencha o nome e selecione os arquivos PNG e GLB");
      return;
    }

    const molde = { id: Date.now().toString(), nome, pngBase64, glbBase64 };
    const updatedMoldes = [...moldes, molde];
    
    localStorage.setItem("moldes", JSON.stringify(updatedMoldes));
    setMoldes(updatedMoldes);
    
    // Reset form
    setNome("");
    setPngBase64("");
    setGlbBase64("");
    const pngInput = document.getElementById("png-upload") as HTMLInputElement;
    if (pngInput) pngInput.value = "";
    const glbInput = document.getElementById("glb-upload") as HTMLInputElement;
    if (glbInput) glbInput.value = "";
    
    alert("Molde salvo com sucesso!");
  };

  if (!isAuthenticated) {
...
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
            {(pngBase64 || glbBase64) && (
              <div className="mt-2 flex gap-4">
                {pngBase64 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Preview PNG:</p>
                    <img src={pngBase64} alt="Preview" className="h-20 w-20 object-contain border rounded bg-gray-100" />
                  </div>
                )}
                {glbBase64 && (
                  <div className="flex flex-col justify-center">
                    <p className="text-xs text-green-600 font-medium">✓ GLB Carregado</p>
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
        </section>

        <section className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4">Moldes Salvos</h2>
          {moldes.length === 0 ? (
            <p className="text-gray-500">Nenhum molde cadastrado.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moldes.map((m) => (
                <div key={m.id} className="border rounded p-4 flex flex-col items-center">
                  <img src={m.pngBase64} alt={m.nome} className="h-32 w-32 object-contain mb-2 bg-gray-100 rounded" />
                  <span className="font-medium">{m.nome}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
