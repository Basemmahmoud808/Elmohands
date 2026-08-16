'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  ShieldAlert,
  Sparkles,
  KeyRound,
  ArrowRight,
  MessageCircle,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { redeemVoucherCode } from '@/lib/actions/vouchers';

interface LessonLockedCardProps {
  lessonTitle: string;
  lessonGradeName: string;
  userGradeName?: string;
  isGuest?: boolean;
  gradeMismatch?: boolean;
  requiresSubscription?: boolean;
  reason?: string;
  onActivated?: () => void;
}

export function LessonLockedCard({
  lessonTitle,
  lessonGradeName,
  userGradeName,
  isGuest,
  gradeMismatch,
  requiresSubscription,
  reason,
  onActivated,
}: LessonLockedCardProps) {
  const router = useRouter();
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ success: boolean; text: string } | null>(null);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    setLoading(true);
    setMsg(null);

    try {
      const res = await redeemVoucherCode(voucherCode.trim());
      if (res.success) {
        setMsg({
          success: true,
          text: res.message || 'تم تفعيل الاشتراك بنجاح! جاري فتح الدرس...',
        });
        setTimeout(() => {
          if (onActivated) {
            onActivated();
          } else {
            router.refresh();
          }
        }, 1200);
      } else {
        setMsg({
          success: false,
          text: res.message || 'كود الشحن غير صالح أو تم استخدامه مسبقاً',
        });
      }
    } catch {
      setMsg({
        success: false,
        text: 'حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-6 sm:p-8 rounded-3xl bg-slate-900/90 border-2 border-amber-500/30 backdrop-blur-2xl shadow-2xl space-y-6 text-center">
      {/* Icon & Title */}
      <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/10">
        {gradeMismatch ? <ShieldAlert className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-black text-chalk">
          {gradeMismatch ? 'محتوى مخصص لصف دراسي آخر' : 'هذا الدرس محمي للمشتركين'}
        </h3>
        <p className="text-xs sm:text-sm text-chalk-muted leading-relaxed max-w-lg mx-auto">
          {reason ||
            (gradeMismatch
              ? `هذا الدرس (${lessonTitle}) مخصص لطلاب ${lessonGradeName}، بينما أنت مسجل في ${userGradeName || 'صف آخر'}.`
              : `لمشاهدة درس "${lessonTitle}" وتحميل المذكرة وحل الامتحانات، يرجى تفعيل اشتراكك.`)}
        </p>
      </div>

      {/* Case 1: Grade Mismatch */}
      {gradeMismatch && userGradeName && (
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
          <p className="text-xs text-slate-300">
            يمكنك تصفح جميع دروس وتمارين صفك الدراسي المسجل فوراً:
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/courses/${encodeURIComponent(userGradeName)}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-electric text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:shadow-cyan-glow transition-all"
            >
              <span>الذهاب لمنهج {userGradeName}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/201008901896"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-500/25 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>طلب تغيير الصف عبر واتساب</span>
            </a>
          </div>
        </div>
      )}

      {/* Case 2: Unsubscribed Student -> Quick Voucher Activation */}
      {!gradeMismatch && !isGuest && (
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4 text-right">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-electric">
            <KeyRound className="w-4 h-4" />
            <span>تفعيل فوري بكود الشحن:</span>
          </div>

          <form onSubmit={handleActivate} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              placeholder="اكتب كود الشحن هنا (مثال: ALM-MONTH-XXXX)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-chalk text-xs font-mono focus:border-cyan-electric focus:outline-none placeholder:text-slate-500 text-center uppercase"
            />
            <button
              type="submit"
              disabled={loading || !voucherCode.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-electric to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 hover:shadow-cyan-glow transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تفعيل الكود</span>
                </>
              )}
            </button>
          </form>

          {msg && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                msg.success
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-pen/15 border border-red-pen/30 text-red-pen'
              }`}
            >
              {msg.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{msg.text}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-chalk-muted">
            <span>ليس لديك كود شحن؟</span>
            <a
              href="https://wa.me/201008901896"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>شراء كود تفعيل عبر واتساب</span>
            </a>
          </div>
        </div>
      )}

      {/* Case 3: Guest Visitor */}
      {isGuest && (
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/sign-in"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-electric text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:shadow-cyan-glow transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول</span>
          </Link>
          <Link
            href="/sign-up"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 text-chalk font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-slate-600"
          >
            <UserPlus className="w-4 h-4" />
            <span>إنشاء حساب جديد</span>
          </Link>
        </div>
      )}

      {/* Back to courses link */}
      <div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-cyan-electric transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>تصفح باقي كورسات المنصة</span>
        </Link>
      </div>
    </div>
  );
}
