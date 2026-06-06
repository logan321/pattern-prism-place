-- Garante que as tabelas existem (caso tenham sido removidas ou não criadas corretamente)
CREATE TABLE IF NOT EXISTS public.modelos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    glb_url TEXT NOT NULL,
    thumbnail_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilita RLS
ALTER TABLE public.modelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;

-- Políticas para modelos
DROP POLICY IF EXISTS "modelos_insert" ON public.modelos;
DROP POLICY IF EXISTS "modelos_select" ON public.modelos;
DROP POLICY IF EXISTS "modelos_update" ON public.modelos;
DROP POLICY IF EXISTS "modelos_delete" ON public.modelos;

CREATE POLICY "modelos_insert" ON public.modelos FOR INSERT WITH CHECK (true);
CREATE POLICY "modelos_select" ON public.modelos FOR SELECT USING (true);
CREATE POLICY "modelos_update" ON public.modelos FOR UPDATE USING (true);
CREATE POLICY "modelos_delete" ON public.modelos FOR DELETE USING (true);

-- Políticas para patterns
DROP POLICY IF EXISTS "patterns_insert" ON public.patterns;
DROP POLICY IF EXISTS "patterns_select" ON public.patterns;
DROP POLICY IF EXISTS "patterns_update" ON public.patterns;
DROP POLICY IF EXISTS "patterns_delete" ON public.patterns;

CREATE POLICY "patterns_insert" ON public.patterns FOR INSERT WITH CHECK (true);
CREATE POLICY "patterns_select" ON public.patterns FOR SELECT USING (true);
CREATE POLICY "patterns_update" ON public.patterns FOR UPDATE USING (true);
CREATE POLICY "patterns_delete" ON public.patterns FOR DELETE USING (true);

-- Permissões de role
GRANT ALL ON public.modelos TO anon, authenticated, service_role;
GRANT ALL ON public.patterns TO anon, authenticated, service_role;
