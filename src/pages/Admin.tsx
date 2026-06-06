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
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [patternData, setPatternData] = useState({ name: '', png: null as File | null, svg: null as File | null });
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (activeView === 'patterns') {
      // For patterns, we'll use the modal now, but let's keep this as a simple fallback if needed
      // or just redirect to modal logic.
      setPatternData(prev => ({ ...prev, png: file, name: file.name.split('.')[0] }));
      setShowPatternModal(true);
      return;
    }

    setIsUploading(true);
    try {
      const bucket = 'models';
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      const uploadOptions = {
        cacheControl: '3600',
        upsert: false,
        contentType: fileExt === 'glb' ? 'model/gltf-binary' : 'model/gltf+json'
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

      // Teste se a URL é acessível
      const testFetch = await fetch(publicUrl, { method: 'HEAD' });
      if (!testFetch.ok) {
        throw new Error(`URL gerada inválida (${testFetch.status}): ${publicUrl}`);
      }

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

      queryClient.invalidateQueries({ queryKey: [activeView] });
      alert('Upload concluído com sucesso!');
    } catch (error: any) {
      console.error('Erro geral no upload:', error);
      alert(`Erro: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePatternSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patternData.name || !patternData.png || !patternData.svg) {
      alert('Por favor, preencha o nome e selecione ambos os arquivos (PNG e SVG).');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload PNG
      const pngName = `thumb_${Date.now()}_${patternData.png.name}`;
      const { data: pngUpload, error: pngError } = await supabase.storage
        .from('textures')
        .upload(pngName, patternData.png);
      if (pngError) throw pngError;
      const pngUrl = supabase.storage.from('textures').getPublicUrl(pngUpload.path).data.publicUrl;

      // 2. Upload SVG
      const svgName = `texture_${Date.now()}_${patternData.svg.name}`;
      const { data: svgUpload, error: svgError } = await supabase.storage
        .from('textures')
        .upload(svgName, patternData.svg, { contentType: 'image/svg+xml' });
      if (svgError) throw svgError;
      const svgUrl = supabase.storage.from('textures').getPublicUrl(svgUpload.path).data.publicUrl;

      // 3. Save to DB
      const { error: dbError } = await supabase
        .from('patterns')
        .insert({
          name: patternData.name,
          image_url: pngUrl,
          svg_url: svgUrl
        } as any);
      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['patterns'] });
      alert('Estampa cadastrada com sucesso!');
      setShowPatternModal(false);
      setPatternData({ name: '', png: null, svg: null });
    } catch (error: any) {
      alert('Erro no upload: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, bucket: string, filePath: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      // 1. Deletar do Banco e obter URLs primeiro
      const table = bucket === 'models' ? 'modelos' : 'patterns';
      const { data: itemToDelete, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;

      // 2. Deletar do Storage
      const filesToRemove: string[] = [];
      if (bucket === 'models') {
        const glbName = itemToDelete.glb_url?.split('/').pop();
        if (glbName) filesToRemove.push(glbName);
        const thumbName = itemToDelete.thumbnail_url?.split('/').pop();
        if (thumbName) filesToRemove.push(thumbName);
      } else {
        const imgName = itemToDelete.image_url?.split('/').pop();
        if (imgName) filesToRemove.push(imgName);
        const svgName = itemToDelete.svg_url?.split('/').pop();
        if (svgName) filesToRemove.push(svgName);
      }

      if (filesToRemove.length > 0) {
        const { error: storageError } = await supabase.storage
          .from(bucket)
          .remove(filesToRemove);
        
        if (storageError) {
          console.warn('Erro ao deletar do storage:', storageError);
        }
      }

      // 3. Deletar do Banco
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
            <button 
              onClick={() => activeView === 'models' ? document.getElementById('file-upload-input')?.click() : setShowPatternModal(true)}
              className={cn(
                "bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-2 transition-all shadow-sm cursor-pointer",
                isUploading && "opacity-50 cursor-not-allowed"
              )}>
              <Plus className="w-4 h-4" />
              <span>{isUploading ? 'Enviando...' : activeView === 'models' ? 'Novo Modelo' : 'Nova Estampa'}</span>
              <input 
                id="file-upload-input"
                type="file" 
                className="hidden" 
                onChange={handleFileUpload} 
                disabled={isUploading}
                accept={activeView === 'models' ? '.glb,.gltf' : 'image/*'}
              />
            </button>

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

      {/* Pattern Upload Modal */}
      {showPatternModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Nova Estampa</h3>
              <button onClick={() => setShowPatternModal(false)} className="text-gray-400 hover:text-gray-600">
                <Trash2 className="w-5 h-5 rotate-45" /> {/* Use Trash2 as an X icon for now, rotated */}
              </button>
            </div>
            <form onSubmit={handlePatternSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Estampa</label>
                <input 
                  type="text" 
                  value={patternData.name} 
                  onChange={e => setPatternData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Ex: Camuflado Azul"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Figura (PNG)</label>
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    {patternData.png ? (
                      <span className="text-xs text-green-600 font-medium text-center px-2 truncate w-full">{patternData.png.name}</span>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                        <span className="text-[10px] text-gray-400">Selecionar PNG</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/png,image/jpeg,image/webp"
                      onChange={e => setPatternData(prev => ({ ...prev, png: e.target.files?.[0] || null }))}
                    />
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UV Map (SVG)</label>
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    {patternData.svg ? (
                      <span className="text-xs text-blue-600 font-medium text-center px-2 truncate w-full">{patternData.svg.name}</span>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-300 mb-2" />
                        <span className="text-[10px] text-gray-400">Selecionar SVG</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".svg"
                      onChange={e => setPatternData(prev => ({ ...prev, svg: e.target.files?.[0] || null }))}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {isUploading ? 'Enviando...' : 'Cadastrar Estampa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
