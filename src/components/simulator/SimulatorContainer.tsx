import { Header } from '../layout/Header'
import { ThreeViewer } from './ThreeViewer'
import { CustomizerPanel } from './CustomizerPanel'

import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useSimulatorStore } from '../../store/useSimulatorStore'

export function SimulatorContainer() {
  const { setTemplates, selectTemplate } = useSimulatorStore()

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('shirt_models')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const formattedTemplates = data.map(m => ({
          id: m.id,
          name: m.name,
          image: '/uploads/colado-1780761035664.png',
          type: 'custom',
          glb_url: m.glb_url
        }));
        setTemplates(formattedTemplates);
        // Seleciona o primeiro por padrão
        selectTemplate(formattedTemplates[0]);
      }
    };

    fetchInitialData();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <Header />
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Visualizador 3D - Ocupa o centro/esquerda */}
        <div className="flex-1 relative bg-gray-200">
          <ThreeViewer />
        </div>
        
        {/* Painel de Customização - Lado direito */}
        <aside className="w-full md:w-[400px] border-l border-gray-200 bg-white overflow-y-auto">
          <CustomizerPanel />
        </aside>
      </main>
    </div>
  )
}
