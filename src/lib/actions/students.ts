'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/actions/auth';
import { ActionResult } from '@/lib/types/actions';
import { AdminStudentDTO } from '@/lib/types/dashboard';
import { getStudentDetails } from '@/lib/actions/dashboard';

/**
 * Fetches list of registered students from Supabase with filters (Admin only).
 */
export async function getStudentsList(params?: {
  search?: string;
  gradeId?: string;
  isActive?: boolean;
}): Promise<ActionResult<AdminStudentDTO[]>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح للوصول إلى قائمة الطلاب' };
    }

    let query = supabaseAdmin
      .from('profiles')
      .select(`
        id, full_name, phone, email, parent_email, is_active, created_at, last_login_at, grade_id,
        grades (name),
        subscriptions (id, status, expires_at, plans (name))
      `)
      .eq('role', 'STUDENT')
      .order('created_at', { ascending: false });

    if (params?.gradeId && params.gradeId !== 'all') {
      query = query.eq('grade_id', params.gradeId);
    }

    if (params?.isActive !== undefined) {
      query = query.eq('is_active', params.isActive);
    }

    const { data, error } = await query;

    if (error || !data) {
      return { success: false, error: error?.message || 'فشل جلب بيانات الطلاب من قاعدة البيانات' };
    }

    const students: AdminStudentDTO[] = (data as unknown as Array<{
      id: string;
      full_name: string;
      phone: string;
      email?: string | null;
      parent_email?: string | null;
      is_active?: boolean | null;
      created_at?: string;
      last_login_at?: string | null;
      grade_id?: string | null;
      grades?: { name?: string } | Array<{ name?: string }> | null;
      subscriptions?: Array<{ id: string; status: string; expires_at: string; plans?: { name?: string } | Array<{ name?: string }> }>;
    }>).map((p) => {
      const gradeObj = Array.isArray(p.grades) ? p.grades[0] : p.grades;
      const subList = Array.isArray(p.subscriptions) ? p.subscriptions : p.subscriptions ? [p.subscriptions] : [];
      const activeSub = subList.find((s) => s.status === 'ACTIVE' && new Date(s.expires_at) > new Date());
      const planObj = activeSub?.plans ? (Array.isArray(activeSub.plans) ? activeSub.plans[0] : activeSub.plans) : null;

      const daysRemaining = activeSub
        ? Math.max(0, Math.ceil((new Date(activeSub.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

      return {
        id: p.id,
        fullName: p.full_name,
        phone: p.phone,
        email: p.email,
        parentEmail: p.parent_email,
        gradeId: p.grade_id,
        gradeName: gradeObj?.name || 'الصف الأول الإعدادي',
        isActive: p.is_active !== false,
        hasActiveSubscription: !!activeSub,
        subscriptionPlanName: activeSub ? planObj?.name || 'اشتراك نشط' : 'غير مشترك',
        subscriptionExpiresAt: activeSub?.expires_at || null,
        daysRemaining,
        createdAt: p.created_at || new Date().toISOString(),
        lastLoginAt: p.last_login_at,
      };
    });

    let finalStudents = students;
    if (params?.search) {
      const s = params.search.toLowerCase();
      finalStudents = finalStudents.filter(
        (std) =>
          std.fullName.toLowerCase().includes(s) ||
          std.phone.includes(s) ||
          (std.parentEmail && std.parentEmail.toLowerCase().includes(s))
      );
    }

    return { success: true, data: finalStudents };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل جلب قائمة الطلاب';
    return { success: false, error: msg };
  }
}

/**
 * Toggles a student's active status (enabling or disabling account) in Supabase.
 */
export async function toggleStudentStatus(
  id: string,
  isActive: boolean
): Promise<ActionResult<{ id: string; isActive: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بتعديل حالة الحساب' };
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: isActive ? 'STUDENT_ACCOUNT_ACTIVATED' : 'STUDENT_ACCOUNT_DEACTIVATED',
      entity_type: 'profiles',
      entity_id: id,
      metadata: { isActive },
    });

    return {
      success: true,
      data: { id, isActive },
      message: isActive ? 'تم تفعيل حساب الطالب بنجاح' : 'تم تعطيل حساب الطالب بنجاح',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تعديل حالة الطالب';
    return { success: false, error: msg };
  }
}

/**
 * Fetches full profile of a student including subscriptions, lessons progress, and quiz attempts.
 */
export async function getStudentFullProfile(id: string) {
  return getStudentDetails(id);
}

// Wrappers for compatibility in "use server" file
export async function getAllStudentsWithDetails(params?: {
  search?: string;
  gradeId?: string;
  isActive?: boolean;
}) {
  return getStudentsList(params);
}

export async function toggleStudentActiveStatusAction(id: string, isActive: boolean) {
  return toggleStudentStatus(id, isActive);
}

