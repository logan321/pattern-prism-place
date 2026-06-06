CREATE TABLE public.uv_matrices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    modelo_id UUID REFERENCES public.modelos(id) ON DELETE CASCADE,
    zones JSONB DEFAULT '{}'::jsonb,
    svg_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.uv_matrices TO authenticated;
GRANT ALL ON public.uv_matrices TO service_role;

ALTER TABLE public.uv_matrices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to authenticated users for uv_matrices" 
ON public.uv_matrices FOR ALL 
USING (true) 
WITH CHECK (true);

ALTER TABLE public.patterns ADD COLUMN uv_matriz_id UUID REFERENCES public.uv_matrices(id) ON DELETE SET NULL;
