CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private
AS $$
  SELECT CASE
    WHEN _user_id = auth.uid() OR private.is_admin() THEN
      EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
      )
    ELSE FALSE
  END;
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

ALTER POLICY "admin_manage_catalog_assets" ON storage.objects
USING (bucket_id IN ('models', 'textures') AND private.is_admin())
WITH CHECK (bucket_id IN ('models', 'textures') AND private.is_admin());

DO $$
DECLARE
  t text;
  catalog_tables text[] := ARRAY['patterns', 'modelos', 'uv_matrices', 'categorias', 'fontes', 'tipos_gola', 'tipos_manga', 'tipos_punho', 'colors', 'products'];
BEGIN
  FOREACH t IN ARRAY catalog_tables LOOP
    EXECUTE format('ALTER POLICY %I_admin_insert ON public.%I WITH CHECK (private.is_admin())', t, t);
    EXECUTE format('ALTER POLICY %I_admin_update ON public.%I USING (private.is_admin()) WITH CHECK (private.is_admin())', t, t);
    EXECUTE format('ALTER POLICY %I_admin_delete ON public.%I USING (private.is_admin())', t, t);
  END LOOP;
END $$;

ALTER POLICY "companies_insert_admin" ON public.companies WITH CHECK (private.is_admin());
ALTER POLICY "companies_update_admin" ON public.companies USING (private.is_admin()) WITH CHECK (private.is_admin());
ALTER POLICY "companies_delete_admin" ON public.companies USING (private.is_admin());
DROP POLICY IF EXISTS "companies_select" ON public.companies;
CREATE POLICY "companies_select_admin" ON public.companies FOR SELECT TO authenticated USING (private.is_admin());
REVOKE ALL ON public.companies FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;

ALTER POLICY "lojistas_admin_insert" ON public.lojistas WITH CHECK (private.is_admin());
ALTER POLICY "lojistas_admin_update" ON public.lojistas USING (private.is_admin()) WITH CHECK (private.is_admin());
ALTER POLICY "lojistas_admin_delete" ON public.lojistas USING (private.is_admin());
DROP POLICY IF EXISTS "Public read for lojistas" ON public.lojistas;
CREATE POLICY "lojistas_select_admin" ON public.lojistas FOR SELECT TO authenticated USING (private.is_admin());
REVOKE ALL ON public.lojistas FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lojistas TO authenticated;
GRANT ALL ON public.lojistas TO service_role;

ALTER POLICY "Admins can view all orcamentos" ON public.orcamentos USING (private.is_admin());
ALTER POLICY "quotes_admin_select" ON public.quotes USING (private.is_admin());
ALTER POLICY "quotes_admin_update" ON public.quotes USING (private.is_admin()) WITH CHECK (private.is_admin());
ALTER POLICY "quotes_admin_delete" ON public.quotes USING (private.is_admin());
ALTER POLICY "uploads_select_admin" ON public.uploads USING (private.is_admin());
ALTER POLICY "uploads_update_admin" ON public.uploads USING (private.is_admin()) WITH CHECK (private.is_admin());
ALTER POLICY "uploads_delete_admin" ON public.uploads USING (private.is_admin());
ALTER POLICY "shirt_models_admin_manage" ON public.shirt_models USING (private.is_admin()) WITH CHECK (private.is_admin());
ALTER POLICY "template_zones_admin_manage" ON public.template_zones USING (private.is_admin()) WITH CHECK (private.is_admin());
DROP POLICY IF EXISTS "admin_manage_roles" ON public.user_roles;
CREATE POLICY "admin_manage_roles" ON public.user_roles FOR ALL TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "Update own customizations by session" ON public.customizations;
CREATE POLICY "Update own customizations by session" ON public.customizations
FOR UPDATE TO anon, authenticated
USING (session_id = ((current_setting('request.headers', true))::json ->> 'x-session-id'))
WITH CHECK (session_id = ((current_setting('request.headers', true))::json ->> 'x-session-id'));

DROP POLICY IF EXISTS "Delete own customizations by session" ON public.customizations;
CREATE POLICY "Delete own customizations by session" ON public.customizations
FOR DELETE TO anon, authenticated
USING (session_id = ((current_setting('request.headers', true))::json ->> 'x-session-id'));

DROP POLICY IF EXISTS "uploads_insert_session" ON public.uploads;
DROP POLICY IF EXISTS "uploads_insert" ON public.uploads;
CREATE POLICY "uploads_insert_session" ON public.uploads
FOR INSERT TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.customizations c
    WHERE c.id = uploads.customization_id
      AND c.session_id = ((current_setting('request.headers', true))::json ->> 'x-session-id')
  )
);