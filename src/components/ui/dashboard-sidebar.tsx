'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  HelpCircle,
  FileQuestion,
  KeyRound,
  CreditCard,
  History,
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronsLeft,
  LogOut,
  Sparkles,
  Award,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

export type RoleMode = 'ADMIN' | 'STUDENT';

interface DashboardSidebarProps {
  role: RoleMode;
  userFullName?: string;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

export function DashboardSidebar({
  role,
  userFullName = 'أحمد محمد',
  selectedTab,
  setSelectedTab,
}: DashboardSidebarProps) {
  const [open, setOpen] = useState(true);

  // Admin options
  const adminOptions = [
    { id: 'dashboard', title: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'students', title: 'إدارة الطلاب', icon: Users, badge: '128' },
    { id: 'courses', title: 'المناهج والصفوف', icon: BookOpen },
    { id: 'lessons', title: 'إدارة الدروس', icon: Video, badge: '36' },
    { id: 'questions', title: 'بنك الأسئلة', icon: FileQuestion },
    { id: 'quizzes', title: 'الاختبارات والامتحانات', icon: HelpCircle },
    { id: 'vouchers', title: 'أكواد الشحن', icon: KeyRound, badge: 'جديد' },
    { id: 'subscriptions', title: 'الاشتراكات الفعالة', icon: CreditCard },
    { id: 'audit', title: 'سجل الأحداث', icon: History },
  ];

  // Student options
  const studentOptions = [
    { id: 'overview', title: 'الرئيسية', icon: LayoutDashboard },
    { id: 'my-courses', title: 'مناهجي والدروس', icon: BookOpen },
    { id: 'my-quizzes', title: 'الاختبارات المتاحة', icon: HelpCircle, badge: '2' },
    { id: 'my-results', title: 'نتائجي وتقييماتي', icon: Award },
    { id: 'activate-code', title: 'تفعيل كود شحن', icon: KeyRound },
  ];

  const options = role === 'ADMIN' ? adminOptions : studentOptions;

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen shrink-0 border-l transition-all duration-300 ease-in-out z-40',
        'border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl p-3 flex flex-col justify-between',
        open ? 'w-64' : 'w-20'
      )}
    >
      {/* Top Header */}
      <div>
        <div className="pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 overflow-hidden group" title="العودة للرئيسية">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-cyan-electric to-blue-ink flex items-center justify-center text-black font-extrabold shadow-cyan-glow group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            {open && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-base text-slate-900 dark:text-chalk truncate group-hover:text-cyan-electric transition-colors">
                  {role === 'ADMIN' ? 'منصة المهندس (Admin)' : 'منصة المهندس'}
                </span>
                <span className="text-xs text-cyan-electric font-semibold truncate">
                  {role === 'ADMIN' ? 'م/ رضا خيرت' : userFullName}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* User Card Badge */}
        {open && (
          <div className="mb-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700 dark:text-chalk">
                {role === 'ADMIN' ? 'مدير المنصة' : 'طالب نشط'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-electric/15 text-cyan-electric border border-cyan-electric/30">
              {role === 'ADMIN' ? 'التحكم' : 'الصف الأول'}
            </span>
          </div>
        )}

        {/* Options List */}
        <div className="space-y-1">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedTab === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedTab(opt.id)}
                className={cn(
                  'relative flex h-11 w-full items-center rounded-xl transition-all duration-200 font-bold text-sm',
                  isSelected
                    ? 'bg-cyan-electric/15 text-cyan-electric border-r-4 border-cyan-electric shadow-cyan-glow'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                )}
                title={!open ? opt.title : undefined}
              >
                <div className="grid h-full w-12 shrink-0 place-content-center">
                  <Icon className="h-5 w-5" />
                </div>
                {open && <span className="truncate">{opt.title}</span>}
                {opt.badge && open && (
                  <span className="absolute left-3 px-2 py-0.5 rounded-full bg-cyan-electric text-black font-extrabold text-[10px]">
                    {opt.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          {open && (
            <Link
              href="/"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full py-2 flex items-center justify-center gap-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          <ChevronsLeft
            className={cn(
              'w-5 h-5 transition-transform duration-300',
              !open && 'rotate-180'
            )}
          />
          {open && <span>طي القائمة</span>}
        </button>
      </div>
    </aside>
  );
}
