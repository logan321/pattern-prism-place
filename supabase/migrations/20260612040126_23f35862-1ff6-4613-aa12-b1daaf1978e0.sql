-- 1. Permissive policies for patterns
DROP POLICY IF EXISTS "patterns_full_access_public" ON public.patterns;
CREATE POLICY "patterns_full_access_public" ON public.patterns 
FOR ALL TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

-- 2. Permissive policies for modelos
DROP POLICY IF EXISTS "modelos_select" ON public.modelos;
DROP POLICY IF EXISTS "modelos_admin_manage" ON public.modelos;
DROP POLICY IF EXISTS "modelos_full_access_public" ON public.modelos;
CREATE POLICY "modelos_full_access_public" ON public.modelos 
FOR ALL TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

-- 3. Permissive policies for uv_matrices
DROP POLICY IF EXISTS "uv_matrices_select" ON public.uv_matrices;
DROP POLICY IF EXISTS "uv_matrices_admin_manage" ON public.uv_matrices;
DROP POLICY IF EXISTS "uv_matrices_full_access_public" ON public.uv_matrices;
CREATE POLICY "uv_matrices_full_access_public" ON public.uv_matrices 
FOR ALL TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

-- 4. Storage policies for objects (permissive for dev)
DROP POLICY IF EXISTS "Public Access to textures" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to models" ON storage.objects;
CREATE POLICY "Public Access to textures" ON storage.objects FOR ALL TO anon, authenticated, service_role USING (bucket_id = 'textures') WITH CHECK (bucket_id = 'textures');
CREATE POLICY "Public Access to models" ON storage.objects FOR ALL TO anon, authenticated, service_role USING (bucket_id = 'models') WITH CHECK (bucket_id = 'models');

-- 5. Grants
GRANT ALL ON public.patterns TO anon, authenticated, service_role;
GRANT ALL ON public.modelos TO anon, authenticated, service_role;
GRANT ALL ON public.uv_matrices TO anon, authenticated, service_role;
GRANT ALL ON storage.objects TO anon, authenticated, service_role;