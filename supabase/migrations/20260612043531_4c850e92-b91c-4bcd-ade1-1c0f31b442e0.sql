-- ============================================================
-- 1. CLEAN UP STORAGE POLICIES
-- ============================================================
-- Remove broad authenticated policies that allow any user to edit catalog assets
DROP POLICY IF EXISTS "models_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "models_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "models_auth_delete" ON storage.objects;
DROP POLICY IF EXISTS "textures_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "textures_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "textures_auth_delete" ON storage.objects;

-- Ensure only admins can manage these buckets
DROP POLICY IF EXISTS "Admin manage models and textures" ON storage.objects;
CREATE POLICY "admin_manage_catalog_assets" ON storage.objects 
FOR ALL TO authenticated 
USING (bucket_id IN ('models', 'textures') AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id IN ('models', 'textures') AND has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 2. SECURE CATALOG TABLES (ADMIN ONLY FOR WRITES)
-- ============================================================

-- Function to apply admin-only write policies to a list of tables
DO $$ 
DECLARE
    t text;
    tables_to_fix text[] := ARRAY['patterns', 'modelos', 'uv_matrices', 'categorias', 'fontes', 'tipos_gola', 'tipos_manga', 'tipos_punho', 'lojistas', 'colors', 'products'];
BEGIN
    FOREACH t IN ARRAY tables_to_fix LOOP
        -- Remove existing write policies
        EXECUTE format('DROP POLICY IF EXISTS %I_auth_insert ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS %I_auth_update ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS %I_auth_delete ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS %I_insert_policy ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS %I_update_policy ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS %I_delete_policy ON public.%I', t, t);
        
        -- Create admin-only policies
        EXECUTE format('CREATE POLICY %I_admin_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), ''admin''::app_role))', t, t);
        EXECUTE format('CREATE POLICY %I_admin_update ON public.%I FOR UPDATE TO authenticated USING (has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (has_role(auth.uid(), ''admin''::app_role))', t, t);
        EXECUTE format('CREATE POLICY %I_admin_delete ON public.%I FOR DELETE TO authenticated USING (has_role(auth.uid(), ''admin''::app_role))', t, t);
    END LOOP;
END $$;

-- ============================================================
-- 3. SECURE USER-SPECIFIC TABLES (AUTHENTICATED ONLY)
-- ============================================================

-- PROFILES
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "profiles_owner_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_owner_select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- USUARIOS
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.usuarios;
CREATE POLICY "usuarios_owner_all" ON public.usuarios FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- UPLOADS_IMAGEM
DROP POLICY IF EXISTS "Users can manage their own uploads" ON public.uploads_imagem;
CREATE POLICY "uploads_imagem_owner_all" ON public.uploads_imagem FOR ALL TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- ============================================================
-- 4. SECURE ROLE MANAGEMENT
-- ============================================================
DROP POLICY IF EXISTS "admin_manage_roles" ON public.user_roles;
CREATE POLICY "admin_manage_roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 5. SECURE LEAD SUBMISSION (PREVENT SPOOFING)
-- ============================================================

-- ORCAMENTOS
DROP POLICY IF EXISTS "Anyone can insert lead/budget" ON public.orcamentos;
DROP POLICY IF EXISTS "authenticated_insert_budget" ON public.orcamentos;
DROP POLICY IF EXISTS "anon_insert_budget" ON public.orcamentos;

CREATE POLICY "orcamentos_auth_insert" ON public.orcamentos FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid());
CREATE POLICY "orcamentos_anon_insert" ON public.orcamentos FOR INSERT TO anon WITH CHECK (usuario_id IS NULL);

-- QUOTES
DROP POLICY IF EXISTS "Anon can create quotes" ON public.quotes;
DROP POLICY IF EXISTS "anyone_can_create_quotes" ON public.quotes;
CREATE POLICY "quotes_insert" ON public.quotes FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Note: Quotes are secured for SELECT via existing admin policy.

-- ============================================================
-- 6. ENSURE RLS IS ENABLED EVERYWHERE
-- ============================================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads_imagem ENABLE ROW LEVEL SECURITY;
