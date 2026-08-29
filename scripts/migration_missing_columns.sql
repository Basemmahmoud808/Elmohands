-- =============================================
-- Migration: Add Missing Columns
-- منصة المهندس — أعمدة ناقصة في قاعدة البيانات
-- شغّل هذا الملف في Supabase SQL Editor
-- =============================================

-- 1. أعمدة جدول الأسئلة (questions)
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS branch_name TEXT,
  ADD COLUMN IF NOT EXISTS grade_name TEXT,
  ADD COLUMN IF NOT EXISTS target_audience TEXT
    CHECK (target_audience IN ('ALL_STUDENTS', 'SUBSCRIBERS_ONLY', 'PUBLIC'))
    DEFAULT 'ALL_STUDENTS',
  ADD COLUMN IF NOT EXISTS entry_type TEXT
    CHECK (entry_type IN ('QUESTION', 'FILE'))
    DEFAULT 'QUESTION',
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_type TEXT;

-- 2. أعمدة جدول الكويزات (quizzes)
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS pdf_path TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT
    CHECK (type IN ('mcq', 'file'))
    DEFAULT 'mcq';

-- 3. عمود parent_phone في جدول profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS parent_phone TEXT;

-- 4. Indexes للأعمدة الجديدة
CREATE INDEX IF NOT EXISTS idx_questions_grade_name ON public.questions(grade_name);
CREATE INDEX IF NOT EXISTS idx_questions_branch_name ON public.questions(branch_name);
CREATE INDEX IF NOT EXISTS idx_questions_entry_type ON public.questions(entry_type);
CREATE INDEX IF NOT EXISTS idx_quizzes_type ON public.quizzes(type);
