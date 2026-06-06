-- 1. PROFILES: restringir SELECT ao próprio dono
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. QUOTES: restringir SELECT ao service_role apenas (PII de clientes)
DROP POLICY IF EXISTS "Public can view quotes" ON public.quotes;
-- (nenhuma política SELECT existia; reforçamos negando leitura via Data API ao revogar SELECT de anon/authenticated)
REVOKE SELECT ON public.quotes FROM anon, authenticated;

-- 3. CUSTOMIZATIONS: restringir SELECT por session_id (header customizado) ou ao service_role
DROP POLICY IF EXISTS "Anon can view their own customizations" ON public.customizations;
CREATE POLICY "View own customizations by session"
  ON public.customizations FOR SELECT
  TO anon, authenticated
  USING (session_id IS NOT NULL AND session_id = current_setting('request.headers', true)::json->>'x-session-id');

-- 4. SIMULACOES: adicionar WITH CHECK explícito
DROP POLICY IF EXISTS "Users can manage their own simulations" ON public.simulacoes;
CREATE POLICY "Users can manage their own simulations"
  ON public.simulacoes FOR ALL
  TO authenticated
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- 5. MODELOS: remover política SELECT duplicada
DROP POLICY IF EXISTS "Public read for modelos" ON public.modelos;

-- 6. PATTERNS: remover políticas duplicadas
DROP POLICY IF EXISTS "Public SELECT patterns" ON public.patterns;
DROP POLICY IF EXISTS "Public patterns are viewable" ON public.patterns;
DROP POLICY IF EXISTS "Public INSERT patterns" ON public.patterns;

-- 7. STORAGE: políticas adequadas para os buckets models/textures
DROP POLICY IF EXISTS "public_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "public_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "public_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "public_storage_delete" ON storage.objects;

-- Leitura pública (para servir URLs públicas de GLB e texturas no visualizador 3D)
CREATE POLICY "Public read models and textures" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('models', 'textures'));

-- Escrita: mantida aberta no contexto atual (admin sem login). Será restringida quando auth for adicionada.
CREATE POLICY "Open write models and textures" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id IN ('models', 'textures'));

CREATE POLICY "Open update models and textures" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id IN ('models', 'textures'));

CREATE POLICY "Open delete models and textures" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id IN ('models', 'textures'));
