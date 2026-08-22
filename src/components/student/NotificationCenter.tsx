'use client';

import React from 'react';
import Link from 'next/link';
import { StudentNotificationDTO } from '@/lib/types/dashboard';
import { Bell, BookOpen, HelpCircle, ShieldCheck, Sparkles, ChevronLeft } from 'lucide-react';

interface NotificationCenterProps {
  notifications: StudentNotificationDTO[];
}

export function NotificationCenter({ notifications }: NotificationCenterProps) {
  const getIcon = (type: StudentNotificationDTO['type']) => {
    switch (type) {
      case 'LESSON':
        return <BookOpen className="w-5 h-5 text-cyan-electric" />;
      case 'QUIZ':
        return <HelpCircle className="w-5 h-5 text-amber-500" />;
      case 'SUBSCRIPTION':
        return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 max-w-4xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">
              مركز التنبيهات والإعلانات
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-chalk-muted mt-0.5">
              تابع الدروس الجديدة، مواعيد الاختبارات، ورسائل م/ رضا خيرت
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-electric text-black shadow-cyan-glow">
          {notifications.length} تنبيهات
        </span>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Bell className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto opacity-50" />
            <p className="text-sm font-bold text-slate-500 dark:text-chalk-muted">لا توجد إشعارات أو تنبيهات جديدة حالياً.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-cyan-electric/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-chalk">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-chalk-muted leading-relaxed">
                    {notif.description}
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block pt-1">
                    {new Date(notif.createdAt).toLocaleDateString('ar-EG', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {notif.linkUrl && (
                <Link
                  href={notif.linkUrl}
                  className="px-4 py-2 rounded-xl text-xs font-black text-slate-900 dark:text-chalk bg-slate-200 dark:bg-slate-800 hover:bg-cyan-electric hover:text-black transition-all flex items-center justify-center gap-1.5 self-end sm:self-center shrink-0"
                >
                  <span>فتح المحتوى</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
