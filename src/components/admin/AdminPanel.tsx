import React, { useState, useEffect } from 'react';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, Trash2 } from 'lucide-react';

export function AdminPanel() {
  const { templates, setTemplates, designs, addDesign } = useSimulatorStore();
  const [activeTab, setActiveTab] = useState<'templates' | 'designs'>('templates');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('shirt_models')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setTemplates(data.map(m => ({
        id: m.id,
        name: m.name,
        image: '/uploads/colado-1780761035664.png', // Placeholder thumbnail
        type: 'custom',
        glb_url: m.glb_url
      })));
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('models')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('models')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('shirt_models')
        .insert([{
          name: name,
          glb_url: publicUrl
        }]);

      if (dbError) throw dbError;
      
      await fetchModels();
    } catch (error: any) {
      alert('Erro ao enviar: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (!confirm('Tem certeza?')) return;
    
    const { error } = await supabase
      .from('shirt_models')
      .delete()
      .eq('id', id);
    
    if (!error) {
      fetchModels();
    }
  };

  const handleAddTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const fileInput = (e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement);
    
    if (fileInput.files?.[0]) {
      await handleFileUpload({ target: fileInput } as any, name);
      e.currentTarget.reset();
    } else {
      alert('Selecione um arquivo .glb');
    }
  };

  const handleAddDesign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addDesign({
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      thumbnail: formData.get('thumbnail') as string,
      uvMap: formData.get('uvMap') as string,
    });
    e.currentTarget.reset();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 px-6 transition-all ${activeTab === 'templates' ? 'border-b-2 border-orange-500 text-orange-600 font-bold' : 'text-gray-400'}`}
        >
          Modelos 3D (.glb)
        </button>
        <button
          onClick={() => setActiveTab('designs')}
          className={`pb-3 px-6 transition-all ${activeTab === 'designs' ? 'border-b-2 border-orange-500 text-orange-600 font-bold' : 'text-gray-400'}`}
        >
          Estampas (UV Maps)
        </button>
      </div>

      {activeTab === 'templates' ? (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Gerenciar Modelos 3D</h2>
          </div>
          
          <form onSubmit={handleAddTemplate} className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome do Estilo</label>
                <input name="name" placeholder="Ex: Camisa Masculina Slim" className="w-full p-2.5 border rounded-lg focus:ring-2 ring-orange-100" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Arquivo GLB</label>
                <input type="file" accept=".glb" className="w-full p-2 border rounded-lg bg-white" required />
              </div>
              <button 
                type="submit" 
                disabled={isUploading}
                className="md:col-span-2 bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                {isUploading ? 'Enviando...' : 'Adicionar Novo Modelo 3D'}
              </button>
            </div>
          </form>
          
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map(t => (
                <div key={t.id} className="group relative border rounded-xl p-4 transition-all hover:shadow-md bg-white">
                  <div className="aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center text-gray-400 italic text-xs">
                    Modelo 3D GLB
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800">{t.name}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{t.glb_url}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteModel(t.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Adicionar Nova Estampa</h2>
          <form onSubmit={handleAddDesign} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <input name="name" placeholder="Nome/Código da Estampa" className="p-2.5 border rounded-lg" required />
            <input name="thumbnail" placeholder="URL da Miniatura" className="p-2.5 border rounded-lg" required />
            <input name="uvMap" placeholder="URL do UV Map (PNG do CLO3D)" className="p-2.5 border rounded-lg md:col-span-2" required />
            <button type="submit" className="bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 transition-all">Adicionar Estampa</button>
          </form>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {designs.map(d => (
              <div key={d.id} className="border rounded-xl p-3 text-center transition-all hover:shadow-md">
                <img src={d.thumbnail} alt={d.name} className="w-full h-32 object-contain mb-2 rounded" />
                <p className="font-bold text-gray-700">{d.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}