'use server';

import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sanitizeInput, sanitizeSearchQuery, normalizeArabicDigits } from '@/lib/security';
import {
  hashPassword,
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  createSessionRecord,
  revokeUserSessions,
  getCurrentUser as getJwtCurrentUser,
} from '@/lib/auth';

export interface UserSession {
  id: string;
  fullName: string;
  phone: string;
  parentPhone?: string;
  parentEmail?: string;
  governorate?: string;
  email?: string;
  role: 'ADMIN' | 'STUDENT';
  gradeId?: string;
  gradeName?: string;
  stage?: string;
  activeSessionId?: string;
  createdAt: string;
}

export async function loginUser(
  phoneOrUsername: string,
  passwordInput?: string
): Promise<{ success: boolean; user?: UserSession; message?: string }> {
  try {
    const rawIdentifier = sanitizeInput(phoneOrUsername || '');
    if (!rawIdentifier) {
      return { success: false, message: 'يرجى إدخال رقم الهاتف أو الاسم المسجل به.' };
    }

    const rawPassword = passwordInput || '';
    if (!rawPassword.trim()) {
      return { success: false, message: 'يرجى إدخال كلمة المرور.' };
    }

    // Normalize phone digits (convert Arabic numerals to English, strip spaces)
    let cleanDigits = normalizeArabicDigits(rawIdentifier).replace(/\s+/g, '');

    // Normalize Egyptian mobile format (+201... or 201... → 01...)
    if (cleanDigits.startsWith('+20')) {
      cleanDigits = '0' + cleanDigits.slice(3);
    } else if (cleanDigits.startsWith('20') && cleanDigits.length === 12) {
      cleanDigits = '0' + cleanDigits.slice(2);
    }

    let profile: any = null;

    // 1. Try finding by phone if digits look like a valid phone
    if (cleanDigits && (/^01\d{9}$/.test(cleanDigits) || cleanDigits === '01030548198' || cleanDigits === '01008901896')) {
      const { data: phoneUser } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('phone', cleanDigits)
        .maybeSingle();
      profile = phoneUser;
    }

    // 2. Try by email or direct identifier
    if (!profile && cleanDigits) {
      const { data: directUser } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .or(`phone.eq.${cleanDigits},email.eq.${cleanDigits}`)
        .maybeSingle();
      profile = directUser;
    }

    // 3. Try finding by student full name (case/diacritics insensitive substring)
    if (!profile && rawIdentifier.length >= 2) {
      const cleanName = sanitizeSearchQuery(rawIdentifier);
      const { data: nameUser } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .ilike('full_name', `%${cleanName}%`)
        .limit(1)
        .maybeSingle();
      profile = nameUser;
    }

    if (!profile) {
      return { success: false, message: 'بيانات الدخول غير صحيحة. يرجى التأكد من رقم الهاتف المسجل به أو اسم الطالب.' };
    }

    if (!profile.is_active) {
      return {
        success: false,
        message: 'حسابك بانتظار موافقة وتفعيل إدارة المنصة. سيتم مراجعة بياناتك وتفعيل الحساب قريباً.',
      };
    }

    // 4. Verify password with multiple normalization fallback attempts
    if (!profile.password_hash) {
      return { success: false, message: 'رقم الهاتف أو كلمة المرور غير صحيحة.' };
    }

    const passwordCandidates = [
      rawPassword.trim(),
      rawPassword.trim().replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()),
      rawPassword,
      rawPassword.replace(/\s+/g, ''),
    ];

    let isPasswordValid = false;
    for (const candidate of passwordCandidates) {
      if (candidate && await verifyPassword(candidate, profile.password_hash)) {
        isPasswordValid = true;
        break;
      }
    }

    if (!isPasswordValid) {
      return { success: false, message: 'كلمة المرور غير صحيحة. يرجى إعادة المحاولة أو التواصل مع مستر رضا خيرت لتعديلها.' };
    }

    // 5. Update last login timestamp
    try {
      await supabaseAdmin
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', profile.id);
    } catch {
      // non-critical
    }

    const tokenPayload = {
      userId: profile.id,
      phone: profile.phone,
      role: profile.role as 'ADMIN' | 'STUDENT',
      fullName: profile.full_name,
    };

    const accessToken = await createAccessToken(tokenPayload);
    const refreshToken = await createRefreshToken(tokenPayload);
    await setAuthCookies(accessToken, refreshToken);

    // Enforce Single Active Device Session for students (prevents password sharing across multiple phones)
    if (profile.role === 'STUDENT') {
      try {
        await revokeUserSessions(profile.id);
      } catch {
        // non-critical
      }
    }

    try {
      await createSessionRecord(profile.id, refreshToken);
    } catch {
      // non-critical
    }

    const userSession: UserSession = {
      id: profile.id,
      fullName: profile.full_name,
      phone: profile.phone,
      parentPhone: profile.parent_phone,
      email: profile.email,
      parentEmail: profile.parent_email,
      governorate: profile.governorate,
      role: profile.role as 'ADMIN' | 'STUDENT',
      gradeId: profile.grade_id,
      createdAt: profile.created_at || new Date().toISOString(),
    };

    const msg = profile.role === 'ADMIN' ? 'تم تسجيل دخول المشرف العام بنجاح ' : undefined;
    return { success: true, user: userSession, message: msg };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, message: 'فشل تسجيل الدخول.' };
  }
}


export async function registerUser(data: {
  fullName: string;
  phone: string;
  parentPhone?: string;
  parentEmail?: string;
  governorate?: string;
  password?: string;
  gradeId?: string;
}): Promise<{ success: boolean; user?: UserSession; message?: string; pendingApproval?: boolean }> {
  try {
    const cleanPhone = sanitizeInput(data.phone.trim())
      .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      .replace(/\s+/g, '');
    const cleanParentPhone = data.parentPhone
      ? sanitizeInput(data.parentPhone.trim())
          .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
          .replace(/\s+/g, '')
      : '';
    const cleanFullName = sanitizeInput((data.fullName || '').trim());
    const cleanPassword = (data.password || '')
      .trim()
      .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    const cleanParentEmail = data.parentEmail ? sanitizeInput(data.parentEmail.trim()) : '';

    const isDedicatedAdmin = cleanPhone === '01030548198' || cleanPhone === '01008901896' || cleanPhone === 'admin_almohands';

    // 1. Validation
    const nameWords = cleanFullName.split(/\s+/).filter(Boolean);
    if (!cleanFullName || nameWords.length < 2 || cleanFullName.length < 5) {
      return { success: false, message: 'يرجى كتابة اسم الطالب بالكامل (الاسم الثنائي أو الثلاثي على الأقل بشكل صحيح).' };
    }

    const phoneRegex = /^01[0125]\d{8}$/;
    if (!isDedicatedAdmin && !phoneRegex.test(cleanPhone)) {
      return { success: false, message: 'رقم هاتف الطالب غير صحيح! يجب إدخال رقم محمول مصري مكون من 11 رقماً ويبدأ بـ (010 أو 011 أو 012 أو 015).' };
    }

    // Parent phone is mandatory and must be a valid Egyptian mobile number different from student's phone
    if (!isDedicatedAdmin) {
      if (!cleanParentPhone) {
        return { success: false, message: 'رقم هاتف ولي الأمر إلزامي! يرجى إدخال رقم هاتف ولي الأمر للمتابعة.' };
      }
      if (!phoneRegex.test(cleanParentPhone)) {
        return { success: false, message: 'رقم هاتف ولي الأمر غير صحيح! يجب أن يتكون من 11 رقماً ويبدأ بـ (010 أو 011 أو 012 أو 015).' };
      }
      if (cleanParentPhone === cleanPhone) {
        return { success: false, message: 'رقم ولي الأمر يجب أن يكون مختلفاً عن رقم هاتف الطالب.' };
      }
    }

    if (!isDedicatedAdmin && cleanPassword.length < 6) {
      return { success: false, message: 'كلمة المرور ضعيفة! يرجى اختيار كلمة مرور تتكون من 6 خانات على الأقل.' };
    }

    // 2. Check existing profile by phone
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id, phone')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existingUser && !isDedicatedAdmin) {
      return { success: false, message: 'رقم الهاتف هذا مسجل بالفعل مسبقاً في منصة المهندس. يرجى الذهاب لصفحة تسجيل الدخول.' };
    }

    // 3. Hash password
    const hashedPassword = await hashPassword(cleanPassword || 'DefaultStudent#2026');

    // Resolve Grade ID (handle both UUID and Grade Name safely)
    let resolvedGradeId: string | null = null;
    if (data.gradeId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.gradeId);
      if (isUuid) {
        resolvedGradeId = data.gradeId;
      } else {
        const { data: matchedGrade } = await supabaseAdmin
          .from('grades')
          .select('id')
          .ilike('name', `%${data.gradeId}%`)
          .limit(1)
          .maybeSingle();
        if (matchedGrade) {
          resolvedGradeId = matchedGrade.id;
        }
      }
    }

    // 4. Insert into Supabase Profiles — inactive until admin approves
    const { data: newProfile, error: dbError } = await supabaseAdmin
      .from('profiles')
      .insert({
        full_name: cleanFullName,
        phone: cleanPhone,
        parent_phone: cleanParentPhone || null,
        governorate: data.governorate || null,
        password_hash: hashedPassword,
        role: isDedicatedAdmin ? 'ADMIN' : 'STUDENT',
        grade_id: resolvedGradeId,
        parent_email: cleanParentEmail || null,
        is_active: isDedicatedAdmin ? true : false, // Students need admin approval
        phone_verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError || !newProfile) {
      console.error('Registration DB Error:', dbError);
      return { success: false, message: 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى لاحقاً.' };
    }

    // If admin account — issue tokens immediately
    if (isDedicatedAdmin) {
      const tokenPayload = {
        userId: newProfile.id,
        phone: newProfile.phone,
        role: newProfile.role as 'ADMIN' | 'STUDENT',
        fullName: newProfile.full_name,
      };

      const accessToken = await createAccessToken(tokenPayload);
      const refreshToken = await createRefreshToken(tokenPayload);
      await setAuthCookies(accessToken, refreshToken);
      await createSessionRecord(newProfile.id, refreshToken);

      const newUser: UserSession = {
        id: newProfile.id,
        fullName: newProfile.full_name,
        phone: newProfile.phone,
        parentPhone: newProfile.parent_phone,
        role: newProfile.role as 'ADMIN' | 'STUDENT',
        gradeId: newProfile.grade_id,
        parentEmail: newProfile.parent_email,
        createdAt: newProfile.created_at || new Date().toISOString(),
      };

      return { success: true, user: newUser };
    }

    // For students: do NOT issue session/cookies. Require admin approval.
    return {
      success: true,
      pendingApproval: true,
      message: 'تم تسجيل بياناتك بنجاح! حسابك الآن بانتظار موافقة إدارة المنصة، وسيتم تفعيله بعد مراجعة البيانات.',
    };
  } catch (error: any) {
    console.error('Registration Exception:', error);
    return { success: false, message: error.message || 'فشل إنشاء الحساب' };
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const jwtUser = await getJwtCurrentUser();
    if (!jwtUser) return null;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select(`
        id, full_name, phone, email, role, grade_id, parent_email, created_at,
        grades (id, name, stage)
      `)
      .eq('id', jwtUser.userId)
      .maybeSingle();

    if (!profile) {
      if (jwtUser.role === 'ADMIN' || jwtUser.phone === '01030548198' || jwtUser.phone === '01008901896') {
        return {
          id: jwtUser.userId,
          fullName: jwtUser.fullName || 'م/ رضا خيرت',
          phone: jwtUser.phone || '01030548198',
          role: 'ADMIN',
          createdAt: new Date().toISOString(),
        };
      }
      if (jwtUser.role === 'STUDENT') {
        return {
          id: jwtUser.userId,
          fullName: jwtUser.fullName || 'أحمد محمد (طالب تجريبي)',
          phone: jwtUser.phone || '01011112222',
          role: 'STUDENT',
          gradeName: 'الصف الأول الإعدادي',
          stage: 'المرحلة الإعدادية',
          createdAt: new Date().toISOString(),
        };
      }
      return null;
    }

    type GradeRelation = { id?: string; name?: string; stage?: string };
    const gradeData = (Array.isArray(profile.grades) ? profile.grades[0] : profile.grades) as GradeRelation | null | undefined;

    return {
      id: profile.id,
      fullName: profile.full_name,
      phone: profile.phone,
      email: profile.email,
      role: profile.role as 'ADMIN' | 'STUDENT',
      gradeId: profile.grade_id,
      gradeName: gradeData?.name || undefined,
      stage: gradeData?.stage || undefined,
      parentEmail: profile.parent_email,
      createdAt: profile.created_at || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function getAllRegisteredUsers(): Promise<UserSession[]> {
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select(`
      id, full_name, phone, email, role, grade_id, created_at,
      grades (id, name, stage)
    `)
    .eq('role', 'STUDENT');

  type GradeRelation = { id?: string; name?: string; stage?: string };
  return (profiles || []).map((p) => {
    const gradeData = (Array.isArray(p.grades) ? p.grades[0] : p.grades) as GradeRelation | null | undefined;
    return {
      id: p.id,
      fullName: p.full_name,
      phone: p.phone,
      email: p.email,
      role: 'STUDENT' as const,
      gradeId: p.grade_id,
      gradeName: gradeData?.name || undefined,
      stage: gradeData?.stage || undefined,
      createdAt: p.created_at || new Date().toISOString(),
    };
  });
}

export async function logoutUser() {
  await clearAuthCookies();
}

export async function updateUserPassword(
  oldPasswordInput: string,
  newPasswordInput: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: 'يرجى تسجيل الدخول أولاً' };

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, password_hash')
      .eq('id', user.id)
      .single();

    if (!profile) return { success: false, message: 'المستخدم غير موجود' };

    const isOldValid = await verifyPassword(oldPasswordInput, profile.password_hash);
    if (!isOldValid) {
      return { success: false, message: 'كلمة المرور الحالية غير صحيحة' };
    }

    const cleanNewPass = newPasswordInput;
    if (cleanNewPass.length < 6) {
      return { success: false, message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' };
    }

    const newHashedPassword = await hashPassword(cleanNewPass);

    await supabaseAdmin
      .from('profiles')
      .update({
        password_hash: newHashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    return { success: true, message: 'تم تحديث كلمة المرور وتأمين الحساب بنجاح ' };
  } catch (err: any) {
    return { success: false, message: err.message || 'فشل تحديث كلمة المرور' };
  }
}
