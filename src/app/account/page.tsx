'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import { getCurrentUser, logoutUser, updateUserPassword, UserSession } from '@/lib/actions/auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  User,
  Phone,
  Users,
  MapPin,
  BookOpen,
  ShieldCheck,
  KeyRound,
  LogOut,
  CheckCircle2,
  Lock,
  LayoutDashboard,
  Crown,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Change Password State
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    async function loadData() {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/sign-in');
        return;
      }
      setUser(currentUser);
      setLoading(false);
    }
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await logoutUser();
    router.push('/');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass.trim()) return;

    if (newPass !== confirmPass) {
      setPassMsg({ success: false, text: 'كلمة المرور الجديدة غير متطابقة مع تأكيد كلمة المرور!' });
      return;
    }

    setIsChangingPass(true);
    const res = await updateUserPassword(oldPass, newPass);
    setIsChangingPass(false);

    if (res.success) {
      setPassMsg({ success: true, text: res.message || 'تم تحديث كلمة المرور وحفظ الأمان بنجاح ' });
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      setPassMsg({ success: false, text: res.message || 'فشل تحديث كلمة المرور. يرجى التأكد من كلمة المرور الحالية.' });
    }
  };

  if (loading) {
    return (
      <DarkGradientBg>
        <div className="min-h-screen flex items-center justify-center text-cyan-electric font-black text-sm">
          جاري تحميل بيانات حسابك الشخصي...
        </div>
      </DarkGradientBg>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <DarkGradientBg>
      <Navbar />

      <main className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-arabic">
        
        {/* Header Breadcrumb Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-electric/10 text-cyan-electric text-xs font-bold border border-cyan-electric/30">
              {isAdmin ? <Crown className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              <span>{isAdmin ? 'حساب مدير المنصة والمشرف العام' : 'الصفحة الرسمية لحساب الطالب'}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-chalk">
              بيانات الحساب والإعدادات
            </h1>
            <p className="text-xs text-slate-500 dark:text-chalk-muted font-bold">
              {isAdmin
                ? 'إدارة بيانات حساب المشرف العام م/ رضا خيرت، وتأمين الدخول وإعدادات المنصة'
                : 'إدارة بياناتك الشخصية، ومتابعة اشتراكك مع منصة المهندس م/ رضا خيرت'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={isAdmin ? '/admin' : '/student'}
              className="px-5 py-3 rounded-2xl text-xs font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{isAdmin ? 'فتح لوحة تحكم الإدارة' : 'لوحة تحكم الطالب'}</span>
            </Link>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Profile Info Card (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Card 1: Personal Details */}
            <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-electric/15 text-cyan-electric flex items-center justify-center font-bold">
                  {isAdmin ? <Crown className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-chalk">
                    {isAdmin ? 'البيانات الرسمية للمشرف العام' : 'البيانات الشخصية والأساسية'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-chalk-muted">
                    {isAdmin ? 'معلومات حساب مدير ومدرس منصة المهندس' : 'معلومات التسجيل الخاصة بك بالمنصة'}
                  </p>
                </div>
              </div>

              {/* ADMIN VIEW */}
              {isAdmin ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-chalk-muted flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-electric" />
                      اسم المدرس والمدير العام:
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-chalk block">
                      {user?.fullName || 'م/ رضا خيرت'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-chalk-muted flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-cyan-electric" />
                      رقم الهاتف / واتساب التواصل:
                    </span>
                    <span className="text-sm font-mono font-extrabold text-cyan-electric block" dir="ltr">
                      {user?.phone || '01008901896'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-chalk-muted flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-electric" />
                      المحافظة ومقر التدريس:
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-chalk block">
                      {user?.governorate || 'الدقهلية — منية النصر — النزل'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-chalk-muted flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-electric" />
                      المراحل الدراسية:
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-chalk block">
                      المرحلة الإعدادية والثانوية (كافة الصفوف)
                    </span>
                  </div>

                  <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-cyan-electric/20 space-y-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-chalk-muted flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-electric" />
                      نوع الحساب والصلاحية:
                    </span>
                    <span className="text-sm font-black text-emerald-500 flex items-center gap-2">
                      <span>مدير ومؤسس المنصة (صلاحيات كاملة للتحكم والنشر)</span>
                      <Crown className="w-4 h-4 text-amber-400" />
                    </span>
                  </div>
                </div>
              ) : (
                /* STUDENT VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-chalk-muted flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-electric" />
                      اسم الطالب الثلاثي:
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-chalk block">{user?.fullName}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-chalk-muted flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-cyan-electric" />
                      رقم هاتف الطالب:
                    </span>
                    <span className="text-sm font-mono font-extrabold text-cyan-electric block" dir="ltr">{user?.phone}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-chalk-muted flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-electric" />
                      رقم هاتف ولي الأمر:
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-800 dark:text-chalk block" dir="ltr">
                      {user?.parentPhone || 'غير مسجل'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-chalk-muted flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-electric" />
                      المحافظة:
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-chalk block">{user?.governorate || 'غير محددة'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-chalk-muted flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-electric" />
                      الصف الدراسي:
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-chalk block">{user?.gradeName || 'الصف الأول الإعدادي'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-chalk-muted flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-electric" />
                      نوع الحساب:
                    </span>
                    <span className="text-sm font-black text-emerald-500 block">
                      طالب مسجل بالمنصة
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Security & Change Password */}
            <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-electric/15 text-cyan-electric flex items-center justify-center font-bold">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-chalk">تغيير كلمة المرور وتأمين الحساب</h3>
                  <p className="text-xs text-slate-500 dark:text-chalk-muted">تحديث كلمة السر لحماية الحساب من المشاركة والولوج غير المصرح به</p>
                </div>
              </div>

              {passMsg && (
                <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  passMsg.success
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                }`}>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{passMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-chalk/90 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-electric" />
                    كلمة المرور الحالية
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-cyan-electric" />
                      كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-cyan-electric" />
                      تأكيد كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full py-3.5 rounded-xl text-xs font-extrabold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isChangingPass ? (
                    <span>جاري تحديث كلمة المرور...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>تأكيد وحفظ كلمة المرور الجديدة</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar Summary Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* ADMIN ACCESS CARD OR STUDENT SUBSCRIPTION CARD */}
            {isAdmin ? (
              <div className="chalk-card rounded-3xl p-6 bg-white/90 dark:bg-slate-900/80 border border-cyan-electric/30 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-electric px-3 py-1 rounded-full bg-cyan-electric/15 border border-cyan-electric/30 flex items-center gap-1.5">
                    <Crown className="w-3 h-3" />
                    <span>صلاحيات الإدارة</span>
                  </span>
                  <span className="text-xs font-black text-emerald-500">مفعل دائماً </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-900 dark:text-chalk">لوحة تحكم المشرف العام</h4>
                  <p className="text-xs text-slate-500 dark:text-chalk-muted leading-relaxed">
                    تمتلك كامل الصلاحيات لإدارة الطلاب، نشر وتعديل الدروس، بناء الاختبارات وبنوك الأسئلة، وتفعيل الاشتراكات.
                  </p>
                </div>

                <Link
                  href="/admin"
                  className="w-full py-3 rounded-2xl text-xs font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow flex items-center justify-center gap-2 transition-all block text-center"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>الدخول المباشر للوحة التحكم</span>
                </Link>
              </div>
            ) : (
              <div className="chalk-card rounded-3xl p-6 bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-electric px-3 py-1 rounded-full bg-cyan-electric/15 border border-cyan-electric/30">
                    حالة الاشتراك
                  </span>
                  <span className="text-xs font-black text-cyan-electric">حساب طالب </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-900 dark:text-chalk">الاشتراك والمحتوى التعليمي</h4>
                  <p className="text-xs text-slate-500 dark:text-chalk-muted leading-relaxed">
                    يمكنك متابعة وتفعيل اشتراكك والوصول الفوري لجميع المحاضرات والامتحانات التفاعلية وبنك الأسئلة.
                  </p>
                </div>

                <Link
                  href="/student"
                  className="w-full py-3 rounded-2xl text-xs font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow flex items-center justify-center gap-2 transition-all block text-center"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>الانتقال للوحة تحكم الطالب</span>
                </Link>
              </div>
            )}

            {/* Platform Teacher Badge Card */}
            <div className="chalk-card rounded-3xl p-6 bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-700">
                  <img src="/teacher_reda_kheyrat.jpg" alt="م/ رضا خيرت" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-chalk">م/ رضا خيرت</h4>
                  <p className="text-[11px] text-cyan-electric font-bold">منصة المهندس لتعليم الرياضيات</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-chalk-muted leading-relaxed font-semibold">
                الدقهلية — منية النصر — النزل. تواصل المدرس عبر الواتساب: 01008901896
              </p>
            </div>
          </div>
        </div>

        {/* LOGOUT BUTTON AT THE VERY BOTTOM OF THE PAGE */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-red-500/20 text-center space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-chalk">هل ترغب في الخروج من المنصة؟</h3>
            <p className="text-xs text-slate-500 dark:text-chalk-muted max-w-md mx-auto font-bold">
              يمكنك الدخول مرة أخرى في أي وقت باستخدام رقم الهاتف وكلمة المرور الخاصة بك.
            </p>
            
            <button
              onClick={handleLogout}
              className="w-full max-w-md py-4 rounded-2xl text-sm font-black text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 flex items-center justify-center gap-2.5 mx-auto transition-all shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج من المنصة بالكامل</span>
            </button>
          </div>
        </div>

      </main>

      <Footer />
    </DarkGradientBg>
  );
}
