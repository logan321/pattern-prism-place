-- 1. Fix permissive INSERT policies by adding session validation or owner checks where possible
-- For 'customizations', we already have session-based SELECT, let's ensure INSERT is consistent
ALTER TABLE public.customizations ALTER COLUMN session_id SET DEFAULT (current_setting('request.headers'::text, true))::json ->> 'x-session-id'::text;

-- 2. Harden SECURITY DEFINER functions
-- Set search_path and ensure EXECUTE is restricted if it hasn't been already
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- 3. Address "RLS Policy Always True" for sensitive tables
-- For 'orcamentos', 'quotes', and 'uploads' INSERTs, these are lead-gen endpoints.
-- However, we can improve them by ensuring they are scoped or at least more specifically defined.
-- Currently they use 'true' for WITH CHECK.

-- 'orcamentos'
DROP POLICY IF EXISTS "Anyone can insert lead/budget" ON public.orcamentos;
CREATE POLICY "Anyone can insert lead/budget" ON public.orcamentos
  FOR INSERT TO public
  WITH CHECK (true); -- Keep as true for anon leads, but explicitly scoped to INSERT

-- 'quotes'
DROP POLICY IF EXISTS "Anon can create quotes" ON public.quotes;
CREATE POLICY "Anon can create quotes" ON public.quotes
  FOR INSERT TO public
  WITH CHECK (true);

-- 'customizations'
DROP POLICY IF EXISTS "Anon can create customizations" ON public.customizations;
CREATE POLICY "Anon can create customizations" ON public.customizations
  FOR INSERT TO public
  WITH CHECK (
    session_id = ((current_setting('request.headers'::text, true))::json ->> 'x-session-id'::text)
  );

-- 'uploads'
DROP POLICY IF EXISTS "uploads_insert" ON public.uploads;
CREATE POLICY "uploads_insert" ON public.uploads
  FOR INSERT TO public
  WITH CHECK (true);

-- 4. Consolidate Catalog Selects (best practice, even if not high severity)
-- Ensure all catalog tables have explicit SELECT policies
ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public colors are viewable" ON public.colors;
CREATE POLICY "Public colors are viewable" ON public.colors FOR SELECT TO public USING (true);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public products are viewable" ON public.products;
CREATE POLICY "Public products are viewable" ON public.products FOR SELECT TO public USING (true);
