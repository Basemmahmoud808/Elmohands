import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  verifyPassword,
  hashPassword,
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  createSessionRecord,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: 'يرجى كتابة رقم الهاتف وكلمة المرور' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();

    // 1. Fetch user from Supabase profiles table
    let { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('phone', cleanPhone)
      .maybeSingle();



    if (error || !profile) {
      return NextResponse.json(
        { error: 'رقم الهاتف غير مسجل! يرجى إنشاء حساب جديد أولاً' },
        { status: 401 }
      );
    }

    if (!profile.is_active) {
      return NextResponse.json(
        { error: 'هذا الحساب معطل حالياً، يرجى التواصل مع إدارة المنصة' },
        { status: 403 }
      );
    }

    // 2. Verify password with bcrypt
    const isPasswordValid = await verifyPassword(password, profile.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'كلمة المرور غير صحيحة، يرجى التأكد من إعادة كتابتها بشكل صحيح' },
        { status: 401 }
      );
    }

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
