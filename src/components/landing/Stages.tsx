'use client';

import Link from 'next/link';
import { BookOpen, ChevronLeft, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

const STAGES = [
  {
    id: 'prep-1',
    name: 'الصف الأول الإعدادي',
    stage: 'المرحلة الإعدادية',
    description: 'تأسيس متين في الجبر والهندسة، دراسة الأعداد النسبية والإنشاءات الهندسية الأساسية.',
    branches: ['جبر وإحصاء', 'هندسة وقياس'],
    lessonsCount: 24,
    quizzesCount: 12,
    color: 'from-blue-ink to-blackboard-light',
  },
  {
    id: 'prep-2',
    name: 'الصف الثاني الإعدادي',
    stage: 'المرحلة الإعدادية',
    description: 'تعمق في الأعداد الحقيقية والتحليل الرياضي ونظريات المثلثات والمتوازيات.',
    branches: ['جبر وإحصاء', 'هندسة وتحليل'],
    lessonsCount: 28,
    quizzesCount: 14,
    color: 'from-brass-compass/30 to-blackboard-light',
  },
  {
    id: 'prep-3',
    name: 'الصف الثالث الإعدادي',
    stage: 'المرحلة الإعدادية',
    description: 'الشهادة الإعدادية: دراسة العلاقات والدوال، حساب المثلثات، والهندسة التحليلية.',
    branches: ['جبر وحساب مثلثات', 'هندسة تحليلية'],
    lessonsCount: 32,
    quizzesCount: 16,
    color: 'from-red-pen/30 to-blackboard-light',
    badge: 'الشهادة الإعدادية',
  },
  {
    id: 'sec-1',
    name: 'الصف الأول الثانوي',
    stage: 'المرحلة الثانوية',
    description: 'الانتقال للرياضيات المتقدمة: الأعداد المركبة، المصفوفات، وتطبيقات الهندسة المستوية.',
    branches: ['جبر وأعداد مركبة', 'حساب مثلثات', 'هندسة مستوية'],
    lessonsCount: 36,
    quizzesCount: 18,
    color: 'from-blue-ink/80 to-blackboard-dark',
    badge: 'مرحلة ثانوية',
  },
];

export default function Stages() {
  return (
    <section id="stages" className="py-20 bg-blackboard border-t border-chalk/10 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brass-compass/15 border border-brass-compass/30 text-brass-compass text-xs font-bold">
            <Layers className="w-4 h-4" />
            <span>المناهج والمراحل الدراسية</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-chalk tracking-tight">
            اختر صفك الدراسي وابدأ رحلة التفوق
          </h2>
          
          <p className="text-chalk-muted text-base sm:text-lg">
            مناهج منسقة بعناية طبقاً للتحديثات الوزارية الأخيرة، مقسمة لـ (أترم - فروع - وحدات - دروس - اختبارات).
          </p>
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STAGES.map((stage) => (
            <div
              key={stage.id}
              className="chalk-card rounded-2xl p-6 flex flex-col justify-between relative group overflow-hidden"
            >
              
              {/* Top Card Banner */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brass-compass px-2.5 py-1 rounded-md bg-brass-compass/10 border border-brass-compass/20">
                    {stage.stage}
                  </span>
                  {stage.badge && (
                    <span className="text-xs font-bold text-chalk px-2.5 py-1 rounded-md bg-red-pen">
                      {stage.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-chalk group-hover:text-brass-compass transition-colors">
                  {stage.name}
                </h3>

                <p className="text-xs text-chalk-muted leading-relaxed line-clamp-3">
                  {stage.description}
                </p>

                {/* Branches Chips */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {stage.branches.map((b, idx) => (
                    <span key={idx} className="text-[11px] font-semibold text-chalk/80 px-2 py-0.5 rounded bg-blackboard-light border border-chalk/10">
                      • {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="pt-6 mt-6 border-t border-chalk/10 space-y-4">
                <div className="flex items-center justify-between text-xs font-medium text-chalk-muted">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-brass-compass" />
                    {stage.lessonsCount} درس متاح
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brass-compass" />
                    {stage.quizzesCount} اختبار MCQ
                  </span>
                </div>

                <Link
                  href="/sign-up"
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-chalk bg-blue-ink hover:bg-blue-ink-hover transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                >
                  <span>استعرض المحتوى</span>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
