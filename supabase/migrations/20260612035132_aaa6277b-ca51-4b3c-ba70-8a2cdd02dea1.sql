-- Enable RLS just in case it wasn't already (though it usually is)
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might conflict if they were named differently or we want to ensure clean state
DROP POLICY IF EXISTS "Authenticated users can manage patterns" ON public.patterns;
DROP POLICY IF EXISTS "Allow select for all authenticated users" ON public.patterns;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.patterns;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.patterns;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON public.patterns;

-- Create the new policies requested
CREATE POLICY "Allow SELECT for all authenticated users" ON public.patterns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow INSERT for authenticated users" ON public.patterns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow UPDATE for authenticated users" ON public.patterns FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow DELETE for authenticated users" ON public.patterns FOR DELETE TO authenticated USING (true);

-- Ensure service_role also has full access
CREATE POLICY "Service role full access" ON public.patterns FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Ensure anon can still see patterns if the app requires public view (keeping current behavior)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patterns' AND policyname = 'Allow public select') THEN
        CREATE POLICY "Allow public select" ON public.patterns FOR SELECT TO anon USING (true);
    END IF;
END $$;