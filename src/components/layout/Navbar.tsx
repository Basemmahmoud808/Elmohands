'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, GraduationCap, LogIn, User, LayoutDashboard, UserCheck, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SlideTabs } from '@/components/ui/slide-tabs';
import { getCurrentUser, logoutUser, UserSession } from '@/lib/actions/auth';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    async function loadUser() {
      const sessionUser = await getCurrentUser();
      setUser(sessionUser);
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    window.location.href = '/';
  };

  const handleNavChange = (id: string) => {
    setActiveNav(id);
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-cyan-electric/20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-electric to-blue-ink flex items-center justify-center text-black shadow-cyan-glow group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6 text-black font-extrabold" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl text-slate-900 dark:text-chalk tracking-tight">
                المهندس
              </span>
              <span className="text-xs text-slate-500 dark:text-chalk-muted font-medium">مع م/ رضا خيرت</span>
            </div>
          </Link>

          {/* Desktop Nav Links using Sliding Cursor Tabs */}
          <nav className="hidden md:block">
            <SlideTabs
              tabs={[
                { id: 'home', label: 'الرئيسية' },
                { id: 'stages', label: 'المراحل الدراسية' },
                { id: 'features', label: 'المميزات' },
                { id: 'contact', label: 'تواصل معنا' },
              ]}
              activeId={activeNav}
              onChange={handleNavChange}
            />
          </nav>

          {/* Auth Actions & ThemeToggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-chalk px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-electric" />
                  <span>{user.role === 'ADMIN' ? 'م/ رضا خيرت (أدمن)' : user.fullName}</span>
                </span>
                <Link
                  href={user.role === 'ADMIN' ? '/admin' : '/student'}
                  className="px-4 py-2.5 rounded-xl text-sm font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>لوحة التحكم</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all flex items-center gap-2"
                  title="تسجيل الخروج من المنصة"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-chalk hover:bg-slate-200 dark:hover:bg-slate-900/80 border border-slate-300 dark:border-slate-700/60 transition-all flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-cyan-electric" />
                  تسجيل الدخول
                </Link>
                <Link
                  href="/sign-up"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-800 dark:text-chalk hover:bg-slate-200 dark:hover:bg-slate-900 border border-slate-300 dark:border-cyan-electric/20"
              aria-label="القائمة الحسابية"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-cyan-electric" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-cyan-electric/20 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3 font-semibold text-chalk/90">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-slate-900 text-cyan-electric font-bold"
            >
              الرئيسية
            </Link>
            <Link
              href="#stages"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-900"
            >
              المراحل الدراسية
            </Link>
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-900"
            >
              المميزات
            </Link>
            <Link
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-900"
            >
              تواصل معنا
            </Link>
          </nav>
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2.5">
            {user ? (
              <>
                <Link
                  href={user.role === 'ADMIN' ? '/admin' : '/student'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-xl text-sm font-black text-black bg-cyan-electric shadow-cyan-glow"
                >
                  الذهاب للوحة التحكم ({user.role === 'ADMIN' ? 'أدمن' : user.fullName})
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 text-center rounded-xl text-sm font-bold text-red-500 bg-red-500/10 border border-red-500/30 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج من الحساب</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-xl text-sm font-bold text-chalk border border-slate-700"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-xl text-sm font-bold text-black bg-cyan-electric shadow-cyan-glow"
                >
                  إنشاء حساب جديد
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
