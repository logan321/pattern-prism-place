import React, { useState } from 'react';
import { useSimulatorStore } from '../../store/useSimulatorStore';

export function AdminPanel() {
  const { templates, designs, addTemplate, addDesign } = useSimulatorStore();
  const [activeTab, setActiveTab] = useState<'templates' | 'designs'>('templates');

  const handleAddTemplate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addTemplate({
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      image: formData.get('image') as string,
      type: formData.get('type') as string,
    });
    e.currentTarget.reset();
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-2 px-4 ${activeTab === 'templates' ? 'border-b-2 border-orange-500 text-orange-600 font-bold' : 'text-gray-500'}`}
        >
          Templates (Modelos)
        </button>
        <button
          onClick={() => setActiveTab('designs')}
          className={`pb-2 px-4 ${activeTab === 'designs' ? 'border-b-2 border-orange-500 text-orange-600 font-bold' : 'text-gray-500'}`}
        >
          Estampas (UV Maps)
        </button>
      </div>

      {activeTab === 'templates' ? (
        <section>
          <h2 className="text-xl font-semibold mb-4">Adicionar Novo Template</h2>
          <form onSubmit={handleAddTemplate} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <input name="name" placeholder="Nome do Template (Ex: Gola Padre)" className="p-2 border rounded" required />
            <select name="type" className="p-2 border rounded" required>
              <option value="gola_padre">Gola Padre</option>
              <option value="gola_o">Gola O</option>
              <option value="v_neck">V-Neck</option>
            </select>
            <input name="image" placeholder="URL da Imagem PNG" className="p-2 border rounded" required />
            <button type="submit" className="bg-orange-500 text-white p-2 rounded hover:bg-orange-600">Adicionar Template</button>
          </form>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {templates.map(t => (
              <div key={t.id} className="border rounded p-2 text-center">
                <img src={t.image} alt={t.name} className="w-full h-32 object-contain mb-2" />
                <p className="font-medium">{t.name}</p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section>
          <h2 className="text-xl font-semibold mb-4">Adicionar Nova Estampa</h2>
          <form onSubmit={handleAddDesign} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <input name="name" placeholder="Nome/Código da Estampa" className="p-2 border rounded" required />
            <input name="thumbnail" placeholder="URL da Miniatura" className="p-2 border rounded" required />
            <input name="uvMap" placeholder="URL do UV Map (PNG do CLO3D)" className="p-2 border rounded" required />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Adicionar Estampa</button>
          </form>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {designs.map(d => (
              <div key={d.id} className="border rounded p-2 text-center">
                <img src={d.thumbnail} alt={d.name} className="w-full h-32 object-contain mb-2" />
                <p className="font-medium">{d.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
