import { supabase } from '../integrations/supabase/client';

export async function fixStorageBuckets() {
  // Atualiza bucket models para público
  const { error: e1 } = await supabase.storage.updateBucket('models', {
    public: true,
    fileSizeLimit: 52428800,
    allowedMimeTypes: ['model/gltf-binary', 'application/octet-stream']
  });
  console.log('models bucket fix:', e1 ? e1.message : 'OK');

  // Atualiza bucket textures para público  
  const { error: e2 } = await supabase.storage.updateBucket('textures', {
    public: true,
    fileSizeLimit: 10485760,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  });
  console.log('textures bucket fix:', e2 ? e2.message : 'OK');
}
