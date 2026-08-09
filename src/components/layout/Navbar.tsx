'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, GraduationCap, Sparkles, User, LogIn } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-blackboard/90 backdrop-blur-md border-b border-chalk/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brass-compass to-brass-compass-dark flex items-center justify-center text-blackboard shadow-md group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6 text-blackboard font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl text-chalk tracking-tight flex items-center gap-1.5">
                المهندس
                <span className="text-brass-compass text-xs font-semibold px-2 py-0.5 rounded-full bg-brass-compass/15 border border-brass-compass/30">
                  منصة الرياضيات
                </span>
              </span>
              <span className="text-xs text-chalk-muted font-medium">مع م/ رضا خيرت</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-chalk/80">
            <Link href="/" className="text-brass-compass font-bold transition-colors">
              الرئيسية
            </Link>
            <Link href="#stages" className="hover:text-chalk transition-colors flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-brass-compass" />
              المراحل الدراسية
            </Link>
            <Link href="#features" className="hover:text-chalk transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brass-compass" />
              المميزات
            </Link>
            <Link href="#about" className="hover:text-chalk transition-colors">
              عن المدرس
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-chalk hover:bg-blackboard-light border border-chalk/20 transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 text-brass-compass" />
              تسجيل الدخول
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-chalk bg-blue-ink hover:bg-blue-ink-hover shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              إنشاء حساب
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-chalk hover:bg-blackboard-light border border-chalk/10"
              aria-label="القائمة الحسابية"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blackboard-dark border-b border-chalk/10 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3 font-semibold text-chalk/90">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-blackboard-light text-brass-compass"
            >
              الرئيسية
            </Link>
            <Link
              href="#stages"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-blackboard-light"
            >
              المراحل الدراسية
            </Link>
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-blackboard-light"
            >
              المميزات
            </Link>
            <Link
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-blackboard-light"
            >
              عن المدرس
            </Link>
          </nav>
          <div className="pt-2 border-t border-chalk/10 flex flex-col gap-2.5">
            <Link
              href="/sign-in"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center rounded-xl text-sm font-bold text-chalk border border-chalk/20"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center rounded-xl text-sm font-bold text-chalk bg-blue-ink hover:bg-blue-ink-hover"
            >
              إنشاء حساب جديد
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
