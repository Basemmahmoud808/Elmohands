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
    const cleanIdentifier = sanitizeInput(phoneOrUsername.trim());
    if (!cleanIdentifier) {
      return { success: false, message: 'يرجى كتابة رقم الهاتف أو اسم المستخدم بشكل صحيح.' };
    }

    const cleanPassword = passwordInput || '';
    if (!cleanPassword) {
      return { success: false, message: 'يرجى إدخال كلمة المرور.' };
    }

    // 1. Special Admin Login
    const isDedicatedAdmin = cleanIdentifier === '01008901896' || cleanIdentifier === 'admin_almohands';
    
    // 2. Fetch from Supabase Profiles Table
    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('phone', cleanIdentifier)
      .maybeSingle();

    if (!profile && isDedicatedAdmin) {
      // Auto-create Admin Profile in Supabase if first run
      const hashedPass = await hashPassword('Reda@Kheyrat#2026!');
      const { data: newAdmin } = await supabaseAdmin
        .from('profiles')
        .insert({
          full_name: 'م/ رضا خيرت',
          phone: '01008901896',
          email: 'Khyratreda@gmail.com',
          password_hash: hashedPass,
          role: 'ADMIN',
          is_active: true,
        })
        .select()
        .single();
      
      profile = newAdmin;
    }

    if (!profile) {
      return { success: false, message: 'هذا الحساب غير مسجل في منصة المهندس. يرجى إنشاء حساب جديد أولاً.' };
    }

    if (!profile.is_active) {
      return { success: false, message: 'هذا الحساب معطل حالياً. يرجى التواصل مع إدارة المنصة.' };
    }

    // 3. Password Verification with Bcrypt
    const isPasswordValid = await verifyPassword(cleanPassword, profile.password_hash);

    if (!isPasswordValid) {
      return { success: false, message: 'كلمة المرور غير صحيحة. يرجى التأكد من البيانات وإعادة المحاولة.' };
    }

    // 4. Update last login
    await supabaseAdmin
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', profile.id);

    // 5. Issue JWT Tokens & Session Cookies
    const tokenPayload = {
      userId: profile.id,
      phone: profile.phone,
      role: profile.role as 'ADMIN' | 'STUDENT',
      fullName: profile.full_name,
    };

    const accessToken = await createAccessToken(tokenPayload);
    const refreshToken = await createRefreshToken(tokenPayload);
    await setAuthCookies(accessToken, refreshToken);
    await createSessionRecord(profile.id, refreshToken);

    const userSession: UserSession = {
      id: profile.id,
      fullName: profile.full_name,
      phone: profile.phone,
      email: profile.email,
      parentEmail: profile.parent_email,
      role: profile.role as 'ADMIN' | 'STUDENT',
      gradeId: profile.grade_id,
      createdAt: profile.created_at || new Date().toISOString(),
    };

    return { success: true, user: userSession };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, message: error.message || 'فشل تسجيل الدخول' };
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
    const cleanPhone = sanitizeInput(data.phone.trim());
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
      return { success: false, message: 'رقم هاتف الطالب غير صحيح! يجب إدخال رقم محمول مصري مكون من 11 رقماً ويبدأ بـ 01.' };
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
      return { success: false, message: 'حدث خطأ في قاعدة البيانات: ' + (dbError?.message || 'تعذر إنشاء الحساب') };
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

    if (!profile) return null;

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

    return { success: true, message: 'تم تحديث كلمة المرور وتأمين الحساب بنجاح 🎯' };
  } catch (err: any) {
    return { success: false, message: err.message || 'فشل تحديث كلمة المرور' };
  }
}
