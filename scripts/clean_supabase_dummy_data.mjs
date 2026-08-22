import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log('Connecting to Supabase:', supabaseUrl);

  // 1. Fetch lessons
  const { data: lessons, error: lErr } = await supabase.from('lessons').select('id, title, is_published');
  console.log('Live lessons in Supabase:', lessons?.length, lessons);

  // 2. Fetch units
  const { data: units } = await supabase.from('units').select('id, title');
  console.log('Live units in Supabase:', units?.length, units);

  // 3. Fetch quizzes
  const { data: quizzes } = await supabase.from('quizzes').select('id, title');
  console.log('Live quizzes in Supabase:', quizzes?.length, quizzes);

  // 4. Fetch questions
  const { data: questions } = await supabase.from('questions').select('id, question_text');
  console.log('Live questions in Supabase:', questions?.length, questions);

  // 5. Fetch students
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, phone, role');
  console.log('Live profiles in Supabase:', profiles?.length, profiles);

  // Clean dummy lessons if requested
  if (lessons && lessons.length > 0) {
    console.log('Deleting dummy lessons from Supabase...');
    const { error: delErr } = await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Delete lessons result:', delErr || 'Deleted successfully!');
  }

  // Clean dummy units if any
  if (units && units.length > 0) {
    console.log('Deleting dummy units from Supabase...');
    const { error: uDelErr } = await supabase.from('units').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Delete units result:', uDelErr || 'Deleted successfully!');
  }

  // Clean dummy quizzes
  if (quizzes && quizzes.length > 0) {
    console.log('Deleting dummy quizzes from Supabase...');
    const { error: qDelErr } = await supabase.from('quizzes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Delete quizzes result:', qDelErr || 'Deleted successfully!');
  }

  // Clean dummy questions
  if (questions && questions.length > 0) {
    console.log('Deleting dummy questions from Supabase...');
    const { error: qnDelErr } = await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Delete questions result:', qnDelErr || 'Deleted successfully!');
  }

  console.log('--- SUPABASE DATABASE PURGE COMPLETED ---');
}

main().catch(console.error);
