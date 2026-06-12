GRANT INSERT ON public.customizations TO authenticated;
GRANT ALL ON public.customizations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.uploads TO authenticated;
GRANT ALL ON public.uploads TO service_role;

DROP POLICY IF EXISTS "customizations_admin_insert" ON public.customizations;
CREATE POLICY "customizations_admin_insert" ON public.customizations
FOR INSERT TO authenticated
WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "quotes_admin_insert" ON public.quotes;
CREATE POLICY "quotes_admin_insert" ON public.quotes
FOR INSERT TO authenticated
WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "uploads_admin_insert" ON public.uploads;
CREATE POLICY "uploads_admin_insert" ON public.uploads
FOR INSERT TO authenticated
WITH CHECK (private.is_admin());