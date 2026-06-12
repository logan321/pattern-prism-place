-- 1. Ensure RLS is enabled
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;

-- 2. Drop policies manually by name (the dynamic loop had a syntax error)
DROP POLICY IF EXISTS "patterns_select" ON public.patterns;
DROP POLICY IF EXISTS "patterns_admin_manage" ON public.patterns;
DROP POLICY IF EXISTS "Allow SELECT for all authenticated users" ON public.patterns;
DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON public.patterns;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON public.patterns;
DROP POLICY IF EXISTS "Allow DELETE for authenticated users" ON public.patterns;
DROP POLICY IF EXISTS "Service role full access" ON public.patterns;
DROP POLICY IF EXISTS "patterns_public_select" ON public.patterns;
DROP POLICY IF EXISTS "patterns_auth_all" ON public.patterns;
DROP POLICY IF EXISTS "patterns_service_all" ON public.patterns;
DROP POLICY IF EXISTS "Allow public select" ON public.patterns;

-- 3. Create fresh, clear policies
CREATE POLICY "patterns_select_policy" ON public.patterns FOR SELECT USING (true);
CREATE POLICY "patterns_insert_policy" ON public.patterns FOR INSERT TO authenticated, service_role WITH CHECK (true);
CREATE POLICY "patterns_update_policy" ON public.patterns FOR UPDATE TO authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "patterns_delete_policy" ON public.patterns FOR DELETE TO authenticated, service_role USING (true);

-- 4. Grant explicit table permissions
GRANT ALL ON public.patterns TO authenticated;
GRANT ALL ON public.patterns TO service_role;
GRANT SELECT ON public.patterns TO anon;