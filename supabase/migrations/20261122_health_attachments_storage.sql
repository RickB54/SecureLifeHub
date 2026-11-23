-- ==============================================================================
-- Health Attachments Private Storage Bucket & Per-User RLS Policies
-- Safe to re-run: ON CONFLICT DO UPDATE + DROP POLICY IF EXISTS
-- Files are stored at: <user_id>/<filename>
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'health-attachments',
    'health-attachments',
    false,
    5242880,
    ARRAY['image/jpeg', 'image/webp', 'image/png', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/webp', 'image/png', 'image/gif', 'application/pdf'];

DROP POLICY IF EXISTS "Users can view own health attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own health attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own health attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own health attachments" ON storage.objects;

CREATE POLICY "Users can view own health attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'health-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload own health attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'health-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own health attachments"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'health-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own health attachments"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'health-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
