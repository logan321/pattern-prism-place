-- 1) Restrict SELECT on public.uploads
-- Currently it's 'true' (public), which exposes all uploaded file URLs.
DROP POLICY IF EXISTS "uploads_select" ON public.uploads;

CREATE POLICY "uploads_select_admin" ON public.uploads
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "uploads_select_session" ON public.uploads
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.customizations c
      WHERE c.id = customization_id
      AND c.session_id = ((current_setting('request.headers'::text, true))::json ->> 'x-session-id'::text)
    )
  );

-- 2) Harden has_role function to prevent information leakage
-- Only allow checking own role or allow admins to check any role.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND (
      _user_id = auth.uid() -- Can check own role
      OR 
      EXISTS ( -- Or if the caller is an admin
        SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
    AND role = _role
  )
$function$;

-- Ensure permissions are still restricted (though this was done in a previous migration, it's good to be explicit)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
