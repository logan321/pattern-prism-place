-- Garante que thumbnail_url é nullable
ALTER TABLE public.modelos 
  ALTER COLUMN thumbnail_url DROP NOT NULL;

-- Garante que created_at tem default
ALTER TABLE public.modelos 
  ALTER COLUMN created_at SET DEFAULT now();

-- Garante que id tem default uuid
ALTER TABLE public.modelos 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Reaplica políticas limpas
DROP POLICY IF EXISTS "modelos_insert" ON public.modelos;
DROP POLICY IF EXISTS "modelos_select" ON public.modelos;
DROP POLICY IF EXISTS "modelos_update" ON public.modelos;
DROP POLICY IF EXISTS "modelos_delete" ON public.modelos;

-- Reinicia RLS para garantir estado limpo
ALTER TABLE public.modelos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modelos_insert" ON public.modelos FOR INSERT WITH CHECK (true);
CREATE POLICY "modelos_select" ON public.modelos FOR SELECT USING (true);
CREATE POLICY "modelos_update" ON public.modelos FOR UPDATE USING (true);
CREATE POLICY "modelos_delete" ON public.modelos FOR DELETE USING (true);

-- Garante permissões de role
GRANT ALL ON public.modelos TO anon;
GRANT ALL ON public.modelos TO authenticated;
GRANT ALL ON public.modelos TO service_role;