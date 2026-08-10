'use server';

import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase/client';

export interface UserSession {
  id: string;
  fullName: string;
  phone: string;
  parentPhone?: string;
  governorate?: string;
  email?: string;
  role: 'ADMIN' | 'STUDENT';
  gradeName?: string;
  createdAt: string;
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  path: '/',
  maxAge: 60 * 60 * 24 * 365, // 365 Days persistent session
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

const DEMO_USERS: Record<string, UserSession> = {
  '01000000000': {
    id: 'adm_01000000000',
    fullName: 'م/ رضا خيرت',
    phone: '01000000000',
    email: 'reda.kheyrat@almohands.com',
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
  },
};

export async function loginUser(phone: string): Promise<{ success: boolean; user?: UserSession; message?: string }> {
  try {
    const cleanPhone = phone.trim();
    if (!cleanPhone) return { success: false, message: 'يرجى كتابة رقم الهاتف بشكل صحيح.' };

    const isDedicatedAdmin = cleanPhone === '01000000000';
    let user: UserSession = DEMO_USERS[cleanPhone] ?? {
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fullName: `طالب (${cleanPhone.slice(-4)})`,
      phone: cleanPhone,
      role: isDedicatedAdmin ? 'ADMIN' : 'STUDENT',
      gradeName: 'الصف الأول الإعدادي',
      createdAt: new Date().toISOString(),
    };

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
    const cleanPhone = data.phone.trim();
    const isDedicatedAdmin = cleanPhone === '01000000000';
    const newUser: UserSession = {
      id: isDedicatedAdmin ? 'adm_01000000000' : `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fullName: data.fullName.trim(),
      phone: cleanPhone,
      parentPhone: data.parentPhone.trim(),
      governorate: data.governorate,
      role: isDedicatedAdmin ? 'ADMIN' : 'STUDENT',
      gradeName: data.gradeId || 'الصف الأول الإعدادي',
      createdAt: new Date().toISOString(),
    };

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      await supabase.from('profiles').insert([{ id: newUser.id, full_name: newUser.fullName, phone: newUser.phone, parent_phone: newUser.parentPhone, governorate: newUser.governorate, role: newUser.role }]);
    }

    DEMO_USERS[cleanPhone] = newUser;
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
    return JSON.parse(sessionCookie.value) as UserSession;
  } catch {
    return null;
  }
}

export async function logoutUser() {
  cookies().delete('almohands_session');
}
