-- Permitir acesso total para anon em modelos
DROP POLICY IF EXISTS "modelos_insert" ON modelos;
DROP POLICY IF EXISTS "modelos_update" ON modelos;
DROP POLICY IF EXISTS "modelos_delete" ON modelos;
CREATE POLICY "modelos_all_anon" ON modelos FOR ALL TO public USING (true) WITH CHECK (true);

-- Permitir acesso total para anon em patterns
DROP POLICY IF EXISTS "patterns_insert" ON patterns;
DROP POLICY IF EXISTS "patterns_update" ON patterns;
DROP POLICY IF EXISTS "patterns_delete" ON patterns;
CREATE POLICY "patterns_all_anon" ON patterns FOR ALL TO public USING (true) WITH CHECK (true);

-- Permitir acesso total para anon em uv_matrices
DROP POLICY IF EXISTS "uv_matrices_insert" ON uv_matrices;
DROP POLICY IF EXISTS "uv_matrices_update" ON uv_matrices;
DROP POLICY IF EXISTS "uv_matrices_delete" ON uv_matrices;
CREATE POLICY "uv_matrices_all_anon" ON uv_matrices FOR ALL TO public USING (true) WITH CHECK (true);

-- Permitir acesso total para anon em template_zones (se existir)
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'template_zones') THEN
        DROP POLICY IF EXISTS "Authenticated users can manage templates" ON template_zones;
        CREATE POLICY "template_zones_all_anon" ON template_zones FOR ALL TO public USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Garantir privilégios
GRANT ALL ON modelos TO anon, authenticated;
GRANT ALL ON patterns TO anon, authenticated;
GRANT ALL ON uv_matrices TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
