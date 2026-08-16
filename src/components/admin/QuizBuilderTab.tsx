'use client';

import React, { useState, useMemo } from 'react';
import katex from 'katex';
import { QuizDetailsDTO, QuestionItemDTO, CurriculumGradeDTO } from '@/lib/types/dashboard';
import {
  createQuizAction,
  updateQuizAction,
  deleteQuizAction,
} from '@/lib/actions/quizzes';
import {
  HelpCircle,
  Plus,
  Clock,
  Award,
  CheckCircle2,
  FileText,
  Trash2,
  Edit,
  Sparkles,
  Loader2,
  BookOpen,
  Search,
  Filter,
  X,
  Layers,
  Check,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface QuizBuilderTabProps {
  initialQuizzes: QuizDetailsDTO[];
  questions: QuestionItemDTO[];
  curriculum: CurriculumGradeDTO[];
  onRefresh?: () => void;
}

export function QuizBuilderTab({
  initialQuizzes,
  questions,
  curriculum,
  onRefresh,
}: QuizBuilderTabProps) {
  const [quizzes, setQuizzes] = useState<QuizDetailsDTO[]>(initialQuizzes);

  // Form State (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [passScore, setPassScore] = useState(50);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(true);

  // Search & Filter in Question Picker
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');

  // Search in Quizzes list
  const [quizSearch, setQuizSearch] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Extract all lessons from curriculum hierarchy
  const allLessons = useMemo(() => {
    const list: Array<{ id: string; title: string; unitTitle: string; branchName: string; gradeName: string }> = [];
    curriculum.forEach((g) => {
      g.terms.forEach((t) => {
        t.branches.forEach((b) => {
          b.units.forEach((u) => {
            u.lessons.forEach((l) => {
              list.push({
                id: l.id,
                title: l.title,
                unitTitle: u.title,
                branchName: b.name,
                gradeName: g.name,
              });
            });
          });
        });
      });
    });
    return list;
  }, [curriculum]);

  const renderMath = (latex: string) => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: false });
    } catch {
      return latex;
    }
  };

  const resetForm = () => {
    setEditingQuizId(null);
    setTitle('');
    setDescription('');
    setSelectedLessonId(allLessons[0]?.id || '');
    setDurationMinutes(25);
    setPassScore(50);
    setMaxAttempts(3);
    setSelectedQuestionIds([]);
    setIsPublished(true);
    setErrorMsg('');
    setQuestionSearch('');
    setQuestionDifficultyFilter('ALL');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (q: QuizDetailsDTO) => {
    setEditingQuizId(q.id);
    setTitle(q.title);
    setDescription(q.description || '');
    setSelectedLessonId(q.lessonId);
    setDurationMinutes(q.durationMinutes);
    setPassScore(q.passScore);
    setMaxAttempts(q.maxAttempts);
    setIsPublished(q.isPublished);
    // If questions array is attached, map IDs
    setSelectedQuestionIds(q.questions ? q.questions.map((item) => item.id) : []);
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  };

  const handleSelectAllQuestions = () => {
    if (selectedQuestionIds.length === filteredQuestionsForPicker.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(filteredQuestionsForPicker.map((q) => q.id));
    }
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('يرجى كتابة عنوان الاختبار');
      return;
    }
    if (!selectedLessonId) {
      setErrorMsg('يرجى اختيار الدرس المرتبط بالاختبار');
      return;
    }
    if (selectedQuestionIds.length === 0) {
      setErrorMsg('يرجى اختيار سؤال واحد على الأقل من بنك الأسئلة');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      if (editingQuizId) {
        // Update quiz
        const res = await updateQuizAction(editingQuizId, {
          lessonId: selectedLessonId,
          title: title.trim(),
          description: description.trim() || undefined,
          durationMinutes,
          passScore,
          maxAttempts,
          isPublished,
          questionIds: selectedQuestionIds,
        });

        if (res.success && res.data) {
          setQuizzes((prev) =>
            prev.map((item) => (item.id === editingQuizId ? (res.data as QuizDetailsDTO) : item))
          );
          setSuccessMsg('تم تحديث بيانات الاختبار والأسئلة المرتبطة بنجاح ✨');
          setIsFormOpen(false);
          resetForm();
          if (onRefresh) onRefresh();
        } else {
          setErrorMsg(res.error || 'فشل تحديث الاختبار');
        }
      } else {
        // Create quiz
        const res = await createQuizAction({
          lessonId: selectedLessonId,
          title: title.trim(),
          description: description.trim() || undefined,
          durationMinutes,
          passScore,
          maxAttempts,
          isPublished,
          questionIds: selectedQuestionIds,
        });

        if (res.success && res.data) {
          setQuizzes((prev) => [res.data as QuizDetailsDTO, ...prev]);
          setSuccessMsg('تم إنشاء ونشر الاختبار وربطه بالدرس بنجاح! 🏆');
          setIsFormOpen(false);
          resetForm();
          if (onRefresh) onRefresh();
        } else {
          setErrorMsg(res.error || 'فشل إنشاء الاختبار');
        }
      }
    } catch {
      setErrorMsg('حدث خطأ أثناء حفظ الاختبار');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاختبار نهائياً؟')) return;

    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    try {
      await deleteQuizAction(quizId);
      if (onRefresh) onRefresh();
    } catch {
      // ignore
    }
  };

  // Filtered questions for the picker inside form
  const filteredQuestionsForPicker = useMemo(() => {
    return questions.filter((q) => {
      if (questionDifficultyFilter !== 'ALL' && q.difficulty !== questionDifficultyFilter) return false;
      if (questionSearch.trim()) {
        const s = questionSearch.trim().toLowerCase();
        const matchesText = q.questionText.toLowerCase().includes(s);
        const matchesLatex = q.questionLatex ? q.questionLatex.toLowerCase().includes(s) : false;
        return matchesText || matchesLatex;
      }
      return true;
    });
  }, [questions, questionDifficultyFilter, questionSearch]);

  // Filtered quizzes list
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      if (quizSearch.trim()) {
        const s = quizSearch.trim().toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(s);
        const matchesLesson = q.lessonTitle ? q.lessonTitle.toLowerCase().includes(s) : false;
        const matchesBranch = q.branchName ? q.branchName.toLowerCase().includes(s) : false;
        const matchesGrade = q.gradeName ? q.gradeName.toLowerCase().includes(s) : false;
        return matchesTitle || matchesLesson || matchesBranch || matchesGrade;
      }
      return true;
    });
  }, [quizzes, quizSearch]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">
            منشئ ومصمم الاختبارات (Quiz Builder)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-chalk-muted mt-0.5">
            إنشاء الاختبارات الإلكترونية وربطها بالدروس والوحدات وتحديد مدة الامتحان والحد الأقصى للمحاولات
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-2xl bg-cyan-electric hover:bg-cyan-electric-hover text-slate-950 font-black text-xs sm:text-sm shadow-cyan-glow transition-all flex items-center justify-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء اختبار جديد</span>
        </button>
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

      {/* Quiz Form (Modal / Card) */}
      {isFormOpen && (
        <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-cyan-electric/30 space-y-6 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
                {editingQuizId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-chalk">
                  {editingQuizId ? 'تعديل بيانات الاختبار' : 'نموذج إنشاء اختبار جديد'}
                </h3>
                <span className="text-xs text-slate-500 dark:text-chalk-muted">
                  حدد مدة الاختبار، درجة النجاح، واختر الأسئلة المخصصة من البنك
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

          <form onSubmit={handleSaveQuiz} className="space-y-5 text-xs font-bold">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Title */}
              <div className="sm:col-span-6 space-y-1.5">
                <label className="text-slate-800 dark:text-chalk block">عنوان الاختبار:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: اختبار الوحدة الأولى: الأعداد النسبية والعمليات عليها"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                />
              </div>

              {/* Linked Lesson */}
              <div className="sm:col-span-6 space-y-1.5">
                <label className="text-slate-800 dark:text-chalk block">الدرس المرتبط به:</label>
                <select
                  required
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                >
                  <option value="">-- اختر الدرس المرتبط --</option>
                  {allLessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.gradeName} • {l.branchName} • {l.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration, Pass Score, Max Attempts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-800 dark:text-chalk block">مدة الاختبار (بالدقائق):</label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value) || 25)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-800 dark:text-chalk block">نسبة درجة النجاح (%):</label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={passScore}
                  onChange={(e) => setPassScore(Number(e.target.value) || 50)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-800 dark:text-chalk block">الحد الأقصى للمحاولات:</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(Number(e.target.value) || 3)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-slate-800 dark:text-chalk block">وصف أو تعليمات الاختبار:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب إرشادات الاختبار للطالب قبل البدء..."
                rows={2}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
              />
            </div>

            {/* Question Selector from Bank */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-electric" />
                  <span className="text-slate-800 dark:text-chalk font-black">
                    اختر الأسئلة المخصصة لهذا الاختبار من بنك الأسئلة:
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllQuestions}
                    className="text-[11px] font-bold text-cyan-electric hover:underline"
                  >
                    {selectedQuestionIds.length === filteredQuestionsForPicker.length ? 'إلغاء التحديد' : 'تحديد الكل'}
                  </button>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-cyan-electric text-black shadow-cyan-glow">
                    المحدد: {selectedQuestionIds.length} أسئلة
                  </span>
                </div>
              </div>

              {/* Mini search & filter inside selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  placeholder="تصفية الأسئلة بالكلمات..."
                  className="h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                />
                <select
                  value={questionDifficultyFilter}
                  onChange={(e) => setQuestionDifficultyFilter(e.target.value as 'ALL' | 'EASY' | 'MEDIUM' | 'HARD')}
                  className="h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                >
                  <option value="ALL">جميع المستويات</option>
                  <option value="EASY">سهل</option>
                  <option value="MEDIUM">متوسط</option>
                  <option value="HARD">متقدم</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {filteredQuestionsForPicker.map((q) => {
                  const isSelected = selectedQuestionIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestionSelection(q.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer select-none transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-cyan-electric/15 border-cyan-electric text-slate-900 dark:text-chalk shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-chalk/80 hover:border-cyan-electric/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-cyan-electric rounded mt-0.5"
                      />
                      <div className="flex-1 space-y-1">
                        <p className="font-bold line-clamp-2 leading-relaxed">{q.questionText}</p>
                        {q.questionLatex && (
                          <div
                            className="text-[11px] text-cyan-electric overflow-hidden text-ellipsis"
                            dangerouslySetInnerHTML={{
                              __html: renderMath(q.questionLatex),
                            }}
                          />
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{q.branchName || 'عام'}</span>
                          <span>•</span>
                          <span>{q.difficulty === 'EASY' ? 'سهل' : q.difficulty === 'MEDIUM' ? 'متوسط' : 'متقدم'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                    <span>{editingQuizId ? 'تحديث الاختبار' : 'حفظ ونشر الاختبار'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quizzes Search */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={quizSearch}
            onChange={(e) => setQuizSearch(e.target.value)}
            placeholder="بحث في أسماء الاختبارات أو الدروس..."
            className="w-full h-10 pr-10 pl-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
          />
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-chalk-muted">
          إجمالي الاختبارات: {filteredQuizzes.length}
        </span>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 flex flex-col justify-between space-y-4 hover:border-cyan-electric/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-electric">
                  {quiz.gradeName} • {quiz.branchName}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-chalk-muted">
                  {quiz.lessonTitle || 'درس عام'}
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 dark:text-chalk leading-snug">
                {quiz.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-chalk-muted leading-relaxed line-clamp-2">
                {quiz.description || 'اختبار تقييمي دوري لقياس مستوى استيعاب المفاهيم والنظريات الرياضية.'}
              </p>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-chalk-muted text-center">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60">
                  <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-amber-500" />
                  <span>{quiz.durationMinutes} دقيقة</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60">
                  <Award className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-500" />
                  <span>النجاح: {quiz.passScore}%</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60">
                  <HelpCircle className="w-3.5 h-3.5 mx-auto mb-1 text-cyan-electric" />
                  <span>{quiz.questionsCount || 4} أسئلة</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleOpenEdit(quiz)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-chalk font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5 text-amber-500" />
                <span>تعديل</span>
              </button>
              <button
                onClick={() => handleDeleteQuiz(quiz.id)}
                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold transition-colors"
                title="حذف الاختبار"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
