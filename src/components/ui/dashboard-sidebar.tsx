'use client';

import React, { useState, useEffect } from 'react';
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
  GraduationCap,
  ChevronsLeft,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';
import { logoutUser } from '@/lib/actions/auth';

export type RoleMode = 'ADMIN' | 'STUDENT';

interface DashboardSidebarProps {
  role: RoleMode;
  userFullName?: string;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  hasActiveSubscription?: boolean;
}

export function DashboardSidebar({
  role,
  userFullName = 'أحمد محمد',
  selectedTab,
  setSelectedTab,
  hasActiveSubscription = false,
}: DashboardSidebarProps) {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setDesktopOpen(false);
    }
  }, []);

  interface SidebarOption {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
  }

  // Admin options
  const adminOptions: SidebarOption[] = [
    { id: 'dashboard', title: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'students', title: 'إدارة الطلاب والاشتراكات', icon: Users },
    { id: 'subscriptions', title: 'الاشتراكات الفعالة', icon: CreditCard },
    { id: 'courses', title: 'المناهج والصفوف', icon: BookOpen },
    { id: 'lessons', title: 'إدارة الدروس', icon: Video },
    { id: 'questions', title: 'بنك الأسئلة', icon: FileQuestion },
    { id: 'quizzes', title: 'الاختبارات والامتحانات', icon: HelpCircle },
    { id: 'account', title: 'حسابي والشخصية', icon: User },
    { id: 'audit', title: 'سجل الأحداث', icon: History },
  ];

  // Student options
  const studentOptions: SidebarOption[] = [
    { id: 'overview', title: 'الرئيسية', icon: LayoutDashboard },
    { id: 'my-courses', title: 'المقرارات الدراسية', icon: BookOpen },
    { id: 'question-bank', title: 'بنك الأسئلة والتمارين', icon: FileQuestion },
    { id: 'my-quizzes', title: 'الاختبارات المتاحة', icon: HelpCircle },
    { id: 'my-results', title: 'نتائجي وتقييماتي', icon: AwardIcon },
    // Conditionally show subscription tab only when not subscribed or expired
    ...(!hasActiveSubscription
      ? [{ id: 'subscribe', title: 'الاشتراك وتفعيل الحساب', icon: CreditCard }]
      : []),
    { id: 'account', title: 'حسابي الشخصي', icon: User },
  ];

  function AwardIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    );
  }

  const options = role === 'ADMIN' ? adminOptions : studentOptions;
  const currentTabObj = options.find((o) => o.id === selectedTab);

  const handleSelectTab = (tabId: string) => {
    if (tabId === 'account') {
      window.location.href = '/account';
      return;
    }
    setSelectedTab(tabId);
    setMobileDrawerOpen(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = '/';
  };

  return (
    <>
      {/* ==================================================== */}
      {/* MOBILE TOP NAVIGATION BAR (Visible on < md screens) */}
      {/* ==================================================== */}
      <div className="md:hidden fixed top-0 inset-x-0 h-16 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-electric to-blue-ink flex items-center justify-center text-black shadow-cyan-glow">
            <GraduationCap className="w-5 h-5 text-black font-extrabold" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm text-slate-900 dark:text-chalk leading-tight">
              المهندس
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-chalk-muted">
              مع م/ رضا خيرت
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-2 rounded-xl text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            aria-label="قائمة التحكم"
          >
            {mobileDrawerOpen ? <X className="w-6 h-6 text-slate-900 dark:text-white" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE SLIDE-OVER DRAWER */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col justify-between p-4 pt-16 animate-in slide-in-from-top duration-200">
          <div className="space-y-4 pt-4 overflow-y-auto">
            {/* User Info Badge */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                    {role === 'ADMIN' ? 'م/ رضا خيرت' : userFullName}
                  </span>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">
                    {role === 'ADMIN' ? 'مدير المنصة' : 'طالب'}
                  </span>
                </div>
              </div>
              <button onClick={() => setMobileDrawerOpen(false)} className="text-slate-500 dark:text-slate-400 text-xs font-bold p-1">
                إغلاق 
              </button>
            </div>

            {/* Nav Links */}
            <div className="space-y-1.5">
              {options.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedTab === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectTab(opt.id)}
                    className={cn(
                      'flex h-12 w-full items-center justify-between px-4 rounded-xl transition-all font-bold text-sm',
                      isSelected
                        ? 'bg-[#00D2EE] text-black font-black shadow-sm'
                        : 'text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn('h-5 w-5 shrink-0', isSelected ? 'text-black' : 'text-slate-500')} />
                      <span>{opt.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            {role === 'ADMIN' ? (
              <button
                onClick={() => { window.location.href = '/'; }}
                className="w-full py-3 rounded-2xl text-xs font-black text-cyan-electric bg-cyan-electric/10 border border-cyan-electric/30 flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>العودة للرئيسية (دون خروج)</span>
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-2xl text-xs font-black text-red-400 bg-red-500/10 border border-red-500/30 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج من المنصة</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* DESKTOP SIDEBAR (Visible on >= md screens) */}
      {/* ==================================================== */}
      <aside
        className={cn(
          'hidden md:flex sticky top-0 h-screen shrink-0 border-l transition-all duration-300 ease-in-out z-40',
          'border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl p-3 flex-col justify-between',
          desktopOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Top Header */}
        <div>
          <div className="pb-4 mb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 overflow-hidden group" title="العودة للرئيسية">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-cyan-electric to-blue-ink flex items-center justify-center text-black shadow-cyan-glow group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="w-6 h-6 text-black font-extrabold" />
              </div>
              {desktopOpen && (
                <div className="flex flex-col truncate">
                  <span className="font-extrabold text-xl text-slate-900 dark:text-chalk tracking-tight">
                    المهندس
                  </span>
                  <span className="text-xs text-slate-500 dark:text-chalk-muted font-medium">
                    مع م/ رضا خيرت
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Options List */}
          <div className="space-y-1.5">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedTab === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectTab(opt.id)}
                  className={cn(
                    'relative flex h-11 w-full items-center rounded-xl transition-all duration-200 font-bold text-sm px-2.5',
                    isSelected
                      ? 'bg-cyan-electric text-black font-black shadow-cyan-glow'
                      : 'text-slate-700 dark:text-chalk hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                  )}
                  title={!desktopOpen ? opt.title : undefined}
                >
                  <div className="grid h-full w-9 shrink-0 place-content-center">
                    <Icon className={cn('h-5 w-5', isSelected ? 'text-black font-bold' : 'text-slate-500 dark:text-slate-400')} />
                  </div>
                  {desktopOpen && <span className="truncate pr-1">{opt.title}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <ThemeToggle />
            {desktopOpen && (
              role === 'ADMIN' ? (
                <button
                  onClick={() => { window.location.href = '/'; }}
                  className="p-2.5 rounded-xl border border-cyan-electric/30 text-cyan-electric hover:bg-cyan-electric/10 transition-colors flex items-center gap-1.5 text-xs font-bold"
                  title="العودة للصفحة الرئيسية بدون تسجيل الخروج"
                >
                  <GraduationCap className="w-5 h-5 text-cyan-electric" />
                  <span>الرئيسية</span>
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1.5 text-xs font-bold"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-5 h-5 text-red-500" />
                  <span>خروج</span>
                </button>
              )
            )}
          </div>

          {/* Toggle Collapse Button */}
          <button
            onClick={() => setDesktopOpen(!desktopOpen)}
            className="w-full py-2 flex items-center justify-center gap-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <ChevronsLeft
              className={cn(
                'w-5 h-5 transition-transform duration-300',
                !desktopOpen && 'rotate-180'
              )}
            />
            {desktopOpen && <span>طي القائمة</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
