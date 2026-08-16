import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sanitizeInput } from '@/lib/security';
import {
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
    const { fullName, phone, email, password, gradeId, parentEmail } = body;

    // 1. Basic validation
    if (!phone || !password || !fullName) {
      return NextResponse.json(
        { error: 'يرجى إدخال جميع البيانات المطلوبة (الاسم الكامل، رقم الهاتف، وكلمة المرور)' },
        { status: 400 }
      );
    }

    const cleanPhone = sanitizeInput(phone.trim());
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'رقم الهاتف غير صحيح، يرجى كتابة رقم هاتف مصري صحيح (مثال: 01012345678)' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل' },
        { status: 400 }
      );
    }

    // 2. Check existing profile by phone
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id, phone')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'رقم الهاتف مسجل بالفعل! يرجى تسجيل الدخول بدلاً من ذلك' },
        { status: 409 }
      );
    }

    // 3. Hash password
    const hashedPassword = await hashPassword(password);

    // 4. Create profile record in Supabase
    const { data: newProfile, error: dbError } = await supabaseAdmin
      .from('profiles')
      .insert({
        full_name: sanitizeInput(fullName.trim()),
        phone: cleanPhone,
        email: email ? email.trim().toLowerCase() : null,
        password_hash: hashedPassword,
        role: 'STUDENT',
        grade_id: gradeId || null,
        parent_email: parentEmail ? parentEmail.trim() : null,
        is_active: true,
        phone_verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError || !newProfile) {
      console.error('Error creating profile:', dbError);
      return NextResponse.json(
        { error: 'حدث خطأ أثناء حفظ الحساب في قاعدة البيانات: ' + (dbError?.message || 'خطأ غير معروف') },
        { status: 500 }
      );
    }

    // 5. Generate Auth Tokens
    const tokenPayload = {
      userId: newProfile.id,
      phone: newProfile.phone,
      role: newProfile.role,
      fullName: newProfile.full_name,
    };

    const accessToken = await createAccessToken(tokenPayload);
    const refreshToken = await createRefreshToken(tokenPayload);

    // 6. Set Cookies & DB Session
    await setAuthCookies(accessToken, refreshToken);
    
    const userAgent = req.headers.get('user-agent') || undefined;
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || undefined;
    await createSessionRecord(newProfile.id, refreshToken, userAgent, ipAddress);

    return NextResponse.json({
      success: true,
      user: {
        id: newProfile.id,
        fullName: newProfile.full_name,
        phone: newProfile.phone,
        role: newProfile.role,
        gradeId: newProfile.grade_id,
      },
    });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع في خادم المصادقة' },
      { status: 500 }
    );
  }
}
