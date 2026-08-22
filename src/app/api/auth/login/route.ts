import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  createSessionRecord,
} from '@/lib/auth';

import { LoginSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

// Per-account brute-force lockout (5 attempts → 15 min lock)
const FAILED_LOGINS = new Map<string, { count: number; lockUntil: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parseResult = LoginSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'بيانات الدخول غير صحيحة';
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }

    const { phone, password } = parseResult.data;

    const cleanPhone = phone.trim();

    // 1. Check per-account brute-force lockout
    const failRecord = FAILED_LOGINS.get(cleanPhone);
    if (failRecord && Date.now() < failRecord.lockUntil) {
      const remaining = Math.ceil((failRecord.lockUntil - Date.now()) / 60000);
      return NextResponse.json(
        { error: `تنبيه أمان: تم إيقاف محاولات الدخول لمدة ${remaining} دقيقة بسبب تكرار كلمة المرور الخاطئة.` },
        { status: 429 }
      );
    }

    // 2. Fetch user from Supabase profiles table
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (error || !profile) {
      // Increment failed attempt counter (prevents phone enumeration timing attacks)
      const rec = FAILED_LOGINS.get(cleanPhone) || { count: 0, lockUntil: 0 };
      rec.count += 1;
      if (rec.count >= MAX_LOGIN_ATTEMPTS) rec.lockUntil = Date.now() + LOGIN_LOCK_DURATION_MS;
      FAILED_LOGINS.set(cleanPhone, rec);
      return NextResponse.json(
        { error: 'رقم الهاتف أو كلمة المرور غير صحيحة.' },
        { status: 401 }
      );
    }

    if (!profile.is_active) {
      return NextResponse.json(
        { error: 'هذا الحساب معطل حالياً، يرجى التواصل مع إدارة المنصة' },
        { status: 403 }
      );
    }

    // 3. Verify password with bcrypt
    const isPasswordValid = await verifyPassword(password, profile.password_hash);
    if (!isPasswordValid) {
      const rec = FAILED_LOGINS.get(cleanPhone) || { count: 0, lockUntil: 0 };
      rec.count += 1;
      if (rec.count >= MAX_LOGIN_ATTEMPTS) rec.lockUntil = Date.now() + LOGIN_LOCK_DURATION_MS;
      FAILED_LOGINS.set(cleanPhone, rec);
      const remaining = MAX_LOGIN_ATTEMPTS - rec.count;
      const msg = rec.lockUntil > Date.now()
        ? 'تنبيه أمان: تم إيقاف محاولات الدخول مؤقتاً بسبب تكرار كلمة المرور الخاطئة.'
        : `رقم الهاتف أو كلمة المرور غير صحيحة. (${remaining > 0 ? remaining + ' محاولات متبقية' : 'سيتم القفل'})`;
      return NextResponse.json({ error: msg }, { status: 401 });
    }

    // 4. Success — clear failed attempts
    FAILED_LOGINS.delete(cleanPhone);

    // 3. Update last_login_at
    await supabaseAdmin
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', profile.id);

    // 4. Generate Auth Tokens
    const tokenPayload = {
      userId: profile.id,
      phone: profile.phone,
      role: profile.role as 'ADMIN' | 'STUDENT',
      fullName: profile.full_name,
    };

    const accessToken = await createAccessToken(tokenPayload);
    const refreshToken = await createRefreshToken(tokenPayload);

    // 5. Set Cookies & Record Session in DB
    await setAuthCookies(accessToken, refreshToken);

    const userAgent = req.headers.get('user-agent') || undefined;
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || undefined;
    await createSessionRecord(profile.id, refreshToken, userAgent, ipAddress);

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        fullName: profile.full_name,
        phone: profile.phone,
        role: profile.role,
        gradeId: profile.grade_id,
        avatarUrl: profile.avatar_url,
      },
    });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
