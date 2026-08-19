'use client';

import React, { useState, useMemo } from 'react';
import {
  CurriculumGradeDTO,
  AdminStudentDTO,
  QuestionItemDTO,
  QuizDetailsDTO,
} from '@/lib/types/dashboard';
import { createUnitAction } from '@/lib/actions/courses';
import katex from 'katex';
import {
  BookOpen,
  Layers,
  Plus,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Video,
  CheckCircle2,
  Loader2,
  FileText,
  HelpCircle,
  Users,
  Award,
  Play,
  Download,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Search,
  Filter,
  Eye,
  Calendar,
  Phone,
  Clock,
  Lock,
  Unlock,
} from 'lucide-react';

interface CoursesManagementTabProps {
  initialCurriculum: CurriculumGradeDTO[];
  students?: AdminStudentDTO[];
  questions?: QuestionItemDTO[];
  quizzes?: QuizDetailsDTO[];
  onRefresh?: () => void;
  onNavigateTab?: (tabId: string) => void;
  onPreviewMedia?: (media: { type: 'video' | 'pdf' | 'exam'; title: string; url: string }) => void;
}

// Default Egyptian Curriculum Hierarchy for Eng. Reda Kheyrat
const DEFAULT_GRADES = [
  {
    id: 'grade-prep-1',
    name: 'الصف الأول الإعدادي',
    stage: 'المرحلة الإعدادية',
    color: 'from-blue-600/20 to-cyan-electric/20 border-cyan-electric/40 text-cyan-electric',
    iconColor: 'text-cyan-electric',
  },
  {
    id: 'grade-prep-2',
    name: 'الصف الثاني الإعدادي',
    stage: 'المرحلة الإعدادية',
    color: 'from-emerald-600/20 to-teal-500/20 border-emerald-500/40 text-emerald-400',
    iconColor: 'text-emerald-400',
  },
  {
    id: 'grade-prep-3',
    name: 'الصف الثالث الإعدادي',
    stage: 'المرحلة الإعدادية — الشهادة الإعدادية',
    color: 'from-purple-600/20 to-pink-500/20 border-purple-500/40 text-purple-400',
    iconColor: 'text-purple-400',
  },
  {
    id: 'grade-sec-1',
    name: 'الصف الأول الثانوي',
    stage: 'المرحلة الثانوية',
    color: 'from-amber-600/20 to-orange-500/20 border-amber-500/40 text-amber-400',
    iconColor: 'text-amber-400',
  },
];

export function CoursesManagementTab({
  initialCurriculum,
  students = [],
  questions = [],
  quizzes = [],
  onRefresh,
  onNavigateTab,
  onPreviewMedia,
}: CoursesManagementTabProps) {
  const [curriculum, setCurriculum] = useState<CurriculumGradeDTO[]>(initialCurriculum);

  // Selected Grade State (defaults to first grade)
  const [selectedGradeId, setSelectedGradeId] = useState<string>(
    initialCurriculum[0]?.id || DEFAULT_GRADES[0].id
  );
  const [selectedTermId, setSelectedTermId] = useState<string>('');

  // Active Sub-Tab inside Grade Hub: 'curriculum' | 'pdfs' | 'exams' | 'questions' | 'students'
  const [activeSubTab, setActiveSubTab] = useState<'curriculum' | 'pdfs' | 'exams' | 'questions' | 'students'>('curriculum');

  // Search in Grade Content
  const [searchQuery, setSearchQuery] = useState('');

  // Unit creation modal state
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitDesc, setNewUnitDesc] = useState('');
  const [unitLoading, setUnitLoading] = useState(false);

  // Math KaTeX Renderer
  const renderMath = (latex: string) => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: false });
    } catch {
      return latex;
    }
  };

  // Find Selected Grade Object
  const selectedGrade = useMemo(() => {
    const found = curriculum.find(
      (g) => g.id === selectedGradeId || g.name === selectedGradeId
    );
    if (found) return found;

    // Fallback template matching default grades
    const def = DEFAULT_GRADES.find((dg) => dg.id === selectedGradeId) || DEFAULT_GRADES[0];
    return {
      id: def.id,
      name: def.name,
      stage: def.stage,
      sortOrder: 1,
      terms: [
        {
          id: `term-1-${def.id}`,
          gradeId: def.id,
          name: 'الترم الأول',
          sortOrder: 1,
          branches: [
            { id: `branch-alg-${def.id}`, termId: `term-1-${def.id}`, name: 'فرع الجبر والإحصاء', sortOrder: 1, units: [] },
            { id: `branch-geom-${def.id}`, termId: `term-1-${def.id}`, name: 'فرع الهندسة والقياس', sortOrder: 2, units: [] },
          ],
        },
        {
          id: `term-2-${def.id}`,
          gradeId: def.id,
          name: 'الترم الثاني',
          sortOrder: 2,
          branches: [
            { id: `branch-alg2-${def.id}`, termId: `term-2-${def.id}`, name: 'فرع الجبر والإحصاء', sortOrder: 1, units: [] },
            { id: `branch-geom2-${def.id}`, termId: `term-2-${def.id}`, name: 'فرع الهندسة وحساب المثلثات', sortOrder: 2, units: [] },
          ],
        },
      ],
    };
  }, [curriculum, selectedGradeId]);

  const terms = selectedGrade.terms || [];
  const currentTerm = terms.find((t) => t.id === selectedTermId) || terms[0];

  // Grade Statistics & Aggregations
  const gradeStatsMap = useMemo(() => {
    const stats: Record<
      string,
      {
        lessonsCount: number;
        pdfsCount: number;
        quizzesCount: number;
        questionsCount: number;
        studentsCount: number;
      }
    > = {};

    DEFAULT_GRADES.forEach((dg) => {
      // 1. Lessons & PDFs count from curriculum
      const gradeInCurriculum = curriculum.find(
        (g) => g.id === dg.id || g.name === dg.name
      );

      let lessons = 0;
      let pdfs = 0;

      gradeInCurriculum?.terms.forEach((t) => {
        t.branches.forEach((b) => {
          b.units.forEach((u) => {
            u.lessons.forEach((l) => {
              lessons++;
              if (l.pdfPath) pdfs++;
            });
          });
        });
      });

      // 2. Quizzes count for this grade
      const gradeQuizzes = quizzes.filter(
        (q) =>
          q.gradeName === dg.name ||
          Boolean(
            gradeInCurriculum &&
              q.lessonId &&
              gradeInCurriculum.terms.some((t) =>
                t.branches.some((b) =>
                  b.units.some((u) => u.lessons.some((l) => l.id === q.lessonId))
                )
              )
          )
      );

      // 3. Students count for this grade
      const gradeStudents = students.filter(
        (s) => s.gradeId === dg.id || s.gradeName === dg.name
      );

      // 4. Questions count
      const gradeQuestions = questions.filter(
        (q) => q.branchName && (dg.name.includes('إعدادي') ? !q.branchName.includes('ثانوي') : true)
      );

      stats[dg.id] = {
        lessonsCount: lessons,
        pdfsCount: pdfs,
        quizzesCount: gradeQuizzes.length,
        questionsCount: gradeQuestions.length,
        studentsCount: gradeStudents.length,
      };
    });

    return stats;
  }, [curriculum, quizzes, students, questions]);

  // Lessons belonging to current grade & term
  const allGradeLessons = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      description?: string;
      durationMinutes: number;
      videoPath?: string | null;
      pdfPath?: string | null;
      thumbnailPath?: string | null;
      isLocked?: boolean;
      unitTitle: string;
      branchName: string;
      termName: string;
    }> = [];

    selectedGrade.terms.forEach((t) => {
      if (selectedTermId && t.id !== selectedTermId) return;
      t.branches.forEach((b) => {
        b.units.forEach((u) => {
          u.lessons.forEach((l) => {
            list.push({
              id: l.id,
              title: l.title,
              description: l.description,
              durationMinutes: l.durationMinutes || 45,
              videoPath: l.videoPath,
              pdfPath: l.pdfPath,
              thumbnailPath: l.thumbnailPath,
              isLocked: l.isLocked,
              unitTitle: u.title,
              branchName: b.name,
              termName: t.name,
            });
          });
        });
      });
    });

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.unitTitle.toLowerCase().includes(q) ||
        item.branchName.toLowerCase().includes(q)
    );
  }, [selectedGrade, selectedTermId, searchQuery]);

  // Grade Filtered Quizzes
  const gradeQuizzes = useMemo(() => {
    const list = quizzes.filter(
      (q) =>
        q.gradeName === selectedGrade.name ||
        selectedGrade.terms.some((t) =>
          t.branches.some((b) =>
            b.units.some((u) => u.lessons.some((l) => l.id === q.lessonId))
          )
        )
    );
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((item) => item.title.toLowerCase().includes(q));
  }, [quizzes, selectedGrade, searchQuery]);

  // Grade Filtered Students
  const gradeStudents = useMemo(() => {
    const list = students.filter(
      (s) => s.gradeId === selectedGrade.id || s.gradeName === selectedGrade.name
    );
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        (s.parentPhone && s.parentPhone.includes(q))
    );
  }, [students, selectedGrade, searchQuery]);

  // Grade Filtered Questions
  const gradeQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    const q = searchQuery.toLowerCase();
    return questions.filter(
      (item) =>
        item.questionText.toLowerCase().includes(q) ||
        (item.questionLatex && item.questionLatex.toLowerCase().includes(q))
    );
  }, [questions, searchQuery]);

  const handleOpenAddUnit = (branchId: string) => {
    setSelectedBranchId(branchId);
    setNewUnitTitle('');
    setNewUnitDesc('');
    setIsAddUnitOpen(true);
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim() || !selectedBranchId) return;

    setUnitLoading(true);
    try {
      const res = await createUnitAction({
        branchId: selectedBranchId,
        title: newUnitTitle.trim(),
        description: newUnitDesc.trim() || undefined,
      });

      if (res.success) {
        setIsAddUnitOpen(false);
        if (onRefresh) onRefresh();
      }
    } catch {
      // ignore
    } finally {
      setUnitLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-600/15 via-cyan-electric/20 to-transparent border border-cyan-electric/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-electric/20 text-cyan-electric text-xs font-bold border border-cyan-electric/30">
            <GraduationCap className="w-4 h-4" />
            <span>بوابة المناهج والمراحل التعليمية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-chalk">
            الصفوف والمناهج الدراسية (م/ رضا خيرت)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-chalk-muted font-bold max-w-2xl">
            اختر أي مرحلة دراسية للدخول إلى مركز الإدارة الشامل الخاص بها لمتابعة الفيديوهات، الشيتات، الامتحانات، وبنك الأسئلة المخصص لها.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigateTab && onNavigateTab('lessons')}
            className="px-4 py-2.5 rounded-2xl bg-cyan-electric hover:bg-cyan-electric-hover text-black font-black text-xs shadow-cyan-glow transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>رفع درس أو محاضرة</span>
          </button>
        </div>
      </div>

      {/* 4 GRADE HUB CARDS (الصفوف الأربعة الرئيسية) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEFAULT_GRADES.map((dg) => {
          const isSelected = selectedGradeId === dg.id;
          const stats = gradeStatsMap[dg.id] || {
            lessonsCount: 0,
            pdfsCount: 0,
            quizzesCount: 0,
            questionsCount: 0,
            studentsCount: 0,
          };

          return (
            <div
              key={dg.id}
              onClick={() => {
                setSelectedGradeId(dg.id);
                setSelectedTermId('');
              }}
              className={`chalk-card rounded-3xl p-5 cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between space-y-4 border ${
                isSelected
                  ? 'border-cyan-electric bg-cyan-electric/10 shadow-cyan-glow scale-[1.02]'
                  : 'bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-cyan-electric/50 hover:shadow-lg'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-chalk-muted">
                    {dg.stage}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-cyan-electric text-black' : 'bg-slate-100 dark:bg-slate-800 text-cyan-electric'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-chalk leading-snug">
                  {dg.name}
                </h3>
              </div>

              {/* Counts Grid */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-[11px] font-bold text-center">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60">
                  <span className="text-cyan-electric block font-black text-xs">{stats.lessonsCount}</span>
                  <span className="text-slate-500 dark:text-chalk-muted text-[10px]">دروس</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60">
                  <span className="text-purple-400 block font-black text-xs">{stats.quizzesCount}</span>
                  <span className="text-slate-500 dark:text-chalk-muted text-[10px]">امتحانات</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60">
                  <span className="text-emerald-400 block font-black text-xs">{stats.studentsCount}</span>
                  <span className="text-slate-500 dark:text-chalk-muted text-[10px]">طلاب</span>
                </div>
              </div>

              <div className="pt-1">
                <div
                  className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors ${
                    isSelected
                      ? 'bg-cyan-electric text-black'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-chalk hover:bg-slate-200'
                  }`}
                >
                  <span>{isSelected ? 'المركز النشط حالياً ⚡' : 'دخول مركز إدارة الصف ⬅️'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SELECTED GRADE COMMAND CENTER / HUB */}
      <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white/90 dark:bg-slate-900/80 border border-cyan-electric/30 space-y-6 shadow-xl">
        {/* Hub Header with Grade Title & Quick Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-cyan-electric/20 text-cyan-electric border border-cyan-electric/30">
                {selectedGrade.stage || 'المرحلة الإعدادية'}
              </span>
              <span className="text-xs text-slate-400">• رياضيات منصة المهندس</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">
              مركز محتوى: {selectedGrade.name} 📚
            </h3>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab && onNavigateTab('lessons')}
              className="px-3.5 py-2 rounded-xl bg-cyan-electric hover:bg-cyan-electric-hover text-black font-black text-xs shadow-cyan-glow transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة درس جديد</span>
            </button>
            <button
              onClick={() => onNavigateTab && onNavigateTab('quizzes')}
              className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-400 font-black text-xs border border-purple-500/30 transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>إضافة شيت أو امتحان</span>
            </button>
          </div>
        </div>

        {/* Term Switcher & Sub-tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Sub-tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveSubTab('curriculum')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeSubTab === 'curriculum'
                  ? 'bg-cyan-electric text-black shadow-cyan-glow'
                  : 'text-slate-600 dark:text-chalk-muted hover:text-slate-900 dark:hover:text-chalk'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>الفيديوهات والدروس ({allGradeLessons.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('pdfs')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeSubTab === 'pdfs'
                  ? 'bg-cyan-electric text-black shadow-cyan-glow'
                  : 'text-slate-600 dark:text-chalk-muted hover:text-slate-900 dark:hover:text-chalk'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>الشيتات والمذكرات ({allGradeLessons.filter((l) => l.pdfPath).length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('exams')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeSubTab === 'exams'
                  ? 'bg-cyan-electric text-black shadow-cyan-glow'
                  : 'text-slate-600 dark:text-chalk-muted hover:text-slate-900 dark:hover:text-chalk'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>الامتحانات والاختبارات ({gradeQuizzes.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('questions')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeSubTab === 'questions'
                  ? 'bg-cyan-electric text-black shadow-cyan-glow'
                  : 'text-slate-600 dark:text-chalk-muted hover:text-slate-900 dark:hover:text-chalk'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>بنك الأسئلة</span>
            </button>

            <button
              onClick={() => setActiveSubTab('students')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeSubTab === 'students'
                  ? 'bg-cyan-electric text-black shadow-cyan-glow'
                  : 'text-slate-600 dark:text-chalk-muted hover:text-slate-900 dark:hover:text-chalk'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>طلاب الصف ({gradeStudents.length})</span>
            </button>
          </div>

          {/* Term Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setSelectedTermId('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !selectedTermId ? 'bg-cyan-electric text-black font-black' : 'text-slate-500 dark:text-chalk-muted'
              }`}
            >
              الترمين معاً
            </button>
            {terms.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTermId(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTermId === t.id
                    ? 'bg-cyan-electric text-black font-black'
                    : 'text-slate-500 dark:text-chalk-muted'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في محتوى ودروس واختبارات هذا الصف..."
            className="w-full h-11 pr-10 pl-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
          />
        </div>

        {/* SUB-TAB 1: CURRICULUM & LESSONS TREE */}
        {activeSubTab === 'curriculum' && (
          <div className="space-y-6">
            {allGradeLessons.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
                <Video className="w-10 h-10 text-cyan-electric mx-auto opacity-70" />
                <h4 className="text-base font-black text-slate-900 dark:text-chalk">
                  لم يتم رفع دروس لهذا الصف بعد
                </h4>
                <p className="text-xs text-slate-500 dark:text-chalk-muted max-w-md mx-auto">
                  اضغط على زر &quot;إضافة درس جديد&quot; لنشر أول محاضرة فيديو ومذكرة PDF لطلاب {selectedGrade.name}.
                </p>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('lessons')}
                  className="px-5 py-2.5 rounded-xl bg-cyan-electric text-black font-black text-xs shadow-cyan-glow inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>رفع أول درس لهذا الصف</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allGradeLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-cyan-electric/40 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-cyan-electric">{lesson.branchName}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-chalk-muted text-[10px]">
                          {lesson.termName} • {lesson.unitTitle}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 dark:text-chalk line-clamp-2">
                        {lesson.title}
                      </h4>

                      {lesson.description && (
                        <p className="text-xs text-slate-500 dark:text-chalk-muted line-clamp-2">
                          {lesson.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-2 text-[11px] font-bold text-slate-500 dark:text-chalk-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          {lesson.durationMinutes} دقيقة
                        </span>
                        {lesson.pdfPath && (
                          <span className="flex items-center gap-1 text-purple-400">
                            <FileText className="w-3.5 h-3.5" />
                            مذكرة PDF
                          </span>
                        )}
                        {lesson.isLocked ? (
                          <span className="flex items-center gap-1 text-red-400">
                            <Lock className="w-3.5 h-3.5" />
                            مشتركين
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Unlock className="w-3.5 h-3.5" />
                            مجاني
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      {lesson.videoPath && (
                        <button
                          onClick={() =>
                            onPreviewMedia &&
                            onPreviewMedia({
                              type: 'video',
                              title: lesson.title,
                              url: lesson.videoPath || '',
                            })
                          }
                          className="flex-1 py-2 rounded-xl bg-cyan-electric/15 text-cyan-electric font-bold text-xs hover:bg-cyan-electric hover:text-black transition-all flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>معاينة الفيديو</span>
                        </button>
                      )}
                      {lesson.pdfPath && (
                        <button
                          onClick={() =>
                            onPreviewMedia &&
                            onPreviewMedia({
                              type: 'pdf',
                              title: lesson.title,
                              url: lesson.pdfPath || '',
                            })
                          }
                          className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-chalk hover:text-cyan-electric transition-colors"
                          title="معاينة المذكرة PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 2: WORKSHEETS & PDFS */}
        {activeSubTab === 'pdfs' && (
          <div className="space-y-4">
            {allGradeLessons.filter((l) => l.pdfPath).length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
                <FileText className="w-10 h-10 text-amber-500 mx-auto opacity-70" />
                <h4 className="text-base font-black text-slate-900 dark:text-chalk">
                  لا توجد مذكرات أو شيتات PDF مرفوعة لهذا الصف حالياً
                </h4>
                <p className="text-xs text-slate-500 dark:text-chalk-muted">
                  يمكنك إرفاق ملف PDF عند إضافة أي درس أو عبر منشئ الشيتات.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allGradeLessons
                  .filter((l) => l.pdfPath)
                  .map((l) => (
                    <div
                      key={l.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-chalk">
                            {l.title}
                          </h4>
                          <span className="text-xs text-slate-500 dark:text-chalk-muted">
                            {l.branchName} • {l.unitTitle}
                          </span>
                        </div>
                      </div>

                      <a
                        href={l.pdfPath || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-cyan-electric text-black font-black text-xs flex items-center gap-1.5 shadow-cyan-glow shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تحميل</span>
                      </a>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 3: EXAMS & QUIZZES */}
        {activeSubTab === 'exams' && (
          <div className="space-y-4">
            {gradeQuizzes.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
                <Award className="w-10 h-10 text-purple-500 mx-auto opacity-70" />
                <h4 className="text-base font-black text-slate-900 dark:text-chalk">
                  لم يتم إضافة امتحانات أو شيتات لهذا الصف بعد
                </h4>
                <p className="text-xs text-slate-500 dark:text-chalk-muted">
                  ارفع شيت PDF من جهازك أو ابنِ امتحاناً إلكترونياً لطلاب {selectedGrade.name}.
                </p>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('quizzes')}
                  className="px-5 py-2.5 rounded-xl bg-cyan-electric text-black font-black text-xs shadow-cyan-glow inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة شيت أو امتحان</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gradeQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-cyan-electric">{quiz.branchName || 'رياضيات'}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-electric/15 text-cyan-electric border border-cyan-electric/30">
                        {quiz.pdfPath || quiz.type === 'file' ? '📄 شيت PDF مرفوع' : '✍️ امتحان إلكتروني'}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 dark:text-chalk">
                      {quiz.title}
                    </h4>

                    <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-bold text-slate-500 dark:text-chalk-muted text-center">
                      <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-900">
                        <span>{quiz.durationMinutes} دقيقة</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-900">
                        <span>النجاح: {quiz.passScore}%</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-900">
                        <span>{quiz.questionsCount || 10} سؤال</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 4: QUESTION BANK */}
        {activeSubTab === 'questions' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {gradeQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>{q.branchName || 'فرع عام'}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-900 text-cyan-electric">
                      {q.difficulty === 'EASY' ? 'سهل' : q.difficulty === 'MEDIUM' ? 'متوسط' : 'متقدم'}
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 dark:text-chalk leading-relaxed">
                    {q.questionText}
                  </p>

                  {q.questionLatex && (
                    <div
                      className="text-cyan-electric text-xs py-1"
                      dangerouslySetInnerHTML={{ __html: renderMath(q.questionLatex) }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TAB 5: STUDENTS */}
        {activeSubTab === 'students' && (
          <div className="space-y-4">
            {gradeStudents.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
                <Users className="w-10 h-10 text-cyan-electric mx-auto opacity-70" />
                <h4 className="text-base font-black text-slate-900 dark:text-chalk">
                  لا يوجد طلاب مسجلون في هذا الصف حتى الآن
                </h4>
                <p className="text-xs text-slate-500 dark:text-chalk-muted">
                  بمجرد أن ينشئ أي طالب حسابه ويختار {selectedGrade.name} سيظهر تلقائياً هنا.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs font-bold">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-chalk-muted">
                      <th className="py-3 px-4">اسم الطالب</th>
                      <th className="py-3 px-4">رقم الهاتف</th>
                      <th className="py-3 px-4">هاتف ولي الأمر</th>
                      <th className="py-3 px-4">حالة الاشتراك</th>
                      <th className="py-3 px-4">تاريخ التسجيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {gradeStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                        <td className="py-3 px-4 text-slate-900 dark:text-chalk font-black">
                          {st.fullName}
                        </td>
                        <td className="py-3 px-4 font-mono text-cyan-electric">{st.phone}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {st.parentPhone || '—'}
                        </td>
                        <td className="py-3 px-4">
                          {st.hasActiveSubscription ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                              مشترك نشط 🌟
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-500 border border-amber-500/30">
                              غير مشترك
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-chalk-muted text-[11px]">
                          {new Date(st.createdAt).toLocaleDateString('ar-EG')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Unit Modal */}
      {isAddUnitOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-electric/30 w-full max-w-md space-y-5 animate-in zoom-in-95 duration-200 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-chalk">
              إضافة وحدة دراسية جديدة
            </h3>
            <form onSubmit={handleCreateUnit} className="space-y-4 text-xs font-bold">
              <div className="space-y-1">
                <label className="text-slate-800 dark:text-chalk block">عنوان الوحدة:</label>
                <input
                  type="text"
                  required
                  value={newUnitTitle}
                  onChange={(e) => setNewUnitTitle(e.target.value)}
                  placeholder="مثال: الوحدة الأولى: الأعداد النسبية"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 dark:text-chalk block">وصف الوحدة (اختياري):</label>
                <textarea
                  value={newUnitDesc}
                  onChange={(e) => setNewUnitDesc(e.target.value)}
                  placeholder="أدخل وصفاً تفصيلياً لموضوعات الوحدة..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUnitOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-chalk font-bold hover:bg-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={unitLoading}
                  className="px-6 py-2.5 rounded-xl bg-cyan-electric hover:bg-cyan-electric-hover text-black font-black shadow-cyan-glow flex items-center gap-2"
                >
                  {unitLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>حفظ الوحدة</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
