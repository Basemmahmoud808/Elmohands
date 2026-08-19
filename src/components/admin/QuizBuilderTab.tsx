'use client';

import React, { useState, useMemo } from 'react';
import katex from 'katex';
import { QuizDetailsDTO, QuestionItemDTO, CurriculumGradeDTO } from '@/lib/types/dashboard';
import {
  createQuizAction,
  updateQuizAction,
  deleteQuizAction,
} from '@/lib/actions/quizzes';
import { uploadRealFileWithProgress } from '@/lib/supabase/storage';
import { UploadProgressBar } from './UploadProgressBar';
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
  UploadCloud,
  Link2,
  Image as ImageIcon,
  FileCheck2,
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

  // Exam Mode: 'file' (Paper / PDF / Image) | 'mcq' (Interactive Question Bank)
  const [examMode, setExamMode] = useState<'file' | 'mcq'>('file');

  // File Exam fields
  const [fileInputType, setFileInputType] = useState<'upload' | 'url'>('upload');
  const [selectedExamFile, setSelectedExamFile] = useState<File | null>(null);
  const [examFileUrl, setExamFileUrl] = useState('');
  const [customQuestionsCount, setCustomQuestionsCount] = useState(10);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState('');

  // General Quiz fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
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
    setExamMode('file');
    setFileInputType('upload');
    setSelectedExamFile(null);
    setExamFileUrl('');
    setCustomQuestionsCount(10);
    setUploadProgress(0);
    setUploadLabel('');
    setTitle('');
    setDescription('');
    setSelectedLessonId(allLessons[0]?.id || '');
    setDurationMinutes(30);
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

  const handleOpenEdit = (quiz: QuizDetailsDTO) => {
    setEditingQuizId(quiz.id);
    setTitle(quiz.title);
    setDescription(quiz.description || '');
    setSelectedLessonId(quiz.lessonId);
    setDurationMinutes(quiz.durationMinutes);
    setPassScore(quiz.passScore);
    setMaxAttempts(quiz.maxAttempts);
    setIsPublished(quiz.isPublished);

    if (quiz.pdfPath || quiz.type === 'file') {
      setExamMode('file');
      setExamFileUrl(quiz.pdfPath || '');
      setCustomQuestionsCount(quiz.questionsCount || 10);
    } else {
      setExamMode('mcq');
      setSelectedQuestionIds(quiz.questions ? quiz.questions.map((q) => q.id) : []);
    }

    setIsFormOpen(true);
  };

  const toggleQuestionSelection = (qId: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleSelectAllQuestions = () => {
    const allFilteredIds = filteredQuestionsForPicker.map((q) => q.id);
    if (selectedQuestionIds.length === allFilteredIds.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(allFilteredIds);
    }
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('يرجى كتابة عنوان الشيت / الاختبار');
      return;
    }
    if (!selectedLessonId) {
      setErrorMsg('يرجى اختيار الدرس المرتبط بالشيت');
      return;
    }

    if (examMode === 'mcq' && selectedQuestionIds.length === 0) {
      setErrorMsg('يرجى اختيار سؤال واحد على الأقل من بنك الأسئلة في النمط الإلكتروني');
      return;
    }

    if (examMode === 'file' && fileInputType === 'upload' && !selectedExamFile && !examFileUrl) {
      setErrorMsg('يرجى اختيار ملف الشيت (PDF أو صورة) من جهازك');
      return;
    }

    if (examMode === 'file' && fileInputType === 'url' && !examFileUrl.trim()) {
      setErrorMsg('يرجى إدخال رابط ملف الشيت أو مستند Google Drive');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      let finalPdfPath = examFileUrl;

      // Handle local file upload if in file mode
      if (examMode === 'file' && fileInputType === 'upload' && selectedExamFile) {
        setUploadLabel('جاري رفع ورقة الشيت / الامتحان من جهازك...');
        setUploadProgress(20);
        finalPdfPath = await uploadRealFileWithProgress(
          selectedExamFile,
          'course-materials',
          'exams',
          (pct) => setUploadProgress(Math.round(20 + pct * 0.75))
        );
        setUploadProgress(100);
      }

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
          questionIds: examMode === 'mcq' ? selectedQuestionIds : [],
          pdfPath: examMode === 'file' ? finalPdfPath : undefined,
          type: examMode,
        });

        if (res.success && res.data) {
          const updated = {
            ...(res.data as QuizDetailsDTO),
            pdfPath: examMode === 'file' ? finalPdfPath : null,
            type: examMode,
            questionsCount: examMode === 'file' ? customQuestionsCount : selectedQuestionIds.length,
          };
          setQuizzes((prev) =>
            prev.map((item) => (item.id === editingQuizId ? updated : item))
          );
          setSuccessMsg('تم تحديث بيانات الشيت والملفات المرتبطة بنجاح ');
          setIsFormOpen(false);
          resetForm();
          if (onRefresh) onRefresh();
        } else {
          setErrorMsg(res.error || 'فشل تحديث الشيت');
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
          questionIds: examMode === 'mcq' ? selectedQuestionIds : [],
          pdfPath: examMode === 'file' ? finalPdfPath : undefined,
          type: examMode,
        });

        if (res.success && res.data) {
          const newQ = {
            ...(res.data as QuizDetailsDTO),
            pdfPath: examMode === 'file' ? finalPdfPath : null,
            type: examMode,
            questionsCount: examMode === 'file' ? customQuestionsCount : selectedQuestionIds.length,
          };
          setQuizzes((prev) => [newQ, ...prev]);
          setSuccessMsg('تم رفع وحفظ الشيت/الامتحان وربطه بالدرس بنجاح! ');
          setIsFormOpen(false);
          resetForm();
          if (onRefresh) onRefresh();
        } else {
          setErrorMsg(res.error || 'فشل إنشاء الشيت');
        }
      }
    } catch {
      setErrorMsg('حدث خطأ أثناء حفظ ورفع الشيت');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاختبار/الشيت نهائياً؟')) return;

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
    if (!quizSearch.trim()) return quizzes;
    const s = quizSearch.trim().toLowerCase();
    return quizzes.filter((q) => {
      return (
        q.title.toLowerCase().includes(s) ||
        (q.lessonTitle && q.lessonTitle.toLowerCase().includes(s)) ||
        (q.branchName && q.branchName.toLowerCase().includes(s))
      );
    });
  }, [quizzes, quizSearch]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-500/10 via-cyan-electric/15 to-transparent border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/30">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>إدارة الشيتات والامتحانات الورقية والإلكترونية</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">
            منشئ الشيتات والاختبارات التقييمية
          </h2>
          <p className="text-xs text-slate-600 dark:text-chalk-muted font-bold max-w-2xl leading-relaxed">
            ارفع شيتات الدروس والامتحانات كملف PDF أو صورة ورقية مباشرة من جهازك، أو ابنِ اختبارات إلكترونية تفاعلية من بنك الأسئلة.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 rounded-2xl bg-cyan-electric hover:bg-cyan-electric-hover text-slate-950 font-black text-xs shadow-cyan-glow transition-all flex items-center justify-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة شيت أو امتحان جديد</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
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
                  {editingQuizId ? 'تعديل بيانات الشيت / الاختبار' : 'إضافة شيت امتحان أو اختبار جديد'}
                </h3>
                <span className="text-xs text-slate-500 dark:text-chalk-muted">
                  اختر طريقة إضافة الامتحان: رفع ملف ورقي/PDF من جهازك أو اختيار أسئلة MCQ
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

          {/* Exam Mode Toggle (Paper / PDF vs Interactive MCQ) */}
          <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setExamMode('file')}
              className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                examMode === 'file'
                  ? 'bg-cyan-electric text-black shadow-cyan-glow'
                  : 'text-slate-600 dark:text-chalk/80 hover:text-slate-900 dark:hover:text-chalk'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span> رفع شيت / امتحان من الجهاز (PDF أو صورة بدون إدخال MCQ)</span>
            </button>

            <button
              type="button"
              onClick={() => setExamMode('mcq')}
              className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                examMode === 'mcq'
                  ? 'bg-cyan-electric text-black shadow-cyan-glow'
                  : 'text-slate-600 dark:text-chalk/80 hover:text-slate-900 dark:hover:text-chalk'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span> بناء امتحان إلكتروني تفاعلي (اختيار من بنك الأسئلة)</span>
            </button>
          </div>

          <form onSubmit={handleSaveQuiz} className="space-y-5 text-xs font-bold">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Title */}
              <div className="sm:col-span-6 space-y-1.5">
                <label className="text-slate-800 dark:text-chalk block">عنوان الشيت أو الاختبار:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: شيت واجب الحصة الأولى: الأعداد النسبية والعمليات عليها"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                />
              </div>

              {/* Linked Lesson */}
              <div className="sm:col-span-6 space-y-1.5">
                <label className="text-slate-800 dark:text-chalk block">الدرس والمرحلة المرتبطة به:</label>
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
                <label className="text-slate-800 dark:text-chalk block">مدة الشيت / الحل (بالدقائق):</label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value) || 30)}
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
                <label className="text-slate-800 dark:text-chalk block">
                  {examMode === 'file' ? 'عدد أسئلة الشيت التقديري:' : 'الحد الأقصى للمحاولات:'}
                </label>
                {examMode === 'file' ? (
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={customQuestionsCount}
                    onChange={(e) => setCustomQuestionsCount(Number(e.target.value) || 10)}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                  />
                ) : (
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(Number(e.target.value) || 3)}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-slate-800 dark:text-chalk block">ملاحظات أو إرشادات للأستاذ والطالب:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب تعليمات الشيت للطلاب (مثلاً: قم بحل التمارين وتجهيز الكشكول للمراجعة)..."
                rows={2}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
              />
            </div>

            {/* MODE 1: FILE / PDF / IMAGE ATTACHMENT */}
            {examMode === 'file' && (
              <div className="space-y-3 p-5 rounded-2xl bg-cyan-electric/5 border border-cyan-electric/20">
                <div className="flex items-center justify-between border-b border-cyan-electric/15 pb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-cyan-electric" />
                    <span className="text-slate-900 dark:text-chalk font-black">
                      ملف ورقة الامتحان أو الشيت (PDF أو صورة عالية الجودة):
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-900 p-1 rounded-xl text-[11px]">
                    <button
                      type="button"
                      onClick={() => setFileInputType('upload')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        fileInputType === 'upload' ? 'bg-cyan-electric text-black font-black' : 'text-slate-500'
                      }`}
                    >
                      رفع ملف من جهازك 
                    </button>
                    <button
                      type="button"
                      onClick={() => setFileInputType('url')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        fileInputType === 'url' ? 'bg-cyan-electric text-black font-black' : 'text-slate-500'
                      }`}
                    >
                      رابط خارجي / Google Drive 
                    </button>
                  </div>
                </div>

                {fileInputType === 'upload' ? (
                  <label className="block p-6 rounded-2xl border-2 border-dashed border-cyan-electric/40 hover:border-cyan-electric bg-white dark:bg-slate-900/90 text-center cursor-pointer transition-all group">
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/jpg"
                      onChange={(e) => setSelectedExamFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <UploadCloud className="w-10 h-10 text-cyan-electric mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-black text-slate-900 dark:text-chalk block">
                      {selectedExamFile ? selectedExamFile.name : 'اضغط لاختيار ملف الشيت (PDF أو صورة) من جهازك'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                      يدعم ملفات PDF، وصور الشيتات JPG, PNG بحجم حتى 25 ميجابايت
                    </span>
                  </label>
                ) : (
                  <div className="relative">
                    <input
                      type="url"
                      dir="ltr"
                      value={examFileUrl}
                      onChange={(e) => setExamFileUrl(e.target.value)}
                      placeholder="https://drive.google.com/... أو رابط مباشر لملف PDF"
                      className="w-full h-11 px-4 pl-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk font-mono text-xs focus:outline-none focus:border-cyan-electric"
                    />
                    <Link2 className="w-4 h-4 text-cyan-electric absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: INTERACTIVE MCQ QUESTION BANK PICKER */}
            {examMode === 'mcq' && (
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
            )}

            {/* Upload Progress Bar */}
            {loading && uploadProgress > 0 && (
              <UploadProgressBar progress={uploadProgress} label={uploadLabel} />
            )}

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
                    <span>جاري الرفع والحفظ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingQuizId ? 'تحديث الشيت' : 'حفظ ونشر الشيت فوراً'}</span>
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
          إجمالي الشيتات والاختبارات: {filteredQuizzes.length}
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
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-electric/15 text-cyan-electric border border-cyan-electric/30">
                  {quiz.pdfPath || quiz.type === 'file' ? ' شيت PDF مرفوع' : ' امتحان إلكتروني'}
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 dark:text-chalk leading-snug">
                {quiz.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-chalk-muted leading-relaxed line-clamp-2">
                {quiz.description || (quiz.pdfPath ? 'ورقة شيت وامتحان مرفوعة بصيغة PDF للحل والمتابعة.' : 'اختبار تقييمي دوري لقياس مستوى استيعاب المفاهيم.')}
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
                  {quiz.pdfPath ? (
                    <FileText className="w-3.5 h-3.5 mx-auto mb-1 text-purple-400" />
                  ) : (
                    <HelpCircle className="w-3.5 h-3.5 mx-auto mb-1 text-cyan-electric" />
                  )}
                  <span>{quiz.questionsCount || 10} سؤال</span>
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
