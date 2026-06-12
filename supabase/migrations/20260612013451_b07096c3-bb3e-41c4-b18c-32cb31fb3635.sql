-- 1) Revoke public execution of has_role
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2) Restrict modelos (Catalog)
DROP POLICY IF EXISTS "modelos_all_anon" ON public.modelos;
CREATE POLICY "modelos_admin_manage" ON public.modelos
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3) Restrict patterns (Catalog)
DROP POLICY IF EXISTS "patterns_all_anon" ON public.patterns;
CREATE POLICY "patterns_admin_manage" ON public.patterns
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4) Restrict template_zones (Catalog)
DROP POLICY IF EXISTS "template_zones_all_anon" ON public.template_zones;
CREATE POLICY "template_zones_admin_manage" ON public.template_zones
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5) Restrict uv_matrices (Catalog)
DROP POLICY IF EXISTS "uv_matrices_all_anon" ON public.uv_matrices;
CREATE POLICY "uv_matrices_admin_manage" ON public.uv_matrices
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6) Clean up any remaining overly permissive write policies on sensitive tables
-- uploads: already restricted UPDATE/DELETE to admin in previous migration, but INSERT is public (intentional for anonymous simulator)
-- orcamentos: INSERT is public (intentional for lead generation)
-- quotes: INSERT is public (intentional for lead generation)
