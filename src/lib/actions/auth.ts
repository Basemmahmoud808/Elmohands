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
    governorate: 'الدقهلية - منية النصر - النزل',
    role: 'ADMIN',
    activeSessionId: 'sess_admin_fixed',
    createdAt: new Date().toISOString(),
  },
  '01000000000': {
    id: 'adm_01000000000',
    fullName: 'م/ رضا خيرت',
    phone: '01000000000',
    email: 'Khyratreda@gmail.com',
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

export async function loginUser(phone: string): Promise<{ success: boolean; user?: UserSession; message?: string }> {
  try {
    const cleanPhone = sanitizeInput(phone.trim());
    if (!cleanPhone) return { success: false, message: 'يرجى كتابة رقم الهاتف بشكل صحيح.' };

    const usersDb = getUsersDb();
    const isDedicatedAdmin = cleanPhone === '01008901896' || cleanPhone === '01000000000';
    const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    let user: UserSession;
    if (usersDb[cleanPhone]) {
      user = {
        ...usersDb[cleanPhone],
        activeSessionId: newSessionId,
      };
    } else {
      user = {
        id: isDedicatedAdmin ? 'adm_01000000000' : `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fullName: isDedicatedAdmin ? 'م/ رضا خيرت' : `طالب (${cleanPhone.slice(-4)})`,
        phone: cleanPhone,
        role: isDedicatedAdmin ? 'ADMIN' : 'STUDENT',
        gradeName: 'الصف الأول الإعدادي',
        activeSessionId: newSessionId,
        createdAt: new Date().toISOString(),
      };
    }

    usersDb[cleanPhone] = user;
    saveUsersDb(usersDb);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      const { data } = await supabase.from('profiles').select('*').eq('phone', cleanPhone).single();
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
  gradeId?: string;
}): Promise<{ success: boolean; user?: UserSession; message?: string }> {
  try {
    const cleanPhone = sanitizeInput(data.phone.trim());
    if (!cleanPhone) return { success: false, message: 'يرجى إدخال رقم الهاتف بشكل صحيح' };

    const isDedicatedAdmin = cleanPhone === '01008901896' || cleanPhone === '01000000000';
    const usersDb = getUsersDb();
    const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newUser: UserSession = {
      id: isDedicatedAdmin ? 'adm_01000000000' : `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fullName: sanitizeInput(data.fullName),
      phone: cleanPhone,
      parentPhone: sanitizeInput(data.parentPhone),
      governorate: sanitizeInput(data.governorate),
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
  return Object.values(usersDb);
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
