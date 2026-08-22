'use client';

import React, { useState, useMemo } from 'react';
import katex from 'katex';
import { QuestionItemDTO, QuestionOptionDTO, CurriculumGradeDTO } from '@/lib/types/dashboard';
import {
  createQuestionAction,
  updateQuestionAction,
  deleteQuestionAction,
} from '@/lib/actions/questions';
import { uploadRealFileWithProgress } from '@/lib/supabase/storage';
import { UploadProgressBar } from './UploadProgressBar';
import {
  FileQuestion,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  UploadCloud,
  Image as ImageIcon,
  HelpCircle,
  Loader2,
  Search,
  X,
  Eye,
  FileText,
  Users,
  Crown,
  Globe,
  GraduationCap,
  Download,
  Link2,
  BookOpen,
} from 'lucide-react';

const STANDARD_GRADES = [
  'الصف الأول الإعدادي',
  'الصف الثاني الإعدادي',
  'الصف الثالث الإعدادي',
  'الصف الأول الثانوي',
];

interface QuestionBankTabProps {
  initialQuestions: QuestionItemDTO[];
  curriculum?: CurriculumGradeDTO[];
  onRefresh?: () => void;
}

export function QuestionBankTab({ initialQuestions, curriculum = [], onRefresh }: QuestionBankTabProps) {
  const [questions, setQuestions] = useState<QuestionItemDTO[]>(initialQuestions);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('ALL');
  const [filterAudience, setFilterAudience] = useState<string>('ALL');
  const [filterEntryType, setFilterEntryType] = useState<'ALL' | 'QUESTION' | 'FILE'>('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [filterBranch, setFilterBranch] = useState<'ALL' | string>('ALL');

  // Form State (Add or Edit)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [entryMode, setEntryMode] = useState<'QUESTION' | 'FILE'>('QUESTION');

  // Target Settings (الصف الدراسي + الفئة المستهدفة)
  const [gradeName, setGradeName] = useState('الصف الأول الإعدادي');
  const [targetAudience, setTargetAudience] = useState<'ALL_STUDENTS' | 'SUBSCRIBERS_ONLY' | 'PUBLIC'>('ALL_STUDENTS');
  const [branchName, setBranchName] = useState('فرع الجبر والإحصاء');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');

  // Interactive Question fields
  const [questionText, setQuestionText] = useState('');
  const [latexFormula, setLatexFormula] = useState('');
  const [questionType, setQuestionType] = useState<'MCQ' | 'TRUE_FALSE'>('MCQ');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAns, setCorrectAns] = useState('A');
  const [explanation, setExplanation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  // File Upload fields (ملف أسئلة / شيت)
  const [fileInputType, setFileInputType] = useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState('');

  // Status & Progress
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Preview modal for a question or file
  const [previewQuestion, setPreviewQuestion] = useState<QuestionItemDTO | null>(null);

  // Grades available from props or fallback
  const availableGrades = useMemo(() => {
    if (curriculum && curriculum.length > 0) {
      return Array.from(new Set(curriculum.map((g) => g.name)));
    }
    return STANDARD_GRADES;
  }, [curriculum]);

  const renderMath = (latex: string) => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: true });
    } catch {
      return latex;
    }
  };

  const resetForm = () => {
    setEditingQuestionId(null);
    setEntryMode('QUESTION');
    setGradeName(availableGrades[0] || 'الصف الأول الإعدادي');
    setTargetAudience('ALL_STUDENTS');
    setBranchName('فرع الجبر والإحصاء');
    setDifficulty('MEDIUM');

    setQuestionText('');
    setLatexFormula('');
    setQuestionType('MCQ');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectAns('A');
    setExplanation('');
    setImageFile(null);
    setExistingImageUrl(null);

    setFileInputType('upload');
    setSelectedFile(null);
    setFileUrl('');
    setFileName('');
    setUploadProgress(0);
    setUploadLabel('');

    setErrorMsg('');
  };

  const handleOpenCreate = (mode: 'QUESTION' | 'FILE' = 'QUESTION') => {
    resetForm();
    setEntryMode(mode);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (q: QuestionItemDTO) => {
    setEditingQuestionId(q.id);
    const isFile = q.entryType === 'FILE' || q.questionType === 'FILE' || Boolean(q.fileUrl);
    setEntryMode(isFile ? 'FILE' : 'QUESTION');

    setGradeName(q.gradeName || availableGrades[0] || 'الصف الأول الإعدادي');
    setTargetAudience(q.targetAudience || 'ALL_STUDENTS');
    setBranchName(q.branchName || 'فرع الجبر والإحصاء');
    setDifficulty(q.difficulty || 'MEDIUM');

    setQuestionText(q.questionText || '');
    setLatexFormula(q.questionLatex || '');
    setQuestionType(q.questionType === 'TRUE_FALSE' ? 'TRUE_FALSE' : 'MCQ');

    if (q.questionType === 'MCQ') {
      setOptA(q.options?.find((o) => o.label === 'A')?.text || '');
      setOptB(q.options?.find((o) => o.label === 'B')?.text || '');
      setOptC(q.options?.find((o) => o.label === 'C')?.text || '');
      setOptD(q.options?.find((o) => o.label === 'D')?.text || '');
    } else {
      setOptA('صواب (True)');
      setOptB('خطأ (False)');
    }

    setCorrectAns(q.correctAnswer || 'A');
    setExplanation(q.explanation || '');
    setImageFile(null);
    setExistingImageUrl(q.imageUrl || null);

    setFileUrl(q.fileUrl || '');
    setFileName(q.fileName || '');
    setSelectedFile(null);
    setFileInputType(q.fileUrl ? 'url' : 'upload');

    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      setErrorMsg(entryMode === 'FILE' ? 'يرجى كتابة عنوان ملف الأسئلة أو الشيت' : 'يرجى كتابة نص السؤال');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      let finalImageUrl = existingImageUrl || undefined;
      if (imageFile) {
        setUploadLabel('جاري رفع الصورة التوضيحية...');
        finalImageUrl = await uploadRealFileWithProgress(
          imageFile,
          'course-materials',
          'questions',
          (pct) => {
            setUploadProgress(pct);
          }
        );
      }

      let finalFileUrl = fileUrl.trim() || undefined;
      let finalFileName = fileName.trim() || undefined;

      if (entryMode === 'FILE' && selectedFile) {
        setUploadLabel(`جاري رفع ملف الأسئلة (${selectedFile.name})...`);
        finalFileUrl = await uploadRealFileWithProgress(
          selectedFile,
          'course-materials',
          'questions',
          (pct) => {
            setUploadProgress(pct);
          }
        );
        finalFileName = selectedFile.name;
      }

      const options: QuestionOptionDTO[] =
        entryMode === 'QUESTION'
          ? questionType === 'MCQ'
            ? [
                { label: 'A', text: optA.trim() || 'الخيار الأول' },
                { label: 'B', text: optB.trim() || 'الخيار الثاني' },
                { label: 'C', text: optC.trim() || 'الخيار الثالث' },
                { label: 'D', text: optD.trim() || 'الخيار الرابع' },
              ]
            : [
                { label: 'A', text: 'صواب (True)' },
                { label: 'B', text: 'خطأ (False)' },
              ]
          : [];

      if (editingQuestionId) {
        const res = await updateQuestionAction(editingQuestionId, {
          questionText: questionText.trim(),
          questionLatex: latexFormula.trim() || undefined,
          imageUrl: finalImageUrl,
          difficulty,
          questionType: entryMode === 'FILE' ? 'FILE' : questionType,
          entryType: entryMode,
          options,
          correctAnswer: entryMode === 'FILE' ? '' : correctAns,
          explanation: explanation.trim() || undefined,
          branchName,
          gradeName,
          targetAudience,
          fileUrl: finalFileUrl,
          fileName: finalFileName,
          fileType: finalFileName?.split('.').pop() || 'pdf',
        });

        if (res.success && res.data) {
          setQuestions((prev) =>
            prev.map((q) => (q.id === editingQuestionId ? (res.data as QuestionItemDTO) : q))
          );
          setSuccessMsg('تم تحديث البيانات في بنك الأسئلة بنجاح! ');
          setIsFormOpen(false);
          resetForm();
          if (onRefresh) onRefresh();
        } else {
          setErrorMsg(res.error || 'فشل تحديث البيانات');
        }
      } else {
        const res = await createQuestionAction({
          questionText: questionText.trim(),
          questionLatex: latexFormula.trim() || undefined,
          imageUrl: finalImageUrl,
          difficulty,
          questionType: entryMode === 'FILE' ? 'FILE' : questionType,
          entryType: entryMode,
          options,
          correctAnswer: entryMode === 'FILE' ? '' : correctAns,
          explanation: explanation.trim() || undefined,
          branchName,
          gradeName,
          targetAudience,
          fileUrl: finalFileUrl,
          fileName: finalFileName,
          fileType: finalFileName?.split('.').pop() || 'pdf',
        });

        if (res.success && res.data) {
          setQuestions((prev) => [res.data as QuestionItemDTO, ...prev]);
          setSuccessMsg(
            entryMode === 'FILE'
              ? 'تم رفع ملف الأسئلة وحفظه في بنك الأسئلة بنجاح! '
              : 'تم حفظ السؤال في بنك الأسئلة بنجاح! '
          );
          setIsFormOpen(false);
          resetForm();
          if (onRefresh) onRefresh();
        } else {
          setErrorMsg(res.error || 'فشل إضافة السؤال/الملف');
        }
      }
    } catch {
      setErrorMsg('حدث خطأ أثناء الحفظ، يرجى المحاولة مجدداً');
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setUploadLabel('');
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا البند نهائياً من بنك الأسئلة؟')) return;

    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    try {
      await deleteQuestionAction(questionId);
      if (onRefresh) onRefresh();
    } catch {
      // ignore
    }
  };

  // Filtered list
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (filterGrade !== 'ALL') {
        if (q.gradeName !== filterGrade && q.gradeName !== 'جميع الصفوف') return false;
      }
      if (filterAudience !== 'ALL' && q.targetAudience !== filterAudience) return false;
      if (filterEntryType !== 'ALL') {
        const isFile = q.entryType === 'FILE' || q.questionType === 'FILE' || Boolean(q.fileUrl);
        if (filterEntryType === 'FILE' && !isFile) return false;
        if (filterEntryType === 'QUESTION' && isFile) return false;
      }
      if (filterDifficulty !== 'ALL' && q.difficulty !== filterDifficulty) return false;
      if (filterBranch !== 'ALL' && q.branchName !== filterBranch) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesText = q.questionText.toLowerCase().includes(query);
        const matchesLatex = q.questionLatex ? q.questionLatex.toLowerCase().includes(query) : false;
        const matchesExplanation = q.explanation ? q.explanation.toLowerCase().includes(query) : false;
        const matchesFile = q.fileName ? q.fileName.toLowerCase().includes(query) : false;
        return matchesText || matchesLatex || matchesExplanation || matchesFile;
      }

      return true;
    });
  }, [questions, filterGrade, filterAudience, filterEntryType, filterDifficulty, filterBranch, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = questions.length;
    const questionsCount = questions.filter(
      (q) => q.entryType !== 'FILE' && q.questionType !== 'FILE' && !q.fileUrl
    ).length;
    const filesCount = total - questionsCount;
    const subscribersOnlyCount = questions.filter((q) => q.targetAudience === 'SUBSCRIBERS_ONLY').length;
    const allStudentsCount = questions.filter((q) => q.targetAudience === 'ALL_STUDENTS' || !q.targetAudience).length;
    return { total, questionsCount, filesCount, subscribersOnlyCount, allStudentsCount };
  }, [questions]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-cyan-electric" />
            <span>بنك الأسئلة والشيتات التفاعلية</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-chalk-muted mt-1">
            إدارة الأسئلة الفردية وملفات الأسئلة المرفوعة وتحديد الصف الدراسي والطلاب المستهدفين بدقة
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenCreate('QUESTION')}
            className="px-4 py-2.5 rounded-2xl bg-cyan-electric hover:bg-cyan-electric-hover text-slate-950 font-black text-xs sm:text-sm shadow-cyan-glow transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سؤال تفاعلي</span>
          </button>
          <button
            onClick={() => handleOpenCreate('FILE')}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-cyan-electric/30 hover:border-cyan-electric text-slate-900 dark:text-chalk font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4 text-cyan-electric" />
            <span>رفع ملف أسئلة / شيت</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="chalk-card rounded-2xl p-4 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-cyan-electric/15 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-chalk-muted block">إجمالي محتوى البنك</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">{stats.total}</div>
        </div>
        <div className="chalk-card rounded-2xl p-4 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-cyan-electric/15 space-y-1">
          <span className="text-[11px] font-bold text-cyan-electric block">أسئلة تفاعلية (MCQ/صواب وخطأ)</span>
          <div className="text-xl sm:text-2xl font-black text-cyan-electric">{stats.questionsCount}</div>
        </div>
        <div className="chalk-card rounded-2xl p-4 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-cyan-electric/15 space-y-1">
          <span className="text-[11px] font-bold text-emerald-500 block">ملفات وشيتات PDF مرفوعة</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.filesCount}</div>
        </div>
        <div className="chalk-card rounded-2xl p-4 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-cyan-electric/15 space-y-1">
          <span className="text-[11px] font-bold text-amber-500 block">خاص بالمشتركين فقط 👑</span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">{stats.subscribersOnlyCount}</div>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Question / File Form Modal */}
      {isFormOpen && (
        <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white/95 dark:bg-slate-900/90 border border-cyan-electric/30 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          {/* Header & Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
                {editingQuestionId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-chalk">
                  {editingQuestionId
                    ? entryMode === 'FILE'
                      ? 'تعديل ملف الأسئلة'
                      : 'تعديل بيانات السؤال'
                    : entryMode === 'FILE'
                    ? 'رفع ملف أسئلة / شيت جديد لبنك الأسئلة'
                    : 'إضافة سؤال تفاعلي جديد لبنك الأسئلة'}
                </h3>
                <span className="text-xs text-slate-500 dark:text-chalk-muted">
                  حدد الصف الدراسي والفئة المستهدفة بدقة ليظهر المحتوى للطلاب المطلوبين
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              {!editingQuestionId && (
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEntryMode('QUESTION')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      entryMode === 'QUESTION'
                        ? 'bg-cyan-electric text-slate-950 shadow-sm'
                        : 'text-slate-600 dark:text-chalk-muted hover:text-slate-900 dark:hover:text-chalk'
                    }`}
                  >
                    سؤال تفاعلي
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryMode('FILE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      entryMode === 'FILE'
                        ? 'bg-cyan-electric text-slate-950 shadow-sm'
                        : 'text-slate-600 dark:text-chalk-muted hover:text-slate-900 dark:hover:text-chalk'
                    }`}
                  >
                    ملف أسئلة / شيت
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-chalk hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {uploadLabel && (
            <UploadProgressBar progress={uploadProgress} label={uploadLabel} />
          )}

          <form onSubmit={handleSave} className="space-y-5 text-xs font-bold">
            {/* 1. Target Grade & Audience Selectors (أساسي لكل أنواع الأسئلة) */}
            <div className="p-4 rounded-2xl bg-cyan-electric/5 border border-cyan-electric/20 space-y-4">
              <div className="flex items-center gap-2 text-cyan-electric font-black text-sm">
                <GraduationCap className="w-4 h-4" />
                <span>الصف الدراسي والفئة المستهدفة:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* الصف الدراسي */}
                <div className="space-y-1.5">
                  <label className="text-slate-800 dark:text-chalk flex items-center gap-1.5">
                    <span>الصف الدراسي التابع له:</span>
                  </label>
                  <select
                    value={gradeName}
                    onChange={(e) => setGradeName(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                  >
                    {availableGrades.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                    <option value="جميع الصفوف">جميع الصفوف الدراسية (عام)</option>
                  </select>
                </div>

                {/* تظهر عند مين بالضبط */}
                <div className="space-y-1.5">
                  <label className="text-slate-800 dark:text-chalk flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-electric" />
                    <span>تظهر عند مين بالظبط:</span>
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) =>
                      setTargetAudience(
                        e.target.value as 'ALL_STUDENTS' | 'SUBSCRIBERS_ONLY' | 'PUBLIC'
                      )
                    }
                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                  >
                    <option value="ALL_STUDENTS">👥 جميع طلاب الصف (المسجلين)</option>
                    <option value="SUBSCRIBERS_ONLY">👑 المشتركين فقط (أصحاب الاشتراكات النشطة)</option>
                    <option value="PUBLIC">🌐 متاح للجميع (محتوى مجاني وعام)</option>
                  </select>
                </div>

                {/* الفرع التعليمي */}
                <div className="space-y-1.5">
                  <label className="text-slate-800 dark:text-chalk block">الفرع التعليمي:</label>
                  <select
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                  >
                    <option value="فرع الجبر والإحصاء">فرع الجبر والإحصاء</option>
                    <option value="فرع الهندسة والقياس">فرع الهندسة والقياس</option>
                    <option value="فرع حساب المثلثات">فرع حساب المثلثات</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. MODE: QUESTION (سؤال تفاعلي فردي) */}
            {entryMode === 'QUESTION' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-800 dark:text-chalk block">نوع السؤال:</label>
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value as 'MCQ' | 'TRUE_FALSE')}
                      className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                    >
                      <option value="MCQ">اختيار من متعدد (4 خيارات)</option>
                      <option value="TRUE_FALSE">صواب أو خطأ (خياران)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-800 dark:text-chalk block">مستوى الصعوبة:</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as 'EASY' | 'MEDIUM' | 'HARD')}
                      className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                    >
                      <option value="EASY">سهل (مفاهيم أساسية)</option>
                      <option value="MEDIUM">متوسط (تطبيق وتفكير)</option>
                      <option value="HARD">متقدم (مستويات عليا)</option>
                    </select>
                  </div>
                </div>

                {/* Question Text */}
                <div className="space-y-1.5">
                  <label className="text-slate-800 dark:text-chalk block">نص السؤال باللغة العربية:</label>
                  <textarea
                    required
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="مثال: في الشكل المقابل، إذا كان المستقيم أ ب يوازي المستقيم جـ د، فإن قيمة س تساوي:"
                    rows={2}
                    className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric text-sm"
                  />
                </div>

                {/* KaTeX Formula Box & Live Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <div className="space-y-1.5">
                    <label className="text-slate-800 dark:text-chalk block">
                      صيغة المعادلة الرياضية (LaTeX Formula) — اختياري:
                    </label>
                    <textarea
                      dir="ltr"
                      value={latexFormula}
                      onChange={(e) => setLatexFormula(e.target.value)}
                      placeholder="f(x) = \frac{x^2 - 4}{x - 2}"
                      rows={2}
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                    />
                    <span className="text-[11px] text-slate-400 font-normal block">
                      {'أمثلة: \\frac{3}{5} للكسور | \\sqrt{x} للجذور | x^2 للأسس'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-800 dark:text-chalk block">
                      المعاينة المباشرة للمعادلة (KaTeX Preview):
                    </label>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-cyan-electric/30 min-h-[75px] flex items-center justify-center text-slate-900 dark:text-chalk overflow-x-auto">
                      {latexFormula ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: renderMath(latexFormula),
                          }}
                        />
                      ) : (
                        <span className="text-slate-400 text-xs">اكتب صيغة LaTeX للمعاينة هنا</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Diagram / Image Upload */}
                <div className="space-y-1.5">
                  <label className="text-slate-800 dark:text-chalk flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-cyan-electric" />
                    <span>صورة أو رسم بياني هندسي مرفق مع السؤال (اختياري):</span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="flex-1 w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 hover:border-cyan-electric cursor-pointer bg-white dark:bg-slate-900 transition-colors">
                      <UploadCloud className="w-4 h-4 text-cyan-electric" />
                      <span className="text-xs text-slate-600 dark:text-chalk-muted">
                        {imageFile ? imageFile.name : existingImageUrl ? 'تغيير الصورة المرفقة' : 'رفع رسم توضيحي أو شكل هندسي'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>

                    {(imageFile || existingImageUrl) && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setExistingImageUrl(null);
                        }}
                        className="px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                      >
                        إزالة الصورة
                      </button>
                    )}
                  </div>
                </div>

                {/* Options Section */}
                {questionType === 'MCQ' ? (
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-800 dark:text-chalk block font-black">
                      خيارات الإجابة وتحديد الإجابة الصحيحة:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctChoice"
                          checked={correctAns === 'A'}
                          onChange={() => setCorrectAns('A')}
                          className="w-4 h-4 text-cyan-electric"
                        />
                        <input
                          type="text"
                          required
                          value={optA}
                          onChange={(e) => setOptA(e.target.value)}
                          placeholder="الخيار (أ)"
                          className="flex-1 h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctChoice"
                          checked={correctAns === 'B'}
                          onChange={() => setCorrectAns('B')}
                          className="w-4 h-4 text-cyan-electric"
                        />
                        <input
                          type="text"
                          required
                          value={optB}
                          onChange={(e) => setOptB(e.target.value)}
                          placeholder="الخيار (ب)"
                          className="flex-1 h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctChoice"
                          checked={correctAns === 'C'}
                          onChange={() => setCorrectAns('C')}
                          className="w-4 h-4 text-cyan-electric"
                        />
                        <input
                          type="text"
                          required
                          value={optC}
                          onChange={(e) => setOptC(e.target.value)}
                          placeholder="الخيار (جـ)"
                          className="flex-1 h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctChoice"
                          checked={correctAns === 'D'}
                          onChange={() => setCorrectAns('D')}
                          className="w-4 h-4 text-cyan-electric"
                        />
                        <input
                          type="text"
                          required
                          value={optD}
                          onChange={(e) => setOptD(e.target.value)}
                          placeholder="الخيار (د)"
                          className="flex-1 h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-800 dark:text-chalk block font-black">
                      حدد الإجابة الصحيحة للعبارة:
                    </span>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="correctTF"
                          checked={correctAns === 'A'}
                          onChange={() => setCorrectAns('A')}
                          className="w-4 h-4 text-cyan-electric"
                        />
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">صواب (True)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="correctTF"
                          checked={correctAns === 'B'}
                          onChange={() => setCorrectAns('B')}
                          className="w-4 h-4 text-cyan-electric"
                        />
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">خطأ (False)</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div className="space-y-1.5">
                  <label className="text-slate-800 dark:text-chalk block">
                    تفسير وشرح الإجابة النموذجية (يظهر للطالب بعد الحل) — اختياري:
                  </label>
                  <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="اكتب التبرير الهندسي أو الخطوات الجبرية للحل النموذجي..."
                    rows={2}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                  />
                </div>
              </div>
            )}

            {/* 3. MODE: FILE (رفع ملف أسئلة / شيت PDF) */}
            {entryMode === 'FILE' && (
              <div className="space-y-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-slate-800 dark:text-chalk block">
                    عنوان ملف الأسئلة أو شيت التمارين:
                  </label>
                  <input
                    type="text"
                    required
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="مثال: شيت بنك الأسئلة الشامل في الجبر - مراجعة نصف العام"
                    className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-800 dark:text-chalk block">مستوى صعوبة الأسئلة بالملف:</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as 'EASY' | 'MEDIUM' | 'HARD')}
                      className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                    >
                      <option value="EASY">سهل (مفاهيم أساسية وتأسيس)</option>
                      <option value="MEDIUM">متوسط (تطبيق وتمارين شاملة)</option>
                      <option value="HARD">متقدم (مستويات عليا وتحدي)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-800 dark:text-chalk block">
                      طريقة إرفاق ملف الأسئلة:
                    </label>
                    <div className="flex items-center gap-2 h-11">
                      <button
                        type="button"
                        onClick={() => setFileInputType('upload')}
                        className={`flex-1 h-full rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                          fileInputType === 'upload'
                            ? 'bg-cyan-electric/15 border-cyan-electric text-cyan-electric'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-chalk-muted'
                        }`}
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>رفع ملف من جهازي</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFileInputType('url')}
                        className={`flex-1 h-full rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                          fileInputType === 'url'
                            ? 'bg-cyan-electric/15 border-cyan-electric text-cyan-electric'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-chalk-muted'
                        }`}
                      >
                        <Link2 className="w-4 h-4" />
                        <span>رابط ملف خارجي (URL)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Upload or URL input */}
                {fileInputType === 'upload' ? (
                  <div className="space-y-1.5">
                    <label className="text-slate-800 dark:text-chalk block">
                      اختر ملف الأسئلة (PDF أو صورة شيت أو مستند):
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-cyan-electric/40 hover:border-cyan-electric cursor-pointer bg-white dark:bg-slate-900 transition-colors">
                        <UploadCloud className="w-5 h-5 text-cyan-electric" />
                        <span className="text-xs text-slate-700 dark:text-chalk font-bold">
                          {selectedFile
                            ? selectedFile.name
                            : fileUrl
                            ? 'الملف مرفوع بالفعل (انقر لتغييره)'
                            : 'انقر هنا لاختيار ملف PDF / Word / صورة للشيت'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null;
                            setSelectedFile(f);
                            if (f) setFileName(f.name);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-slate-800 dark:text-chalk block">
                      رابط ملف الأسئلة المباشر:
                    </label>
                    <input
                      type="url"
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      placeholder="https://example.com/questions-bank.pdf"
                      className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                    />
                  </div>
                )}

                {/* File description / instructions */}
                <div className="space-y-1.5">
                  <label className="text-slate-800 dark:text-chalk block">
                    ملاحظات أو تعليمات حول هذا الملف (اختياري):
                  </label>
                  <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="مثال: يحتوي الشيت على نماذج امتحانات السنوات السابقة مع الإجابات النموذجية..."
                    rows={2}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                  />
                </div>
              </div>
            )}

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-chalk font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-cyan-electric hover:bg-cyan-electric-hover text-slate-950 font-black shadow-cyan-glow transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الحفظ والرفع...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {editingQuestionId
                        ? 'تحديث البيانات'
                        : entryMode === 'FILE'
                        ? 'حفظ ملف الأسئلة في البنك'
                        : 'حفظ السؤال في البنك'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في نصوص وصيغ وملفات الأسئلة..."
              className="w-full h-10 pr-10 pl-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Grade Filter */}
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
            >
              <option value="ALL">جميع الصفوف الدراسية</option>
              {availableGrades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {/* Target Audience Filter */}
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
            >
              <option value="ALL">جميع الفئات المستهدفة</option>
              <option value="ALL_STUDENTS">👥 جميع طلاب الصف</option>
              <option value="SUBSCRIBERS_ONLY">👑 المشتركين فقط</option>
              <option value="PUBLIC">🌐 متاح للجميع (عام)</option>
            </select>

            {/* Entry Type Filter */}
            <select
              value={filterEntryType}
              onChange={(e) => setFilterEntryType(e.target.value as 'ALL' | 'QUESTION' | 'FILE')}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
            >
              <option value="ALL">كل الأنواع (أسئلة وملفات)</option>
              <option value="QUESTION">أسئلة تفاعلية</option>
              <option value="FILE">ملفات وشيتات PDF</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value as 'ALL' | 'EASY' | 'MEDIUM' | 'HARD')}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
            >
              <option value="ALL">جميع الصعوبات</option>
              <option value="EASY">سهل</option>
              <option value="MEDIUM">متوسط</option>
              <option value="HARD">متقدم</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions & Files Listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-chalk-muted">
          <span>النتائج المعروضة: {filteredQuestions.length} عنصر</span>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="chalk-card rounded-3xl p-12 text-center space-y-3 bg-white/80 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800">
            <FileQuestion className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-black text-slate-900 dark:text-chalk">لا توجد أسئلة أو ملفات مطابقة للبحث</h3>
            <p className="text-xs text-slate-500 dark:text-chalk-muted">
              جرّب تغيير كلمات البحث أو الفلاتر المختارة، أو أضف سؤالاً أو ملفاً جديداً.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredQuestions.map((q, idx) => {
              const isFile = q.entryType === 'FILE' || q.questionType === 'FILE' || Boolean(q.fileUrl);

              return (
                <div
                  key={q.id}
                  className="chalk-card rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-cyan-electric/15 hover:border-cyan-electric/40 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-xl bg-cyan-electric/15 text-cyan-electric font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="space-y-2">
                        {/* Badges: Grade + Target Audience + Branch + Type + Difficulty */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Grade Badge */}
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-cyan-electric/15 text-cyan-electric border border-cyan-electric/30 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            <span>{q.gradeName || 'الصف الأول الإعدادي'}</span>
                          </span>

                          {/* Audience Badge */}
                          {q.targetAudience === 'SUBSCRIBERS_ONLY' ? (
                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              <span>المشتركين فقط</span>
                            </span>
                          ) : q.targetAudience === 'PUBLIC' ? (
                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              <span>متاح للجميع (عام)</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>جميع طلاب الصف</span>
                            </span>
                          )}

                          {/* Branch Badge */}
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-chalk-muted">
                            {q.branchName || 'فرع الجبر'}
                          </span>

                          {/* Entry Type Badge */}
                          {isFile ? (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              <span>ملف أسئلة / شيت</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-chalk-muted">
                              {q.questionType === 'MCQ' ? 'اختيار من متعدد' : 'صواب وخطأ'}
                            </span>
                          )}

                          {/* Difficulty Badge */}
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                              q.difficulty === 'EASY'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : q.difficulty === 'MEDIUM'
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}
                          >
                            {q.difficulty === 'EASY' ? 'سهل' : q.difficulty === 'MEDIUM' ? 'متوسط' : 'متقدم'}
                          </span>
                        </div>

                        {/* Title or Question text */}
                        <p className="text-sm sm:text-base font-black text-slate-900 dark:text-chalk leading-relaxed">
                          {q.questionText}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                      <button
                        onClick={() => setPreviewQuestion(q)}
                        className="p-2 rounded-xl text-slate-500 hover:text-cyan-electric hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="معاينة"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(q)}
                        className="p-2 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* If File: Display file link & details */}
                  {isFile && q.fileUrl && (
                    <div className="p-3.5 rounded-2xl bg-cyan-electric/5 border border-cyan-electric/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-cyan-electric/15 text-cyan-electric flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-chalk block truncate max-w-xs sm:max-w-md">
                            {q.fileName || 'ملف الأسئلة المرفق'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            شيت تمارين بصيغة PDF / مستند جاهز للتحميل والمعاينة
                          </span>
                        </div>
                      </div>

                      <a
                        href={q.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-cyan-electric text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 hover:bg-cyan-electric-hover transition-all shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>معاينة وتحميل الملف</span>
                      </a>
                    </div>
                  )}

                  {/* KaTeX formula preview if present */}
                  {q.questionLatex && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 overflow-x-auto text-center">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: renderMath(q.questionLatex),
                        }}
                      />
                    </div>
                  )}

                  {/* Attached Diagram if present */}
                  {q.imageUrl && (
                    <div className="max-w-xs rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-2">
                      <img
                        src={q.imageUrl}
                        alt="Diagram"
                        className="w-full h-auto max-h-40 object-contain rounded-lg"
                      />
                    </div>
                  )}

                  {/* Options preview for interactive questions */}
                  {!isFile && q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                      {q.options.map((opt) => {
                        const isCorrect = opt.label === q.correctAnswer;
                        return (
                          <div
                            key={opt.label}
                            className={`p-2.5 rounded-xl border flex items-center justify-between ${
                              isCorrect
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-black'
                                : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-chalk-muted font-medium'
                            }`}
                          >
                            <span className="truncate">{opt.text}</span>
                            {isCorrect && (
                              <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md shrink-0">
                                الإجابة الصحيحة 
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <p className="text-[11px] text-slate-500 dark:text-chalk-muted italic bg-slate-50/50 dark:bg-slate-950/30 p-2.5 rounded-xl">
                      <span className="font-bold">
                        {isFile ? 'ملاحظات وتفاصيل:' : 'التفسير والحل النموذجي:'}
                      </span>{' '}
                      {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-cyan-electric/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-electric font-black text-sm">
                <HelpCircle className="w-5 h-5" />
                <span>
                  {previewQuestion.entryType === 'FILE'
                    ? 'معاينة ملف الأسئلة والشيت'
                    : 'معاينة السؤال كما يظهر للطالب'}
                </span>
              </div>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-chalk"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black px-3 py-1 rounded-full bg-cyan-electric/15 text-cyan-electric border border-cyan-electric/30">
                  {previewQuestion.gradeName || 'الصف الأول الإعدادي'}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-chalk-muted">
                  {previewQuestion.targetAudience === 'SUBSCRIBERS_ONLY'
                    ? '👑 المشتركين فقط'
                    : previewQuestion.targetAudience === 'PUBLIC'
                    ? '🌐 متاح للجميع'
                    : '👥 جميع طلاب الصف'}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-chalk-muted">
                  {previewQuestion.branchName}
                </span>
              </div>

              <p className="text-base font-black text-slate-900 dark:text-chalk">
                {previewQuestion.questionText}
              </p>

              {previewQuestion.fileUrl && (
                <div className="p-4 rounded-2xl bg-cyan-electric/10 border border-cyan-electric/30 text-center space-y-3">
                  <FileText className="w-10 h-10 text-cyan-electric mx-auto" />
                  <div className="text-xs font-bold text-slate-900 dark:text-chalk">
                    {previewQuestion.fileName || 'ملف الأسئلة المرفوع'}
                  </div>
                  <a
                    href={previewQuestion.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-electric text-slate-950 font-black text-xs shadow-cyan-glow"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل وفتح الملف في نافذة جديدة</span>
                  </a>
                </div>
              )}

              {previewQuestion.questionLatex && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: renderMath(previewQuestion.questionLatex),
                    }}
                  />
                </div>
              )}

              {previewQuestion.imageUrl && (
                <div className="text-center">
                  <img
                    src={previewQuestion.imageUrl}
                    alt="Diagram"
                    className="max-h-48 mx-auto rounded-xl border border-slate-300 dark:border-slate-800"
                  />
                </div>
              )}

              {previewQuestion.options && previewQuestion.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {previewQuestion.options.map((opt) => (
                    <div
                      key={opt.label}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-chalk"
                    >
                      {opt.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setPreviewQuestion(null)}
              className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-chalk hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              إغلاق المعاينة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

