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
  ArrowLeft,
  Sparkles,
  Search,
  Filter,
  Eye,
  Calendar,
  Phone,
  Clock,
  Lock,
  Unlock,
  FolderPlus,
  Library,
  ChevronLeft,
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

const DEFAULT_GRADES = [
  {
    id: 'grade-prep-1',
    name: 'الصف الأول الإعدادي',
    stage: 'المرحلة الإعدادية',
    tag: '1st Prep',
    accent: 'blue',
  },
  {
    id: 'grade-prep-2',
    name: 'الصف الثاني الإعدادي',
    stage: 'المرحلة الإعدادية',
    tag: '2nd Prep',
    accent: 'emerald',
  },
  {
    id: 'grade-prep-3',
    name: 'الصف الثالث الإعدادي',
    stage: 'الشهادة الإعدادية',
    tag: '3rd Prep',
    accent: 'purple',
  },
  {
    id: 'grade-sec-1',
    name: 'الصف الأول الثانوي',
    stage: 'المرحلة الثانوية',
    tag: '1st Secondary',
    accent: 'amber',
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

  // Selected Grade State
  const [selectedGradeId, setSelectedGradeId] = useState<string>(
    initialCurriculum[0]?.id || DEFAULT_GRADES[0].id
  );
  const [selectedTermId, setSelectedTermId] = useState<string>('');

  // Active Sub-Tab: 'curriculum' | 'pdfs' | 'exams' | 'questions' | 'students'
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

      const gradeStudents = students.filter(
        (s) => s.gradeId === dg.id || s.gradeName === dg.name
      );

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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-l from-cyan-900/10 via-slate-900/5 to-transparent dark:from-cyan-950/40 dark:via-slate-900/80 dark:to-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold border border-cyan-500/20">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>بوابة المناهج والمراحل الدراسية</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            مناهج الرياضيات — م/ رضا خيرت
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xl">
            اختر أي مرحلة دراسية للدخول إلى مركز التحكم الخاص بها ومتابعة الفيديوهات، الشيتات، الامتحانات، وبنك الأسئلة المخصص لها.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab && onNavigateTab('lessons')}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة درس جديد</span>
          </button>
        </div>
      </div>

      {/* 4 GRADE CARDS (الصفوف الأربعة الرئيسية) */}
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
              className={`rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 border ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 shadow-md ring-2 ring-cyan-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {dg.stage}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  {dg.name}
                </h3>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/50">
                  <span className="text-slate-900 dark:text-slate-100 block font-black text-xs">{stats.lessonsCount}</span>
                  <span className="text-slate-400 text-[10px]">دروس</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/50">
                  <span className="text-slate-900 dark:text-slate-100 block font-black text-xs">{stats.quizzesCount}</span>
                  <span className="text-slate-400 text-[10px]">امتحانات</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/50">
                  <span className="text-slate-900 dark:text-slate-100 block font-black text-xs">{stats.studentsCount}</span>
                  <span className="text-slate-400 text-[10px]">طلاب</span>
                </div>
              </div>

              <div
                className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  isSelected
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{isSelected ? 'الصف النشط حالياً' : 'عرض محتوى الصف'}</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* SELECTED GRADE COMMAND CENTER */}
      <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
        {/* Hub Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                {selectedGrade.stage || 'المرحلة الإعدادية'}
              </span>
              <span className="text-xs text-slate-400">• رياضيات منصة المهندس</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
              إدارة محتوى: {selectedGrade.name}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab && onNavigateTab('lessons')}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة درس جديد</span>
            </button>
            <button
              onClick={() => onNavigateTab && onNavigateTab('quizzes')}
              className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800 transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>إضافة شيت أو امتحان</span>
            </button>
          </div>
        </div>

        {/* Subtabs and Term Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Segmented Subtabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveSubTab('curriculum')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'curriculum'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>الدروس والفيديوهات ({allGradeLessons.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('pdfs')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'pdfs'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>الشيتات والمذكرات ({allGradeLessons.filter((l) => l.pdfPath).length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('exams')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'exams'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>الامتحانات ({gradeQuizzes.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('questions')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'questions'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>بنك الأسئلة</span>
            </button>

            <button
              onClick={() => setActiveSubTab('students')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'students'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>طلاب الصف ({gradeStudents.length})</span>
            </button>
          </div>

          {/* Term Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setSelectedTermId('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !selectedTermId
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              الترمين معاً
            </button>
            {terms.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTermId(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTermId === t.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في دروس ومذكرات واختبارات هذا الصف..."
            className="w-full h-10 pr-10 pl-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* SUBTAB 1: LESSONS & VIDEOS */}
        {activeSubTab === 'curriculum' && (
          <div className="space-y-4">
            {allGradeLessons.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Video className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  لم يتم رفع دروس لهذا الصف بعد
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  اضغط على زر &quot;إضافة درس جديد&quot; لنشر أول محاضرة فيديو ومذكرة لطلاب {selectedGrade.name}.
                </p>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('lessons')}
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-sm inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>رفع أول درس</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allGradeLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-cyan-600 dark:text-cyan-400">{lesson.branchName}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
                          {lesson.termName} • {lesson.unitTitle}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                        {lesson.title}
                      </h4>

                      {lesson.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {lesson.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          {lesson.durationMinutes} دقيقة
                        </span>
                        {lesson.pdfPath && (
                          <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                            <FileText className="w-3.5 h-3.5" />
                            مذكرة PDF
                          </span>
                        )}
                        {lesson.isLocked ? (
                          <span className="flex items-center gap-1 text-red-500">
                            <Lock className="w-3.5 h-3.5" />
                            مشتركين
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <Unlock className="w-3.5 h-3.5" />
                            مجاني
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
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
                          className="flex-1 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-bold text-xs hover:bg-cyan-600 hover:text-white transition-all flex items-center justify-center gap-1"
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
                          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-600 transition-colors"
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

        {/* SUBTAB 2: WORKSHEETS & PDFS */}
        {activeSubTab === 'pdfs' && (
          <div className="space-y-3">
            {allGradeLessons.filter((l) => l.pdfPath).length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  لا توجد مذكرات أو شيتات PDF مرفوعة لهذا الصف حالياً
                </h4>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allGradeLessons
                  .filter((l) => l.pdfPath)
                  .map((l) => (
                    <div
                      key={l.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                            {l.title}
                          </h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {l.branchName} • {l.unitTitle}
                          </span>
                        </div>
                      </div>

                      <a
                        href={l.pdfPath || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm shrink-0"
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

        {/* SUBTAB 3: EXAMS & QUIZZES */}
        {activeSubTab === 'exams' && (
          <div className="space-y-3">
            {gradeQuizzes.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Award className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  لم يتم إضافة امتحانات أو شيتات لهذا الصف بعد
                </h4>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('quizzes')}
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-sm inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة شيت أو امتحان</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gradeQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-cyan-600 dark:text-cyan-400">{quiz.branchName || 'رياضيات'}</span>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold">
                        {quiz.pdfPath || quiz.type === 'file' ? 'شيت PDF مرفوع' : 'امتحان إلكتروني'}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {quiz.title}
                    </h4>

                    <div className="grid grid-cols-3 gap-1.5 pt-2 text-[10px] font-medium text-slate-500 dark:text-slate-400 text-center">
                      <div className="p-1.5 rounded bg-slate-200 dark:bg-slate-900">
                        <span>{quiz.durationMinutes} دقيقة</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-200 dark:bg-slate-900">
                        <span>النجاح: {quiz.passScore}%</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-200 dark:bg-slate-900">
                        <span>{quiz.questionsCount || 10} سؤال</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 4: QUESTION BANK */}
        {activeSubTab === 'questions' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {gradeQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>{q.branchName || 'فرع عام'}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400">
                      {q.difficulty === 'EASY' ? 'سهل' : q.difficulty === 'MEDIUM' ? 'متوسط' : 'متقدم'}
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                    {q.questionText}
                  </p>

                  {q.questionLatex && (
                    <div
                      className="text-cyan-600 dark:text-cyan-400 text-xs py-1"
                      dangerouslySetInnerHTML={{ __html: renderMath(q.questionLatex) }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 5: STUDENTS */}
        {activeSubTab === 'students' && (
          <div className="space-y-3">
            {gradeStudents.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  لا يوجد طلاب مسجلون في هذا الصف حتى الآن
                </h4>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                      <th className="py-2.5 px-3">اسم الطالب</th>
                      <th className="py-2.5 px-3">رقم الهاتف</th>
                      <th className="py-2.5 px-3">هاتف ولي الأمر</th>
                      <th className="py-2.5 px-3">حالة الاشتراك</th>
                      <th className="py-2.5 px-3">تاريخ التسجيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {gradeStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                        <td className="py-2.5 px-3 text-slate-900 dark:text-slate-100 font-bold">
                          {st.fullName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-cyan-600 dark:text-cyan-400">{st.phone}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {st.parentPhone || '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          {st.hasActiveSubscription ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              مشترك نشط
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              غير مشترك
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md space-y-4 animate-in zoom-in-95 duration-200 shadow-xl">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              إضافة وحدة دراسية جديدة
            </h3>
            <form onSubmit={handleCreateUnit} className="space-y-3 text-xs font-bold">
              <div className="space-y-1">
                <label className="text-slate-800 dark:text-slate-200 block">عنوان الوحدة:</label>
                <input
                  type="text"
                  required
                  value={newUnitTitle}
                  onChange={(e) => setNewUnitTitle(e.target.value)}
                  placeholder="مثال: الوحدة الأولى: الأعداد النسبية"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 dark:text-slate-200 block">وصف الوحدة (اختياري):</label>
                <textarea
                  value={newUnitDesc}
                  onChange={(e) => setNewUnitDesc(e.target.value)}
                  placeholder="أدخل وصفاً تفصيلياً لموضوعات الوحدة..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUnitOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={unitLoading}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-sm flex items-center gap-1.5"
                >
                  {unitLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
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
