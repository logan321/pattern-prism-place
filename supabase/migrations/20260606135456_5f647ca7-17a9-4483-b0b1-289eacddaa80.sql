-- Fix search_path for functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Add explicit SELECT policies for catalog tables
CREATE POLICY "Public read for categorias" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Public read for modelos" ON public.modelos FOR SELECT USING (true);
CREATE POLICY "Public read for fontes" ON public.fontes FOR SELECT USING (true);
CREATE POLICY "Public read for tipos_gola" ON public.tipos_gola FOR SELECT USING (true);
CREATE POLICY "Public read for tipos_manga" ON public.tipos_manga FOR SELECT USING (true);
CREATE POLICY "Public read for tipos_punho" ON public.tipos_punho FOR SELECT USING (true);
CREATE POLICY "Public read for lojistas" ON public.lojistas FOR SELECT USING (true);

-- Refine orcamentos policy (keeping it open for public leads but naming it better)
-- The linter warns about WITH CHECK (true) for INSERT. 
-- In this case, we WANT anyone to be able to send an budget request (Lead).
-- We'll keep it as is since it's a lead capture form.
