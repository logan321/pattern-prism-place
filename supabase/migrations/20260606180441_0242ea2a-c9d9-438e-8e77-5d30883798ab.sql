-- Habilita RLS na tabela (caso não esteja)
ALTER TABLE public.modelos ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas que possam conflitar
DROP POLICY IF EXISTS "Public INSERT modelos" ON public.modelos;
DROP POLICY IF EXISTS "Public SELECT modelos" ON public.modelos;
DROP POLICY IF EXISTS "modelos_insert" ON public.modelos;
DROP POLICY IF EXISTS "modelos_select" ON public.modelos;
DROP POLICY IF EXISTS "modelos_update" ON public.modelos;
DROP POLICY IF EXISTS "modelos_delete" ON public.modelos;

-- Recria as políticas permitindo acesso público completo
CREATE POLICY "modelos_insert" ON public.modelos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "modelos_select" ON public.modelos
  FOR SELECT USING (true);

CREATE POLICY "modelos_update" ON public.modelos
  FOR UPDATE USING (true);

CREATE POLICY "modelos_delete" ON public.modelos
  FOR DELETE USING (true);

-- Garante permissões de role
GRANT ALL ON public.modelos TO anon;
GRANT ALL ON public.modelos TO authenticated;
GRANT ALL ON public.modelos TO service_role;