'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ChevronLeft, Layers, CheckCircle2, Award, Sparkles, GraduationCap } from 'lucide-react';
import { SlideTabs } from '@/components/ui/slide-tabs';
import { getCurrentUser, UserSession } from '@/lib/actions/auth';

const STAGES = [
  {
    id: 'prep-1',
    name: 'الصف الأول الإعدادي',
    stageCategory: 'prep',
    stage: 'المرحلة الإعدادية',
    image: '/courses/prep-1.jpg',
    description: 'تأسيس متين في الجبر والهندسة، دراسة الأعداد النسبية والإنشاءات الهندسية الأساسية.',
    branches: ['جبر وإحصاء', 'هندسة وقياس'],
    badge: '1 إعدادي',
  },
  {
    id: 'prep-2',
    name: 'الصف الثاني الإعدادي',
    stageCategory: 'prep',
    stage: 'المرحلة الإعدادية',
    image: '/courses/prep-2.jpg',
    description: 'تعمق في الأعداد الحقيقية والتحليل الرياضي ونظريات المثلثات والتشابه.',
    branches: ['جبر وإحصاء', 'هندسة وتحليل'],
    badge: '2 إعدادي',
  },
  {
    id: 'prep-3',
    name: 'الصف الثالث الإعدادي',
    stageCategory: 'prep',
    stage: 'المرحلة الإعدادية',
    image: '/courses/prep-3.jpg',
    description: 'الشهادة الإعدادية: دراسة العلاقات والدوال، حساب المثلثات، والهندسة التحليلية.',
    branches: ['جبر وحساب مثلثات', 'هندسة تحليلية'],
    badge: '3 إعدادي • الشهادة',
  },
  {
    id: 'sec-1',
    name: 'الصف الأول الثانوي',
    stageCategory: 'sec',
    stage: 'المرحلة الثانوية',
    image: '/courses/sec-1.jpg',
    description: 'الانتقال للرياضيات المتقدمة: الأعداد المركبة، المصفوفات، وتطبيقات الهندسة المستوية.',
    branches: ['جبر وأعداد مركبة', 'حساب مثلثات', 'هندسة تحليلية'],
    badge: '1 ثانوي',
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

  return (
    <section id="stages" className="py-20 bg-transparent border-t border-slate-200 dark:border-slate-800/80 relative overflow-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30 text-cyan-electric text-xs font-bold shadow-cyan-glow">
            <Layers className="w-4 h-4" />
            <span>المناهج والمراحل الدراسية</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-chalk tracking-tight">
            {user ? `المناهج والكورسات الدراسية المتاحة` : `اختر صفك الدراسي وابدأ رحلة التفوق`}
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
                className={`rounded-3xl flex flex-col justify-between relative group overflow-hidden bg-white/90 dark:bg-slate-900/80 border transition-all duration-300 hover:shadow-cyan-glow-lg hover:border-cyan-electric/50 shadow-sm ${
                  isRegisteredGrade
                    ? 'border-cyan-electric ring-2 ring-cyan-electric shadow-cyan-glow'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Registered Student Badge */}
                {isRegisteredGrade && (
                  <div className="bg-cyan-electric text-black text-[11px] font-black px-3 py-1.5 text-center flex items-center justify-center gap-1.5 shadow-sm z-20 relative">
                    <Award className="w-4 h-4" />
                    <span>صفك الدراسي المسجل حالياً</span>
                  </div>
                )}

                {/* Course Cover Image Banner */}
                <div className="relative w-full h-44 bg-slate-950 overflow-hidden">
                  <Image
                    src={stage.image}
                    alt={stage.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-between p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-cyan-electric text-black text-[11px] font-black shadow-cyan-glow">
                        {stage.badge}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                        {stage.stage}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-cyan-electric">
                      مادة الرياضيات • م/ رضا خيرت
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-chalk group-hover:text-cyan-electric transition-colors">
                      {stage.name}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-chalk-muted leading-relaxed line-clamp-2 font-medium">
                      {stage.description}
                    </p>

                    {/* Branches Chips */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {stage.branches.map((b, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold text-slate-700 dark:text-chalk/80 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                          • {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Action Link */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={`/courses/${encodeURIComponent(stage.name)}`}
                      className="w-full py-2.5 rounded-xl text-xs font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-1.5 group-hover:shadow-cyan-glow-lg"
                    >
                      <span>عرض دروس ومذكرات الصف</span>
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
