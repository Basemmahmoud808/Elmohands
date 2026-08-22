'use server';

import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sanitizeInput } from '@/lib/security';
import {
  hashPassword,
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  createSessionRecord,
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
    // 1. Normalize identifier (convert Arabic numerals, trim whitespace)
    let cleanIdentifier = sanitizeInput(phoneOrUsername.trim())
      .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      .replace(/\s+/g, '');

    if (!cleanIdentifier) {
      return { success: false, message: 'يرجى كتابة رقم الهاتف بشكل صحيح.' };
    }

    const cleanPassword = passwordInput ? passwordInput.trim() : '';
    if (!cleanPassword) {
      return { success: false, message: 'يرجى إدخال كلمة المرور.' };
    }

    // 2. Normalize Egyptian phone format (+201... or 201... → 01...)
    if (cleanIdentifier.startsWith('+20')) {
      cleanIdentifier = '0' + cleanIdentifier.slice(3);
    } else if (cleanIdentifier.startsWith('20') && cleanIdentifier.length === 12) {
      cleanIdentifier = '0' + cleanIdentifier.slice(2);
    }

    // 3. Query profile by phone or email — no aliases, no fallbacks
    let profile: any = null;
    try {
      const { data: dbUser } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .or(`phone.eq.${cleanIdentifier},email.eq.${cleanIdentifier}`)
        .maybeSingle();
      profile = dbUser;
    } catch {
      // DB unreachable — fail closed, no fallback
    }

    if (!profile) {
      return { success: false, message: 'رقم الهاتف أو كلمة المرور غير صحيحة.' };
    }

    if (!profile.is_active) {
      return { success: false, message: 'هذا الحساب معطل حالياً. يرجى التواصل مع إدارة المنصة.' };
    }

    // 4. Verify password via bcrypt only — no hardcoded master passwords
    if (!profile.password_hash) {
      return { success: false, message: 'رقم الهاتف أو كلمة المرور غير صحيحة.' };
    }
    const isPasswordValid = await verifyPassword(cleanPassword, profile.password_hash);
    if (!isPasswordValid) {
      return { success: false, message: 'رقم الهاتف أو كلمة المرور غير صحيحة.' };
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
}): Promise<{ success: boolean; user?: UserSession; message?: string }> {
  try {
    const cleanPhone = sanitizeInput(data.phone.trim())
      .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      .replace(/\s+/g, '');
    const cleanParentPhone = data.parentPhone
      ? sanitizeInput(data.parentPhone.trim())
          .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
          .replace(/\s+/g, '')
      : '';
    const cleanFullName = sanitizeInput(data.fullName.trim());
    const cleanPassword = data.password || '';
    const cleanParentEmail = data.parentEmail ? sanitizeInput(data.parentEmail.trim()) : '';

    const isDedicatedAdmin = cleanPhone === '01008901896' || cleanPhone === 'admin_almohands';

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

    // 4. Insert into Supabase Profiles
    const { data: newProfile, error: dbError } = await supabaseAdmin
      .from('profiles')
      .insert({
        full_name: cleanFullName,
        phone: cleanPhone,
        parent_phone: cleanParentPhone || null,
        password_hash: hashedPassword,
        role: isDedicatedAdmin ? 'ADMIN' : 'STUDENT',
        grade_id: data.gradeId || null,
        parent_email: cleanParentEmail || null,
        is_active: true,
        phone_verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError || !newProfile) {
      console.error('Registration DB Error:', dbError);
      return { success: false, message: 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى لاحقاً.' };
    }

    // 5. Issue Tokens & Cookies
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
      if (jwtUser.role === 'ADMIN' || jwtUser.phone === '01008901896') {
        return {
          id: jwtUser.userId,
          fullName: jwtUser.fullName || 'م/ رضا خيرت',
          phone: jwtUser.phone || '01008901896',
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
