-- Final hardening of has_role function
-- Ensure it is not executable by the public (anon)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- Note: 'orcamentos', 'quotes', and 'uploads' tables have public INSERT policies (USING true) 
-- which is intentional for lead generation from the public simulator. 
-- This is a business requirement to allow unauthenticated users to submit requests.
