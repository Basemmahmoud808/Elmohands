'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getCurrentUser, UserSession } from '@/lib/actions/auth';
import { getCurriculumByGradeAction } from '@/lib/actions/lessons';
import { CurriculumGradeDTO, CurriculumLessonDTO, CurriculumUnitDTO } from '@/lib/types/dashboard';
import { LessonPdfViewer } from '@/components/lessons/LessonPdfViewer';
import {
  BookOpen,
  Video,
  FileText,
  Play,
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  Layers,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ShieldAlert,
  GraduationCap,
  X,
  LogIn,
  UserPlus,
} from 'lucide-react';

export default function GradeCoursesPage() {
  const params = useParams();
  const router = useRouter();

  // Decode grade param
  const rawParam = typeof params.grade === 'string' ? decodeURIComponent(params.grade) : 'الصف الأول الإعدادي';
  const gradeAliasMap: Record<string, string> = {
    'prep1': 'الصف الأول الإعدادي',
    'prep2': 'الصف الثاني الإعدادي',
    'prep3': 'الصف الثالث الإعدادي',
    'sec1': 'الصف الأول الثانوي',
  };
  const gradeName = gradeAliasMap[rawParam] || rawParam;

  const [user, setUser] = useState<UserSession | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumGradeDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters & State
  const [selectedTermIndex, setSelectedTermIndex] = useState(0);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'FREE'>('ALL');
  const [collapsedUnits, setCollapsedUnits] = useState<Record<string, boolean>>({});

  // Media preview modal for PDF
  const [activePdfModal, setActivePdfModal] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (!currentUser) {
          // If not logged in, redirect to sign-in
          router.push(`/sign-in?redirect=${encodeURIComponent(`/courses/${rawParam}`)}`);
          return;
        }

        const res = await getCurriculumByGradeAction(gradeName);
        if (res.success && res.data) {
          setCurriculum(res.data);
        } else {
          setErrorMsg(res.error || 'لم يتم العثور على منهج هذا الصف');
        }
      } catch {
        setErrorMsg('حدث خطأ أثناء تحميل بيانات المنهج');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [gradeName, rawParam, router]);

  // Check access authorization
  const isAdmin = user?.role === 'ADMIN';
  const isMatchingStudent = user?.role === 'STUDENT' && (user.gradeName === gradeName || user.gradeId === curriculum?.id);
  const isGradeMismatch = user?.role === 'STUDENT' && !isMatchingStudent;

  // Active Term
  const activeTerm = curriculum?.terms[selectedTermIndex] || curriculum?.terms[0];

  // Available Branches in active term
  const branches = activeTerm?.branches || [];

  // Filtered Units and Lessons
  const filteredUnits = useMemo(() => {
    if (!activeTerm) return [];

    let currentUnits: Array<CurriculumUnitDTO & { branchName: string }> = [];
    activeTerm.branches.forEach((b) => {
      if (selectedBranchId === 'ALL' || b.id === selectedBranchId) {
        b.units.forEach((u) => {
          currentUnits.push({ ...u, branchName: b.name });
        });
      }
    });

    if (!searchQuery.trim() && statusFilter === 'ALL') {
      return currentUnits;
    }

    return currentUnits
      .map((u) => {
        const matchingLessons = u.lessons.filter((l) => {
          const matchesQuery =
            !searchQuery.trim() ||
            l.title.includes(searchQuery.trim()) ||
            l.description.includes(searchQuery.trim());

          let matchesStatus = true;
          if (statusFilter === 'COMPLETED') matchesStatus = l.isCompleted;
          else if (statusFilter === 'IN_PROGRESS') matchesStatus = l.watchPercentage > 0 && !l.isCompleted;
          else if (statusFilter === 'FREE') matchesStatus = !l.isLocked;

          return matchesQuery && matchesStatus;
        });

        return {
          ...u,
          lessons: matchingLessons,
        };
      })
      .filter((u) => u.lessons.length > 0);
  }, [activeTerm, selectedBranchId, searchQuery, statusFilter]);

  // Overall Stats
  const allLessons = useMemo(() => {
    const list: CurriculumLessonDTO[] = [];
    curriculum?.terms.forEach((t) => {
      t.branches.forEach((b) => {
        b.units.forEach((u) => {
          u.lessons.forEach((l) => list.push(l));
        });
      });
    });
    return list;
  }, [curriculum]);

  const totalLessonsCount = allLessons.length;
  const completedLessonsCount = allLessons.filter((l) => l.isCompleted).length;
  const overallProgressPct =
    totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  const toggleUnitCollapse = (unitId: string) => {
    setCollapsedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center font-arabic transition-colors duration-200">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-electric border-t-transparent rounded-full animate-spin mx-auto shadow-cyan-glow" />
          <p className="text-sm font-bold text-slate-700 dark:text-chalk">
            جاري جلب محتوى ودروس {gradeName}...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in gate
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black font-arabic flex flex-col justify-between transition-colors duration-200">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-5 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-cyan-electric/15 text-cyan-electric mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-chalk">
              محتوى خاص بطلاب المنصة
            </h2>
            <p className="text-xs text-slate-500 dark:text-chalk-muted leading-relaxed">
              يرجى تسجيل الدخول أو إنشاء حساب جديد للوصول إلى دروس واختبارات ومذكرات {gradeName}.
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <Link
                href={`/sign-in?redirect=${encodeURIComponent(`/courses/${rawParam}`)}`}
                className="w-full py-3.5 rounded-2xl bg-cyan-electric hover:bg-cyan-electric-hover text-black font-black text-xs shadow-cyan-glow transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </Link>
              <Link
                href="/sign-up"
                className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-chalk border border-slate-200 dark:border-slate-700 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>إنشاء حساب طالب جديد</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-chalk font-arabic transition-colors duration-200">
      <Navbar />

      <main className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-bold">
          <Link href="/" className="hover:text-cyan-electric transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/courses" className="hover:text-cyan-electric transition-colors">
            الكورسات
          </Link>
          <span>/</span>
          <span className="text-cyan-electric font-black">{gradeName}</span>
        </div>

        {/* Grade Mismatch Notice Banner */}
        {isGradeMismatch && (
          <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-chalk">
                  أنت مسجل حالياً في <span className="text-cyan-electric font-black">{user.gradeName || 'صف دراسي آخر'}</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-chalk-muted leading-relaxed">
                  هذا المنهج مخصص لطلاب {gradeName}. يمكنك تصفح خطة المنهج أدناه أو العودة لمنهجك المسجل.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Link
                href={`/courses/${encodeURIComponent(user.gradeName || '')}`}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-cyan-electric text-black font-black text-xs flex items-center justify-center gap-2 shadow-cyan-glow transition-all shrink-0"
              >
                <span>الذهاب لمنهجي ({user.gradeName})</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Hero Grade Banner */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-electric/15 border border-cyan-electric/30 text-cyan-electric text-xs font-black">
                  مادة الرياضيات
                </span>
                <span className="text-xs text-slate-500 dark:text-chalk-muted font-bold">م/ رضا خيرت</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-chalk tracking-tight">{gradeName}</h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-chalk-muted leading-relaxed">
                {curriculum?.description ||
                  `المنهج المتكامل لطلاب ${gradeName} مع شرح تفصيلي لجميع فروع المادة والامتحانات.`}
              </p>
            </div>

            {/* Progress / Stats Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3 w-full md:w-72 shrink-0">
              {isMatchingStudent ? (
                <>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 dark:text-chalk">تقدمك في المنهج:</span>
                    <span className="text-cyan-electric font-mono font-black">{overallProgressPct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-cyan-electric h-2 rounded-full shadow-cyan-glow transition-all"
                      style={{ width: `${overallProgressPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-chalk-muted font-bold">
                    <span>{completedLessonsCount} درس مكتمل</span>
                    <span>من إجمالي {totalLessonsCount} درس</span>
                  </div>
                </>
              ) : (
                <div className="space-y-2 text-center">
                  <p className="text-xs font-bold text-slate-800 dark:text-chalk">إحصائيات المنهج</p>
                  <div className="grid grid-cols-2 gap-2 text-center pt-1">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <p className="text-base font-black text-cyan-electric">{totalLessonsCount}</p>
                      <p className="text-[10px] text-slate-500 dark:text-chalk-muted font-bold">درساً متاحاً</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <p className="text-base font-black text-emerald-500">{curriculum?.terms.length || 2}</p>
                      <p className="text-[10px] text-slate-500 dark:text-chalk-muted font-bold">ترم دراسي</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Term Switcher Tabs */}
          {curriculum?.terms && curriculum.terms.length > 0 && (
            <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
              {curriculum.terms.map((term, idx) => (
                <button
                  key={term.id}
                  onClick={() => {
                    setSelectedTermIndex(idx);
                    setSelectedBranchId('ALL');
                  }}
                  className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all shrink-0 flex items-center gap-2 ${
                    selectedTermIndex === idx
                      ? 'bg-cyan-electric text-black shadow-cyan-glow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-chalk hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{term.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Branch Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1">
            <button
              onClick={() => setSelectedBranchId('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedBranchId === 'ALL'
                  ? 'bg-cyan-electric text-black font-black shadow-cyan-glow'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-chalk hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              جميع الفروع
            </button>
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => setSelectedBranchId(branch.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedBranchId === branch.id
                    ? 'bg-cyan-electric text-black font-black shadow-cyan-glow'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-chalk hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {branch.name}
              </button>
            ))}
          </div>

          {/* Search and Status filter */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في الدروس..."
                className="w-full pl-3 pr-9 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs font-bold focus:border-cyan-electric focus:outline-none placeholder:text-slate-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs font-bold focus:border-cyan-electric focus:outline-none"
            >
              <option value="ALL">جميع الحالات</option>
              <option value="COMPLETED">مكتمل ✓</option>
              <option value="IN_PROGRESS">قيد المشاهدة</option>
              <option value="FREE">عينة مجانية</option>
            </select>
          </div>
        </div>

        {/* Units Accordion List */}
        {filteredUnits.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
            <Layers className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-900 dark:text-chalk">لا توجد دروس تطابق بحثك</h4>
            <p className="text-xs text-slate-500 dark:text-chalk-muted">جرب تغيير كلمات البحث أو إزالة التصفية الحالية.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredUnits.map((unit) => {
              const isCollapsed = collapsedUnits[unit.id] || false;
              const unitLessonsCount = unit.lessons.length;
              const unitCompletedCount = unit.lessons.filter((l) => l.isCompleted).length;
              const unitProgressPct =
                unitLessonsCount > 0 ? Math.round((unitCompletedCount / unitLessonsCount) * 100) : 0;

              return (
                <div
                  key={unit.id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all"
                >
                  {/* Unit Header */}
                  <div
                    onClick={() => toggleUnitCollapse(unit.id)}
                    className="p-5 sm:p-6 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-950 transition-colors select-none"
                  >
                    <div className="space-y-1 text-right flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-cyan-electric bg-cyan-electric/15 px-2.5 py-0.5 rounded-lg border border-cyan-electric/25">
                          {unit.branchName}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-chalk">{unit.title}</h3>
                      </div>
                      {unit.description && (
                        <p className="text-xs text-slate-500 dark:text-chalk-muted leading-relaxed">{unit.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      {isMatchingStudent && (
                        <div className="text-left">
                          <span className="text-xs font-mono font-black text-cyan-electric">
                            {unitCompletedCount}/{unitLessonsCount} مكتمل ({unitProgressPct}%)
                          </span>
                        </div>
                      )}

                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-chalk">
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Lessons Grid in Unit */}
                  {!isCollapsed && (
                    <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {unit.lessons.map((lesson, idx) => {
                        const canDirectPlay = isMatchingStudent || isAdmin || !lesson.isLocked;

                        return (
                          <div
                            key={lesson.id}
                            className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-cyan-electric/40 transition-all flex flex-col justify-between space-y-4 group"
                          >
                            {/* Top info row */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1 text-right">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-lg bg-cyan-electric/15 text-cyan-electric font-mono font-bold text-xs flex items-center justify-center">
                                    #{idx + 1}
                                  </span>
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-chalk group-hover:text-cyan-electric transition-colors">
                                    {lesson.title}
                                  </h4>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-chalk-muted line-clamp-2 leading-relaxed">
                                  {lesson.description || 'شرح وحلول تمارين المنهج بإشراف م/ رضا خيرت'}
                                </p>
                              </div>

                              {/* Status Badges */}
                              <div className="shrink-0">
                                {lesson.isCompleted ? (
                                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>مكتمل</span>
                                  </span>
                                ) : !lesson.isLocked ? (
                                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    <span>عينة مجانية</span>
                                  </span>
                                ) : lesson.watchPercentage > 0 ? (
                                  <span className="px-2.5 py-1 rounded-lg bg-cyan-electric/15 border border-cyan-electric/30 text-cyan-electric text-[10px] font-bold">
                                    {lesson.watchPercentage}%
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    <span>للمشتركين</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Progress bar if watched */}
                            {lesson.watchPercentage > 0 && !lesson.isCompleted && (
                              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-cyan-electric h-1.5 rounded-full shadow-cyan-glow"
                                  style={{ width: `${lesson.watchPercentage}%` }}
                                />
                              </div>
                            )}

                            {/* Bottom Actions Row */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                              <div className="flex items-center gap-1 text-slate-500 dark:text-chalk-muted text-[11px] font-bold">
                                <Clock className="w-3.5 h-3.5 text-cyan-electric" />
                                <span>{lesson.durationMinutes} دقيقة</span>
                              </div>

                              <div className="flex items-center gap-2">
                                {lesson.pdfPath && (
                                  <button
                                    onClick={() =>
                                      setActivePdfModal({
                                        url: lesson.pdfPath || '',
                                        title: lesson.title,
                                      })
                                    }
                                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-chalk hover:text-cyan-electric transition-colors"
                                    title="معاينة مذكرة PDF"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </button>
                                )}

                                <Link
                                  href={`/lessons/${lesson.id}`}
                                  className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all ${
                                    canDirectPlay
                                      ? 'bg-cyan-electric text-black hover:bg-cyan-electric-hover shadow-cyan-glow'
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                                  }`}
                                >
                                  {canDirectPlay ? <Play className="w-3.5 h-3.5 fill-current" /> : <Lock className="w-3.5 h-3.5" />}
                                  <span>{canDirectPlay ? 'مشاهدة الدرس' : 'عرض الدرس'}</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* PDF Modal Preview */}
        {activePdfModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-chalk truncate">{activePdfModal.title}</span>
                <button
                  onClick={() => setActivePdfModal(null)}
                  className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <LessonPdfViewer
                  pdfUrl={activePdfModal.url}
                  title={activePdfModal.title}
                  studentName={user?.fullName}
                  studentPhone={user?.phone}
                  allowDownload={isMatchingStudent || isAdmin}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
