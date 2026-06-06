-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  company_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'client', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT,
  whatsapp TEXT,
  plan TEXT DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sport_type TEXT NOT NULL,
  is_3d BOOLEAN DEFAULT true,
  base_price NUMERIC,
  model_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Patterns table
CREATE TABLE public.patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Colors table
CREATE TABLE public.colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  hex_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Customizations table
CREATE TABLE public.customizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  product_id UUID REFERENCES public.products(id),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  preview_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Quotes table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customization_id UUID REFERENCES public.customizations(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  quantity INTEGER,
  notes TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'analyzing', 'approved', 'production', 'delivered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Uploads table
CREATE TABLE public.uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customization_id UUID REFERENCES public.customizations(id),
  file_url TEXT NOT NULL,
  position TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT ALL ON public.profiles TO authenticated, service_role;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.companies TO authenticated, service_role;
GRANT SELECT ON public.companies TO anon;
GRANT ALL ON public.products TO authenticated, service_role;
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.patterns TO authenticated, service_role;
GRANT SELECT ON public.patterns TO anon;
GRANT ALL ON public.colors TO authenticated, service_role;
GRANT SELECT ON public.colors TO anon;
GRANT ALL ON public.customizations TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.customizations TO anon;
GRANT ALL ON public.quotes TO authenticated, service_role;
GRANT INSERT ON public.quotes TO anon;
GRANT ALL ON public.uploads TO authenticated, service_role;
GRANT INSERT ON public.uploads TO anon;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public products are viewable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public patterns are viewable" ON public.patterns FOR SELECT USING (true);
CREATE POLICY "Public colors are viewable" ON public.colors FOR SELECT USING (true);
CREATE POLICY "Anon can create customizations" ON public.customizations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can view their own customizations" ON public.customizations FOR SELECT USING (true);
CREATE POLICY "Anon can create quotes" ON public.quotes FOR INSERT WITH CHECK (true);
