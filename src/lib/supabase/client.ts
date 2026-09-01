import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl && process.env.NODE_ENV === 'production') {
  console.error('CRITICAL: NEXT_PUBLIC_SUPABASE_URL environment variable is not configured.');
}
if (!supabaseAnonKey && process.env.NODE_ENV === 'production') {
  console.error('CRITICAL: NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not configured.');
}

const effectiveUrl = supabaseUrl || (process.env.NODE_ENV === 'production' ? '' : 'https://placeholder.supabase.co');
const effectiveKey = supabaseAnonKey || (process.env.NODE_ENV === 'production' ? '' : 'placeholder_anon_key');

export const supabase = createClient(effectiveUrl, effectiveKey);
