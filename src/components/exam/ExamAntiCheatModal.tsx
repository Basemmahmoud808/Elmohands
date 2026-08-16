'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert, Maximize } from 'lucide-react';

interface ExamAntiCheatModalProps {
  violationCount: number;
  isOpen: boolean;
  onDismiss: () => void;
}

export function ExamAntiCheatModal({
  violationCount,
  isOpen,
  onDismiss,
}: ExamAntiCheatModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-red-500/60 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-3xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-500 shadow-lg shadow-red-500/20 animate-pulse">
          <ShieldAlert className="w-9 h-9" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-red-400">
            تنبيه أمان: مخالفة قواعد النزاهة الأكاديمية!
          </h3>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-400 inline-block border border-red-500/30">
            الإنذار رقم ({violationCount} من 2)
          </span>
        </div>

        {/* Message */}
        <p className="text-sm font-bold text-slate-200 leading-relaxed bg-slate-950/80 p-4 rounded-2xl border border-red-500/20">
          {violationCount >= 2
            ? 'تم تجاوز الحد الأقصى للمخالفات الأمنية! سيتم تسليم الامتحان تلقائياً الآن وتسجيل المخالفة في تقريرك الأكاديمي.'
            : 'تنبيه أمان: تم رصد محاولة تبديل النافذة أو الخروج من وضع ملء الشاشة. تكرار ذلك سيؤدي لتسليم الامتحان فوراً!'}
        </p>

        <p className="text-xs text-slate-400 leading-relaxed">
          يرجى البقاء في وضع ملء الشاشة والتركيز في حل الامتحان دون مغادرة النافذة أو استخدام برامج خارجية.
        </p>

        {/* Return Button */}
        {violationCount < 2 && (
          <button
            onClick={onDismiss}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Maximize className="w-4 h-4" />
            <span>العودة لوضع ملء الشاشة ومتابعة الامتحان</span>
          </button>
        )}
      </div>
    </div>
  );
}
