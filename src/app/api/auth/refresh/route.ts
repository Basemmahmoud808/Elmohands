import { NextResponse } from 'next/server';
import {
  getRefreshTokenFromCookies,
  verifyRefreshToken,
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  createSessionRecord,
  revokeSessionById,
} from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const refreshToken = await getRefreshTokenFromCookies();
    if (!refreshToken) {
      return NextResponse.json({ error: 'رمز التجديد غير متاح' }, { status: 401 });
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'جلسة التجديد غير صالحة أو منتهية' }, { status: 401 });
    }

    // Verify session is not revoked in database
    const { data: activeSession } = await supabaseAdmin
      .from('sessions')
      .select('id, revoked_at')
      .eq('user_id', payload.userId)
      .is('revoked_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!activeSession) {
      return NextResponse.json({ error: 'الجلسة ملغاة أو منتهية' }, { status: 401 });
    }

    // Fetch user from DB
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, phone, role, full_name, is_active')
      .eq('id', payload.userId)
      .maybeSingle();

    if (!profile || !profile.is_active) {
      return NextResponse.json({ error: 'الحساب غير فعال' }, { status: 403 });
    }

    const tokenPayload = {
      userId: profile.id,
      phone: profile.phone,
      role: profile.role as 'ADMIN' | 'STUDENT',
      fullName: profile.full_name,
    };

    const newAccessToken = await createAccessToken(tokenPayload);
    const newRefreshToken = await createRefreshToken(tokenPayload);

    // Rotate refresh token session in database
    await revokeSessionById(activeSession.id);
    await createSessionRecord(profile.id, newRefreshToken);

    await setAuthCookies(newAccessToken, newRefreshToken);

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        fullName: profile.full_name,
        role: profile.role,
      },
    });
  } catch (error) {
    console.error('Refresh API error:', error);
    return NextResponse.json({ error: 'فشل تجديد الجلسة' }, { status: 500 });
  }
}
