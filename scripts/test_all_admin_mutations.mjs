import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function testAll() {
  console.log('--- TESTING ALL ADMIN MUTATIONS ON SUPABASE ---');

  // 1. Check Grades
  const { data: grades } = await supabase.from('grades').select('*').order('sort_order');
  console.log('1. Grades:', grades);

  if (!grades || grades.length === 0) {
    console.error('No grades found!');
    return;
  }

  const prep1 = grades[0];

  // 2. Ensure Terms (الترم الأول & الترم الثاني) exist for each grade
  for (const g of grades) {
    const { data: existingTerms } = await supabase.from('terms').select('*').eq('grade_id', g.id);
    if (!existingTerms || existingTerms.length === 0) {
      console.log(`Creating Terms for grade: ${g.name}`);
      const { data: t1 } = await supabase.from('terms').insert({ grade_id: g.id, name: 'الترم الأول', sort_order: 1 }).select().single();
      const { data: t2 } = await supabase.from('terms').insert({ grade_id: g.id, name: 'الترم الثاني', sort_order: 2 }).select().single();
      
      // Create Branches for Term 1 & Term 2
      const isSec = g.name.includes('ثانوي');
      const b1Name = isSec ? 'فرع الجبر وحساب المثلثات' : 'فرع الجبر والإحصاء';
      const b2Name = isSec ? 'فرع الهندسة التحليلية' : 'فرع الهندسة والقياس';

      if (t1) {
        await supabase.from('branches').insert([
          { term_id: t1.id, name: b1Name, sort_order: 1 },
          { term_id: t1.id, name: b2Name, sort_order: 2 },
        ]);
      }
      if (t2) {
        await supabase.from('branches').insert([
          { term_id: t2.id, name: b1Name, sort_order: 1 },
          { term_id: t2.id, name: b2Name, sort_order: 2 },
        ]);
      }
    }
  }

  // 3. Test Unit Creation
  const { data: branches } = await supabase.from('branches').select('id, name, term_id').limit(1);
  console.log('3. Sample Branch:', branches);
  if (branches && branches[0]) {
    const { data: unit, error: uErr } = await supabase.from('units').insert({
      branch_id: branches[0].id,
      title: 'الوحدة الأولى: الأعداد النسبية (تجريبي)',
      description: 'موضوعات الوحدة الأولى',
      sort_order: 1,
    }).select().single();
    console.log('Unit insert result:', uErr ? uErr.message : 'SUCCESS', unit?.id);

    // 4. Test Lesson Creation
    if (unit) {
      const { data: lesson, error: lErr } = await supabase.from('lessons').insert({
        unit_id: unit.id,
        title: 'الدرس الأول: الأعداد النسبية (تجريبي)',
        description: 'شرح الدرس الأول',
        duration: 45,
        video_path: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        is_locked: false,
        is_published: true,
        sort_order: 1,
      }).select().single();
      console.log('Lesson insert result:', lErr ? lErr.message : 'SUCCESS', lesson?.id);

      // Clean up test lesson & unit
      if (lesson) await supabase.from('lessons').delete().eq('id', lesson.id);
      await supabase.from('units').delete().eq('id', unit.id);
    }
  }

  // 5. Test Question Creation
  const { data: q, error: qErr } = await supabase.from('questions').insert({
    question_text: 'سؤال تجريبي لاختبار الإدخال؟',
    difficulty: 'EASY',
    question_type: 'MCQ',
    options: JSON.stringify([{ label: 'A', text: 'خيار 1' }, { label: 'B', text: 'خيار 2' }]),
    correct_answer: 'A',
    branch_name: 'فرع الجبر والإحصاء',
    grade_name: 'الصف الأول الإعدادي',
  }).select().single();
  console.log('Question insert result:', qErr ? qErr.message : 'SUCCESS', q?.id);
  if (q) await supabase.from('questions').delete().eq('id', q.id);

  // 6. Test Voucher Code Generation
  const { data: v, error: vErr } = await supabase.from('activation_codes').insert({
    code: 'TEST-VOUCHER-1234',
    status: 'UNUSED',
  }).select().single();
  console.log('Voucher insert result:', vErr ? vErr.message : 'SUCCESS', v?.id);
  if (v) await supabase.from('activation_codes').delete().eq('id', v.id);

  console.log('--- ALL TEST MUTATIONS COMPLETED ---');
}

testAll().catch(console.error);
