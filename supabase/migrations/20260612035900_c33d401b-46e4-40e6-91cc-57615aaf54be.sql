-- 1. Ensure RLS is enabled on patterns table
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;

-- 2. Drop any potentially conflicting or restrictive policies
DROP POLICY IF EXISTS "patterns_select_policy" ON public.patterns;
DROP POLICY IF EXISTS "patterns_insert_policy" ON public.patterns;
DROP POLICY IF EXISTS "patterns_update_policy" ON public.patterns;
DROP POLICY IF EXISTS "patterns_delete_policy" ON public.patterns;
DROP POLICY IF EXISTS "patterns_auth_all" ON public.patterns;
DROP POLICY IF EXISTS "patterns_service_all" ON public.patterns;
DROP POLICY IF EXISTS "patterns_public_select" ON public.patterns;

-- 3. Create simple, permissive policies for authenticated users and service_role
-- Use a single policy for ALL operations for simplicity and to avoid hidden conflicts
CREATE POLICY "patterns_full_access_authenticated" ON public.patterns 
FOR ALL TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "patterns_full_access_service_role" ON public.patterns 
FOR ALL TO service_role 
USING (true) 
WITH CHECK (true);

-- 4. Allow anonymous users to view patterns (standard for storefronts/simulators)
CREATE POLICY "patterns_read_anon" ON public.patterns 
FOR SELECT TO anon 
USING (true);

-- 5. Grant database-level permissions explicitly
GRANT ALL ON public.patterns TO authenticated;
GRANT ALL ON public.patterns TO service_role;
GRANT SELECT ON public.patterns TO anon;