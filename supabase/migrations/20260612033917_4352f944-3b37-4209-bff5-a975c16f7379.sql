ALTER TABLE public.patterns ADD COLUMN IF NOT EXISTS color_mapping JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.patterns ADD COLUMN IF NOT EXISTS base_color_hex TEXT;

-- Update the types if necessary (the system will regenerate them automatically)
GRANT ALL ON public.patterns TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patterns TO authenticated;
GRANT SELECT ON public.patterns TO anon;