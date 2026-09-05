'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getCurrentUser, UserSession } from '@/lib/actions/auth';
import { getFullCurriculumTreeAction } from '@/lib/actions/courses';
import { CurriculumGradeDTO } from '@/lib/types/dashboard';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  Search,
  Video,
  FileText,
  HelpCircle,
} from 'lucide-react';

interface GradeCardView {
  id: string;
  name: string;
  stage: string;
  badge: string;
  description: string;
  branches: string[];
  terms: string[];
  lessonsCount: number;
  totalMinutes: number;
  coverImage?: string | null;
}

const DEFAULT_GRADE_CATALOG: GradeCardView[] = [
  {
    id: 'g-prep-1',
    name: 'الصف الأول الإعدادي',
    stage: 'إعدادي',
    badge: '1 إعدادي',
    description: 'كورس الرياضيات المتكامل: الأعداد النسبية، الجبر، الإحصاء، والمفاهيم الهندسية الأساسية والتطابق.',
    branches: ['فرع الجبر والإحصاء', 'فرع الهندسة والقياس'],
    terms: ['الترم الأول', 'الترم الثاني'],
    lessonsCount: 0,
    totalMinutes: 0,
    coverImage: '/courses/prep-1.jpg',
  },
  {
    id: 'g-prep-2',
    name: 'الصف الثاني الإعدادي',
    stage: 'إعدادي',
    badge: '2 إعدادي',
    description: 'كورس الرياضيات المتكامل: التحليل الجبري الكامل، العمليات على الجذور، نظريات المثلث والتشابه.',
    branches: ['فرع الجبر والإحصاء', 'فرع الهندسة والقياس'],
    terms: ['الترم الأول', 'الترم الثاني'],
    lessonsCount: 0,
    totalMinutes: 0,
    coverImage: '/courses/prep-2.jpg',
  },
  {
    id: 'g-prep-3',
    name: 'الصف الثالث الإعدادي',
    stage: 'إعدادي',
    badge: '3 إعدادي • الشهادة',
    description: 'كورس الشهادة الإعدادية: حاصل الضرب الديكارتي، النسب والتناسب، الدائرة والزوايا، وحساب المثلثات.',
    branches: ['فرع الجبر والإحصاء', 'فرع الهندسة وحساب المثلثات'],
    terms: ['الترم الأول', 'الترم الثاني'],
    lessonsCount: 0,
    totalMinutes: 0,
    coverImage: '/courses/prep-3.jpg',
  },
  {
    id: 'g-sec-1',
    name: 'الصف الأول الثانوي',
    stage: 'ثانوي',
    badge: '1 ثانوي',
    description: 'كورس المرحلة الثانوية: الأعداد المركبة، المصفوفات، المتجهات، وحساب المثلثات المتقدم بنظام التابلت الحديث.',
    branches: ['فرع الجبر والأعداد المركبة', 'فرع الهندسة التحليلية', 'فرع حساب المثلثات'],
    terms: ['الترم الأول', 'الترم الثاني'],
    lessonsCount: 0,
    totalMinutes: 0,
    coverImage: '/courses/sec-1.jpg',
  },
];

export default function CoursesCatalogPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [gradesList, setGradesList] = useState<GradeCardView[]>(DEFAULT_GRADE_CATALOG);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<'ALL' | 'إعدادي' | 'ثانوي'>('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        const [currentUser, treeRes] = await Promise.all([
          getCurrentUser(),
          getFullCurriculumTreeAction(),
        ]);
        setUser(currentUser);

        if (treeRes.success && treeRes.data && treeRes.data.length > 0) {
          const mapped: GradeCardView[] = treeRes.data.map((g: CurriculumGradeDTO) => {
            const allTerms = g.terms || [];
            const termNames = allTerms.map((t) => t.name);
            const branchNames = Array.from(
              new Set(allTerms.flatMap((t) => (t.branches || []).map((b) => b.name)))
            );

            let lessonsCnt = 0;
            let totMin = 0;
            allTerms.forEach((t) => {
              (t.branches || []).forEach((b) => {
                (b.units || []).forEach((u) => {
                  (u.lessons || []).forEach((l) => {
                    lessonsCnt++;
                    totMin += l.durationMinutes || 0;
                  });
                });
              });
            });

            const badge = g.name.includes('الأول الإعدادي')
              ? '1 إعدادي'
              : g.name.includes('الثاني الإعدادي')
              ? '2 إعدادي'
              : g.name.includes('الثالث الإعدادي')
              ? '3 إعدادي • الشهادة'
              : g.name.includes('الأول الثانوي')
              ? '1 ثانوي'
              : g.stage || 'عام';

            const defaultCover = g.name.includes('الأول الإعدادي')
              ? '/courses/prep-1.jpg'
              : g.name.includes('الثاني الإعدادي')
              ? '/courses/prep-2.jpg'
              : g.name.includes('الثالث الإعدادي')
              ? '/courses/prep-3.jpg'
              : g.name.includes('الأول الثانوي')
              ? '/courses/sec-1.jpg'
              : '/courses/prep-1.jpg';

            return {
              id: g.id,
              name: g.name,
              stage: g.stage || (g.name.includes('ثانوي') ? 'ثانوي' : 'إعدادي'),
              badge,
              description: g.description || `شرح مبسط وتدريبات شاملة لمنهج ${g.name} مع م/ رضا خيرت`,
              branches: branchNames.length > 0 ? branchNames : ['فرع الجبر والإحصاء', 'فرع الهندسة'],
              terms: termNames.length > 0 ? termNames : ['الترم الأول', 'الترم الثاني'],
              lessonsCount: lessonsCnt,
              totalMinutes: totMin,
              coverImage: g.coverImage || g.thumbnailPath || defaultCover,
            };
          });
          setGradesList(mapped);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredGrades = gradesList.filter((g) => {
    const matchesStage = selectedStage === 'ALL' || g.stage.includes(selectedStage);
    const matchesQuery =
      !searchQuery.trim() ||
      g.name.includes(searchQuery.trim()) ||
      g.description.includes(searchQuery.trim()) ||
      g.branches.some((b) => b.includes(searchQuery.trim()));
    return matchesStage && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-chalk font-arabic transition-colors duration-200">
      <Navbar />

      <main className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-bold">
          <Link href="/" className="hover:text-cyan-electric transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-cyan-electric font-black">دليل المناهج والكورسات</span>
        </div>

        {/* Hero Section */}
        <div className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-electric/15 border border-cyan-electric/30 text-cyan-electric text-xs font-black">
                <Sparkles className="w-3.5 h-3.5" />
                <span>مناهج الرياضيات للمرحلتين الإعدادية والثانوية</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-chalk tracking-tight">
                اختر صفك الدراسي وابدأ رحلة التفوق مع <span className="text-cyan-electric">م/ رضا خيرت</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-chalk-muted leading-relaxed">
                شرح مبسط، مذكرات PDF مطبوعة بدقة عالية، تدريبات تفاعلية على كل درس، وامتحانات دورية تحاكي اختبارات الوزارة.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xl sm:text-2xl font-black text-cyan-electric">4</p>
                <p className="text-[11px] text-slate-500 dark:text-chalk-muted font-bold">صفوف دراسية كاملة</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xl sm:text-2xl font-black text-emerald-500">80+</p>
                <p className="text-[11px] text-slate-500 dark:text-chalk-muted font-bold">درس وشرح فيديو</p>
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
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-chalk">
                    أهلاً بك يا {user.fullName}! صفك الدراسي الحالي: <span className="text-cyan-electric font-black">{user.gradeName}</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-chalk-muted">
                    انقر هنا للدخول المباشر إلى منهجك ومتابعة الدروس والامتحانات المخصصة لك.
                  </p>
                </div>
              </div>

              <Link
                href={`/courses/${encodeURIComponent(user.gradeName)}`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-electric text-black font-black text-xs flex items-center justify-center gap-2 shadow-cyan-glow hover:bg-cyan-electric-hover transition-all shrink-0"
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
              className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs font-bold focus:border-cyan-electric focus:outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Stage Filter Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSelectedStage('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedStage === 'ALL'
                  ? 'bg-cyan-electric text-black font-black shadow-cyan-glow'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-chalk hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              جميع المراحل
            </button>
            <button
              onClick={() => setSelectedStage('إعدادي')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedStage === 'إعدادي'
                  ? 'bg-cyan-electric text-black font-black shadow-cyan-glow'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-chalk hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              المرحلة الإعدادية
            </button>
            <button
              onClick={() => setSelectedStage('ثانوي')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedStage === 'ثانوي'
                  ? 'bg-cyan-electric text-black font-black shadow-cyan-glow'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-chalk hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
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
            const hoursCount = Math.round((grade.totalMinutes / 60) * 10) / 10;

            return (
              <div
                key={grade.id}
                className={`rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 border transition-all duration-300 flex flex-col justify-between space-y-5 group hover:border-cyan-electric/50 hover:shadow-lg shadow-sm ${
                  isUserGrade ? 'border-cyan-electric ring-1 ring-cyan-electric/40 shadow-cyan-glow' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Course Cover Image Banner */}
                <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800/80">
                  <img
                    src={grade.coverImage || '/courses/prep-1.jpg'}
                    alt={grade.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-xl bg-cyan-electric text-black font-black text-xs shadow-cyan-glow">
                        {grade.badge}
                      </span>
                      {isUserGrade && (
                        <span className="px-3 py-1 rounded-xl bg-emerald-500 text-black text-xs font-black flex items-center gap-1 shadow-md">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          صفك المسجل
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-cyan-electric">منهج الرياضيات • م/ رضا خيرت</span>
                      <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                        {grade.name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Grade Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-chalk-muted leading-relaxed">
                  {grade.description}
                </p>

                {/* Branches List */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">الفروع والمقررات:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {grade.branches.map((b, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-chalk text-[11px] font-bold"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Real Stats Row */}
                <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 dark:border-slate-800 text-center">
                  <div>
                    <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-chalk">
                      {grade.lessonsCount > 0 ? `${grade.lessonsCount} درس` : 'دروس المنهج'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-chalk-muted font-semibold">شرح ومذكرات PDF</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-cyan-electric">
                      {grade.terms.length} أترام دراسية
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-chalk-muted font-semibold">محتوى تفاعلي متكامل</p>
                  </div>
                </div>

                {/* Action CTA Button */}
                <div>
                  <Link
                    href={`/courses/${encodeURIComponent(grade.name)}`}
                    className="w-full py-3.5 rounded-2xl bg-cyan-electric hover:bg-cyan-electric-hover text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-cyan-glow transition-all"
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
    </div>
  );
}
