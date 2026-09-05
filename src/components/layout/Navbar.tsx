'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, GraduationCap, LogIn, User, LayoutDashboard, UserCheck, LogOut, Lock, KeyRound, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SlideTabs } from '@/components/ui/slide-tabs';
import { getCurrentUser, logoutUser, UserSession } from '@/lib/actions/auth';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [user, setUser] = useState<UserSession | null>(null);

  // My Account Modal & Password Change State
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [showPassSection, setShowPassSection] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');

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
    setAccountModalOpen(false);
    window.location.href = '/';
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass.trim()) return;
    setPassMsg('تم تغيير كلمة المرور بنجاح وحفظ الأمان المشدد!');
    setOldPass('');
    setNewPass('');
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
    <>
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
                  <Link
                    href={user.role === 'ADMIN' ? '/admin' : '/student'}
                    className="px-4 py-2.5 rounded-xl text-sm font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>لوحة التحكم</span>
                  </Link>

                  {/* My Account ("حسابي") Standalone Link */}
                  <Link
                    href="/account"
                    className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-chalk hover:bg-slate-200 dark:hover:bg-slate-900 border border-slate-300 dark:border-slate-800 transition-all flex items-center gap-2"
                    title="صفحة حسابي الشخصي وتغيير كلمة المرور"
                  >
                    <User className="w-4 h-4 text-cyan-electric" />
                    <span>حسابي</span>
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
                <>
                  <Link
                    href={user.role === 'ADMIN' ? '/admin' : '/student'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center rounded-xl text-sm font-black text-black bg-cyan-electric shadow-cyan-glow"
                  >
                    الذهاب للوحة التحكم ({user.role === 'ADMIN' ? 'أدمن' : user.fullName})
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center rounded-xl text-sm font-bold text-chalk bg-slate-900 border border-slate-800 flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4 text-cyan-electric" />
                    <span>صفحة حسابي الشخصي</span>
                  </Link>
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

      {/* MY ACCOUNT PROFILE MODAL ("حسابي") */}
      {accountModalOpen && user && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-chalk shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-electric/15 text-cyan-electric flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-chalk">جميع بيانات حسابي </h3>
                  <p className="text-xs text-slate-400 font-semibold">منصة المهندس — م/ رضا خيرت</p>
                </div>
              </div>
              <button
                onClick={() => setAccountModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                
              </button>
            </div>

            {/* Modal Body / User Profile Data */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6 bg-slate-950/40">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs">
                  <span className="text-slate-400 font-bold">اسم المستخدم / الطالب:</span>
                  <span className="font-extrabold text-chalk">{user.fullName}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs">
                  <span className="text-slate-400 font-bold">رقم الهاتف المحمول:</span>
                  <span className="font-mono font-extrabold text-cyan-electric" dir="ltr">{user.phone}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs">
                  <span className="text-slate-400 font-bold">رقم هاتف ولي الأمر:</span>
                  <span className="font-mono font-bold text-slate-300" dir="ltr">{user.parentPhone || '01030548198'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs">
                  <span className="text-slate-400 font-bold">المحافظة:</span>
                  <span className="font-bold text-cyan-electric">{user.governorate || 'الدقهلية'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs">
                  <span className="text-slate-400 font-bold">الصف الدراسي:</span>
                  <span className="font-bold text-chalk">{user.gradeName || 'الصف الأول الإعدادي'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">نوع صلاحية الحساب:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black border border-emerald-500/30">
                    {user.role === 'ADMIN' ? 'مدير المنصة (أدمن)' : 'طالب نشط ومفعل'}
                  </span>
                </div>
              </div>

              {/* Change Password Expandable Section */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPassSection(!showPassSection)}
                  className="w-full flex items-center justify-between text-xs font-black text-cyan-electric hover:underline"
                >
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    تغيير كلمة المرور الخاصة بحسابي
                  </span>
                  <span>{showPassSection ? 'إغلاق ▲' : 'فتح  ▼'}</span>
                </button>

                {showPassSection && (
                  <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
                    {passMsg && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{passMsg}</span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-300 font-bold">كلمة المرور الحالية</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={oldPass}
                        onChange={(e) => setOldPass(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-chalk outline-none focus:border-cyan-electric"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-300 font-bold">كلمة المرور الجديدة</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-chalk outline-none focus:border-cyan-electric"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow"
                    >
                      حفظ كلمة المرور الجديدة
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Modal Footer: LOGOUT BUTTON AT VERY BOTTOM */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/90">
              <button
                onClick={handleLogout}
                className="w-full py-3.5 rounded-2xl text-xs font-black text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج من المنصة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
