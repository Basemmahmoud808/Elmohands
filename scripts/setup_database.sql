-- ===================================================
-- Almohands Platform (منصة المهندس) — Complete Database Setup
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ngcfncglbrwhtjdvlhbm/sql/new
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

-- 3. SESSIONS TABLE
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

-- 4. TERMS TABLE
CREATE TABLE IF NOT EXISTS public.terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grade_id UUID REFERENCES public.grades(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BRANCHES TABLE
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term_id UUID REFERENCES public.terms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. UNITS TABLE
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LESSONS TABLE
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

-- 8. PLANS TABLE
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

-- 9. ACTIVATION CODES TABLE
CREATE TABLE IF NOT EXISTS public.activation_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(64) UNIQUE NOT NULL,
  plan_id UUID REFERENCES public.plans(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('UNUSED', 'USED', 'DISABLED')) DEFAULT 'UNUSED',
  used_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED')) DEFAULT 'ACTIVE',
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  source TEXT CHECK (source IN ('CODE', 'PAYMOB', 'MANUAL')) DEFAULT 'CODE',
  activation_code_id UUID REFERENCES public.activation_codes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  question_latex TEXT,
  image_url TEXT,
  difficulty TEXT DEFAULT 'MEDIUM',
  question_type TEXT DEFAULT 'MCQ',
  entry_type TEXT DEFAULT 'QUESTION',
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT NOT NULL DEFAULT '',
  explanation TEXT,
  branch_name TEXT,
  grade_name TEXT,
  target_audience TEXT DEFAULT 'ALL_STUDENTS',
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INT DEFAULT 20,
  pass_score INT DEFAULT 50,
  max_attempts INT DEFAULT 3,
  is_published BOOLEAN DEFAULT TRUE,
  type TEXT DEFAULT 'mcq',
  pdf_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. QUIZ QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_quiz_question UNIQUE (quiz_id, question_id)
);

-- 14. EXAM ATTEMPTS TABLE
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

-- 15. STUDENT ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.student_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_attempt_question UNIQUE (attempt_id, question_id)
);

-- 16. STUDENT PROGRESS TABLE
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

-- 17. AUDIT LOGS TABLE
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

-- ===================================================
-- SEED TERMS AND BRANCHES FOR ALL GRADES
-- ===================================================
DO $$
DECLARE
  r_grade RECORD;
  v_term1 UUID;
  v_term2 UUID;
BEGIN
  FOR r_grade IN SELECT id, name FROM public.grades LOOP
    -- Check if Term 1 exists
    SELECT id INTO v_term1 FROM public.terms WHERE grade_id = r_grade.id AND sort_order = 1;
    IF v_term1 IS NULL THEN
      INSERT INTO public.terms (grade_id, name, sort_order)
      VALUES (r_grade.id, 'الترم الأول', 1) RETURNING id INTO v_term1;
    END IF;

    -- Check if Term 2 exists
    SELECT id INTO v_term2 FROM public.terms WHERE grade_id = r_grade.id AND sort_order = 2;
    IF v_term2 IS NULL THEN
      INSERT INTO public.terms (grade_id, name, sort_order)
      VALUES (r_grade.id, 'الترم الثاني', 2) RETURNING id INTO v_term2;
    END IF;

    -- Create Branches for Term 1
    IF NOT EXISTS (SELECT 1 FROM public.branches WHERE term_id = v_term1) THEN
      IF r_grade.name LIKE '%ثانوي%' THEN
        INSERT INTO public.branches (term_id, name, sort_order) VALUES
          (v_term1, 'فرع الجبر وحساب المثلثات', 1),
          (v_term1, 'فرع الهندسة التحليلية', 2);
      ELSE
        INSERT INTO public.branches (term_id, name, sort_order) VALUES
          (v_term1, 'فرع الجبر والإحصاء', 1),
          (v_term1, 'فرع الهندسة والقياس', 2);
      END IF;
    END IF;

    -- Create Branches for Term 2
    IF NOT EXISTS (SELECT 1 FROM public.branches WHERE term_id = v_term2) THEN
      IF r_grade.name LIKE '%ثانوي%' THEN
        INSERT INTO public.branches (term_id, name, sort_order) VALUES
          (v_term2, 'فرع الجبر والمصفوفات', 1),
          (v_term2, 'فرع حساب المثلثات والهندسة', 2);
      ELSE
        INSERT INTO public.branches (term_id, name, sort_order) VALUES
          (v_term2, 'فرع الجبر والإحصاء', 1),
          (v_term2, 'فرع الهندسة وحساب المثلثات', 2);
      END IF;
    END IF;
  END LOOP;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_terms_grade ON public.terms(grade_id);
CREATE INDEX IF NOT EXISTS idx_branches_term ON public.branches(term_id);
CREATE INDEX IF NOT EXISTS idx_units_branch ON public.units(branch_id);
CREATE INDEX IF NOT EXISTS idx_lessons_unit ON public.lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_questions_grade ON public.questions(grade_name);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON public.quizzes(lesson_id);
