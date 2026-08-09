'use client';

import Link from 'next/link';
import { ArrowLeft, PlayCircle, Award, CheckCircle2, Sigma, Calculator, Compass, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center py-16 lg:py-24 overflow-hidden">
      
      {/* Decorative Math Symbols Floating Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-15 select-none overflow-hidden font-math">
        <span className="absolute top-12 right-12 text-6xl text-cyan-electric font-bold rotate-12 drop-shadow-[0_0_10px_rgba(0,207,255,0.4)]">f(x) = ax² + bx + c</span>
        <span className="absolute top-1/4 left-16 text-5xl text-slate-800 dark:text-chalk rotate-[-15deg]">sin²θ + cos²θ = 1</span>
        <span className="absolute bottom-20 right-1/4 text-6xl text-cyan-electric font-bold">a² + b² = c²</span>
        <span className="absolute top-1/3 right-1/3 text-4xl text-slate-800 dark:text-chalk">√x + π ≈ 3.14</span>
        <span className="absolute bottom-16 left-12 text-7xl text-cyan-electric">∫ x dx</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-right">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-electric/10 border border-cyan-electric/30 text-cyan-electric text-sm font-bold shadow-cyan-glow">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>منصة الرياضيات الأولى للمرحلة الإعدادية والصف الأول الثانوي</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-chalk leading-tight tracking-tight">
              منصتك الأولى لتعلم
              <br />
              و فهم <span className="text-cyan-electric text-cyan-glow underline decoration-cyan-electric/40 decoration-wavy underline-offset-8">الرياضيات</span> بأسلوب
              <br />
              بسيط وممتع
            </h1>

            {/* Subheading */}
            <p className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-chalk/90 flex items-center justify-center lg:justify-start gap-3">
              <span className="w-8 h-1 bg-cyan-electric rounded-full inline-block shadow-cyan-glow"></span>
              مع م/ رضا خيرت
            </p>

            <p className="text-base sm:text-lg text-slate-600 dark:text-chalk-muted font-medium max-w-2xl leading-relaxed">
              شرح مبسط، تطبيق عملي، بنك أسئلة وافي لكل فكرة، واختبارات تفاعلية بعد كل درس لتضمن التفوق والدرجة النهائية بسهولة.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-extrabold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all duration-200 flex items-center justify-center gap-3 group"
              >
                <span>ابدأ الآن مجاناً</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#stages"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-slate-800 dark:text-chalk bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 transition-all flex items-center justify-center gap-3 shadow-sm"
              >
                <PlayCircle className="w-5 h-5 text-cyan-electric" />
                <span>استكشف المنهج والمراحل</span>
              </Link>
            </div>

            {/* Quick Highlights */}
            <div className="pt-6 border-t border-slate-300 dark:border-slate-800 grid grid-cols-3 gap-4 text-center">
              <div className="chalk-card p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15">
                <div className="text-2xl font-black text-cyan-electric text-cyan-glow">100%</div>
                <div className="text-xs font-semibold text-slate-600 dark:text-chalk-muted">تغطية شاملة للمنهج</div>
              </div>
              <div className="chalk-card p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15">
                <div className="text-2xl font-black text-slate-900 dark:text-chalk">MCQ</div>
                <div className="text-xs font-semibold text-slate-600 dark:text-chalk-muted">اختبارات بعد كل درس</div>
              </div>
              <div className="chalk-card p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15">
                <div className="text-2xl font-black text-cyan-electric">مباشر</div>
                <div className="text-xs font-semibold text-slate-600 dark:text-chalk-muted">أكواد شحن فورية</div>
              </div>
            </div>

          </div>

          {/* Graphical Teacher Illustration Container */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              
              {/* Outer Geometric Glow */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-cyan-electric/20 via-blue-ink/30 to-cyan-electric/10 blur-2xl animate-pulse"></div>

              {/* Main Card Container */}
              <div className="relative rounded-3xl bg-white/90 dark:bg-slate-950/80 backdrop-blur-2xl border-2 border-slate-200 dark:border-cyan-electric/40 p-6 shadow-cyan-glow-lg overflow-hidden text-center space-y-6">
                
                {/* Board Decorative Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-chalk-muted">
                  <span className="flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-cyan-electric" />
                    منهج الرياضيات الحديث
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-cyan-electric/15 text-cyan-electric border border-cyan-electric/30 font-bold">
                    إعدادي + أولى ثانوي
                  </span>
                </div>

                {/* Teacher Graphic Avatar Area */}
                <div className="relative w-44 h-44 mx-auto rounded-full bg-gradient-to-b from-blue-ink to-slate-900 border-4 border-cyan-electric flex items-center justify-center shadow-cyan-glow overflow-hidden">
                  <div className="text-center space-y-1">
                    <Sigma className="w-16 h-16 mx-auto text-cyan-electric animate-bounce" />
                    <span className="block text-sm font-extrabold text-chalk">م/ رضا خيرت</span>
                  </div>
                </div>

                {/* Info Text inside Card */}
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-chalk">الرياضيات أسهل مع المهندس</h3>
                  <p className="text-xs text-slate-600 dark:text-chalk-muted leading-relaxed">
                    خطوات مبرهنة وواضحة لحل أصعب المسائل في الجبر، الهندسة، والتفاضل وحساب المثلثات.
                  </p>
                </div>

                {/* Badges */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-900/90 text-xs font-bold text-slate-800 dark:text-chalk border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-electric" />
                    فيديوهات فائقة الجودة
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-900/90 text-xs font-bold text-slate-800 dark:text-chalk border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-cyan-electric" />
                    مذكرات PDF متميزة
                  </span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
