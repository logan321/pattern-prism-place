
-- 1. Re-proteger patterns (somente admin escreve)
DROP POLICY IF EXISTS patterns_public_insert ON public.patterns;
DROP POLICY IF EXISTS patterns_public_update ON public.patterns;
DROP POLICY IF EXISTS patterns_public_delete ON public.patterns;

CREATE POLICY patterns_admin_insert ON public.patterns
  FOR INSERT TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY patterns_admin_update ON public.patterns
  FOR UPDATE TO authenticated
  USING (private.is_admin()) WITH CHECK (private.is_admin());

CREATE POLICY patterns_admin_delete ON public.patterns
  FOR DELETE TO authenticated
  USING (private.is_admin());

REVOKE INSERT, UPDATE, DELETE ON public.patterns FROM anon;

-- 2. RPC que concede admin ao e-mail allowlistado
CREATE OR REPLACE FUNCTION public.claim_admin_role()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_email text;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;

  IF lower(coalesce(v_email,'')) IN ('rabigudo@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_admin_role() TO authenticated;
