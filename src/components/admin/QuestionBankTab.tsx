'use client';

import React, { useState, useMemo } from 'react';
import katex from 'katex';
import { QuestionItemDTO, QuestionOptionDTO } from '@/lib/types/dashboard';
import {
  createQuestionAction,
  updateQuestionAction,
  deleteQuestionAction,
} from '@/lib/actions/questions';
import { uploadRealFile } from '@/lib/supabase/storage';
import {
  FileQuestion,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Sparkles,
  UploadCloud,
  Image as ImageIcon,
  HelpCircle,
  Loader2,
  Search,
  Filter,
  Layers,
  X,
  Eye,
  BookOpen,
} from 'lucide-react';

interface QuestionBankTabProps {
  initialQuestions: QuestionItemDTO[];
  onRefresh?: () => void;
}

export function QuestionBankTab({ initialQuestions, onRefresh }: QuestionBankTabProps) {
  const [questions, setQuestions] = useState<QuestionItemDTO[]>(initialQuestions);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'MCQ' | 'TRUE_FALSE'>('ALL');
  const [filterBranch, setFilterBranch] = useState<'ALL' | string>('ALL');

  // Form State (Add or Edit)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [latexFormula, setLatexFormula] = useState('\\frac{a}{b} = \\sqrt{c^2 + d^2}');
  const [questionType, setQuestionType] = useState<'MCQ' | 'TRUE_FALSE'>('MCQ');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [branchName, setBranchName] = useState('فرع الجبر والإحصاء');

  // Options
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAns, setCorrectAns] = useState('A');
  const [explanation, setExplanation] = useState('');

  // Diagram upload / preview
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Preview modal for a question
  const [previewQuestion, setPreviewQuestion] = useState<QuestionItemDTO | null>(null);

  const renderMath = (latex: string) => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: true });
    } catch {
      return latex;
    }
  };

  const resetForm = () => {
    setEditingQuestionId(null);
    setQuestionText('');
    setLatexFormula('\\frac{a}{b} = \\sqrt{c^2 + d^2}');
    setQuestionType('MCQ');
    setDifficulty('MEDIUM');
    setBranchName('فرع الجبر والإحصاء');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectAns('A');
    setExplanation('');
    setImageFile(null);
    setExistingImageUrl(null);
    setErrorMsg('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (q: QuestionItemDTO) => {
    setEditingQuestionId(q.id);
    setQuestionText(q.questionText);
    setLatexFormula(q.questionLatex || '');
    setQuestionType(q.questionType);
    setDifficulty(q.difficulty);
    setBranchName(q.branchName || 'فرع الجبر والإحصاء');

    if (q.questionType === 'MCQ') {
      setOptA(q.options.find((o) => o.label === 'A')?.text || '');
      setOptB(q.options.find((o) => o.label === 'B')?.text || '');
      setOptC(q.options.find((o) => o.label === 'C')?.text || '');
      setOptD(q.options.find((o) => o.label === 'D')?.text || '');
    } else {
      setOptA('صواب (True)');
      setOptB('خطأ (False)');
    }

    setCorrectAns(q.correctAnswer);
    setExplanation(q.explanation || '');
    setImageFile(null);
    setExistingImageUrl(q.imageUrl || null);
    setIsFormOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setErrorMsg('يرجى كتابة نص السؤال');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      let finalImageUrl = existingImageUrl || undefined;
      if (imageFile) {
        finalImageUrl = await uploadRealFile(imageFile, 'course-materials');
      }

      const options: QuestionOptionDTO[] =
        questionType === 'MCQ'
          ? [
              { label: 'A', text: optA.trim() || 'الخيار الأول' },
              { label: 'B', text: optB.trim() || 'الخيار الثاني' },
              { label: 'C', text: optC.trim() || 'الخيار الثالث' },
              { label: 'D', text: optD.trim() || 'الخيار الرابع' },
            ]
          : [
              { label: 'A', text: 'صواب (True)' },
              { label: 'B', text: 'خطأ (False)' },
            ];

      if (editingQuestionId) {
        // Update existing question
        const res = await updateQuestionAction(editingQuestionId, {
          questionText: questionText.trim(),
          questionLatex: latexFormula.trim() || undefined,
          imageUrl: finalImageUrl,
          difficulty,
          questionType,
          options,
          correctAnswer: correctAns,
          explanation: explanation.trim() || undefined,
          branchName,
        });

        if (res.success && res.data) {
          setQuestions((prev) =>
            prev.map((q) => (q.id === editingQuestionId ? (res.data as QuestionItemDTO) : q))
          );
          setSuccessMsg('تم تحديث بيانات السؤال بنجاح ✨');
          setIsFormOpen(false);
          resetForm();
          if (onRefresh) onRefresh();
        } else {
          setErrorMsg(res.error || 'فشل تحديث السؤال');
        }
      } else {
        // Create new question
        const res = await createQuestionAction({
          questionText: questionText.trim(),
          questionLatex: latexFormula.trim() || undefined,
          imageUrl: finalImageUrl,
          difficulty,
          questionType,
          options,
          correctAnswer: correctAns,
          explanation: explanation.trim() || undefined,
          branchName,
        });

        if (res.success && res.data) {
          setQuestions((prev) => [res.data as QuestionItemDTO, ...prev]);
          setSuccessMsg('تم حفظ السؤال بنجاح في بنك الأسئلة! 🎯');
          setIsFormOpen(false);
          resetForm();
          if (onRefresh) onRefresh();
        } else {
          setErrorMsg(res.error || 'فشل إضافة السؤال');
        }
      }
    } catch {
      setErrorMsg('حدث خطأ أثناء حفظ السؤال');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال نهائياً من بنك الأسئلة؟')) return;

    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    try {
      await deleteQuestionAction(questionId);
      if (onRefresh) onRefresh();
    } catch {
      // ignore
    }
  };

  // Filtered Questions list
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (filterDifficulty !== 'ALL' && q.difficulty !== filterDifficulty) return false;
      if (filterType !== 'ALL' && q.questionType !== filterType) return false;
      if (filterBranch !== 'ALL' && q.branchName !== filterBranch) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesText = q.questionText.toLowerCase().includes(query);
        const matchesLatex = q.questionLatex ? q.questionLatex.toLowerCase().includes(query) : false;
        const matchesExplanation = q.explanation ? q.explanation.toLowerCase().includes(query) : false;
        return matchesText || matchesLatex || matchesExplanation;
      }

      return true;
    });
  }, [questions, filterDifficulty, filterType, filterBranch, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = questions.length;
    const easyCount = questions.filter((q) => q.difficulty === 'EASY').length;
    const medCount = questions.filter((q) => q.difficulty === 'MEDIUM').length;
    const hardCount = questions.filter((q) => q.difficulty === 'HARD').length;
    const mcqCount = questions.filter((q) => q.questionType === 'MCQ').length;
    const tfCount = questions.filter((q) => q.questionType === 'TRUE_FALSE').length;
    return { total, easyCount, medCount, hardCount, mcqCount, tfCount };
  }, [questions]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">
            بنك الأسئلة ومعادلات KaTeX الرياضية
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-chalk-muted mt-0.5">
            إدارة وإنشاء أسئلة الاختيار من متعدد والصواب والخطأ مع كتابة الصيغ الرياضية والرسم الهندسي
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-2xl bg-cyan-electric hover:bg-cyan-electric-hover text-slate-950 font-black text-xs sm:text-sm shadow-cyan-glow transition-all flex items-center justify-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة سؤال جديد</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="chalk-card rounded-2xl p-4 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-cyan-electric/15 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-chalk-muted block">إجمالي الأسئلة</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">{stats.total}</div>
        </div>
        <div className="chalk-card rounded-2xl p-4 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-cyan-electric/15 space-y-1">
          <span className="text-[11px] font-bold text-emerald-500 block">أسئلة سهلة (مفاهيم)</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.easyCount}</div>
        </div>
        <div className="chalk-card rounded-2xl p-4 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-cyan-electric/15 space-y-1">
          <span className="text-[11px] font-bold text-amber-500 block">أسئلة متوسطة (تطبيق)</span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">{stats.medCount}</div>
        </div>
        <div className="chalk-card rounded-2xl p-4 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-cyan-electric/15 space-y-1">
          <span className="text-[11px] font-bold text-red-500 block">أسئلة متقدمة (فائقة)</span>
          <div className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400">{stats.hardCount}</div>
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

      {/* Question Form (Add / Edit Modal or Collapsible) */}
      {isFormOpen && (
        <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-cyan-electric/30 space-y-6 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
                {editingQuestionId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-chalk">
                  {editingQuestionId ? 'تعديل بيانات السؤال' : 'إضافة سؤال جديد لبنك الأسئلة'}
                </h3>
                <span className="text-xs text-slate-500 dark:text-chalk-muted">
                  يدعم كتابة صيغ الجبر، الكسور، الجذور، والمثلثات عبر KaTeX
                </span>
              </div>
            </div>

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

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSaveQuestion} className="space-y-5 text-xs font-bold">
            {/* Metadata Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-800 dark:text-chalk block">الفرع التعليمي:</label>
                <select
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                >
                  <option value="فرع الجبر والإحصاء">فرع الجبر والإحصاء</option>
                  <option value="فرع الهندسة والقياس">فرع الهندسة والقياس</option>
                  <option value="فرع حساب المثلثات">فرع حساب المثلثات</option>
                </select>
              </div>

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
                  صيغة المعادلة الرياضية (LaTeX Formula):
                </label>
                <textarea
                  dir="ltr"
                  value={latexFormula}
                  onChange={(e) => setLatexFormula(e.target.value)}
                  placeholder="f(x) = \frac{x^2 - 4}{x - 2}"
                  rows={3}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                />
                <span className="text-[11px] text-slate-400 font-normal block">
                  {'أمثلة: \\frac{3}{5} للكسور | \\sqrt{x} للجذور | x^2 للأسس | \\sin(x) للجا'}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-800 dark:text-chalk block">
                  المعاينة المباشرة للمعادلة (KaTeX Live Preview):
                </label>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-cyan-electric/30 min-h-[90px] flex items-center justify-center text-slate-900 dark:text-chalk overflow-x-auto">
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

            {/* Diagram Upload */}
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

            {/* MCQ Options */}
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
                تفسير وشرح الإجابة النموذجية (يظهر للطالب بعد الحل):
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="اكتب التبرير الهندسي أو الخطوات الجبرية للحل النموذجي..."
                rows={2}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
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
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingQuestionId ? 'تحديث السؤال' : 'حفظ السؤال في البنك'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في نصوص وصيغ الأسئلة..."
            className="w-full h-10 pr-10 pl-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Difficulty Filter */}
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value as 'ALL' | 'EASY' | 'MEDIUM' | 'HARD')}
            className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
          >
            <option value="ALL">جميع المستويات</option>
            <option value="EASY">سهل</option>
            <option value="MEDIUM">متوسط</option>
            <option value="HARD">متقدم</option>
          </select>

          {/* Question Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'ALL' | 'MCQ' | 'TRUE_FALSE')}
            className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
          >
            <option value="ALL">جميع أنواع الأسئلة</option>
            <option value="MCQ">اختيار من متعدد</option>
            <option value="TRUE_FALSE">صواب وخطأ</option>
          </select>

          {/* Branch Filter */}
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
          >
            <option value="ALL">جميع الفروع</option>
            <option value="فرع الجبر والإحصاء">فرع الجبر والإحصاء</option>
            <option value="فرع الهندسة والقياس">فرع الهندسة والقياس</option>
            <option value="فرع حساب المثلثات">فرع حساب المثلثات</option>
          </select>
        </div>
      </div>

      {/* Questions Listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-chalk-muted">
          <span>النتائج المعروضة: {filteredQuestions.length} سؤال</span>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="chalk-card rounded-3xl p-12 text-center space-y-3 bg-white/80 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800">
            <FileQuestion className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-black text-slate-900 dark:text-chalk">لا توجد أسئلة مطابقة للبحث</h3>
            <p className="text-xs text-slate-500 dark:text-chalk-muted">
              جرّب تغيير كلمات البحث أو الفلاتر المختارة، أو أضف سؤالاً جديداً.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="chalk-card rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-cyan-electric/15 hover:border-cyan-electric/40 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-xl bg-cyan-electric/15 text-cyan-electric font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-electric/10 text-cyan-electric border border-cyan-electric/20">
                          {q.branchName || 'فرع الجبر'}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            q.difficulty === 'EASY'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : q.difficulty === 'MEDIUM'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}
                        >
                          {q.difficulty === 'EASY' ? 'سهل' : q.difficulty === 'MEDIUM' ? 'متوسط' : 'متقدم'}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-chalk-muted">
                          {q.questionType === 'MCQ' ? 'اختيار من متعدد' : 'صواب وخطأ'}
                        </span>
                      </div>
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
                      title="معاينة السؤال"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="p-2 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="تعديل السؤال"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="حذف السؤال"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

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

                {/* Attached Image if present */}
                {q.imageUrl && (
                  <div className="max-w-xs rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-2">
                    <img
                      src={q.imageUrl}
                      alt="Diagram"
                      className="w-full h-auto max-h-40 object-contain rounded-lg"
                    />
                  </div>
                )}

                {/* Options preview */}
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
                            الإجابة الصحيحة ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <p className="text-[11px] text-slate-500 dark:text-chalk-muted italic bg-slate-50/50 dark:bg-slate-950/30 p-2.5 rounded-xl">
                    💡 <span className="font-bold">التفسير والحل النموذجي:</span> {q.explanation}
                  </p>
                )}
              </div>
            ))}
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
                <span>معاينة السؤال كما يظهر للطالب</span>
              </div>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-chalk"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-base font-black text-slate-900 dark:text-chalk">
                {previewQuestion.questionText}
              </p>

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
            </div>

            <button
              onClick={() => setPreviewQuestion(null)}
              className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-chalk"
            >
              إغلاق المعاينة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
