-- Ensure RLS is permissive
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patterns_full_access_public" ON public.patterns;
CREATE POLICY "patterns_full_access_public" ON public.patterns 
FOR ALL TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

-- Ensure storage is also permissive for the textures bucket
DROP POLICY IF EXISTS "Public Access to textures" ON storage.objects;
CREATE POLICY "Public Access to textures" ON storage.objects 
FOR ALL TO anon, authenticated, service_role 
USING (bucket_id = 'textures') 
WITH CHECK (bucket_id = 'textures');

-- Re-grant just in case
GRANT ALL ON public.patterns TO anon, authenticated, service_role;
GRANT ALL ON storage.objects TO anon, authenticated, service_role;