GRANT SELECT, UPDATE, DELETE ON public.customizations TO authenticated;
GRANT ALL ON public.customizations TO service_role;

CREATE POLICY "customizations_admin_select" ON public.customizations
FOR SELECT TO authenticated
USING (private.is_admin());

CREATE POLICY "customizations_admin_update" ON public.customizations
FOR UPDATE TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

CREATE POLICY "customizations_admin_delete" ON public.customizations
FOR DELETE TO authenticated
USING (private.is_admin());