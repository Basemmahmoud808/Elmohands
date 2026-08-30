'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, Phone, User, BookOpen, MapPin, Users, Lock, ArrowLeft, AlertCircle } from 'lucide-react';

export interface AuthFormData {
  fullName?: string;
  phone: string;
  parentPhone?: string;
  password: string;
  governorate?: string;
  gradeId?: string;
}

interface AuthSectionProps {
  mode?: 'signup' | 'signin';
  onSubmit: (data: AuthFormData) => Promise<void>;
  loading: boolean;
  errorMsg: string;
}

const GRADES = [
  { name: 'الصف الأول الإعدادي', id: '7af16072-b5c2-4874-bc2d-a78a257f64bf' },
  { name: 'الصف الثاني الإعدادي', id: '5d2a3c21-86dc-4416-84bd-43933665eea2' },
  { name: 'الصف الثالث الإعدادي', id: 'c8681ec4-28a2-4750-85ad-c46b79b0e660' },
  { name: 'الصف الأول الثانوي', id: 'ecdf728c-a79a-422c-ba94-3c73279c57da' },
];

const GOVERNORATES = [
  'الدقهلية',
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الشرقية',
  'القليوبية',
  'البحيرة',
  'المنوفية',
  'الغربية',
  'كفر الشيخ',
  'الفيوم',
  'بني سويف',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'دمياط',
  'بورسعيد',
  'السويس',
  'الإسماعيلية',
];

export default function AuthSectionThree({ mode = 'signup', onSubmit, loading, errorMsg }: AuthSectionProps) {
  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [governorate, setGovernorate] = useState(GOVERNORATES[0]);
  const [gradeId, setGradeId] = useState(GRADES[0].id);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      fullName,
      phone,
      parentPhone,
      password,
      governorate,
      gradeId,
    });
  };

  return (
    <section className="min-h-screen bg-slate-50 dark:bg-slate-950 p-3 sm:p-6 text-slate-900 dark:text-chalk font-arabic antialiased flex items-center justify-center transition-colors">
      <div className="w-full max-w-7xl grid min-h-[calc(100vh-3rem)] gap-6 md:grid-cols-2 items-stretch">
        
        {/* RIGHT SIDE (FORM CONTAINER - LIGHT / DARK MODE SYNCHRONIZED) */}
        <div className="flex min-h-[600px] flex-col justify-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-10 lg:p-14 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-electric/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-ink/10 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto w-full max-w-md space-y-6 relative z-10">
            
            {/* Header */}
            <div className="space-y-3">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-electric to-blue-ink text-black flex items-center justify-center shadow-cyan-glow group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-cyan-electric tracking-wide">منصة المهندس لتعليم الرياضيات</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">مع م/ رضا خيرت — التأسيس والتميز</p>
                </div>
              </Link>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-chalk tracking-tight pt-2">
                {mode === 'signup' ? 'إنشاء حساب طالب جديد ' : 'تسجيل الدخول لمنصة المهندس '}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                {mode === 'signup'
                  ? 'قم بإدخال بياناتك كاملة للوصول الفوري للمحاضرات والأوراق الامتحانية وبنك الأسئلة'
                  : 'ادخل رقم الهاتف المحمول وكلمة المرور الخاصة بك للمتابعة واستكمال دروسك'}
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2.5"
              >
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="space-y-4">
              
              {mode === 'signup' && (
                <div className="space-y-1.5 text-right w-full">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-electric" />
                    اسم الطالب الثلاثي
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد محمود السيد"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric transition-colors"
                  />
                </div>
              )}

              <div className={mode === 'signup' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                <div className="space-y-1.5 text-right w-full">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-cyan-electric" />
                      {mode === 'signup' ? 'رقم هاتف الطالب' : 'رقم الهاتف أو اسم المستخدم'}
                    </span>
                    {mode === 'signup' && (
                      <span className="text-[10px] text-cyan-electric font-black">(إلزامي)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={mode === 'signup' ? '01012345678' : '01008901896 أو اسم المستخدم'}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk font-mono text-left text-xs outline-none focus:border-cyan-electric transition-colors"
                    dir="ltr"
                  />
                  {mode === 'signup' && (
                    <span className="text-[10px] text-slate-400 font-normal block">
                      11 رقماً يبدأ بـ (010, 011, 012, 015)
                    </span>
                  )}
                </div>

                {mode === 'signup' && (
                  <div className="space-y-1.5 text-right w-full">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-cyan-electric" />
                        رقم هاتف ولي الأمر
                      </span>
                      <span className="text-[10px] text-amber-500 dark:text-amber-400 font-black bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        (إلزامي)
                      </span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01223456789"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk font-mono text-left text-xs outline-none focus:border-cyan-electric transition-colors"
                      dir="ltr"
                    />
                    <span className="text-[10px] text-slate-400 font-normal block">
                      يجب أن يكون رقم صحيح ومختلف عن هاتف الطالب
                    </span>
                  </div>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 text-right w-full">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-electric" />
                  كلمة المرور
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 text-slate-400 hover:text-cyan-electric transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-right w-full">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-electric" />
                      المحافظة
                    </label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric transition-colors"
                    >
                      {GOVERNORATES.map((g, i) => (
                        <option key={i} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 text-right w-full">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-electric" />
                      الصف الدراسي
                    </label>
                    <select
                      value={gradeId}
                      onChange={(e) => setGradeId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric transition-colors"
                    >
                      {GRADES.map((g, i) => (
                        <option key={i} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full py-4 rounded-2xl text-sm font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>جاري التنفيذ والتسجيل...</span>
                ) : (
                  <>
                    <span>{mode === 'signup' ? 'إنشاء حساب والبدء الفوري' : 'تسجيل الدخول للحساب'}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Navigation Link */}
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 font-semibold pt-3 border-t border-slate-200 dark:border-slate-800">
              {mode === 'signup' ? (
                <>
                  لديك حساب بالفعل؟{' '}
                  <Link href="/sign-in" className="text-cyan-electric hover:underline font-bold">
                    تسجيل الدخول من هنا
                  </Link>
                </>
              ) : (
                <>
                  ليس لديك حساب بعد؟{' '}
                  <Link href="/sign-up" className="text-cyan-electric hover:underline font-bold">
                    أنشئ حساب طالب جديد
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>

        {/* LEFT SIDE - CLEAN TEACHER PORTRAIT PHOTO ONLY (NO OVERLAY TEXT, LIGHT/DARK SYNCHRONIZED) */}
        <div className="hidden md:flex relative min-h-[500px] lg:min-h-[550px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-900 items-center justify-center transition-colors group">
          <img
            src="/teacher_reda_kheyrat.jpg"
            alt="م/ رضا خيرت — منصة المهندس لتعليم الرياضيات"
            className="w-full h-full object-cover object-center rounded-3xl group-hover:scale-105 transition-transform duration-700"
          />
          {/* Subtle Ambient Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
        </div>

      </div>
    </section>
  );
}
