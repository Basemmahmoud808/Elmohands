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

    const cleanCode = inputCode.trim().toUpperCase();
    const voucher = VOUCHER_STORE.find((v) => v.code === cleanCode);

    if (!voucher) return { success: false, message: 'كود الشحن غير صحيح. يرجى التأكد من كتابته بشكل صحيح.' };
    if (voucher.status === 'USED') return { success: false, message: 'عفواً، تم استخدام كود الشحن هذا من قبل.' };
    if (voucher.status === 'DISABLED') return { success: false, message: 'عفواً، هذا الكود ملغى وغير متاح للتفعيل.' };

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
