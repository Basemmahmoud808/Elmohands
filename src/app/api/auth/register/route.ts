import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sanitizeInput, checkIpRateLimit } from '@/lib/security';
import {
  hashPassword,
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  createSessionRecord,
} from '@/lib/auth';

import { RegisterSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 0. IP Rate Limiting (Max 5 registration requests per minute per IP)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
    const rateCheck = checkIpRateLimit(`register_${clientIp}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `تم تجاوز الحد المسموح لمحاولات إنشاء الحسابات. يرجى الانتظار ${rateCheck.resetInSeconds} ثانية.` },
        { status: 429 }
      );
    }

    const rawBody = await req.json();

    // Normalize Arabic numbers before schema parsing
    if (typeof rawBody.phone === 'string') {
      rawBody.phone = rawBody.phone.replace(/[٠-٩]/g, (d: string) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()).replace(/\s+/g, '');
    }
    if (typeof rawBody.parentPhone === 'string') {
      rawBody.parentPhone = rawBody.parentPhone.replace(/[٠-٩]/g, (d: string) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()).replace(/\s+/g, '');
    }

    const parseResult = RegisterSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'بيانات التسجيل غير صالحة';
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }

    const { fullName, phone: cleanPhone, parentPhone: cleanParentPhone, email, password, gradeId, parentEmail } = parseResult.data;

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

    // Resolve Grade ID (handle both UUID and Grade Name safely)
    let resolvedGradeId: string | null = null;
    if (gradeId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(gradeId);
      if (isUuid) {
        resolvedGradeId = gradeId;
      } else {
        const { data: matchedGrade } = await supabaseAdmin
          .from('grades')
          .select('id')
          .ilike('name', `%${gradeId}%`)
          .limit(1)
          .maybeSingle();
        if (matchedGrade) {
          resolvedGradeId = matchedGrade.id;
        }
      }
    }

    // 4. Create profile record in Supabase
    const { data: newProfile, error: dbError } = await supabaseAdmin
      .from('profiles')
      .insert({
        full_name: sanitizeInput(fullName.trim()),
        phone: cleanPhone,
        parent_phone: cleanParentPhone,
        email: email ? email.trim().toLowerCase() : null,
        password_hash: hashedPassword,
        role: 'STUDENT',
        grade_id: resolvedGradeId,
        parent_email: parentEmail ? parentEmail.trim() : null,
        is_active: false, // Requires admin approval before login
        phone_verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError || !newProfile) {
      console.error('Error creating profile in database:', dbError);
      return NextResponse.json(
        { error: 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى لاحقاً' },
        { status: 500 }
      );
    }

    // 5. Account created successfully — pending admin approval
    // Do NOT issue tokens or set cookies — student must wait for admin activation
    return NextResponse.json({
      success: true,
      pending_approval: true,
      message: 'تم إنشاء حسابك بنجاح! سيتم مراجعة بياناتك من قِبل الإدارة وتفعيل حسابك خلال فترة قصيرة. يمكنك تسجيل الدخول بعد تلقي إشعار التفعيل.',
      user: {
        id: newProfile.id,
        fullName: newProfile.full_name,
        phone: newProfile.phone,
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
