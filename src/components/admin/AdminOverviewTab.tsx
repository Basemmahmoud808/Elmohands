'use client';

import React from 'react';
import { AdminOverviewStatsDTO } from '@/lib/types/dashboard';
import {
  Users,
  CreditCard,
  Video,
  FileQuestion,
  HelpCircle,
  KeyRound,
  History,
  Plus,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface AdminOverviewTabProps {
  stats: AdminOverviewStatsDTO;
  onSelectTab: (tabId: string) => void;
}

export function AdminOverviewTab({ stats, onSelectTab }: AdminOverviewTabProps) {
  const statCards = [
    {
      title: 'إجمالي الطلاب المسجلين',
      value: stats.totalStudents,
      subtitle: 'طالب في مختلف الصفوف',
      icon: Users,
      color: 'text-cyan-electric bg-cyan-electric/10 border-cyan-electric/30',
      tab: 'students',
    },
    {
      title: 'الاشتراكات الفعالة',
      value: stats.activeSubscriptions,
      subtitle: 'طالب لديه اشتراك سارٍ',
      icon: CreditCard,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
      tab: 'subscriptions',
    },
    {
      title: 'إجمالي الدروس المنشورة',
      value: stats.totalLessons,
      subtitle: 'فيديو شرح ومحاضرة',
      icon: Video,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
      tab: 'lessons',
    },
    {
      title: 'أسئلة بنك الأسئلة',
      value: stats.totalQuestions,
      subtitle: 'سؤال MCQ ومعادلات رياضية',
      icon: FileQuestion,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      tab: 'questions',
    },
    {
      title: 'الاختبارات والامتحانات',
      value: stats.totalQuizzes,
      subtitle: 'اختبار تقييمي وشيت أونلاين',
      icon: HelpCircle,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
      tab: 'quizzes',
    },
    {
      title: 'أكواد الشحن المتاحة',
      value: stats.unusedVouchers,
      subtitle: 'كود جاهز للتوزيع والشحن',
      icon: KeyRound,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
      tab: 'vouchers',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-cyan-electric/15 via-blue-ink/20 to-transparent border border-cyan-electric/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-electric/20 text-cyan-electric text-xs font-bold border border-cyan-electric/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>لوحة التحكم الرئيسية — منصة المهندس</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-chalk">
              مرحباً بك، م/ رضا خيرت 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-chalk-muted max-w-xl">
              إدارة شاملة للمناهج، الدروس التفاعلية، بنك الأسئلة، أكواد الشحن، ومتابعة فورية للطلاب.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onSelectTab('lessons')}
              className="px-4 py-3 rounded-2xl text-xs font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>رفع درس جديد</span>
            </button>
            <button
              onClick={() => onSelectTab('vouchers')}
              className="px-4 py-3 rounded-2xl text-xs font-bold text-slate-900 dark:text-chalk bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-cyan-electric transition-all flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-cyan-electric" />
              <span>توليد أكواد شحن</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={() => onSelectTab(card.tab)}
              className="chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 hover:border-cyan-electric/40 transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-electric transition-colors" />
              </div>

              <div>
                <div className="text-3xl font-black text-slate-900 dark:text-chalk group-hover:text-cyan-electric transition-colors">
                  {card.value}
                </div>
                <h3 className="text-sm font-black text-slate-800 dark:text-chalk mt-1">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-chalk-muted mt-0.5">
                  {card.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Audit Logs */}
      <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-chalk">
                سجل النشاط والأحداث الأخير
              </h3>
              <p className="text-xs text-slate-500 dark:text-chalk-muted">
                متابعة فورية لعمليات النظام وتفاعلات الطلاب
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('audit')}
            className="text-xs font-bold text-cyan-electric hover:underline"
          >
            عرض السجل الكامل ←
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {stats.recentAuditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-electric shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-chalk block">
                    {log.action}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-chalk-muted">
                    بواسطة: {log.userName || 'مدير المنصة'} ({log.userRole || 'ADMIN'})
                  </span>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                {new Date(log.createdAt).toLocaleDateString('ar-EG', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
