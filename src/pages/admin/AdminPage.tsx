import { useState, useEffect } from 'react';

interface Molde {
  id: string;
  nome: string;
  pngBase64: string;
  glbNome: string;
}

interface Cor {
  hex: string;
  nome: string;
}

interface Estampa {
  id: string;
  moldeId: string;
  nome: string;
  miniaturaBase64: string;
  svgTexto: string;
  cores: Cor[];
}


const SENHA = 'admin123';

function extrairCores(svgText: string): string[] {
  const matches = svgText.match(/fill="(#[a-fA-F0-9]{3,6})"/gi) || [];
  const ignorar = ['#000000', '#ffffff', '#201e1e', '#373435'];
  return [...new Set(
    matches
      .map(m => { const r = m.match(/#[a-fA-F0-9]{3,6}/i); return r ? r[0].toLowerCase() : ''; })
      .filter(c => c && !ignorar.includes(c))
  )];
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState('');
  const [erroSenha, setErroSenha] = useState(false);
  const [moldes, setMoldes] = useState<Molde[]>([]);
  const [nomeMolde, setNomeMolde] = useState('');
  const [pngMolde, setPngMolde] = useState('');
  const [glbNome, setGlbNome] = useState('');
  const [estampas, setEstampas] = useState<Estampa[]>([]);
  const [passo, setPasso] = useState(1);
  const [moldeIdSel, setMoldeIdSel] = useState('');
  const [nomeEstampa, setNomeEstampa] = useState('');
  const [miniaturaBase64, setMiniaturaBase64] = useState('');
  const [svgTexto, setSvgTexto] = useState('');
  const [coresExtraidas, setCoresExtraidas] = useState<string[]>([]);
  const [nomesCores, setNomesCores] = useState<Record<string, string>>({});

  useEffect(() => {
    const m = localStorage.getItem('moldes');
    const e = localStorage.getItem('estampas');
    if (m) setMoldes(JSON.parse(m));
    if (e) setEstampas(JSON.parse(e));
  }, []);

  const login = () => {
    if (senha === SENHA) { setAutenticado(true); setErroSenha(false); }
    else setErroSenha(true);
  };

  const salvarMolde = () => {
    if (!nomeMolde || !pngMolde || !glbNome) { alert('Preencha todos os campos'); return; }
    const novo: Molde = { id: Date.now().toString(), nome: nomeMolde, pngBase64: pngMolde, glbNome };
    const lista = [...moldes, novo];
    setMoldes(lista);
    localStorage.setItem('moldes', JSON.stringify(lista));
    setNomeMolde(''); setPngMolde(''); setGlbNome('');
    alert('Molde salvo!');
  };

  const handlePngMolde = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPngMolde(await fileToBase64(file));
  };

  const handleMiniaturaEstampa = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setMiniaturaBase64(await fileToBase64(file));
  };

  const handleSvgEstampa = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const texto = await fileToText(file);
    setSvgTexto(texto);
    const cores = extrairCores(texto);
    setCoresExtraidas(cores);
    const nomesIniciais: Record<string, string> = {};
    cores.forEach(c => { nomesIniciais[c] = ''; });
    setNomesCores(nomesIniciais);
  };


  const avancarPasso = () => {
    if (!moldeIdSel || !nomeEstampa || !miniaturaBase64 || !svgTexto) { alert('Preencha todos os campos'); return; }
    setPasso(2);
  };

  const salvarEstampa = () => {
    const nova: Estampa = {
      id: Date.now().toString(),
      moldeId: moldeIdSel,
      nome: nomeEstampa,
      miniaturaBase64,
      svgTexto,
      cores: coresExtraidas.map(hex => ({ hex, nome: nomesCores[hex] || '' }))
    };
    const lista = [...estampas, nova];
    setEstampas(lista);
    localStorage.setItem('estampas', JSON.stringify(lista));
    setPasso(1); setMoldeIdSel(''); setNomeEstampa(''); setMiniaturaBase64(''); setSvgTexto(''); setCoresExtraidas([]); setNomesCores({});

    alert('Estampa salva!');
  };

  const deletarEstampa = (id: string) => {
    const lista = estampas.filter(e => e.id !== id);
    setEstampas(lista);
    localStorage.setItem('estampas', JSON.stringify(lista));
  };

  const deletarMolde = (id: string) => {
    const lista = moldes.filter(m => m.id !== id);
    setMoldes(lista);
    localStorage.setItem('moldes', JSON.stringify(lista));
  };

  if (!autenticado) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:12 }}>
      <h2>Admin</h2>
      <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} onKeyDown={e => e.key==='Enter' && login()} style={{ padding:'8px 12px', fontSize:16, border:'1px solid #ccc', borderRadius:6 }} />
      <button onClick={login} style={{ padding:'8px 24px', background:'#2563eb', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:16 }}>Entrar</button>
      {erroSenha && <p style={{ color:'red' }}>Senha incorreta</p>}
    </div>
  );

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:24, fontFamily:'sans-serif' }}>
      <h1>⚙️ Painel Admin</h1>

      <section style={{ marginBottom:40 }}>
        <h2>Moldes</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:10, background:'#f9f9f9', padding:16, borderRadius:8 }}>
          <input placeholder="Nome do molde" value={nomeMolde} onChange={e => setNomeMolde(e.target.value)} style={{ padding:8, borderRadius:6, border:'1px solid #ccc' }} />
          <label>PNG da camisa (branca): <input type="file" accept="image/png" onChange={handlePngMolde} /></label>
          {pngMolde && <img src={pngMolde} alt="preview" style={{ height:80, objectFit:'contain' }} />}
          <label>Nome do GLB (em public/models/): <input placeholder="ex: GOLA_PADRE.glb" value={glbNome} onChange={e => setGlbNome(e.target.value)} style={{ marginLeft:8, padding:6, borderRadius:6, border:'1px solid #ccc' }} /></label>
          <button onClick={salvarMolde} style={{ padding:'8px 16px', background:'#16a34a', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>Salvar Molde</button>
        </div>
        <h3>Moldes Cadastrados</h3>
        {moldes.length === 0 && <p>Nenhum molde.</p>}
        <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
          {moldes.map(m => (
            <div key={m.id} style={{ border:'1px solid #ddd', borderRadius:8, padding:12, width:160, textAlign:'center' }}>
              <img src={m.pngBase64} alt={m.nome} style={{ width:'100%', height:100, objectFit:'contain' }} />
              <p style={{ fontWeight:'bold', margin:'8px 0 4px' }}>{m.nome}</p>
              <p style={{ fontSize:12, color:'#666' }}>{m.glbNome}</p>
              <button onClick={() => deletarMolde(m.id)} style={{ background:'#dc2626', color:'#fff', border:'none', borderRadius:4, padding:'4px 10px', cursor:'pointer' }}>Deletar</button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Estampas</h2>
        <div style={{ background:'#f9f9f9', padding:16, borderRadius:8 }}>
          {passo === 1 && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <p style={{ fontWeight:'bold', color:'#2563eb' }}>Passo 1: Dados da Estampa</p>
              <select value={moldeIdSel} onChange={e => setMoldeIdSel(e.target.value)} style={{ padding:8, borderRadius:6, border:'1px solid #ccc' }}>
                <option value="">Selecione o molde</option>
                {moldes.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
              <input placeholder="Nome da estampa" value={nomeEstampa} onChange={e => setNomeEstampa(e.target.value)} style={{ padding:8, borderRadius:6, border:'1px solid #ccc' }} />
              <label>Miniatura PNG (o que o cliente vê): <input type="file" accept="image/png,image/jpeg" onChange={handleMiniaturaEstampa} /></label>
              {miniaturaBase64 && <img src={miniaturaBase64} alt="miniatura" style={{ height:80, objectFit:'contain' }} />}
              <label>SVG do UV map (projetado no 3D): <input type="file" accept=".svg" onChange={handleSvgEstampa} /></label>
              {svgTexto && <p style={{ color:'green' }}>✅ SVG carregado — {coresExtraidas.length} cores encontradas</p>}

              <button onClick={avancarPasso} style={{ padding:'8px 16px', background:'#2563eb', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>Próximo →</button>
            </div>
          )}
          {passo === 2 && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <p style={{ fontWeight:'bold', color:'#2563eb' }}>Passo 2: Nomear Regiões de Cor</p>
              {coresExtraidas.length === 0 && <p style={{ color:'#888' }}>Nenhuma cor editável encontrada.</p>}
              {coresExtraidas.map(hex => (
                <div key={hex} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, background:hex, borderRadius:4, border:'1px solid #ccc' }} />
                  <span style={{ fontFamily:'monospace', fontSize:13 }}>{hex}</span>
                  <input placeholder="Nome da região (ex: Corpo, Gola)" value={nomesCores[hex] || ''} onChange={e => setNomesCores(prev => ({ ...prev, [hex]: e.target.value }))} style={{ flex:1, padding:'6px 10px', borderRadius:6, border:'1px solid #ccc' }} />
                </div>
              ))}
              <div style={{ display:'flex', gap:10, marginTop:8 }}>
                <button onClick={() => setPasso(1)} style={{ padding:'8px 16px', background:'#6b7280', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>← Voltar</button>
                <button onClick={salvarEstampa} style={{ padding:'8px 16px', background:'#16a34a', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>Salvar Estampa</button>
              </div>
            </div>
          )}
        </div>
        <h3>Estampas Cadastradas</h3>
        {estampas.length === 0 && <p>Nenhuma estampa.</p>}
        <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
          {estampas.map(e => (
            <div key={e.id} style={{ border:'1px solid #ddd', borderRadius:8, padding:12, width:160, textAlign:'center' }}>
              <img src={e.miniaturaBase64} alt={e.nome} style={{ width:'100%', height:100, objectFit:'contain' }} />
              <p style={{ fontWeight:'bold', margin:'8px 0 2px' }}>{e.nome}</p>
              <p style={{ fontSize:11, color:'#666' }}>{moldes.find(m => m.id === e.moldeId)?.nome}</p>
              <p style={{ fontSize:11, color:'#888' }}>{e.cores.length} cores</p>
              <button onClick={() => deletarEstampa(e.id)} style={{ background:'#dc2626', color:'#fff', border:'none', borderRadius:4, padding:'4px 10px', cursor:'pointer', marginTop:4 }}>Deletar</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
