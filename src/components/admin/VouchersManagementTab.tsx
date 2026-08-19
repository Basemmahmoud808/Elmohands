'use client';

import React, { useState } from 'react';
import { AdminVoucherDTO } from '@/lib/types/dashboard';
import { generateVoucherCodes, toggleVoucherStatusAction } from '@/lib/actions/vouchers';
import {
  KeyRound,
  Sparkles,
  Copy,
  Check,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

interface VouchersManagementTabProps {
  initialVouchers: AdminVoucherDTO[];
  onRefresh?: () => void;
}

export function VouchersManagementTab({ initialVouchers, onRefresh }: VouchersManagementTabProps) {
  const [vouchers, setVouchers] = useState<AdminVoucherDTO[]>(initialVouchers);
  const [planType, setPlanType] = useState<'1month' | 'term' | 'year'>('1month');
  const [count, setCount] = useState(5);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNUSED' | 'USED' | 'DISABLED'>('ALL');
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await generateVoucherCodes(planType, count);
      if (res.success && res.codes && res.codes.length > 0) {
        const mapped: AdminVoucherDTO[] = res.codes.map((c) => ({
          id: c.id,
          code: c.code,
          planId: 'p-gen',
          planName: c.planName,
          durationDays: c.durationDays,
          price: c.durationDays === 30 ? 150 : c.durationDays === 120 ? 450 : 850,
          status: 'UNUSED',
          createdAt: c.createdAt,
        }));
        setVouchers((prev) => [...mapped, ...prev]);
        setSuccessMsg(`تم توليد وحفظ ${res.codes.length} كود شحن بنجاح! `);
        if (onRefresh) onRefresh();
      } else {
        setErrorMsg(res.message || 'فشل توليد الأكواد');
      }
    } catch {
      setErrorMsg('حدث خطأ أثناء الاتصال بالسيرفر لتوليد الأكواد');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleExportAll = () => {
    const unusedCodes = filteredVouchers.map((v) => `${v.code} (${v.planName})`).join('\n');
    navigator.clipboard.writeText(unusedCodes);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2500);
  };

  const handleToggleStatus = async (voucherId: string, currentStatus: 'UNUSED' | 'USED' | 'DISABLED') => {
    const nextStatus = currentStatus === 'DISABLED' ? 'UNUSED' : 'DISABLED';
    setVouchers((prev) =>
      prev.map((v) => (v.id === voucherId ? { ...v, status: nextStatus } : v))
    );

    try {
      await toggleVoucherStatusAction(voucherId, nextStatus);
    } catch {
      // Revert on error
      setVouchers((prev) =>
        prev.map((v) => (v.id === voucherId ? { ...v, status: currentStatus } : v))
      );
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (statusFilter === 'ALL') return true;
    return v.status === statusFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
          أكواد الشحن والاشتراكات
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          توليد وتوزيع أكواد تفعيل الاشتراكات للطلاب
        </p>
      </div>

      {/* Generator Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              توليد أكواد جديدة
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              اختر نوع الاشتراك وعدد الأكواد المطلوبة للتوليد الفوري
            </span>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-4 text-xs font-bold">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 space-y-1.5">
              <label className="text-slate-800 dark:text-chalk block">نوع الخطة والاشتراك:</label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value as '1month' | 'term' | 'year')}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
              >
                <option value="1month">اشتراك شهر (30 يوماً — 150 ج.م)</option>
                <option value="term">اشتراك ترم دراسي (120 يوماً — 450 ج.م)</option>
                <option value="year">اشتراك عام دراسي كامل (365 يوماً — 850 ج.م)</option>
              </select>
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-slate-800 dark:text-chalk block">عدد الأكواد المطلوبة:</label>
              <input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(Number(e.target.value) || 5)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
              />
            </div>

            <div className="sm:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={generating}
                className="w-full h-11 rounded-xl text-xs font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover disabled:opacity-50 shadow-cyan-glow transition-all flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التوليد...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>توليد {count} أكواد</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Vouchers Table & Controls */}
      <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-cyan-electric text-black shadow-cyan-glow'
                  : 'text-slate-600 dark:text-chalk-muted'
              }`}
            >
              الكل ({vouchers.length})
            </button>
            <button
              onClick={() => setStatusFilter('UNUSED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'UNUSED'
                  ? 'bg-cyan-electric text-black shadow-cyan-glow'
                  : 'text-slate-600 dark:text-chalk-muted'
              }`}
            >
              المتاحة فقط ({vouchers.filter((v) => v.status === 'UNUSED').length})
            </button>
            <button
              onClick={() => setStatusFilter('USED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'USED'
                  ? 'bg-cyan-electric text-black shadow-cyan-glow'
                  : 'text-slate-600 dark:text-chalk-muted'
              }`}
            >
              المستخدمة ({vouchers.filter((v) => v.status === 'USED').length})
            </button>
            <button
              onClick={() => setStatusFilter('DISABLED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'DISABLED'
                  ? 'bg-cyan-electric text-black shadow-cyan-glow'
                  : 'text-slate-600 dark:text-chalk-muted'
              }`}
            >
              المعطلة ({vouchers.filter((v) => v.status === 'DISABLED').length})
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportAll}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-chalk bg-slate-100 dark:bg-slate-800 hover:border-cyan-electric border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            {exportSuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-cyan-electric" />}
            <span>{exportSuccess ? 'تم نسخ الأكواد للمحفظة!' : 'نسخ قائمة الأكواد للطباعة'}</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-black text-slate-500 dark:text-chalk-muted">
                <th className="pb-3 px-3">كود الشحن</th>
                <th className="pb-3 px-3">الخطة والمدة</th>
                <th className="pb-3 px-3">الحالة</th>
                <th className="pb-3 px-3">المستخدم</th>
                <th className="pb-3 px-3 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredVouchers.map((voucher) => (
                <tr key={voucher.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-chalk tracking-wider">
                        {voucher.code}
                      </span>
                      <button
                        onClick={() => handleCopy(voucher.code)}
                        className="p-1 rounded-lg hover:bg-cyan-electric/10 text-cyan-electric transition-colors"
                        title="نسخ الكود"
                      >
                        {copiedCode === voucher.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-xs font-bold text-slate-700 dark:text-chalk/90">
                    <span>{voucher.planName}</span>
                    <span className="text-slate-400 text-[11px] block font-normal">
                      {voucher.durationDays} يوماً ({voucher.price} ج.م)
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    {voucher.status === 'UNUSED' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>متاح للشحن</span>
                      </span>
                    ) : voucher.status === 'USED' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>تم استخدامه</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-500 border border-red-500/30">
                        <XCircle className="w-3 h-3" />
                        <span>معطل</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-xs">
                    {voucher.usedByName ? (
                      <div>
                        <span className="font-bold text-slate-900 dark:text-chalk block">
                          {voucher.usedByName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {voucher.usedByPhone}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-left">
                    {voucher.status !== 'USED' && (
                      <button
                        onClick={() => handleToggleStatus(voucher.id, voucher.status)}
                        className={`text-xs font-bold px-3 py-1 rounded-xl transition-all ${
                          voucher.status === 'DISABLED'
                            ? 'text-emerald-500 hover:bg-emerald-500/10 border border-emerald-500/30'
                            : 'text-red-500 hover:bg-red-500/10 border border-red-500/30'
                        }`}
                      >
                        {voucher.status === 'DISABLED' ? 'تفعيل' : 'تعطيل'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
