import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Box, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Upload,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export default function Admin() {
  const [activeView, setActiveView] = useState<'models' | 'patterns'>('models');
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const bucket = activeView === 'models' ? 'models' : 'textures';
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      if (activeView === 'models') {
        const { error: dbError } = await supabase
          .from('modelos')
          .insert({
            nome: file.name.replace(`.${fileExt}`, ''),
            glb_url: publicUrl,
          });
        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase
          .from('patterns')
          .insert({
            name: file.name.replace(`.${fileExt}`, ''),
            image_url: publicUrl,
          });

        if (dbError) throw dbError;
      }

      queryClient.invalidateQueries({ queryKey: [activeView] });
      alert('Upload concluído com sucesso!');
    } catch (error: any) {
      console.error('Erro no upload:', error);
      alert(`Erro no upload: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };


  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const { data, error } = await supabase.from('modelos').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: patterns, isLoading: patternsLoading } = useQuery({
    queryKey: ['patterns'],
    queryFn: async () => {
      const { data, error } = await supabase.from('patterns').select('*');
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center space-x-3 border-b border-gray-800">
          <div className="bg-orange-600 p-1.5 rounded-lg">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">Admin Painel</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveView('models')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'models' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Box className="w-5 h-5" />
            <span className="font-medium text-sm">Modelos 3D</span>
          </button>
          <button 
            onClick={() => setActiveView('patterns')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'patterns' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="font-medium text-sm">Estampas</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Simulador</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{activeView === 'models' ? 'Modelos 3D' : 'Gerenciamento de Estampas'}</h2>
              <p className="text-gray-500 text-sm mt-1">
                {activeView === 'models' ? 'Gerencie os arquivos GLB/GLTF dos seus produtos.' : 'Importe e configure as estampas disponíveis para personalização.'}
              </p>
            </div>
            <label className={cn(
              "bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-2 transition-all shadow-sm cursor-pointer",
              isUploading && "opacity-50 cursor-not-allowed"
            )}>
              <Plus className="w-4 h-4" />
              <span>{isUploading ? 'Enviando...' : activeView === 'models' ? 'Novo Modelo' : 'Nova Estampa'}</span>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload} 
                disabled={isUploading}
                accept={activeView === 'models' ? '.glb,.gltf' : 'image/*'}
              />
            </label>

          </div>

          {activeView === 'models' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modelsLoading ? (
                <div className="col-span-full py-12 text-center text-gray-400">Carregando modelos...</div>
              ) : models?.length === 0 ? (
                <div className="col-span-full py-24 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 bg-white">
                  <Box className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-medium">Nenhum modelo cadastrado</p>
                  <button className="mt-4 text-orange-600 font-bold text-sm">Importar primeiro arquivo .glb</button>
                </div>
              ) : (
                models?.map((model: any) => (
                  <div key={model.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                    <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                      {model.thumbnail_url ? (
                        <img src={model.thumbnail_url} alt={model.nome} className="w-full h-full object-cover" />
                      ) : (
                        <Box className="w-12 h-12 text-gray-300" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button className="bg-white p-2 rounded-lg text-gray-700 hover:bg-gray-100"><Upload className="w-4 h-4" /></button>
                        <button className="bg-red-500 p-2 rounded-lg text-white hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <span className="font-bold text-gray-800">{model.nome}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
               {patternsLoading ? (
                 <div className="col-span-full py-12 text-center text-gray-400">Carregando estampas...</div>
               ) : patterns?.length === 0 ? (
                 <div className="col-span-full py-24 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 bg-white">
                   <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                   <p className="font-medium">Nenhuma estampa cadastrada</p>
                 </div>
               ) : (
                 patterns?.map((pattern: any) => (
                   <div key={pattern.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden aspect-square flex items-center justify-center">
                     {pattern.image_url && (
                       <img src={pattern.image_url} alt={pattern.name} className="w-full h-full object-cover" />
                     )}
                   </div>

                 ))
               )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
