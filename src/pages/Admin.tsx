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
import { Helmet } from 'react-helmet-async';
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
      const bucket = activeView === 'models' ? 'models' : 'textures';
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      const uploadOptions = activeView === 'models' 
        ? {
            cacheControl: '3600',
            upsert: false,
            contentType: fileExt === 'glb' ? 'model/gltf-binary' : 'model/gltf+json'
          }
        : {
            cacheControl: '3600',
            upsert: false
          };

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, uploadOptions);

      if (uploadError) {
        console.error('Erro no upload storage:', uploadError);
        throw new Error(`Erro no storage: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

      const publicUrl = urlData.publicUrl;
      console.log('URL gerada:', publicUrl);

      // Teste se a URL é acessível antes de salvar
      const testFetch = await fetch(publicUrl, { method: 'HEAD' });
      if (!testFetch.ok) {
        throw new Error(`URL gerada inválida (${testFetch.status}): ${publicUrl}`);
      }

      if (activeView === 'models') {
        const { error: dbError } = await supabase
          .from('modelos')
          .insert({
            nome: file.name,
            glb_url: publicUrl,
            categoria_id: null,
          } as any);
        if (dbError) {
          console.error('Erro no banco modelos:', dbError);
          throw new Error(`Erro no banco: ${dbError.message}`);
        }
      } else {
        const { error: dbError } = await supabase
          .from('patterns')
          .insert({
            name: file.name,
            image_url: publicUrl,
          });

        if (dbError) {
          console.error('Erro no banco patterns:', dbError);
          throw new Error(`Erro no banco: ${dbError.message}`);
        }
      }

      queryClient.invalidateQueries({ queryKey: [activeView] });
      alert('Upload concluído com sucesso!');
    } catch (error: any) {
      console.error('Erro geral no upload:', error);
      alert(`Erro: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, bucket: string, filePath: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      // 1. Deletar do Storage
      const fileName = filePath.split('/').pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from(bucket)
          .remove([fileName]);
        
        if (storageError) {
          console.warn('Erro ao deletar do storage:', storageError);
        }
      }

      // 2. Deletar do Banco
      const table = bucket === 'models' ? 'modelos' : 'patterns';
      const { error: dbError } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: [activeView] });
      alert('Item excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      alert(`Erro ao excluir: ${error.message}`);
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
    <>
      <Helmet>
        <title>Painel Admin | Macro Master</title>
        <meta name="description" content="Painel administrativo para gerenciar modelos 3D e padrões de uniformes." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://pattern-prism-place.lovable.app/admin" />
      </Helmet>
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
                        <button 
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = async (e: any) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              try {
                                const fileName = `thumb_${Date.now()}_${file.name}`;
                                const { data: uploadData, error: uploadError } = await supabase.storage
                                  .from('textures')
                                  .upload(fileName, file);
                                
                                if (uploadError) throw uploadError;
                                
                                const { data: urlData } = supabase.storage
                                  .from('textures')
                                  .getPublicUrl(uploadData.path);
                                
                                const { error: updateError } = await supabase
                                  .from('modelos')
                                  .update({ thumbnail_url: urlData.publicUrl } as any)
                                  .eq('id', model.id);
                                
                                if (updateError) throw updateError;
                                
                                queryClient.invalidateQueries({ queryKey: ['models'] });
                                alert('Thumbnail atualizada!');
                              } catch (err: any) {
                                alert('Erro ao atualizar thumbnail: ' + err.message);
                              }
                            };
                            input.click();
                          }}
                          className="bg-white p-2 rounded-lg text-gray-700 hover:bg-gray-100" 
                          title="Atualizar Thumbnail"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(model.id, 'models', model.glb_url)}
                          className="bg-red-500 p-2 rounded-lg text-white hover:bg-red-600"
                          title="Excluir Modelo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                    <div key={pattern.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden aspect-square flex items-center justify-center relative group">
                      {pattern.image_url && (
                        <img src={pattern.image_url} alt={pattern.name} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => handleDelete(pattern.id, 'textures', pattern.image_url)}
                          className="bg-red-500 p-1.5 rounded-lg text-white hover:bg-red-600"
                          title="Excluir Estampa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                 ))
               )}
            </div>
          )}
        </div>
      </main>
    </div>
    </>
  );
}
