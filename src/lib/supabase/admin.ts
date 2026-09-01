import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl && process.env.NODE_ENV === 'production') {
  console.error('CRITICAL: SUPABASE_URL environment variable is not configured.');
}
if (!serviceRoleKey && process.env.NODE_ENV === 'production') {
  console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY environment variable is not configured.');
}

// Fallback is only used for build-time static phase when environment variables are omitted
const effectiveUrl = supabaseUrl || (process.env.NODE_ENV === 'production' ? '' : 'https://placeholder.supabase.co');
const effectiveKey = serviceRoleKey || (process.env.NODE_ENV === 'production' ? '' : 'placeholder_service_key');

export const supabaseAdmin = createClient(
  effectiveUrl,
  effectiveKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
