
-- 1) Roles infrastructure
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 2) profiles: remove role column (privilege escalation)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- 3) companies: restrict update/delete to admins
DROP POLICY IF EXISTS "companies_update" ON public.companies;
DROP POLICY IF EXISTS "companies_delete" ON public.companies;
DROP POLICY IF EXISTS "companies_insert" ON public.companies;
CREATE POLICY "companies_insert_admin" ON public.companies
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "companies_update_admin" ON public.companies
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "companies_delete_admin" ON public.companies
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4) shirt_models: restrict write to admins
DROP POLICY IF EXISTS "Allow authenticated users to manage models" ON public.shirt_models;
CREATE POLICY "shirt_models_admin_manage" ON public.shirt_models
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5) uploads: restrict update/delete to admins (no owner column)
DROP POLICY IF EXISTS "uploads_update" ON public.uploads;
DROP POLICY IF EXISTS "uploads_delete" ON public.uploads;
CREATE POLICY "uploads_update_admin" ON public.uploads
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "uploads_delete_admin" ON public.uploads
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6) orcamentos: prevent NULL auth.uid() matching NULL usuario_id
DROP POLICY IF EXISTS "Users can view their own budget" ON public.orcamentos;
CREATE POLICY "Users can view their own budget" ON public.orcamentos
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL AND auth.uid() = usuario_id);
DROP POLICY IF EXISTS "Admins can view all orcamentos" ON public.orcamentos;
CREATE POLICY "Admins can view all orcamentos" ON public.orcamentos
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7) quotes: add admin-only read/update/delete policies
DROP POLICY IF EXISTS "quotes_admin_select" ON public.quotes;
DROP POLICY IF EXISTS "quotes_admin_update" ON public.quotes;
DROP POLICY IF EXISTS "quotes_admin_delete" ON public.quotes;
CREATE POLICY "quotes_admin_select" ON public.quotes
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "quotes_admin_update" ON public.quotes
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "quotes_admin_delete" ON public.quotes
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
