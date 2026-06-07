import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Zone3D } from '@/context/AppContext';
import { useToast } from '@/components/ui/use-toast';

export const useTemplateZones = () => {
  const [zones, setZones] = useState<Zone3D[]>([]);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadTemplate = useCallback(async (id: string) => {
    setLoading(true);
    setTemplateId(id);
    try {
      const { data, error } = await supabase
        .from('template_zones')
        .select('*')
        .eq('template_id', id);

      if (error) throw error;

      if (data) {
        const mappedZones: Zone3D[] = data.map((z: any) => ({
          id: z.id,
          name: z.name,
          side: z.side as 'front' | 'back',
          xPercent: z.x_percent,
          yPercent: z.y_percent,
          widthPercent: z.width_percent,
          heightPercent: z.height_percent,
          rotation: z.rotation,
          position3d: z.position_3d as [number, number, number] | undefined,
          normal3d: z.normal_3d as [number, number, number] | undefined,
          size3d: z.size_3d,
          rotation3d: z.rotation_3d,
          pathData: z.path_data as { x: number; y: number }[] | undefined,
          shared: z.shared,
        }));
        setZones(mappedZones);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar template",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const saveTemplate = useCallback(async (id: string, newZones: Zone3D[]) => {
    setLoading(true);
    try {
      // First, delete existing zones for this template
      const { error: deleteError } = await supabase
        .from('template_zones')
        .delete()
        .eq('template_id', id);

      if (deleteError) throw deleteError;

      // Prepare data for insert
      const insertData = newZones.map(z => ({
        template_id: id,
        name: z.name,
        side: z.side,
        x_percent: z.xPercent,
        y_percent: z.yPercent,
        width_percent: z.widthPercent,
        height_percent: z.heightPercent,
        rotation: z.rotation,
        position_3d: z.position3d,
        normal_3d: z.normal3d,
        size_3d: z.size3d,
        rotation_3d: z.rotation3d,
        path_data: z.pathData,
        shared: z.shared,
      }));

      const { error: insertError } = await supabase
        .from('template_zones')
        .insert(insertData);

      if (insertError) throw insertError;

      toast({
        title: "Sucesso",
        description: "Template salvo com sucesso!",
      });
      setZones(newZones);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar template",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createDefaultZones = useCallback(() => {
    const defaultZones: Zone3D[] = [
      {
        id: crypto.randomUUID(),
        name: 'Peito Esquerdo',
        side: 'front',
        xPercent: 30,
        yPercent: 30,
        widthPercent: 10,
        heightPercent: 10,
        rotation: 0,
        shared: false,
      },
      {
        id: crypto.randomUUID(),
        name: 'Peito Direito',
        side: 'front',
        xPercent: 60,
        yPercent: 30,
        widthPercent: 10,
        heightPercent: 10,
        rotation: 0,
        shared: false,
      },
      {
        id: crypto.randomUUID(),
        name: 'Costas Centro',
        side: 'back',
        xPercent: 50,
        yPercent: 40,
        widthPercent: 20,
        heightPercent: 20,
        rotation: 0,
        shared: false,
      }
    ];
    setZones(defaultZones);
  }, []);

  const duplicateZone = useCallback((id: string) => {
    setZones(prev => {
      const zoneToDuplicate = prev.find(z => z.id === id);
      if (!zoneToDuplicate) return prev;

      const newZone: Zone3D = {
        ...zoneToDuplicate,
        id: crypto.randomUUID(),
        name: `${zoneToDuplicate.name} (Cópia)`,
      };

      return [...prev, newZone];
    });
  }, []);

  return {
    zones,
    setZones,
    templateId,
    loading,
    loadTemplate,
    saveTemplate,
    createDefaultZones,
    duplicateZone,
  };
};