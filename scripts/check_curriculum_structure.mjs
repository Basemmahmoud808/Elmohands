import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function check() {
  const { data: grades, error: gErr } = await supabase.from('grades').select('*').order('sort_order');
  console.log('Grades:', grades?.length, grades);

  const { data: terms } = await supabase.from('terms').select('*').order('sort_order');
  console.log('Terms:', terms?.length, terms);

  const { data: branches } = await supabase.from('branches').select('*').order('sort_order');
  console.log('Branches:', branches?.length, branches);

  const { data: units } = await supabase.from('units').select('*').order('sort_order');
  console.log('Units:', units?.length, units);
}

check().catch(console.error);
