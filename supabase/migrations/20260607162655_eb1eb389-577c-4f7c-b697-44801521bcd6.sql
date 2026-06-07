CREATE TABLE IF NOT EXISTS public.template_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id TEXT NOT NULL,
    name TEXT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('front', 'back')),
    x_percent FLOAT8 NOT NULL DEFAULT 0,
    y_percent FLOAT8 NOT NULL DEFAULT 0,
    width_percent FLOAT8 NOT NULL DEFAULT 10,
    height_percent FLOAT8 NOT NULL DEFAULT 10,
    rotation FLOAT8 NOT NULL DEFAULT 0,
    position_3d JSONB,
    normal_3d JSONB,
    size_3d FLOAT8 DEFAULT 1.0,
    rotation_3d FLOAT8 DEFAULT 0,
    path_data JSONB,
    shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.template_zones TO authenticated;
GRANT SELECT ON public.template_zones TO anon;
GRANT ALL ON public.template_zones TO service_role;

ALTER TABLE public.template_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are viewable by everyone" ON public.template_zones
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage templates" ON public.template_zones
    FOR ALL USING (auth.role() = 'authenticated');