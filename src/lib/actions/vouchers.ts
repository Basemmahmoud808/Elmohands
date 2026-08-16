'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/actions/auth';
import { sanitizeInput } from '@/lib/security';
import { ActionResult } from '@/lib/types/actions';
import { AdminVoucherDTO } from '@/lib/types/dashboard';

export interface VoucherCode {
  id: string;
  code: string;
  planName: string;
  durationDays: number;
  status: 'UNUSED' | 'USED' | 'DISABLED';
  createdAt: string;
}

// In-Memory Failed Attempts Rate Limiter Tracker (Per phone)
const FAILED_ATTEMPTS: Record<string, { count: number; lockUntil: number }> = {};

// Fallback in-memory store for offline/sandbox mode
const FALLBACK_VOUCHERS: AdminVoucherDTO[] = [];

/**
 * Generates a batch of unique voucher activation codes and persists them to activation_codes table.
 */
export async function generateVoucherCodes(
  planType: '1month' | 'term' | 'year',
  count: number = 5
): Promise<{ success: boolean; codes: VoucherCode[]; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, codes: [], message: 'غير مصرح. يجب تسجيل الدخول كأدمن لتوليد الأكواد.' };
    }

    const planName = planType === '1month' ? 'اشتراك شهر' : planType === 'term' ? 'اشتراك ترم' : 'اشتراك سنة';
    const durationDays = planType === '1month' ? 30 : planType === 'term' ? 120 : 365;
    const price = planType === '1month' ? 150 : planType === 'term' ? 450 : 850;
    const prefix = planType === '1month' ? 'ALM-M1-' : planType === 'term' ? 'ALM-TR-' : 'ALM-YR-';

    // Find or fetch corresponding plan from Supabase
    let planId: string | null = null;
    try {
      const { data: planData } = await supabaseAdmin
        .from('plans')
        .select('id')
        .eq('duration_days', durationDays)
        .maybeSingle();
      if (planData) {
        planId = planData.id;
      }
    } catch {
      // Plan query fallback
    }

    const generatedCodes: VoucherCode[] = [];
    const dbPayloads: Array<{
      code: string;
      plan_id?: string;
      status: 'UNUSED';
      created_by?: string;
    }> = [];

    for (let i = 0; i < count; i++) {
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const code = `${prefix}${randomSuffix}`;
      const vId = `v-${Date.now()}-${i}`;

      generatedCodes.push({
        id: vId,
        code,
        planName,
        durationDays,
        status: 'UNUSED',
        createdAt: new Date().toISOString(),
      });

      const payload: {
        code: string;
        plan_id?: string;
        status: 'UNUSED';
        created_by?: string;
      } = {
        code,
        status: 'UNUSED',
      };
      if (planId) payload.plan_id = planId;
      if (user.id) payload.created_by = user.id;

      dbPayloads.push(payload);

      FALLBACK_VOUCHERS.unshift({
        id: vId,
        code,
        planId: planId || 'p-default',
        planName,
        durationDays,
        price,
        status: 'UNUSED',
        createdAt: new Date().toISOString(),
      });
    }

    try {
      const { error: insertErr } = await supabaseAdmin
        .from('activation_codes')
        .insert(dbPayloads);

      if (insertErr) {
        console.warn('activation_codes insert error:', insertErr.message);
      } else {
        // Record audit log
        await supabaseAdmin.from('audit_logs').insert({
          user_id: user.id,
          action: 'VOUCHERS_GENERATED',
          entity_type: 'activation_codes',
          metadata: { planName, count, durationDays },
        });
      }
    } catch (e) {
      console.warn('Exception persisting activation codes:', e);
    }

    return { success: true, codes: generatedCodes, message: `تم توليد ${count} كود بنجاح!` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'فشل توليد الأكواد';
    return { success: false, codes: [], message: errorMsg };
  }
}

/**
 * Standard typed action to generate vouchers.
 */
export async function generateVouchersAction(
  inputOrPlanType: { planId?: string; count?: number } | '1month' | 'term' | 'year',
  countParam?: number
): Promise<ActionResult<AdminVoucherDTO[]>> {
  let pType: '1month' | 'term' | 'year' = '1month';
  let cnt = 5;

  if (typeof inputOrPlanType === 'string') {
    pType = inputOrPlanType;
    cnt = countParam || 5;
  } else if (inputOrPlanType) {
    cnt = inputOrPlanType.count || 5;
  }

  const res = await generateVoucherCodes(pType, cnt);
  if (!res.success) {
    return { success: false, error: res.message || 'فشل توليد الأكواد' };
  }

  const dtos: AdminVoucherDTO[] = res.codes.map((c) => ({
    id: c.id,
    code: c.code,
    planId: 'p-gen',
    planName: c.planName,
    durationDays: c.durationDays,
    price: c.durationDays === 30 ? 150 : c.durationDays === 120 ? 450 : 850,
    status: 'UNUSED',
    createdAt: c.createdAt,
  }));

  return { success: true, data: dtos, message: res.message };
}

/**
 * Redeems an activation code for the authenticated student, creating or extending their subscription.
 */
export async function redeemVoucherCode(
  inputCode: string
): Promise<{ success: boolean; message: string; durationDays?: number; newExpiresAt?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً لتفعيل كود الشحن.' };
    }

    const userKey = user.phone;
    const now = Date.now();

    // Check Rate Limit Lock
    if (FAILED_ATTEMPTS[userKey]) {
      if (now < FAILED_ATTEMPTS[userKey].lockUntil) {
        const remainingMinutes = Math.ceil((FAILED_ATTEMPTS[userKey].lockUntil - now) / 60000);
        return {
          success: false,
          message: `عفواً، تم إيقاف محاولات الشحن مؤقتاً على حسابك لمدة ${remainingMinutes} دقيقة لحظر التخمين التلقائي.`,
        };
      } else {
        delete FAILED_ATTEMPTS[userKey];
      }
    }

    const cleanCode = sanitizeInput(inputCode).trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'يرجى إدخال كود الشحن.' };
    }

    interface DbVoucherRecord {
      id: string;
      code: string;
      plan_id?: string | null;
      status: string;
      plans?: { id: string; name: string; duration_days: number } | Array<{ id: string; name: string; duration_days: number }> | null;
    }

    let voucherRecord: DbVoucherRecord | null = null;

    try {
      const { data: dbVoucher } = await supabaseAdmin
        .from('activation_codes')
        .select('id, code, plan_id, status, plans (id, name, duration_days)')
        .eq('code', cleanCode)
        .maybeSingle();

      if (dbVoucher) {
        voucherRecord = dbVoucher as unknown as DbVoucherRecord;
      }
    } catch {
      // Supabase query fallback
    }

    // Check fallback store if not found in DB
    const fallbackItem = FALLBACK_VOUCHERS.find((v) => v.code === cleanCode);

    if (!voucherRecord && !fallbackItem) {
      // Record Failed Attempt
      if (!FAILED_ATTEMPTS[userKey]) {
        FAILED_ATTEMPTS[userKey] = { count: 1, lockUntil: 0 };
      } else {
        FAILED_ATTEMPTS[userKey].count += 1;
      }

      if (FAILED_ATTEMPTS[userKey].count >= 5) {
        FAILED_ATTEMPTS[userKey].lockUntil = now + 15 * 60 * 1000; // 15 Min Lock
        return {
          success: false,
          message: 'تنبيه أمان: تم حظر محاولات الشحن لمدة 15 دقيقة بسبب تكرار إدخال أكواد خاطئة 🛡️',
        };
      }

      const attemptsLeft = 5 - FAILED_ATTEMPTS[userKey].count;
      return {
        success: false,
        message: `كود الشحن غير صحيح. المتبقي لديك ${attemptsLeft} محاولات قبل القفل المؤقت.`,
      };
    }

    const status = voucherRecord?.status || fallbackItem?.status;
    if (status !== 'UNUSED') {
      return {
        success: false,
        message: status === 'USED' ? 'هذا الكود تم استخدامه من قبل بالفعل!' : 'هذا الكود معطل حالياً من إدارة المنصة.',
      };
    }

    // Successful code verification
    delete FAILED_ATTEMPTS[userKey];

    // Determine plan duration
    let durationDays = 30;
    let planName = 'اشتراك شهر';
    let planId: string | null = null;

    const planObj = voucherRecord?.plans ? (Array.isArray(voucherRecord.plans) ? voucherRecord.plans[0] : voucherRecord.plans) : null;

    if (planObj) {
      durationDays = planObj.duration_days;
      planName = planObj.name;
      planId = planObj.id;
    } else if (voucherRecord?.plan_id) {
      planId = voucherRecord.plan_id;
      // Fetch plan
      try {
        const { data: p } = await supabaseAdmin
          .from('plans')
          .select('name, duration_days')
          .eq('id', voucherRecord.plan_id)
          .maybeSingle();
        if (p) {
          durationDays = p.duration_days;
          planName = p.name;
        }
      } catch {
        // use defaults
      }
    } else if (fallbackItem) {
      durationDays = fallbackItem.durationDays;
      planName = fallbackItem.planName;
      planId = fallbackItem.planId;
    } else if (cleanCode.includes('TRM') || cleanCode.includes('TR')) {
      durationDays = 120;
      planName = 'اشتراك ترم';
    } else if (cleanCode.includes('YR')) {
      durationDays = 365;
      planName = 'اشتراك سنة';
    }

    // Check existing active subscription to extend
    let newExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    try {
      const { data: existingSub } = await supabaseAdmin
        .from('subscriptions')
        .select('id, expires_at')
        .eq('student_id', user.id)
        .eq('status', 'ACTIVE')
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingSub && new Date(existingSub.expires_at) > new Date()) {
        newExpiresAt = new Date(new Date(existingSub.expires_at).getTime() + durationDays * 24 * 60 * 60 * 1000);
      }

      // Update code status to USED
      if (voucherRecord) {
        await supabaseAdmin
          .from('activation_codes')
          .update({
            status: 'USED',
            used_by: user.id,
            used_at: new Date().toISOString(),
          })
          .eq('id', voucherRecord.id);
      }

      // Insert subscription record
      await supabaseAdmin.from('subscriptions').insert({
        student_id: user.id,
        plan_id: planId,
        status: 'ACTIVE',
        starts_at: new Date().toISOString(),
        expires_at: newExpiresAt.toISOString(),
        source: 'CODE',
        activation_code_id: voucherRecord?.id || null,
      });

      // Audit Log
      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        action: 'VOUCHER_REDEEMED',
        entity_type: 'activation_codes',
        entity_id: voucherRecord?.id || null,
        metadata: { code: cleanCode, planName, durationDays, newExpiresAt: newExpiresAt.toISOString() },
      });
    } catch (e) {
      console.warn('Exception updating DB for voucher redemption:', e);
    }

    // Update in-memory fallback store
    if (fallbackItem) {
      fallbackItem.status = 'USED';
      fallbackItem.usedByName = user.fullName;
      fallbackItem.usedByPhone = user.phone;
      fallbackItem.usedAt = new Date().toISOString();
    }

    return {
      success: true,
      message: `تم تفعيل كود الشحن بنجاح! تم تمديد اشتراكك (${planName}) لمدة ${durationDays} يوماً حتى ${newExpiresAt.toLocaleDateString('ar-EG')}.`,
      durationDays,
      newExpiresAt: newExpiresAt.toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'حدث خطأ أثناء تفعيل الكود.';
    return { success: false, message: errorMsg };
  }
}

/**
 * Typed Server Action for redeeming voucher code.
 */
export async function redeemVoucherAction(
  code: string
): Promise<ActionResult<{ planName: string; durationDays: number; newExpiresAt: string }>> {
  const res = await redeemVoucherCode(code);
  if (!res.success) {
    return { success: false, error: res.message };
  }
  return {
    success: true,
    data: {
      planName: res.message.includes('ترم') ? 'اشتراك ترم' : res.message.includes('سنة') ? 'اشتراك سنة' : 'اشتراك شهر',
      durationDays: res.durationDays || 30,
      newExpiresAt: res.newExpiresAt || new Date().toISOString(),
    },
    message: res.message,
  };
}

/**
 * Fetches all vouchers for Admin management table with status and plan details.
 */
export async function getAllVouchers(): Promise<VoucherCode[]> {
  try {
    const { data: dbVouchers } = await supabaseAdmin
      .from('activation_codes')
      .select('id, code, status, created_at, plans (name, duration_days)')
      .order('created_at', { ascending: false });

    if (dbVouchers && dbVouchers.length > 0) {
      return dbVouchers.map((v: { id: string; code: string; status?: string; created_at?: string; plans?: { name?: string; duration_days?: number } | Array<{ name?: string; duration_days?: number }> }) => {
        const planObj = Array.isArray(v.plans) ? v.plans[0] : v.plans;
        return {
          id: v.id,
          code: v.code,
          planName: planObj?.name || 'اشتراك شهر',
          durationDays: planObj?.duration_days || 30,
          status: (v.status as 'UNUSED' | 'USED' | 'DISABLED') || 'UNUSED',
          createdAt: v.created_at || new Date().toISOString(),
        };
      });
    }
  } catch {
    // fallback
  }

  return FALLBACK_VOUCHERS.map((v) => ({
    id: v.id,
    code: v.code,
    planName: v.planName,
    durationDays: v.durationDays,
    status: v.status,
    createdAt: v.createdAt,
  }));
}

/**
 * Standard typed action for admin voucher list.
 */
export async function getAdminVouchersListAction(
  statusFilter?: 'ALL' | 'UNUSED' | 'USED' | 'DISABLED'
): Promise<ActionResult<AdminVoucherDTO[]>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح للوصول إلى بيانات الأكواد' };
    }

    let query = supabaseAdmin
      .from('activation_codes')
      .select(`
        id,
        code,
        plan_id,
        status,
        used_at,
        created_at,
        plans (id, name, duration_days, price),
        profiles:used_by (id, full_name, phone)
      `)
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'ALL') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Fallback
      let result = [...FALLBACK_VOUCHERS];
      if (statusFilter && statusFilter !== 'ALL') {
        result = result.filter((v) => v.status === statusFilter);
      }
      return { success: true, data: result };
    }

    const items: AdminVoucherDTO[] = (data as unknown as Array<{
      id: string;
      code: string;
      plan_id?: string | null;
      status: string;
      used_at?: string | null;
      created_at?: string;
      plans?: { id?: string; name?: string; duration_days?: number; price?: number } | Array<{ id?: string; name?: string; duration_days?: number; price?: number }> | null;
      profiles?: { id?: string; full_name?: string; phone?: string } | Array<{ id?: string; full_name?: string; phone?: string }> | null;
    }>).map((row) => {
      const planObj = Array.isArray(row.plans) ? row.plans[0] : row.plans;
      const userObj = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return {
        id: row.id,
        code: row.code,
        planId: row.plan_id || planObj?.id || '',
        planName: planObj?.name || 'اشتراك شهر',
        durationDays: planObj?.duration_days || 30,
        price: planObj?.price || 150,
        status: row.status as 'UNUSED' | 'USED' | 'DISABLED',
        usedById: userObj?.id || null,
        usedByName: userObj?.full_name || null,
        usedByPhone: userObj?.phone || null,
        usedAt: row.used_at || null,
        createdAt: row.created_at || new Date().toISOString(),
      };
    });

    return { success: true, data: items };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'فشل جلب قائمة الأكواد';
    return { success: false, error: errorMsg };
  }
}

export async function getAllVouchersAction(
  statusFilter?: 'ALL' | 'UNUSED' | 'USED' | 'DISABLED'
): Promise<ActionResult<AdminVoucherDTO[]>> {
  return getAdminVouchersListAction(statusFilter);
}

/**
 * Toggles a voucher status between UNUSED and DISABLED (Admin only).
 */
export async function toggleVoucherStatusAction(
  voucherId: string,
  newStatus: 'UNUSED' | 'DISABLED'
): Promise<ActionResult<{ voucherId: string; status: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بتعديل حالة الأكواد' };
    }

    const { error } = await supabaseAdmin
      .from('activation_codes')
      .update({ status: newStatus })
      .eq('id', voucherId);

    if (error) {
      console.warn('DB update voucher error:', error.message);
    }

    const target = FALLBACK_VOUCHERS.find((v) => v.id === voucherId);
    if (target) {
      target.status = newStatus;
    }

    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'VOUCHER_STATUS_TOGGLED',
      entity_type: 'activation_codes',
      entity_id: voucherId,
      metadata: { newStatus },
    });

    return { success: true, data: { voucherId, status: newStatus }, message: `تم تحديث حالة الكود بنجاح.` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'فشل تعديل حالة الكود';
    return { success: false, error: errorMsg };
  }
}
