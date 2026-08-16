'use client';

import React, { useState } from 'react';
import { KeyRound, Sparkles, CheckCircle2, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { redeemVoucherCode } from '@/lib/actions/vouchers';

interface VoucherActivationCardProps {
  onVoucherRedeemed?: (durationDays: number) => void;
}

export function VoucherActivationCard({ onVoucherRedeemed }: VoucherActivationCardProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await redeemVoucherCode(clean);
      setFeedback({
        success: res.success,
        message: res.message,
      });

      if (res.success) {
        setCode('');
        if (onVoucherRedeemed && res.durationDays) {
          onVoucherRedeemed(res.durationDays);
        }
      }
    } catch {
      setFeedback({
        success: false,
        message: 'حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 max-w-3xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="w-12 h-12 rounded-2xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">
            شحن وتفعيل كود الاشتراك
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-chalk-muted mt-0.5">
            أدخل كود الشحن المستلم من السنتر أو عبر الواتساب لتمديد اشتراكك فوراً
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-800 dark:text-chalk flex items-center gap-2">
            <span>كود الشحن المكون من أرقام وحروف:</span>
            <span className="text-[11px] font-normal text-slate-500 dark:text-chalk-muted">
              (مثال: MTH30-2026-0001 أو ALM-M1-XXXXXX)
            </span>
          </label>

          <div className="relative">
            <input
              type="text"
              dir="ltr"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="MTH30-2026-0001"
              maxLength={24}
              disabled={loading}
              className="w-full h-14 px-4 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk font-mono font-black text-base sm:text-lg tracking-wider placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-cyan-electric focus:ring-1 focus:ring-cyan-electric transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-electric pointer-events-none">
              <KeyRound className="w-5 h-5" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full h-14 rounded-2xl text-sm font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover disabled:opacity-50 shadow-cyan-glow transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري التحقق وتفعيل الكود...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>تأكيد وتفعيل الاشتراك الآن</span>
            </>
          )}
        </button>
      </form>

      {/* Feedback Messages */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm font-bold leading-relaxed ${
            feedback.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}
        >
          {feedback.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Info & Security Tips */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-chalk-muted">
        <div className="flex items-center gap-2 text-cyan-electric font-black">
          <ShieldCheck className="w-4 h-4" />
          <span>تأمين فوري ومباشر ضد الاحتيال</span>
        </div>
        <ul className="list-disc list-inside space-y-1 font-medium leading-relaxed pr-1">
          <li>كل كود شحن صالح للاستخدام مرة واحدة فقط لحساب طالب واحد.</li>
          <li>إذا كان لديك اشتراك سارٍ، فسيتم إضافة مدة الكود الجديد تلقائياً فوق الأيام المتبقية.</li>
          <li>لحجز كود شحن جديد، تواصل مع الدعم الفني أو السنتر الخاص بـ م/ رضا خيرت.</li>
        </ul>
      </div>
    </div>
  );
}
