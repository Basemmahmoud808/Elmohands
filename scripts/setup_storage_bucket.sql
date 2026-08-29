-- =============================================
-- Supabase Storage: Create course-materials Bucket
-- شغّل هذا في Supabase SQL Editor
-- =============================================

-- إنشاء الـ bucket لو مش موجود
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials',
  'course-materials',
  true,
  524288000,  -- 500MB
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 524288000;

-- سياسة القراءة العامة (أي أحد يقدر يقرأ)
DROP POLICY IF EXISTS "Public read course-materials" ON storage.objects;
CREATE POLICY "Public read course-materials"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-materials');

-- سياسة الرفع (عبر الـ service role فقط — الـ anon مش يرفع)
DROP POLICY IF EXISTS "Service role upload course-materials" ON storage.objects;
CREATE POLICY "Service role upload course-materials"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'course-materials');
