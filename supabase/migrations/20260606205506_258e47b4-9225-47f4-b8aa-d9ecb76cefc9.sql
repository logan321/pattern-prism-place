ALTER TABLE public.modelos ADD COLUMN universal_uv_svg TEXT;
GRANT UPDATE ON public.modelos TO authenticated;
GRANT UPDATE ON public.modelos TO service_role;