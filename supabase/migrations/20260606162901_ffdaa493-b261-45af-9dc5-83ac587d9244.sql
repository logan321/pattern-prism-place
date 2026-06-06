-- Grant explicit permissions on public tables to the appropriate roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modelos TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patterns TO anon, authenticated, service_role;

-- Ensure RLS is active but with open policies for this dev stage
ALTER TABLE public.modelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public INSERT modelos" ON public.modelos;
CREATE POLICY "Public INSERT modelos" ON public.modelos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public SELECT modelos" ON public.modelos;
CREATE POLICY "Public SELECT modelos" ON public.modelos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public INSERT patterns" ON public.patterns;
CREATE POLICY "Public INSERT patterns" ON public.patterns FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public SELECT patterns" ON public.patterns;
CREATE POLICY "Public SELECT patterns" ON public.patterns FOR SELECT USING (true);
