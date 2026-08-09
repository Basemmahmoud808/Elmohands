'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import { loginUser } from '@/lib/actions/auth';
import { GraduationCap, Phone, Lock, ArrowLeft, AlertCircle } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg('يرجى إدخال رقم الهاتف بشكل صحيح');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await loginUser(phone);
    setLoading(false);

    if (res.success && res.user) {
      if (res.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/student');
      }
    } else {
      setErrorMsg(res.message || 'فشل تسجيل الدخول. يرجى التثبت وإعادة المحاولة.');
    }
  };

  return (
    <DarkGradientBg>
      <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 font-arabic">
        
        {/* Card Container */}
        <div className="w-full max-w-md chalk-card rounded-3xl p-8 bg-white/90 dark:bg-slate-950/80 border-slate-200 dark:border-cyan-electric/30 shadow-cyan-glow-lg space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-electric to-blue-ink text-black shadow-cyan-glow">
              <GraduationCap className="w-8 h-8" />
            </Link>
            
            <h1 className="text-2xl font-black text-slate-900 dark:text-chalk">
              تسجيل الدخول لمنصة المهندس
            </h1>
            <p className="text-xs text-slate-500 dark:text-chalk-muted font-medium">
              ادخل رقم الهاتف المسجل للمتابعة والدراسة مع م/ رضا خيرت
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-chalk/90 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-electric" />
                رقم الهاتف المحمول
              </label>
              <input
                type="tel"
                required
                placeholder="01000000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk font-mono text-left outline-none focus:border-cyan-electric transition-colors"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-chalk/90 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-electric" />
                كلمة المرور
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk outline-none focus:border-cyan-electric transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-base font-extrabold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>جاري تسجيل الدخول...</span>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowLeft className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-xs text-slate-600 dark:text-chalk-muted font-semibold pt-2 border-t border-slate-200 dark:border-slate-800">
            ليس لديك حساب بعد؟{' '}
            <Link href="/sign-up" className="text-cyan-electric hover:underline font-bold">
              أنشئ حساب طالب جديد
            </Link>
          </div>

        </div>
      </div>
    </DarkGradientBg>
  );
}
