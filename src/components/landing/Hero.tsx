'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, PlayCircle, Award, CheckCircle2, Sparkles, LayoutDashboard } from 'lucide-react';
import { getCurrentUser, UserSession } from '@/lib/actions/auth';

export default function Hero() {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    checkAuth();
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center py-12 lg:py-20 overflow-hidden">
      
      {/* Decorative Math Symbols Floating Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-15 select-none overflow-hidden font-math">
        <span className="absolute top-12 right-12 text-5xl lg:text-6xl text-cyan-electric font-bold rotate-12 drop-shadow-[0_0_10px_rgba(0,207,255,0.4)]">f(x) = ax² + bx + c</span>
        <span className="absolute top-1/4 left-16 text-4xl lg:text-5xl text-slate-700 dark:text-chalk rotate-[-15deg]">sin²θ + cos²θ = 1</span>
        <span className="absolute bottom-20 right-1/4 text-5xl lg:text-6xl text-cyan-electric font-bold">a² + b² = c²</span>
        <span className="absolute top-1/3 right-1/3 text-3xl lg:text-4xl text-slate-700 dark:text-chalk">√x + π ≈ 3.14</span>
        <span className="absolute bottom-16 left-12 text-6xl lg:text-7xl text-cyan-electric">∫ x dx</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-right">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-electric/10 border border-cyan-electric/30 text-cyan-electric text-xs font-bold shadow-cyan-glow">
              <Sparkles className="w-4 h-4 animate-pulse text-cyan-electric" />
              <span>منصة الرياضيات الأولى للمرحلة الإعدادية والصف الأول الثانوي</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-chalk leading-tight tracking-tight">
              منصتك الأولى لتعلم
              <br />
              و فهم <span className="text-cyan-electric text-cyan-glow">الرياضيات</span> بأسلوب
              <br />
              بسيط وممتع
            </h1>

            {/* Subheading */}
            <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-chalk/90 flex items-center justify-center lg:justify-start gap-3">
              <span className="w-8 h-1 bg-cyan-electric rounded-full inline-block shadow-cyan-glow"></span>
              مع م/ رضا خيرت
            </p>

            <p className="text-base sm:text-lg text-slate-600 dark:text-chalk-muted font-medium max-w-2xl leading-relaxed">
              شرح مبسط، تطبيق عملي، بنك أسئلة وافي لكل فكرة، واختبارات تفاعلية بعد كل درس لتضمن التفوق والدرجة النهائية بسهولة.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href={user ? (user.role === 'ADMIN' ? '/admin' : '/student') : '/sign-up'}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-extrabold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all duration-200 flex items-center justify-center gap-3 group"
              >
                {user ? (
                  <>
                    <LayoutDashboard className="w-5 h-5" />
                    <span>الانتقال إلى لوحتي التعليمية ({user.fullName.split(' ')[0]})</span>
                  </>
                ) : (
                  <>
                    <span>ابدأ الآن مجاناً</span>
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </>
                )}
              </Link>
              <Link
                href="#stages"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-slate-800 dark:text-chalk bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 transition-all flex items-center justify-center gap-3 shadow-sm"
              >
                <PlayCircle className="w-5 h-5 text-cyan-electric" />
                <span>استكشف المنهج والمراحل</span>
              </Link>
            </div>

            {/* Quick Highlights */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 text-center">
              <div className="chalk-card p-3.5 rounded-xl">
                <div className="text-2xl font-black text-cyan-electric text-cyan-glow">100%</div>
                <div className="text-xs font-semibold text-slate-600 dark:text-chalk-muted">تغطية شاملة للمنهج</div>
              </div>
              <div className="chalk-card p-3.5 rounded-xl">
                <div className="text-2xl font-black text-slate-900 dark:text-chalk">MCQ</div>
                <div className="text-xs font-semibold text-slate-600 dark:text-chalk-muted">اختبارات بعد كل درس</div>
              </div>
              <div className="chalk-card p-3.5 rounded-xl">
                <div className="text-2xl font-black text-cyan-electric">مباشر</div>
                <div className="text-xs font-semibold text-slate-600 dark:text-chalk-muted">أكواد شحن فورية</div>
              </div>
            </div>

          </div>

          {/* Clean Teacher Badge & Graphic Avatar */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm text-center space-y-6">
              
              {/* Outer Geometric Glow */}
              <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-cyan-electric/20 via-blue-ink/30 to-cyan-electric/20 blur-3xl animate-pulse"></div>

              {/* Clean Avatar Ring with Official Teacher Photo */}
              <div className="relative w-64 h-80 mx-auto rounded-3xl bg-gradient-to-b from-cyan-electric to-blue-ink p-1 shadow-cyan-glow overflow-hidden">
                <div className="w-full h-full rounded-[22px] bg-slate-900 border-2 border-slate-950 overflow-hidden relative group">
                  <img
                    src="/teacher_reda_kheyrat.jpg"
                    alt="م/ رضا خيرت — معلم الرياضيات"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 text-center">
                    <span className="text-sm font-black text-chalk block">م/ رضا خيرت</span>
                  </div>
                </div>
              </div>

              {/* Clean Feature Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-chalk border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-electric" />
                  شرح مبسط وتطبيقي
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-chalk border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-cyan-electric" />
                  تفوق ودرجات نهائية
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
