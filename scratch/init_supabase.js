const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ngcfncglbrwhtjdvlhbm.supabase.co';
const supabaseKey = 'sb_publishable_4HhI34Dliz6jjQpUF5nyhQ_U5Itq-Q8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
      console.log('Table profiles not created yet or RLS policy active:', error.message);
    } else {
      console.log('Connection successful! Data:', data);
    }
  } catch (err) {
    console.error('Connection error:', err);
  }
}

testConnection();
