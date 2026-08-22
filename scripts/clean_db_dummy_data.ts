import { supabaseAdmin } from '../src/lib/supabase/admin';

async function inspectAndCleanData() {
  console.log('--- INSPECTING SUPABASE DATABASE DATA ---');

  const { data: lessons, error: lErr } = await supabaseAdmin.from('lessons').select('id, title, unit_id');
  console.log('Lessons count:', lessons?.length, lessons);

  const { data: units, error: uErr } = await supabaseAdmin.from('units').select('id, title, branch_id');
  console.log('Units count:', units?.length, units);

  const { data: quizzes, error: qErr } = await supabaseAdmin.from('quizzes').select('id, title');
  console.log('Quizzes count:', quizzes?.length, quizzes);

  const { data: questions, error: qnErr } = await supabaseAdmin.from('questions').select('id, question_text');
  console.log('Questions count:', questions?.length, questions);

  const { data: vouchers, error: vErr } = await supabaseAdmin.from('activation_codes').select('id, code');
  console.log('Vouchers count:', vouchers?.length, vouchers);
}

inspectAndCleanData().catch(console.error);
