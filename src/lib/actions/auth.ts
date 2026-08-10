'use server';

import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase/client';
import { readJSON, writeJSON } from '@/lib/store/db';
import { sanitizeInput } from '@/lib/security';

export interface UserSession {
  id: string;
  fullName: string;
  phone: string;
  parentPhone?: string;
  governorate?: string;
  email?: string;
  password?: string;
  role: 'ADMIN' | 'STUDENT';
  gradeName?: string;
  activeSessionId?: string;
  createdAt: string;
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  path: '/',
  maxAge: 60 * 60 * 24 * 365, // 365 Days persistent session
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

const INITIAL_USERS: Record<string, UserSession> = {
  '01008901896': {
    id: 'adm_01008901896',
    fullName: 'م/ رضا خيرت',
    phone: '01008901896',
    email: 'Khyratreda@gmail.com',
    password: 'Reda@Kheyrat#2026!',
    governorate: 'الدقهلية - منية النصر - النزل',
    role: 'ADMIN',
    activeSessionId: 'sess_admin_fixed',
    createdAt: new Date().toISOString(),
  },
  'admin_almohands': {
    id: 'adm_01008901896',
    fullName: 'م/ رضا خيرت',
    phone: '01008901896',
    email: 'Khyratreda@gmail.com',
    password: 'Reda@Kheyrat#2026!',
    governorate: 'الدقهلية - منية النصر - النزل',
    role: 'ADMIN',
    activeSessionId: 'sess_admin_fixed',
    createdAt: new Date().toISOString(),
  },
};

function getUsersDb(): Record<string, UserSession> {
  return readJSON<Record<string, UserSession>>('users.json', INITIAL_USERS);
}

function saveUsersDb(users: Record<string, UserSession>): void {
  writeJSON('users.json', users);
}

// Reset/Wipe all registered users and reset database with Admin only
export async function wipeAllUsersAndResetAdmin(): Promise<void> {
  saveUsersDb(INITIAL_USERS);
}

export async function loginUser(
  phoneOrUsername: string,
  passwordInput?: string
): Promise<{ success: boolean; user?: UserSession; message?: string }> {
  try {
    const cleanIdentifier = sanitizeInput(phoneOrUsername.trim());
    if (!cleanIdentifier) return { success: false, message: 'يرجى كتابة رقم الهاتف أو اسم المستخدم بشكل صحيح.' };

    const usersDb = getUsersDb();
    const cleanPassword = passwordInput ? sanitizeInput(passwordInput) : '';

    const isDedicatedAdmin = cleanIdentifier === '01008901896' || cleanIdentifier === 'admin_almohands' || cleanIdentifier === '01000000000';
    const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    let user: UserSession | undefined = usersDb[cleanIdentifier];

    // Password Check for Admin or Registered User with Password
    if (isDedicatedAdmin) {
      if (cleanPassword !== 'Reda@Kheyrat#2026!') {
        return { success: false, message: 'كلمة المرور الخاصة بحساب الأدمن غير صحيحة.' };
      }
      user = INITIAL_USERS['01008901896'];
      user.activeSessionId = newSessionId;
    } else if (user && user.password) {
      if (user.password !== cleanPassword) {
        return { success: false, message: 'كلمة المرور غير صحيحة. يرجى التأكد من البيانات.' };
      }
      user.activeSessionId = newSessionId;
    } else if (!user) {
      // Auto-create student session if first time phone login
      user = {
        id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fullName: `طالب (${cleanIdentifier.slice(-4)})`,
        phone: cleanIdentifier,
        password: cleanPassword,
        role: 'STUDENT',
        gradeName: 'الصف الأول الإعدادي',
        activeSessionId: newSessionId,
        createdAt: new Date().toISOString(),
      };
    } else {
      user.activeSessionId = newSessionId;
    }

    usersDb[cleanIdentifier] = user;
    saveUsersDb(usersDb);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      const { data } = await supabase.from('profiles').select('*').eq('phone', cleanIdentifier).single();
      if (data) {
        user.id = data.id;
        user.fullName = data.full_name;
        user.role = data.role as 'ADMIN' | 'STUDENT';
      }
    }

    cookies().set('almohands_session', JSON.stringify(user), COOKIE_OPTIONS);
    return { success: true, user };
  } catch (error: any) {
    return { success: false, message: error.message || 'فشل تسجيل الدخول' };
  }
}

export async function registerUser(data: {
  fullName: string;
  phone: string;
  parentPhone: string;
  governorate: string;
  password?: string;
  gradeId?: string;
}): Promise<{ success: boolean; user?: UserSession; message?: string }> {
  try {
    const cleanPhone = sanitizeInput(data.phone.trim());
    if (!cleanPhone) return { success: false, message: 'يرجى إدخال رقم الهاتف بشكل صحيح' };

    const isDedicatedAdmin = cleanPhone === '01008901896' || cleanPhone === 'admin_almohands';
    const usersDb = getUsersDb();
    const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newUser: UserSession = {
      id: isDedicatedAdmin ? 'adm_01008901896' : `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fullName: sanitizeInput(data.fullName),
      phone: cleanPhone,
      parentPhone: sanitizeInput(data.parentPhone),
      governorate: sanitizeInput(data.governorate),
      password: data.password ? sanitizeInput(data.password) : undefined,
      role: isDedicatedAdmin ? 'ADMIN' : 'STUDENT',
      gradeName: sanitizeInput(data.gradeId || 'الصف الأول الإعدادي'),
      activeSessionId: newSessionId,
      createdAt: new Date().toISOString(),
    };

    usersDb[cleanPhone] = newUser;
    saveUsersDb(usersDb);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      await supabase.from('profiles').insert([{ id: newUser.id, full_name: newUser.fullName, phone: newUser.phone, parent_phone: newUser.parentPhone, governorate: newUser.governorate, role: newUser.role }]);
    }

    cookies().set('almohands_session', JSON.stringify(newUser), COOKIE_OPTIONS);
    return { success: true, user: newUser };
  } catch (error: any) {
    return { success: false, message: error.message || 'فشل إنشاء الحساب' };
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const sessionCookie = cookies().get('almohands_session');
  if (!sessionCookie?.value) return null;
  try {
    const cookieUser = JSON.parse(sessionCookie.value) as UserSession;
    const usersDb = getUsersDb();
    const serverUser = usersDb[cookieUser.phone];

    // Single Device Session Lock Check
    if (serverUser && serverUser.activeSessionId && cookieUser.activeSessionId) {
      if (serverUser.activeSessionId !== cookieUser.activeSessionId) {
        // Logged in on another device! Terminate current session
        cookies().delete('almohands_session');
        return null;
      }
    }

    return cookieUser;
  } catch {
    return null;
  }
}

export async function getAllRegisteredUsers(): Promise<UserSession[]> {
  const usersDb = getUsersDb();
  return Object.values(usersDb).filter((u) => u.role === 'STUDENT');
}

export async function checkActiveSessionStatus(): Promise<{ valid: boolean; reason?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { valid: false, reason: 'تم فتح حسابك من متصفح أو جهاز آخر في نفس الوقت 🛡️' };
  }
  return { valid: true };
}

export async function logoutUser() {
  cookies().delete('almohands_session');
}
