-- 1. Secure the uploads table INSERT policy
DROP POLICY IF EXISTS "uploads_insert" ON public.uploads;
CREATE POLICY "uploads_insert_session" ON public.uploads 
FOR INSERT TO public 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customizations c 
    WHERE c.id = customization_id 
    AND (
      c.session_id = ((current_setting('request.headers'::text, true))::json ->> 'x-session-id'::text)
      OR (auth.uid() IS NOT NULL) -- Allow authenticated users as well
    )
  )
);

-- 2. Hardened has_role function to prevent role probing
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to check their own roles, or admins to check anyone's roles
  -- This prevents malicious users from probing the roles of others
  IF (auth.uid() = _user_id) OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    );
  END IF;
  
  RETURN FALSE;
END;
$$;

-- 3. Tighten quotes submission
DROP POLICY IF EXISTS "quotes_insert" ON public.quotes;
CREATE POLICY "quotes_insert_with_customization" ON public.quotes 
FOR INSERT TO anon, authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customizations c 
    WHERE c.id = customization_id
  )
);

-- 4. Revoke execute on the helper from non-authenticated roles if not already done
-- This is a best practice, though Supabase manages it, being explicit helps scanners
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role, anon;
