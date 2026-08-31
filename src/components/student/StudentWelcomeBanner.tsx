'use client';

import React from 'react';
import { StudentProfileDTO, StudentSubscriptionDTO } from '@/lib/types/dashboard';
import { Sparkles, Calendar, ShieldCheck, AlertTriangle } from 'lucide-react';

interface StudentWelcomeBannerProps {
  profile: StudentProfileDTO;
  subscription: StudentSubscriptionDTO;
  onNavigateToSubscribe?: () => void;
}

export function StudentWelcomeBanner({
  profile,
  subscription,
  onNavigateToSubscribe,
}: StudentWelcomeBannerProps) {
  const sub = subscription.subscription;
  const daysRemaining = sub?.daysRemaining ?? 0;
  const isActive = subscription.hasActiveSubscription && daysRemaining > 0;
  const isExpiringSoon = isActive && daysRemaining <= 5;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-chalk tracking-tight">
            أهلاً يا {profile.fullName || 'بطل الرياضيات'} 
          </h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-cyan-electric/15 text-cyan-electric border border-cyan-electric/30">
            <Sparkles className="w-3 h-3" />
            <span>طالب متميز</span>
          </span>
        </div>
        <p className="text-slate-600 dark:text-chalk-muted text-xs sm:text-sm font-medium">
          {profile.gradeName || 'الصف الأول الإعدادي'} — منصة المهندس مع م/ رضا خيرت
        </p>
      </div>

      {/* Subscription Status Badge */}
      <div className="flex items-center gap-3">
        {isActive ? (
          <div
            className={`p-3 sm:p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/90 border ${
              isExpiringSoon
                ? 'border-amber-500/40 shadow-sm'
                : 'border-emerald-500/30 shadow-sm'
            } flex items-center gap-3 backdrop-blur-md`}
          >
            <div
              className={`w-3 h-3 rounded-full ${
                isExpiringSoon ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'
              }`}
            />
            <div className="flex flex-col text-right">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 dark:text-chalk">
                  {sub?.planName || 'اشتراك نشط'}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <span
                className={`text-[11px] font-bold ${
                  isExpiringSoon
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isExpiringSoon
                  ? `ينتهي قريباً (متبقي ${daysRemaining} أيام)`
                  : `متبقي ${daysRemaining} يوماً في الاشتراك`}
              </span>
            </div>
          </div>
        ) : (
          <div
            onClick={onNavigateToSubscribe}
            className={`p-3 sm:p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 backdrop-blur-md ${
              onNavigateToSubscribe ? 'cursor-pointer hover:border-red-500/60 hover:scale-[1.02] transition-all' : ''
            }`}
            title="اضغط للاشتراك وتفعيل الحساب"
          >
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <div className="flex flex-col text-right">
              <span className="text-xs font-black text-red-600 dark:text-red-400">
                اشتراك غير نشط
              </span>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-chalk-muted">
                اضغط هنا للاشتراك وتفعيل الدروس
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
