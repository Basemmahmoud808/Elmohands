'use server';

import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/actions/auth';

export interface VoucherCode {
  id: string;
  code: string;
  planName: string;
  durationDays: number;
  status: 'UNUSED' | 'USED' | 'DISABLED';
  createdAt: string;
}

const VOUCHER_STORE: VoucherCode[] = [
  { id: 'v-1', code: 'ALM-M1-8K9X2P', planName: 'اشتراك شهر', durationDays: 30, status: 'UNUSED', createdAt: new Date().toISOString() },
  { id: 'v-2', code: 'ALM-TR-4L2P9A', planName: 'اشتراك ترم', durationDays: 120, status: 'UNUSED', createdAt: new Date().toISOString() },
  { id: 'v-3', code: 'ALM-YR-9Z7W1M', planName: 'اشتراك سنة', durationDays: 365, status: 'UNUSED', createdAt: new Date().toISOString() },
];

// In-Memory Failed Attempts Rate Limiter Tracker
const FAILED_ATTEMPTS: Record<string, { count: number; lockUntil: number }> = {};

export async function generateVoucherCodes(
  planType: '1month' | 'term' | 'year',
  count: number = 5
): Promise<{ success: boolean; codes: VoucherCode[]; message?: string }> {
  try {
    const planName = planType === '1month' ? 'اشتراك شهر' : planType === 'term' ? 'اشتراك ترم' : 'اشتراك سنة';
    const durationDays = planType === '1month' ? 30 : planType === 'term' ? 120 : 365;
    const prefix = planType === '1month' ? 'ALM-M1-' : planType === 'term' ? 'ALM-TR-' : 'ALM-YR-';

    const newCodes: VoucherCode[] = Array.from({ length: count }, (_, i) => ({
      id: `v-${Date.now()}-${i}`,
      code: `${prefix}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      planName,
      durationDays,
      status: 'UNUSED',
      createdAt: new Date().toISOString(),
    }));

    VOUCHER_STORE.unshift(...newCodes);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      await supabase.from('activation_codes').insert(newCodes.map((c) => ({ code: c.code, status: 'UNUSED' })));
    }

    return { success: true, codes: newCodes };
  } catch (error: any) {
    return { success: false, codes: [], message: error.message || 'فشل توليد الأكواد' };
  }
}

export async function redeemVoucherCode(
  inputCode: string
): Promise<{ success: boolean; message: string; durationDays?: number }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: 'يرجى تسجيل الدخول أولاً لتفعيل كود الشحن.' };

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
        // Lock expired, reset tracker
        delete FAILED_ATTEMPTS[userKey];
      }
    }

    const cleanCode = inputCode.trim().toUpperCase();
    const voucher = VOUCHER_STORE.find((v) => v.code === cleanCode);

    if (!voucher || voucher.status !== 'UNUSED') {
      // Record Failed Attempt
      if (!FAILED_ATTEMPTS[userKey]) {
        FAILED_ATTEMPTS[userKey] = { count: 1, lockUntil: 0 };
      } else {
        FAILED_ATTEMPTS[userKey].count += 1;
      }

      if (FAILED_ATTEMPTS[userKey].count >= 5) {
        FAILED_ATTEMPTS[userKey].lockUntil = now + 15 * 60 * 1000; // 15 Minutes Lock
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

    // Success: Reset Failed Attempts Tracker
    delete FAILED_ATTEMPTS[userKey];
    voucher.status = 'USED';

    return {
      success: true,
      message: `تم تفعيل كود الشحن بنجاح! تم تمديد اشتراكك (${voucher.planName}) لمدة ${voucher.durationDays} يوماً.`,
      durationDays: voucher.durationDays,
    };
  } catch (error: any) {
    return { success: false, message: error.message || 'حدث خطأ أثناء تفعيل الكود.' };
  }
}

export async function getAllVouchers(): Promise<VoucherCode[]> {
  return VOUCHER_STORE;
}
