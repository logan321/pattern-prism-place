ALTER TABLE public.uv_matrices ADD COLUMN IF NOT EXISTS reference_url TEXT;

-- Update existing grants to ensure the new column is accessible
GRANT SELECT, INSERT, UPDATE, DELETE ON public.uv_matrices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.uv_matrices TO anon;
GRANT ALL ON public.uv_matrices TO service_role;