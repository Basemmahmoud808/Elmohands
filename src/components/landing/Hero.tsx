'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, PlayCircle, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { getCurrentUser, UserSession } from '@/lib/actions/auth';

export default function Hero() {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    async function loadUser() {
      const sessionUser = await getCurrentUser();
      setUser(sessionUser);
    }
    loadUser();
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center py-10 lg:py-16 overflow-hidden">
      
      {/* Decorative Light Math Formulas Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-15 select-none overflow-hidden font-math">
        <span className="absolute top-10 left-12 text-4xl lg:text-5xl text-cyan-electric/40 font-bold rotate-[-10deg]">sin²θ + cos²θ</span>
        <span className="absolute top-1/4 right-1/4 text-3xl lg:text-4xl text-slate-400 dark:text-chalk/30 rotate-12">x + π ≈ 3.14</span>
        <span className="absolute bottom-12 left-10 text-5xl lg:text-6xl text-cyan-electric/40">x dx ∫</span>
        <span className="absolute bottom-20 right-16 text-4xl lg:text-5xl text-slate-400 dark:text-chalk/30">f(x) = ax² + c</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Right Column: Hero Text & Main CTAs (Appears on right in RTL) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right order-1 lg:order-1">
            
            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-chalk leading-[1.25] tracking-tight">
              و فهم <span className="text-cyan-electric">الرياضيات بأسلوب</span>
              <br />
              بسيط وممتع
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-chalk flex items-center justify-center lg:justify-start gap-3">
              <span className="w-8 h-1 bg-cyan-electric rounded-full inline-block"></span>
              <span>مع م/ رضا خيرت</span>
            </p>

            <p className="text-sm sm:text-base text-slate-600 dark:text-chalk-muted font-bold max-w-xl leading-relaxed">
              شرح مبسط، تطبيق عملي، بنك أسئلة وافي لكل فكرة، واختبارات تفاعلية بعد كل درس لتضمن التفوق والدرجة النهائية بسهولة.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {user ? (
                <Link
                  href={user.role === 'ADMIN' ? '/admin' : '/student'}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm sm:text-base font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>دخول كورسات {user.gradeName || 'صفك الدراسي'} ➔</span>
                </Link>
              ) : (
                <Link
                  href="/sign-up"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm sm:text-base font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2"
                >
                  <span>ابدأ الآن مجاناً</span>
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              )}

              <Link
                href="#stages"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm sm:text-base font-bold text-slate-800 dark:text-chalk bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <PlayCircle className="w-5 h-5 text-cyan-electric" />
                <span>استكشف المنهج والمراحل</span>
              </Link>
            </div>

            {/* 3 Stats Highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 text-center">
              <div className="chalk-card p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
                <div className="text-xl sm:text-2xl font-black text-cyan-electric">100%</div>
                <div className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-chalk-muted mt-1">تغطية شاملة للمنهج</div>
              </div>

              <div className="chalk-card p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">MCQ</div>
                <div className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-chalk-muted mt-1">اختبارات بعد كل درس</div>
              </div>

              <div className="chalk-card p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
                <div className="text-xl sm:text-2xl font-black text-cyan-electric">مباشر</div>
                <div className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-chalk-muted mt-1">أكواد شحن فورية</div>
              </div>
            </div>

          </div>

          {/* Left Column: Teacher Portrait Card (Appears on left in RTL) */}
          <div className="lg:col-span-5 flex justify-center order-2 lg:order-2">
            <div className="relative w-full max-w-sm text-center space-y-5">
              
              {/* Outer Cyan Glow Effect */}
              <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-cyan-electric/20 via-blue-ink/30 to-cyan-electric/20 blur-3xl animate-pulse"></div>

              {/* High Quality Portrait Ring Frame */}
              <div className="relative w-64 sm:w-72 h-80 sm:h-96 mx-auto rounded-3xl bg-gradient-to-b from-cyan-electric to-blue-ink p-1 shadow-cyan-glow overflow-hidden">
                <div className="w-full h-full rounded-[22px] bg-slate-900 border-2 border-slate-950 overflow-hidden relative group">
                  
                  {/* Top Chalkboard Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="text-[11px] font-extrabold text-chalk border border-slate-700/80 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md inline-block">
                      دروس الرياضيات
                    </span>
                  </div>

                  <img
                    src="/teacher_reda_kheyrat.jpg"
                    alt="م/ رضا خيرت — معلم الرياضيات"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Bottom Teacher Name Badge */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 text-center">
                    <span className="text-sm font-black text-chalk block">م/ رضا خيرت</span>
                  </div>
                </div>
              </div>

              {/* Bottom Feature Badges */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <span className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 text-xs font-extrabold text-slate-800 dark:text-chalk border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-electric" />
                  <span>شرح مبسط وتطبيقي</span>
                </span>
                <span className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 text-xs font-extrabold text-slate-800 dark:text-chalk border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-electric" />
                  <span>تفوق ودرجات نهائية</span>
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
