'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, GraduationCap, LogIn, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SlideTabs } from '@/components/ui/slide-tabs';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

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
              <span className="font-extrabold text-2xl text-slate-900 dark:text-chalk tracking-tight flex items-center gap-2">
                المهندس
                <span className="text-cyan-electric text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-electric/15 border border-cyan-electric/30 shadow-sm">
                  منصة الرياضيات
                </span>
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
              ]}
              activeId={activeNav}
              onChange={handleNavChange}
            />
          </nav>

          {/* Auth Actions & ThemeToggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
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
          </nav>
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2.5">
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
          </div>
        </div>
      )}
    </header>
  );
}
