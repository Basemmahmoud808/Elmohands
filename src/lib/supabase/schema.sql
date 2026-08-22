-- ===================================================
-- Almohands Educational Platform (منصة المهندس)
-- PostgreSQL Database Schema (MVP Edition - Revised)
-- Auth: Custom (NOT Clerk) - password_hash based
-- ===================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. GRADES TABLE
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  stage TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILES TABLE
-- NOTE: password_hash MUST be hashed with bcrypt/argon2 in the app layer.
-- Never store or compare plain text passwords.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT CHECK (role IN ('ADMIN', 'STUDENT')) DEFAULT 'STUDENT',
  grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL,
  avatar_url TEXT,
  parent_email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2b. SESSIONS TABLE (custom auth session/refresh token management)
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TERMS TABLE
CREATE TABLE IF NOT EXISTS public.terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grade_id UUID REFERENCES public.grades(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BRANCHES TABLE
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term_id UUID REFERENCES public.terms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. UNITS TABLE
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LESSONS TABLE
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_path TEXT,
  thumbnail_path TEXT,
  pdf_path TEXT,
  duration INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  is_locked BOOLEAN DEFAULT FALSE,
  min_pass_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PLANS TABLE
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0.00,
  duration_days INT NOT NULL,
  grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ACTIVATION CODES TABLE
CREATE TABLE IF NOT EXISTS public.activation_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(24) UNIQUE NOT NULL,
  plan_id UUID REFERENCES public.plans(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('UNUSED', 'USED', 'DISABLED')) DEFAULT 'UNUSED',
  used_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED')) DEFAULT 'ACTIVE',
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  source TEXT CHECK (source IN ('CODE', 'MANUAL')) DEFAULT 'CODE',
  activation_code_id UUID REFERENCES public.activation_codes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  question_latex TEXT,
  image_url TEXT,
  difficulty TEXT CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')) DEFAULT 'MEDIUM',
  question_type TEXT CHECK (question_type IN ('MCQ', 'TRUE_FALSE')) DEFAULT 'MCQ',
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INT DEFAULT 15,
  pass_score INT DEFAULT 50,
  max_attempts INT DEFAULT 3,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. QUIZ QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_quiz_question UNIQUE (quiz_id, question_id)
);

-- 13. EXAM ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL DEFAULT 1,
  score INT DEFAULT 0,
  percentage INT DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_quiz_attempt UNIQUE (quiz_id, student_id, attempt_number)
);

-- 14. STUDENT ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.student_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_attempt_question UNIQUE (attempt_id, question_id)
);

-- 15. STUDENT PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  watch_percentage INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  last_position INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_lesson UNIQUE (student_id, lesson_id)
);

-- 16. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. PARENT REPORTS TABLE (Resend email tracking)
CREATE TABLE IF NOT EXISTS public.parent_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_email TEXT NOT NULL,
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  status TEXT CHECK (status IN ('PENDING', 'SENT', 'FAILED')) DEFAULT 'PENDING',
  resend_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- INDEXES
-- ===================================================
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_grade ON public.profiles(grade_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_terms_grade ON public.terms(grade_id);
CREATE INDEX IF NOT EXISTS idx_branches_term ON public.branches(term_id);
CREATE INDEX IF NOT EXISTS idx_units_branch ON public.units(branch_id);
CREATE INDEX IF NOT EXISTS idx_lessons_unit ON public.lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_activation_codes_code ON public.activation_codes(code);
CREATE INDEX IF NOT EXISTS idx_activation_codes_status ON public.activation_codes(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_student ON public.subscriptions(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student ON public.exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_quiz ON public.exam_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_attempt ON public.student_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON public.student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_lesson ON public.student_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_parent_reports_student ON public.parent_reports(student_id);

-- ===================================================
-- ROW LEVEL SECURITY
-- Since auth is custom (not Supabase Auth / Clerk), the app backend
-- uses the Supabase SERVICE ROLE key for all privileged writes, and
-- RLS below acts as a defense-in-depth layer for any direct client
-- access via the anon/public key. Adjust to your actual auth bridge
-- (e.g. set a custom JWT claim "profile_id" and read via auth.jwt())
-- if the frontend ever queries Supabase directly instead of via API.
-- ===================================================

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_reports ENABLE ROW LEVEL SECURITY;

-- Public catalog data (grades/terms/branches/units/published lessons/plans)
-- is readable by anyone; writes are blocked at RLS level (service role bypasses RLS).
CREATE POLICY "grades_public_read" ON public.grades FOR SELECT USING (is_active = TRUE);
CREATE POLICY "terms_public_read" ON public.terms FOR SELECT USING (true);
CREATE POLICY "branches_public_read" ON public.branches FOR SELECT USING (true);
CREATE POLICY "units_public_read" ON public.units FOR SELECT USING (is_active = TRUE);
-- SECURITY NOTE: lessons table has a public SELECT policy for metadata only.
-- video_path and pdf_path are sensitive columns — they MUST NOT be exposed via anon key.
-- All lesson content (video, PDF) must be fetched server-side via supabaseAdmin, never client-side.
-- The policy below allows public read of lesson metadata but the app MUST NOT use the anon client to fetch lessons.
-- Instead use supabaseAdmin in server actions only.
CREATE POLICY "lessons_public_read" ON public.lessons FOR SELECT USING (is_published = TRUE);

-- RECOMMENDED: If you want to fully block anon clients from reading video_path/pdf_path,
-- replace the above policy with a column-level security approach or a Supabase view:
-- CREATE VIEW public.lessons_public AS
--   SELECT id, unit_id, title, description, thumbnail_path, duration, sort_order, is_published, is_locked, min_pass_score, created_at
--   FROM public.lessons WHERE is_published = TRUE;
-- Then grant SELECT on the view and revoke on the base table.

CREATE POLICY "plans_public_read" ON public.plans FOR SELECT USING (is_active = TRUE);

-- No client-side INSERT/UPDATE/DELETE policies are defined for any table:
-- all writes must go through the backend API using the service role key.
-- This blocks anon-key clients from mutating data while still allowing
-- the app server (service role, which bypasses RLS) full access.

-- ===================================================
-- NOTES FOR THE AI AGENT
-- ===================================================
-- 1. Auth is fully custom: verify password_hash with bcrypt/argon2 in
--    the API layer, issue your own JWT + refresh token, store refresh
--    token hashes in public.sessions.
-- 2. The frontend NEVER talks to Supabase directly with the anon key
--    for anything beyond the public SELECT policies above. All writes
--    (progress, answers, subscriptions, etc.) go through Next.js API
--    routes using the Supabase service role key, after verifying the
--    custom JWT and checking role/ownership in application code.
-- 3. exam_attempts.attempt_number must be computed server-side as
--    COUNT(*) + 1 for that (quiz_id, student_id) pair, and rejected
--    once it exceeds quizzes.max_attempts.
