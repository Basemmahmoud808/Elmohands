'use server';

import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase/client';

export interface UserSession {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: 'ADMIN' | 'STUDENT';
  gradeName?: string;
}

// In-memory demo store fallback for initial local testing
const DEMO_USERS: Record<string, UserSession> = {
  '01000000000': {
    id: 'admin-1',
    fullName: 'م/ رضا خيرت',
    phone: '01000000000',
    email: 'reda.kheyrat@almohands.com',
    role: 'ADMIN',
  },
  '01012345678': {
    id: 'student-1',
    fullName: 'أحمد محمود',
    phone: '01012345678',
    email: 'ahmed@gmail.com',
    role: 'STUDENT',
    gradeName: 'الصف الأول الإعدادي',
  },
};

export async function loginUser(phone: string, password_hash?: string): Promise<{ success: boolean; user?: UserSession; message?: string }> {
  try {
    const cleanPhone = phone.trim();

    // 1. Try Supabase query
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', cleanPhone)
        .single();

      if (!error && data) {
        const user: UserSession = {
          id: data.id,
          fullName: data.full_name,
          phone: data.phone,
          email: data.email,
          role: data.role as 'ADMIN' | 'STUDENT',
        };
        
        cookies().set('almohands_session', JSON.stringify(user), { httpOnly: true, path: '/' });
        return { success: true, user };
      }
    }

    // 2. Fallback local auth check
    if (DEMO_USERS[cleanPhone]) {
      const user = DEMO_USERS[cleanPhone];
      cookies().set('almohands_session', JSON.stringify(user), { httpOnly: true, path: '/' });
      return { success: true, user };
    }

    // 3. Auto-login as Student if new phone for seamless demo experience
    const newUser: UserSession = {
      id: `user-${Date.now()}`,
      fullName: `طالب (${cleanPhone.slice(-4)})`,
      phone: cleanPhone,
      role: 'STUDENT',
      gradeName: 'الصف الأول الإعدادي',
    };
    DEMO_USERS[cleanPhone] = newUser;
    cookies().set('almohands_session', JSON.stringify(newUser), { httpOnly: true, path: '/' });
    return { success: true, user: newUser };
  } catch (error: any) {
    return { success: false, message: error.message || 'فشل تسجيل الدخول' };
  }
}

export async function registerUser(data: {
  fullName: string;
  phone: string;
  gradeId?: string;
  role?: 'ADMIN' | 'STUDENT';
}): Promise<{ success: boolean; user?: UserSession; message?: string }> {
  try {
    const cleanPhone = data.phone.trim();

    const newUser: UserSession = {
      id: `user-${Date.now()}`,
      fullName: data.fullName.trim(),
      phone: cleanPhone,
      role: data.role || 'STUDENT',
      gradeName: data.gradeId || 'الصف الأول الإعدادي',
    };

    // Try Supabase insert
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      await supabase.from('profiles').insert([
        {
          full_name: newUser.fullName,
          phone: newUser.phone,
          role: newUser.role,
        },
      ]);
    }

    DEMO_USERS[cleanPhone] = newUser;
    cookies().set('almohands_session', JSON.stringify(newUser), { httpOnly: true, path: '/' });
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
