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
  Plus,
  ArrowUpRight,
  ChevronLeft,
} from 'lucide-react';

interface AdminOverviewTabProps {
  stats: AdminOverviewStatsDTO;
  onSelectTab: (tabId: string) => void;
}

export function AdminOverviewTab({ stats, onSelectTab }: AdminOverviewTabProps) {
  const statCards = [
    {
      title: 'الطلاب المسجلون',
      value: stats.totalStudents,
      subtitle: 'طالب في مختلف الصفوف',
      icon: Users,
      tab: 'students',
    },
    {
      title: 'الاشتراكات الفعالة',
      value: stats.activeSubscriptions,
      subtitle: 'طالب لديه اشتراك سارٍ',
      icon: CreditCard,
      tab: 'subscriptions',
    },
    {
      title: 'الدروس والمحاضرات',
      value: stats.totalLessons,
      subtitle: 'فيديو شرح منشور',
      icon: Video,
      tab: 'lessons',
    },
    {
      title: 'بنك الأسئلة',
      value: stats.totalQuestions,
      subtitle: 'سؤال وتمرين متاح',
      icon: FileQuestion,
      tab: 'questions',
    },
    {
      title: 'الامتحانات والشيتات',
      value: stats.totalQuizzes,
      subtitle: 'اختبار وشيت منشور',
      icon: HelpCircle,
      tab: 'quizzes',
    },
    {
      title: 'أكواد الشحن المتاحة',
      value: stats.unusedVouchers,
      subtitle: 'كود جاهز للتوزيع',
      icon: KeyRound,
      tab: 'vouchers',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            لوحة التحكم
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            مرحباً بك، م/ رضا خيرت — نظرة عامة على محتوى المنصة والطلاب
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab('lessons')}
            className="px-4 py-2.5 rounded-xl bg-cyan-electric hover:bg-cyan-electric-hover text-black font-black text-xs shadow-cyan-glow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة درس</span>
          </button>
          <button
            onClick={() => onSelectTab('vouchers')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <KeyRound className="w-4 h-4 text-cyan-500" />
            <span>توليد أكواد</span>
          </button>
        </div>
      </div>

      {/* 6 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={() => onSelectTab(card.tab)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-cyan-500">
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
              </div>

              <div>
                <div className="text-3xl font-black text-slate-900 dark:text-slate-100 group-hover:text-cyan-500 transition-colors">
                  {card.value}
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {card.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div
          onClick={() => onSelectTab('courses')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between shadow-sm"
        >
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              المناهج والصفوف الدراسية
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              استعراض الدروس والشيتات مقسمة لكل مرحلة
            </p>
          </div>
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </div>

        <div
          onClick={() => onSelectTab('students')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between shadow-sm"
        >
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              إدارة الطلاب
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              متابعة حسابات واشتراكات الطلاب المسجلين
            </p>
          </div>
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
