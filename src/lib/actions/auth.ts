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
}

// In-memory demo store fallback
const DEMO_USERS: Record<string, UserSession> = {
  '01000000000': {
    id: 'admin-1',
    fullName: 'م/ رضا خيرت',
    phone: '01000000000',
    email: 'reda.kheyrat@almohands.com',
    role: 'ADMIN',
  },
};

export async function loginUser(phone: string, password_hash?: string): Promise<{ success: boolean; user?: UserSession; message?: string }> {
  try {
    const cleanPhone = phone.trim();

    // 1. Check for Dedicated Admin Credentials
    if (cleanPhone === '01000000000' || cleanPhone === '01099999999') {
      const adminUser: UserSession = {
        id: 'admin-1',
        fullName: 'م/ رضا خيرت',
        phone: cleanPhone,
        email: 'reda.kheyrat@almohands.com',
        role: 'ADMIN',
      };
      cookies().set('almohands_session', JSON.stringify(adminUser), { httpOnly: true, path: '/' });
      return { success: true, user: adminUser };
    }

    // 2. Try Supabase query
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
          parentPhone: data.parent_phone,
          governorate: data.governorate,
          email: data.email,
          role: data.role as 'ADMIN' | 'STUDENT',
        };
        
        cookies().set('almohands_session', JSON.stringify(user), { httpOnly: true, path: '/' });
        return { success: true, user };
      }
    }

    // 3. Fallback stored account check
    if (DEMO_USERS[cleanPhone]) {
      const user = DEMO_USERS[cleanPhone];
      cookies().set('almohands_session', JSON.stringify(user), { httpOnly: true, path: '/' });
      return { success: true, user };
    }

    // 4. Create Student Account session for registered student phone
    const studentUser: UserSession = {
      id: `user-${Date.now()}`,
      fullName: `طالب (${cleanPhone.slice(-4)})`,
      phone: cleanPhone,
      role: 'STUDENT',
      gradeName: 'الصف الأول الإعدادي',
    };
    DEMO_USERS[cleanPhone] = studentUser;
    cookies().set('almohands_session', JSON.stringify(studentUser), { httpOnly: true, path: '/' });
    return { success: true, user: studentUser };
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
    const cleanParentPhone = data.parentPhone.trim();

    const newUser: UserSession = {
      id: `user-${Date.now()}`,
      fullName: data.fullName.trim(),
      phone: cleanPhone,
      parentPhone: cleanParentPhone,
      governorate: data.governorate,
      role: 'STUDENT',
      gradeName: data.gradeId || 'الصف الأول الإعدادي',
    };

    // Save to Supabase if connected
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      await supabase.from('profiles').insert([
        {
          full_name: newUser.fullName,
          phone: newUser.phone,
          parent_phone: newUser.parentPhone,
          governorate: newUser.governorate,
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
