CREATE TABLE public.shirt_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  glb_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shirt_models TO authenticated;
GRANT ALL ON public.shirt_models TO service_role;
GRANT SELECT ON public.shirt_models TO anon;

ALTER TABLE public.shirt_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.shirt_models FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage models" ON public.shirt_models FOR ALL USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_shirt_models_updated_at BEFORE UPDATE ON public.shirt_models FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();