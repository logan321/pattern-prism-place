-- Fix modelos policies
DROP POLICY IF EXISTS "modelos_insert" ON public.modelos;
DROP POLICY IF EXISTS "modelos_select" ON public.modelos;
DROP POLICY IF EXISTS "modelos_update" ON public.modelos;
DROP POLICY IF EXISTS "modelos_delete" ON public.modelos;

GRANT SELECT ON public.modelos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.modelos TO authenticated;
GRANT ALL ON public.modelos TO service_role;

CREATE POLICY "modelos_select" ON public.modelos FOR SELECT USING (true);
CREATE POLICY "modelos_insert" ON public.modelos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "modelos_update" ON public.modelos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "modelos_delete" ON public.modelos FOR DELETE TO authenticated USING (true);

-- Fix patterns policies
DROP POLICY IF EXISTS "patterns_insert" ON public.patterns;
DROP POLICY IF EXISTS "patterns_select" ON public.patterns;
DROP POLICY IF EXISTS "patterns_update" ON public.patterns;
DROP POLICY IF EXISTS "patterns_delete" ON public.patterns;

GRANT SELECT ON public.patterns TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.patterns TO authenticated;
GRANT ALL ON public.patterns TO service_role;

CREATE POLICY "patterns_select" ON public.patterns FOR SELECT USING (true);
CREATE POLICY "patterns_insert" ON public.patterns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "patterns_update" ON public.patterns FOR UPDATE TO authenticated USING (true);
CREATE POLICY "patterns_delete" ON public.patterns FOR DELETE TO authenticated USING (true);

-- Fix uv_matrices policies
DROP POLICY IF EXISTS "Allow all access to authenticated users for uv_matrices" ON public.uv_matrices;
DROP POLICY IF EXISTS "Templates are viewable by everyone" ON public.uv_matrices;

GRANT SELECT ON public.uv_matrices TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.uv_matrices TO authenticated;
GRANT ALL ON public.uv_matrices TO service_role;

CREATE POLICY "uv_matrices_select" ON public.uv_matrices FOR SELECT USING (true);
CREATE POLICY "uv_matrices_insert" ON public.uv_matrices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "uv_matrices_update" ON public.uv_matrices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "uv_matrices_delete" ON public.uv_matrices FOR DELETE TO authenticated USING (true);

-- Fix companies policies
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON public.companies;

GRANT SELECT ON public.companies TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies_select" ON public.companies FOR SELECT USING (true);
CREATE POLICY "companies_insert" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "companies_update" ON public.companies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "companies_delete" ON public.companies FOR DELETE TO authenticated USING (true);

-- Fix uploads policies
DROP POLICY IF EXISTS "Anyone can upload" ON public.uploads;
DROP POLICY IF EXISTS "Anyone can view uploads" ON public.uploads;

GRANT SELECT, INSERT ON public.uploads TO anon, authenticated;
GRANT UPDATE, DELETE ON public.uploads TO authenticated;
GRANT ALL ON public.uploads TO service_role;

ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "uploads_select" ON public.uploads FOR SELECT USING (true);
CREATE POLICY "uploads_insert" ON public.uploads FOR INSERT WITH CHECK (true);
CREATE POLICY "uploads_update" ON public.uploads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "uploads_delete" ON public.uploads FOR DELETE TO authenticated USING (true);
