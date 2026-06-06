-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tables
CREATE TABLE public.lojistas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    whatsapp TEXT,
    facebook_pixel_id TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    nome TEXT NOT NULL,
    telefone TEXT,
    cidade TEXT,
    estado TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    genero TEXT CHECK (genero IN ('Masculino', 'Feminino', 'Unissex')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.modelos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID REFERENCES public.categorias(id),
    nome TEXT NOT NULL,
    thumbnail_url TEXT,
    glb_url TEXT NOT NULL,
    pecas JSONB DEFAULT '["Camisa", "Calção", "Meião"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.fontes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    font_family TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.tipos_gola (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.tipos_manga (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.tipos_punho (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.simulacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES auth.users(id),
    nome TEXT NOT NULL,
    configuracao JSONB NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.orcamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES auth.users(id),
    dados_contato JSONB NOT NULL,
    resumo_uniforme JSONB NOT NULL,
    whatsapp_link TEXT,
    status TEXT DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.uploads_imagem (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES auth.users(id),
    url TEXT NOT NULL,
    tipo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Grants
GRANT ALL ON public.lojistas TO service_role;
GRANT SELECT ON public.lojistas TO authenticated, anon;

GRANT ALL ON public.usuarios TO service_role;
GRANT SELECT, UPDATE ON public.usuarios TO authenticated;

GRANT SELECT ON public.categorias TO authenticated, anon;
GRANT SELECT ON public.modelos TO authenticated, anon;
GRANT SELECT ON public.fontes TO authenticated, anon;
GRANT SELECT ON public.tipos_gola TO authenticated, anon;
GRANT SELECT ON public.tipos_manga TO authenticated, anon;
GRANT SELECT ON public.tipos_punho TO authenticated, anon;

GRANT ALL ON public.simulacoes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.simulacoes TO authenticated;

GRANT ALL ON public.orcamentos TO service_role;
GRANT INSERT ON public.orcamentos TO authenticated, anon;
GRANT SELECT ON public.orcamentos TO authenticated;

GRANT ALL ON public.uploads_imagem TO service_role;
GRANT SELECT, INSERT ON public.uploads_imagem TO authenticated;

-- 3. RLS
ALTER TABLE public.lojistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fontes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_gola ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_manga ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_punho ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads_imagem ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own profile" ON public.usuarios FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage their own simulations" ON public.simulacoes FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "Anyone can insert lead/budget" ON public.orcamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own budget" ON public.orcamentos FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can manage their own uploads" ON public.uploads_imagem FOR ALL USING (auth.uid() = usuario_id);

-- 4. Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lojistas_updated_at BEFORE UPDATE ON public.lojistas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_simulacoes_updated_at BEFORE UPDATE ON public.simulacoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
