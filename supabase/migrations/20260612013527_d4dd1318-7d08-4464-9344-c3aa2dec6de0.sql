-- Fix storage policies for models and textures buckets
-- Currently they allow anyone (anon) to delete or update assets.

-- 1) Revoke existing overly permissive policies
DROP POLICY IF EXISTS "Open write models and textures" ON storage.objects;
DROP POLICY IF EXISTS "Open update models and textures" ON storage.objects;
DROP POLICY IF EXISTS "Open delete models and textures" ON storage.objects;

-- 2) Create admin-only management policies
CREATE POLICY "Admin manage models and textures"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id IN ('models', 'textures') AND
    public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    bucket_id IN ('models', 'textures') AND
    public.has_role(auth.uid(), 'admin')
  );

-- 3) Ensure public read access remains (assuming it's intended for the simulator)
-- The existing policy "Public read models and textures" already handles this.
-- If it doesn't exist, we should create it.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public read models and textures'
    ) THEN
        CREATE POLICY "Public read models and textures"
          ON storage.objects
          FOR SELECT
          TO public
          USING (bucket_id IN ('models', 'textures'));
    END IF;
END
$$;
