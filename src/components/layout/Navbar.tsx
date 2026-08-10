'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, GraduationCap, LogIn, User, LayoutDashboard, UserCheck, BookOpen, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SlideTabs } from '@/components/ui/slide-tabs';
import { getCurrentUser, UserSession } from '@/lib/actions/auth';
import { LogoSearchInput, LogoSearchIcon } from '@/components/ui/LogoSearchInput';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [user, setUser] = useState<UserSession | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadUser() {
      const sessionUser = await getCurrentUser();
      setUser(sessionUser);
    }
    loadUser();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
          <nav className="hidden md:flex items-center gap-6">
            <SlideTabs
              tabs={[
                { id: 'home', label: 'الرئيسية' },
                { id: 'stages', label: 'المراحل الدراسية' },
                { id: 'features', label: 'المميزات' },
              ]}
              activeId={activeNav}
              onChange={handleNavChange}
            />

            {/* Quick Search Button featuring Website Logo Search Icon */}
            <button
              onClick={() => setSearchOpen(true)}
              className="group flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 transition-all text-xs font-bold text-slate-600 dark:text-chalk shadow-sm"
              title="البحث في المنصة"
            >
              <LogoSearchIcon className="w-6 h-6" iconSize="w-3 h-3" />
              <span className="hidden lg:inline text-slate-500 dark:text-chalk-muted">بحث بالمنصة...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-cyan-electric bg-cyan-electric/10 rounded border border-cyan-electric/20">⌘K</kbd>
            </button>
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
                  className="px-5 py-2.5 rounded-xl text-sm font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>لوحة التحكم</span>
                </Link>
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
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-xl text-slate-800 dark:text-chalk hover:bg-slate-200 dark:hover:bg-slate-900 border border-slate-300 dark:border-cyan-electric/20"
              aria-label="البحث"
            >
              <LogoSearchIcon className="w-7 h-7" iconSize="w-3.5 h-3.5" />
            </button>
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
            {user ? (
              <Link
                href={user.role === 'ADMIN' ? '/admin' : '/student'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-xl text-sm font-black text-black bg-cyan-electric shadow-cyan-glow"
              >
                الذهاب للوحة التحكم ({user.role === 'ADMIN' ? 'أدمن' : user.fullName})
              </Link>
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

      {/* Interactive Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-200">
          <div className="chalk-card max-w-2xl w-full rounded-3xl p-6 bg-slate-900 border border-cyan-electric/30 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-electric" />
                <span className="text-sm font-black text-chalk">محرك بحث منصة المهندس</span>
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700"
              >
                إغلاق ✕ (ESC)
              </button>
            </div>

            {/* Custom Logo Search Input */}
            <LogoSearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="ابحث عن الدرس، الوحدة، الجبر، الهندسة، أو الملاحظات..."
              size="lg"
              autoFocus
            />

            {/* Quick Suggestions / Results */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-400 block">مقترحات سريعة للبحث:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
                {[
                  { title: 'كورس الجبر الشامل (الترم الأول)', tag: 'فرع الجبر', link: '/student' },
                  { title: 'الإنشاءات الهندسية وحساب المثلثات', tag: 'فرع الهندسة', link: '/student' },
                  { title: 'مجموعات الأعداد والعمليات الأساسية', tag: 'درس متاح', link: '/lessons/les-1' },
                  { title: 'الامتحان الشامل ونماذج الإجابة', tag: 'اختبار MCQ', link: '/student' },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.link}
                    onClick={() => setSearchOpen(false)}
                    className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-electric/40 hover:bg-cyan-electric/5 transition-all flex items-center justify-between text-chalk group"
                  >
                    <span className="group-hover:text-cyan-electric transition-colors">{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-electric/15 text-cyan-electric border border-cyan-electric/25">
                      {item.tag}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
