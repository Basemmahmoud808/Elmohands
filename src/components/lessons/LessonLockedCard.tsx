'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  ShieldAlert,
  ArrowRight,
  MessageCircle,
  LogIn,
  UserPlus,
} from 'lucide-react';

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
      {/* Case 2: Logged-in student needs subscription */}
      {!gradeMismatch && !isGuest && (
        <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4 text-center">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-chalk">
              هذه المحاضرة مخصصة للطلاب المشتركين فقط
            </h4>
            <p className="text-xs text-slate-400">
              يمكنك الاشتراك بسهولة عبر فودافون كاش أو إنستاباي والتفعيل الفوري عبر واتساب
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={`https://wa.me/201008901896?text=${encodeURIComponent(`السلام عليكم يا مستر رضا، أود الاشتراك في المنصة لمشاهدة درس: (${lessonTitle}). ما هي باقات الاشتراك المتاحة؟`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>تواصل للاشتراك عبر واتساب 💬</span>
            </a>

            <Link
              href="/student"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-chalk font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>معرفة تفاصيل وباقات الاشتراك</span>
            </Link>
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
