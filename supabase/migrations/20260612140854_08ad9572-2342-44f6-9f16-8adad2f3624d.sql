ALTER TABLE public.customizations ALTER COLUMN session_id DROP DEFAULT;

DROP POLICY IF EXISTS "Anon can create customizations" ON public.customizations;
DROP POLICY IF EXISTS "View own customizations by session" ON public.customizations;
DROP POLICY IF EXISTS "Update own customizations by session" ON public.customizations;
DROP POLICY IF EXISTS "Delete own customizations by session" ON public.customizations;
REVOKE ALL ON public.customizations FROM anon, authenticated;
GRANT ALL ON public.customizations TO service_role;

DROP POLICY IF EXISTS "uploads_insert_session" ON public.uploads;
DROP POLICY IF EXISTS "uploads_select_session" ON public.uploads;
REVOKE ALL ON public.uploads FROM anon, authenticated;
GRANT ALL ON public.uploads TO service_role;

DROP POLICY IF EXISTS "quotes_insert_with_customization" ON public.quotes;
DROP POLICY IF EXISTS "quotes_insert" ON public.quotes;
DROP POLICY IF EXISTS "Anon can create quotes" ON public.quotes;
REVOKE ALL ON public.quotes FROM anon, authenticated;
GRANT ALL ON public.quotes TO service_role;