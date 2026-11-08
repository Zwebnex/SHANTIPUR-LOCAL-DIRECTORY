-- ==============================================================================
-- SHANTIPUR LOCAL DIRECTORY — MIGRATION 04: STORAGE BUCKETS & ACCESS POLICIES
-- Project ID: bnlhqkcyqymsvtqblwkv
-- Description: Sets up storage buckets with strict RLS policies.
--              - heritage-media (Public Read, Admin Write)
--              - business-documents (Private, Owner & Admin only)
--              - user-uploads (Restricted Authenticated Uploads)
-- ==============================================================================

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('heritage-media', 'heritage-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
    ('business-documents', 'business-documents', false, 15728640, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
    ('user-uploads', 'user-uploads', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies: heritage-media
-- Public Read
DROP POLICY IF EXISTS "heritage_media_public_read" ON storage.objects;
CREATE POLICY "heritage_media_public_read" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'heritage-media');

-- Admin Upload/Modify/Delete
DROP POLICY IF EXISTS "heritage_media_admin_write" ON storage.objects;
CREATE POLICY "heritage_media_admin_write" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'heritage-media' AND public.is_admin());

DROP POLICY IF EXISTS "heritage_media_admin_delete" ON storage.objects;
CREATE POLICY "heritage_media_admin_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'heritage-media' AND public.is_admin());

-- 3. Storage Policies: business-documents (PRIVATE)
-- Owner can view only their own documents; Admin can view all
DROP POLICY IF EXISTS "business_docs_owner_admin_read" ON storage.objects;
CREATE POLICY "business_docs_owner_admin_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'business-documents' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));

-- Owner can upload only into their own folder (auth.uid()/*)
DROP POLICY IF EXISTS "business_docs_owner_insert" ON storage.objects;
CREATE POLICY "business_docs_owner_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'business-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Owner or Admin can delete
DROP POLICY IF EXISTS "business_docs_owner_admin_delete" ON storage.objects;
CREATE POLICY "business_docs_owner_admin_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'business-documents' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));

-- 4. Storage Policies: user-uploads
-- Public read for community gallery
DROP POLICY IF EXISTS "user_uploads_public_read" ON storage.objects;
CREATE POLICY "user_uploads_public_read" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'user-uploads');

-- Authenticated upload only to own user folder
DROP POLICY IF EXISTS "user_uploads_user_insert" ON storage.objects;
CREATE POLICY "user_uploads_user_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- User or Admin can delete
DROP POLICY IF EXISTS "user_uploads_user_delete" ON storage.objects;
CREATE POLICY "user_uploads_user_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'user-uploads' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));

