import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function checkTables() {
  const tables = [
    'profiles', 'sessions', 'grades', 'terms', 'branches', 'units',
    'lessons', 'quizzes', 'quiz_questions', 'questions', 'exam_attempts',
    'student_answers', 'student_progress', 'plans', 'subscriptions',
    'activation_codes', 'audit_logs'
  ];

  console.log('--- CHECKING TABLE EXISTENCE IN SUPABASE ---');
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`❌ Table '${t}': ${error.message}`);
    } else {
      console.log(`✅ Table '${t}': OK`);
    }
  }
}

checkTables().catch(console.error);
