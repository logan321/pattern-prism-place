
-- Abrir gestão de patterns (admin sem login)
DROP POLICY IF EXISTS patterns_admin_insert ON public.patterns;
DROP POLICY IF EXISTS patterns_admin_update ON public.patterns;
DROP POLICY IF EXISTS patterns_admin_delete ON public.patterns;

CREATE POLICY patterns_public_insert ON public.patterns
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY patterns_public_update ON public.patterns
  FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY patterns_public_delete ON public.patterns
  FOR DELETE TO anon, authenticated
  USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patterns TO anon, authenticated;
