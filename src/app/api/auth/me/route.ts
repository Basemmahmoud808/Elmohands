import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, email, role, grade_id, avatar_url, parent_email, is_active, last_login_at, created_at')
      .eq('id', userPayload.userId)
      .maybeSingle();

    if (!profile || !profile.is_active) {
      return NextResponse.json({ authenticated: false, error: 'الحساب غير فعال أو غير موجود' }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: profile.id,
        fullName: profile.full_name,
        phone: profile.phone,
        email: profile.email,
        role: profile.role,
        gradeId: profile.grade_id,
        avatarUrl: profile.avatar_url,
        parentEmail: profile.parent_email,
        lastLoginAt: profile.last_login_at,
      },
    });
  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
