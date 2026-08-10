'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronLeft, Layers, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { SlideTabs } from '@/components/ui/slide-tabs';
import { getCurrentUser, UserSession } from '@/lib/actions/auth';

const STAGES = [
  {
    id: 'prep-1',
    name: 'الصف الأول الإعدادي',
    stageCategory: 'prep',
    stage: 'المرحلة الإعدادية',
    description: 'تأسيس متين في الجبر والهندسة، دراسة الأعداد النسبية والإنشاءات الهندسية الأساسية.',
    branches: ['جبر وإحصاء', 'هندسة وقياس'],
    lessonsCount: 24,
    quizzesCount: 12,
  },
  {
    id: 'prep-2',
    name: 'الصف الثاني الإعدادي',
    stageCategory: 'prep',
    stage: 'المرحلة الإعدادية',
    description: 'تعمق في الأعداد الحقيقية والتحليل الرياضي ونظريات المثلثات والمتوازيات.',
    branches: ['جبر وإحصاء', 'هندسة وتحليل'],
    lessonsCount: 28,
    quizzesCount: 14,
  },
  {
    id: 'prep-3',
    name: 'الصف الثالث الإعدادي',
    stageCategory: 'prep',
    stage: 'المرحلة الإعدادية',
    description: 'الشهادة الإعدادية: دراسة العلاقات والدوال، حساب المثلثات، والهندسة التحليلية.',
    branches: ['جبر وحساب مثلثات', 'هندسة تحليلية'],
    lessonsCount: 32,
    quizzesCount: 16,
    badge: 'الشهادة الإعدادية',
  },
  {
    id: 'sec-1',
    name: 'الصف الأول الثانوي',
    stageCategory: 'sec',
    stage: 'المرحلة الثانوية',
    description: 'الانتقال للرياضيات المتقدمة: الأعداد المركبة، المصفوفات، وتطبيقات الهندسة المستوية.',
    branches: ['جبر وأعداد مركبة', 'حساب مثلثات', 'هندسة مستوية'],
    lessonsCount: 36,
    quizzesCount: 18,
    badge: 'مرحلة ثانوية',
  },
];

export default function Stages() {
  const [activeFilter, setActiveFilter] = useState('prep');
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    async function loadUser() {
      const sessionUser = await getCurrentUser();
      setUser(sessionUser);
    }
    loadUser();
  }, []);

  const filteredStages = STAGES.filter((s) => {
    if (activeFilter === 'prep') return s.stageCategory === 'prep';
    if (activeFilter === 'sec') return s.stageCategory === 'sec';
    return true;
  });

  const studentGrade = user?.gradeName || 'الصف الأول الإعدادي';
  const targetDashboardRoute = user ? (user.role === 'ADMIN' ? '/admin' : '/student') : '/sign-up';

  return (
    <section id="stages" className="py-20 bg-transparent border-t border-slate-200 dark:border-slate-800/80 relative overflow-hidden transition-colors duration-200">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Logged in Student Personalized Greeting Banner */}
        {user && user.role === 'STUDENT' && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-electric/20 via-blue-900/30 to-slate-900 border-2 border-cyan-electric/40 shadow-cyan-glow space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-electric" />
                  <span className="text-sm font-extrabold text-cyan-electric">أهلاً بك مجدداً، {user.fullName}!</span>
                </div>
                <h3 className="text-xl font-black text-chalk">
                  الكورسات والمناهج المتاحة لصفك الدراسي ({studentGrade})
                </h3>
              </div>

              <Link
                href="/student"
                className="px-6 py-3 rounded-2xl text-xs font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center gap-2 shrink-0"
              >
                <span>الدخول لداشبورد الدروس والمعاينات ➔</span>
              </Link>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30 text-cyan-electric text-xs font-bold shadow-cyan-glow">
            <Layers className="w-4 h-4" />
            <span>المناهج والمراحل الدراسية</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-chalk tracking-tight">
            {user ? `المراحل والكورسات الدراسية المتاحة` : `اختر صفك الدراسي وابدأ رحلة التفوق`}
          </h2>

          {/* Framer Motion Sliding Tabs */}
          <div className="pt-4">
            <SlideTabs
              tabs={[
                { id: 'prep', label: 'المرحلة الإعدادية' },
                { id: 'sec', label: 'المرحلة الثانوية' },
              ]}
              activeId={activeFilter}
              onChange={(id) => setActiveFilter(id)}
            />
          </div>
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredStages.map((stage) => {
            const isRegisteredGrade = user && user.gradeName === stage.name;

            return (
              <div
                key={stage.id}
                className={`chalk-card rounded-2xl p-6 flex flex-col justify-between relative group overflow-hidden bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 hover:border-cyan-electric/50 transition-all ${
                  isRegisteredGrade ? 'ring-2 ring-cyan-electric shadow-cyan-glow' : ''
                }`}
              >
                {isRegisteredGrade && (
                  <div className="bg-cyan-electric text-black text-[10px] font-black px-3 py-1 text-center -mx-6 -mt-6 mb-4 flex items-center justify-center gap-1 shadow-sm">
                    <Award className="w-3.5 h-3.5" />
                    <span>صفك الدراسي المسجل حالياً</span>
                  </div>
                )}
                
                {/* Top Card Banner */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-electric px-2.5 py-1 rounded-md bg-cyan-electric/10 border border-cyan-electric/30">
                      {stage.stage}
                    </span>
                    {stage.badge && (
                      <span className="text-xs font-bold text-black px-2.5 py-1 rounded-md bg-cyan-electric shadow-cyan-glow">
                        {stage.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-chalk group-hover:text-cyan-electric transition-colors">
                    {stage.name}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-chalk-muted leading-relaxed line-clamp-3">
                    {stage.description}
                  </p>

                  {/* Branches Chips */}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {stage.branches.map((b, idx) => (
                      <span key={idx} className="text-[11px] font-semibold text-slate-700 dark:text-chalk/80 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        • {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Info */}
                <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800/80 space-y-4">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-chalk-muted">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-electric" />
                      {stage.lessonsCount} درس متاح
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-electric" />
                      {stage.quizzesCount} اختبار MCQ
                    </span>
                  </div>

                  <Link
                    href={targetDashboardRoute}
                    className="w-full py-2.5 rounded-xl text-xs font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2 group-hover:shadow-cyan-glow-lg"
                  >
                    <span>{user ? `الانتقال لدروسك وكورساتك ➔` : `استعرض المحتوى`}</span>
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
