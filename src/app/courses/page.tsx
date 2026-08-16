'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getCurrentUser, UserSession } from '@/lib/actions/auth';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  Search,
  Lock,
  Compass,
  Calculator,
  Binary,
} from 'lucide-react';

interface GradeCardData {
  id: string;
  name: string;
  stage: 'إعدادي' | 'ثانوي';
  badge: string;
  description: string;
  branches: string[];
  terms: string[];
  lessonsCount: number;
  totalHours: number;
  quizzesCount: number;
  highlight: string;
}

const GRADES_DATA: GradeCardData[] = [
  {
    id: 'g-prep-1',
    name: 'الصف الأول الإعدادي',
    stage: 'إعدادي',
    badge: '1 إعدادي',
    description: 'تأسيس متين في الأعداد النسبية، الحدود والمقادير الجبرية، والمفاهيم الهندسية الأساسية والتطابق.',
    branches: ['فرع الجبر والإحصاء', 'فرع الهندسة والقياس'],
    terms: ['الترم الأول', 'الترم الثاني'],
    lessonsCount: 16,
    totalHours: 12,
    quizzesCount: 8,
    highlight: 'شامل التمارين التطبيقية والامتحانات الشهرية',
  },
  {
    id: 'g-prep-2',
    name: 'الصف الثاني الإعدادي',
    stage: 'إعدادي',
    badge: '2 إعدادي',
    description: 'التحليل الجبري الكامل، العمليات على الجذور، نظريات المثلث متساوي الساقين والتشابه.',
    branches: ['فرع الجبر والإحصاء', 'فرع الهندسة والقياس'],
    terms: ['الترم الأول', 'الترم الثاني'],
    lessonsCount: 18,
    totalHours: 15,
    quizzesCount: 10,
    highlight: 'تمارين مستويات عليا وأفكار امتحانات المحافظات',
  },
  {
    id: 'g-prep-3',
    name: 'الصف الثالث الإعدادي',
    stage: 'إعدادي',
    badge: '3 إعدادي • الشهادة',
    description: 'سنة الشهادة الإعدادية: حاصل الضرب الديكارتي، النسب والتناسب، الدائرة والزوايا، وحساب المثلثات.',
    branches: ['فرع الجبر والإحصاء', 'فرع الهندسة وحساب المثلثات'],
    terms: ['الترم الأول', 'الترم الثاني'],
    lessonsCount: 22,
    totalHours: 18,
    quizzesCount: 14,
    highlight: 'مراجعات نهائية مكثفة وتوقعات ليلة الامتحان',
  },
  {
    id: 'g-sec-1',
    name: 'الصف الأول الثانوي',
    stage: 'ثانوي',
    badge: '1 ثانوي',
    description: 'الانتقال للمرحلة الثانوية: الأعداد المركبة، المصفوفات، المتجهات، وحساب المثلثات المتقدم.',
    branches: ['فرع الجبر والأعداد المركبة', 'فرع الهندسة المستوية والتحليلية', 'فرع حساب المثلثات'],
    terms: ['الترم الأول', 'الترم الثاني'],
    lessonsCount: 24,
    totalHours: 20,
    quizzesCount: 16,
    highlight: 'نظام التابلت الحديث وأسئلة الفهم والتطبيق',
  },
];

export default function CoursesCatalogPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<'ALL' | 'إعدادي' | 'ثانوي'>('ALL');

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    }
    loadUser();
  }, []);

  const filteredGrades = GRADES_DATA.filter((g) => {
    const matchesStage = selectedStage === 'ALL' || g.stage === selectedStage;
    const matchesQuery =
      !searchQuery.trim() ||
      g.name.includes(searchQuery.trim()) ||
      g.description.includes(searchQuery.trim()) ||
      g.branches.some((b) => b.includes(searchQuery.trim()));
    return matchesStage && matchesQuery;
  });

  return (
    <DarkGradientBg>
      <Navbar />

      <main className="min-h-screen font-arabic py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-cyan-electric transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-cyan-electric font-bold">دليل المناهج والكورسات</span>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-electric/15 border border-cyan-electric/30 text-cyan-electric text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>مناهج الرياضيات للمرحلتين الإعدادية والثانوية</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-chalk tracking-tight">
                اختر صفك الدراسي وابدأ رحلة التفوق مع <span className="text-cyan-electric">م/ رضا خيرت</span>
              </h1>
              <p className="text-xs sm:text-sm text-chalk-muted leading-relaxed">
                شرح مبسط، مذكرات PDF مطبوعة بدقة عالية، تدريبات تفاعلية على كل درس، وامتحانات دورية تحاكي اختبارات الوزارة.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <p className="text-xl sm:text-2xl font-black text-cyan-electric">4</p>
                <p className="text-[11px] text-chalk-muted font-bold">صفوف دراسية كاملة</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <p className="text-xl sm:text-2xl font-black text-emerald-400">80+</p>
                <p className="text-[11px] text-chalk-muted font-bold">درس وشرح فيديو</p>
              </div>
            </div>
          </div>

          {/* Student Assigned Grade Callout */}
          {user && user.role === 'STUDENT' && user.gradeName && (
            <div className="p-4 sm:p-5 rounded-2xl bg-cyan-electric/10 border border-cyan-electric/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-right w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-cyan-electric/20 text-cyan-electric flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-chalk">
                    أهلاً بك يا {user.fullName}! صفك الدراسي الحالي: <span className="text-cyan-electric font-black">{user.gradeName}</span>
                  </h4>
                  <p className="text-[11px] text-chalk-muted">
                    انقر هنا للدخول المباشر إلى منهجك ومتابعة الدروس والامتحانات المخصصة لك.
                  </p>
                </div>
              </div>

              <Link
                href={`/courses/${encodeURIComponent(user.gradeName)}`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-electric text-slate-950 font-black text-xs flex items-center justify-center gap-2 hover:shadow-cyan-glow transition-all shrink-0"
              >
                <span>دخول منهجي الدراسي</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن صف، فرع، أو موضوع..."
              className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-chalk text-xs focus:border-cyan-electric focus:outline-none placeholder:text-slate-500"
            />
          </div>

          {/* Stage Filter Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSelectedStage('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedStage === 'ALL'
                  ? 'bg-cyan-electric text-slate-950 shadow-cyan-glow'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              جميع المراحل
            </button>
            <button
              onClick={() => setSelectedStage('إعدادي')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedStage === 'إعدادي'
                  ? 'bg-cyan-electric text-slate-950 shadow-cyan-glow'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              المرحلة الإعدادية
            </button>
            <button
              onClick={() => setSelectedStage('ثانوي')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedStage === 'ثانوي'
                  ? 'bg-cyan-electric text-slate-950 shadow-cyan-glow'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              المرحلة الثانوية
            </button>
          </div>
        </div>

        {/* Grade Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGrades.map((grade) => {
            const isUserGrade = user && user.gradeName === grade.name;

            return (
              <div
                key={grade.id}
                className={`relative rounded-3xl p-6 sm:p-7 bg-slate-900/80 border transition-all duration-300 backdrop-blur-xl flex flex-col justify-between space-y-6 group hover:border-cyan-electric/50 hover:shadow-2xl ${
                  isUserGrade ? 'border-cyan-electric shadow-lg shadow-cyan-electric/10' : 'border-slate-800'
                }`}
              >
                {/* Top Badge & Stage */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-cyan-electric/15 text-cyan-electric border border-cyan-electric/30 text-xs font-black">
                      {grade.badge}
                    </span>
                    <span className="text-xs text-chalk-muted font-medium">المرحلة الـ{grade.stage}ة</span>
                  </div>

                  {isUserGrade && (
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      صفك المسجل
                    </span>
                  )}
                </div>

                {/* Grade Title & Description */}
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-chalk group-hover:text-cyan-electric transition-colors">
                    {grade.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-chalk-muted leading-relaxed">
                    {grade.description}
                  </p>
                </div>

                {/* Branches List */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400">الفروع المقررة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {grade.branches.map((b, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-medium"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 text-center">
                  <div>
                    <p className="text-xs sm:text-sm font-black text-chalk">{grade.lessonsCount} درس</p>
                    <p className="text-[10px] text-chalk-muted">شرح وتدريبات</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-cyan-electric">{grade.totalHours} ساعة</p>
                    <p className="text-[10px] text-chalk-muted">محتوى تفاعلي</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-emerald-400">{grade.quizzesCount} امتحان</p>
                    <p className="text-[10px] text-chalk-muted">تقييم مستمر</p>
                  </div>
                </div>

                {/* Action CTA Button */}
                <div>
                  <Link
                    href={`/courses/${encodeURIComponent(grade.name)}`}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-electric to-blue-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:shadow-cyan-glow transition-all"
                  >
                    <span>استكشاف المنهج والدروس</span>
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </DarkGradientBg>
  );
}
