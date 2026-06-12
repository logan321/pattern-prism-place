-- ============================================================
-- 1. PATTERNS: anon read-only, authenticated full access
-- ============================================================
DROP POLICY IF EXISTS "patterns_full_access_public" ON public.patterns;
DROP POLICY IF EXISTS "patterns_full_access_authenticated" ON public.patterns;
DROP POLICY IF EXISTS "patterns_full_access_service_role" ON public.patterns;
DROP POLICY IF EXISTS "patterns_read_anon" ON public.patterns;
DROP POLICY IF EXISTS "patterns_select_policy" ON public.patterns;
DROP POLICY IF EXISTS "patterns_insert_policy" ON public.patterns;
DROP POLICY IF EXISTS "patterns_update_policy" ON public.patterns;
DROP POLICY IF EXISTS "patterns_delete_policy" ON public.patterns;

CREATE POLICY "patterns_public_read" ON public.patterns FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "patterns_auth_insert" ON public.patterns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "patterns_auth_update" ON public.patterns FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "patterns_auth_delete" ON public.patterns FOR DELETE TO authenticated USING (true);
CREATE POLICY "patterns_service_all" ON public.patterns FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE INSERT, UPDATE, DELETE ON public.patterns FROM anon;
GRANT SELECT ON public.patterns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patterns TO authenticated;
GRANT ALL ON public.patterns TO service_role;

-- ============================================================
-- 2. MODELOS: anon read-only, authenticated full access
-- ============================================================
DROP POLICY IF EXISTS "modelos_full_access_public" ON public.modelos;

CREATE POLICY "modelos_public_read" ON public.modelos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "modelos_auth_insert" ON public.modelos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "modelos_auth_update" ON public.modelos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "modelos_auth_delete" ON public.modelos FOR DELETE TO authenticated USING (true);
CREATE POLICY "modelos_service_all" ON public.modelos FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE INSERT, UPDATE, DELETE ON public.modelos FROM anon;
GRANT SELECT ON public.modelos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modelos TO authenticated;
GRANT ALL ON public.modelos TO service_role;

-- ============================================================
-- 3. UV_MATRICES: anon read-only, authenticated full access
-- ============================================================
DROP POLICY IF EXISTS "uv_matrices_full_access_public" ON public.uv_matrices;

CREATE POLICY "uv_matrices_public_read" ON public.uv_matrices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "uv_matrices_auth_insert" ON public.uv_matrices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "uv_matrices_auth_update" ON public.uv_matrices FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "uv_matrices_auth_delete" ON public.uv_matrices FOR DELETE TO authenticated USING (true);
CREATE POLICY "uv_matrices_service_all" ON public.uv_matrices FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE INSERT, UPDATE, DELETE ON public.uv_matrices FROM anon;
GRANT SELECT ON public.uv_matrices TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.uv_matrices TO authenticated;
GRANT ALL ON public.uv_matrices TO service_role;

-- ============================================================
-- 4. STORAGE: anon read-only, authenticated can upload/edit/delete
-- ============================================================
DROP POLICY IF EXISTS "Public Access to textures" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to models" ON storage.objects;

CREATE POLICY "textures_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'textures');
CREATE POLICY "textures_auth_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'textures');
CREATE POLICY "textures_auth_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'textures') WITH CHECK (bucket_id = 'textures');
CREATE POLICY "textures_auth_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'textures');

CREATE POLICY "models_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'models');
CREATE POLICY "models_auth_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'models');
CREATE POLICY "models_auth_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'models') WITH CHECK (bucket_id = 'models');
CREATE POLICY "models_auth_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'models');

-- ============================================================
-- 5. Simplify has_role function (per scanner recommendation)
-- ============================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;