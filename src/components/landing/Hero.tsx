'use client';

import Link from 'next/link';
import { ArrowLeft, PlayCircle, Award, CheckCircle2, Sigma, Calculator, Compass } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center py-16 lg:py-24 overflow-hidden">
      
      {/* Decorative Blackboard Math Symbols Floating Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 select-none overflow-hidden font-math">
        <span className="absolute top-12 right-12 text-6xl text-brass-compass font-bold rotate-12">f(x) = ax² + bx + c</span>
        <span className="absolute top-1/4 left-16 text-5xl text-chalk rotate-[-15deg]">sin²θ + cos²θ = 1</span>
        <span className="absolute bottom-20 right-1/4 text-6xl text-brass-compass font-bold">a² + b² = c²</span>
        <span className="absolute top-1/3 right-1/3 text-4xl text-chalk">√x + π ≈ 3.14</span>
        <span className="absolute bottom-16 left-12 text-7xl text-brass-compass">∫ x dx</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-right">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brass-compass/10 border border-brass-compass/30 text-brass-compass text-sm font-bold shadow-chalk">
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>منصة الرياضيات الأولى للمرحلة الإعدادية والصف الأول الثانوي</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-chalk leading-tight tracking-tight">
              منصتك الأولى لتعلم
              <br />
              و فهم <span className="text-brass-compass underline decoration-brass-compass/40 decoration-wavy underline-offset-8">الرياضيات</span> بأسلوب
              <br />
              بسيط وممتع
            </h1>

            {/* Subheading */}
            <p className="text-xl sm:text-2xl font-bold text-chalk/90 flex items-center justify-center lg:justify-start gap-3">
              <span className="w-8 h-1 bg-red-pen rounded-full inline-block"></span>
              مع م/ رضا خيرت
            </p>

            <p className="text-base sm:text-lg text-chalk-muted font-medium max-w-2xl leading-relaxed">
              شرح مبسط، تطبيق عملي، بنك أسئلة وافي لكل فكرة، واختبارات تفاعلية بعد كل درس لتضمن التفوق والدرجة النهائية بسهولة.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-chalk bg-blue-ink hover:bg-blue-ink-hover shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 group"
              >
                <span>ابدأ الآن مجاناً</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#stages"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-chalk bg-black/40 hover:bg-black/60 border border-chalk/20 transition-all flex items-center justify-center gap-3"
              >
                <PlayCircle className="w-5 h-5 text-brass-compass" />
                <span>استكشف المنهج والمراحل</span>
              </Link>
            </div>

            {/* Quick Highlights */}
            <div className="pt-6 border-t border-chalk/10 grid grid-cols-3 gap-4 text-center">
              <div className="chalk-card p-3 rounded-xl">
                <div className="text-2xl font-black text-brass-compass">100%</div>
                <div className="text-xs font-semibold text-chalk-muted">تغطية شاملة للمنهج</div>
              </div>
              <div className="chalk-card p-3 rounded-xl">
                <div className="text-2xl font-black text-chalk">MCQ</div>
                <div className="text-xs font-semibold text-chalk-muted">اختبارات بعد كل درس</div>
              </div>
              <div className="chalk-card p-3 rounded-xl">
                <div className="text-2xl font-black text-red-pen">مباشر</div>
                <div className="text-xs font-semibold text-chalk-muted">أكواد شحن فورية</div>
              </div>
            </div>

          </div>

          {/* Graphical Teacher Illustration Container */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              
              {/* Outer Geometric Ring */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-brass-compass/20 via-blue-ink/30 to-red-pen/20 blur-xl animate-pulse"></div>

              {/* Main Card Container */}
              <div className="relative rounded-3xl bg-black/70 backdrop-blur-xl border-2 border-brass-compass/40 p-6 shadow-2xl overflow-hidden text-center space-y-6">
                
                {/* Chalk Board Decorative Header */}
                <div className="flex items-center justify-between pb-4 border-b border-chalk/10 text-xs font-semibold text-chalk-muted">
                  <span className="flex items-center gap-1">
                    <Calculator className="w-4 h-4 text-brass-compass" />
                    منهج الرياضيات الحديث
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-pen/20 text-red-pen font-bold">
                    إعدادي + أولى ثانوي
                  </span>
                </div>

                {/* Teacher Graphic Avatar Area */}
                <div className="relative w-44 h-44 mx-auto rounded-full bg-gradient-to-b from-blue-ink to-black/80 border-4 border-brass-compass flex items-center justify-center shadow-inner overflow-hidden">
                  <div className="text-center space-y-1">
                    <Sigma className="w-16 h-16 mx-auto text-brass-compass animate-bounce" />
                    <span className="block text-sm font-extrabold text-chalk">م/ رضا خيرت</span>
                  </div>
                </div>

                {/* Info Text inside Card */}
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-chalk">الرياضيات أسهل مع المهندس</h3>
                  <p className="text-xs text-chalk-muted leading-relaxed">
                    خطوات مبرهنة وواضحة لحل أصعب المسائل في الجبر، الهندسة، والتفاضل وحساب المثلثات.
                  </p>
                </div>

                {/* Badges */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="px-3 py-1 rounded-lg bg-black/50 text-xs font-bold text-chalk border border-chalk/10 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brass-compass" />
                    فيديوهات فائقة الجودة
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-black/50 text-xs font-bold text-chalk border border-chalk/10 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-brass-compass" />
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
