'use client';

import React, { useState, useEffect } from 'react';
import {
  FileQuestion,
  FileText,
  HelpCircle,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  Loader2,
  Eye,
  GraduationCap,
} from 'lucide-react';
import { QuestionItemDTO } from '@/lib/types/dashboard';
import { getStudentQuestionsListAction } from '@/lib/actions/questions';

interface StudentQuestionBankTabProps {
  studentGradeName?: string;
  onOpenPdf: (title: string, url: string) => void;
}

export function StudentQuestionBankTab({
  studentGradeName = 'الصف الأول الإعدادي',
  onOpenPdf,
}: StudentQuestionBankTabProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'FILE' | 'QUESTION'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [questions, setQuestions] = useState<QuestionItemDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive state for MCQ questions: map questionId -> selectedOption
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  // Persistent completed questions/sheets map: id -> true
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('almohands_completed_qb');
        if (saved) {
          setCompletedItems(JSON.parse(saved));
        }
      } catch {}
    }
  }, []);

  const markItemCompleted = (id: string) => {
    setCompletedItems((prev) => {
      const updated = { ...prev, [id]: true };
      if (typeof window !== 'undefined') {
        localStorage.setItem('almohands_completed_qb', JSON.stringify(updated));
      }
      return updated;
    });
  };

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      try {
        const res = await getStudentQuestionsListAction({
          gradeName: studentGradeName,
          branchName: selectedBranch === 'ALL' ? undefined : selectedBranch,
          entryType: selectedType === 'ALL' ? undefined : selectedType,
        });

        if (res.success && res.data) {
          setQuestions(res.data);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.error('Error fetching questions for student:', err);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [studentGradeName, selectedBranch, selectedType]);

  const filteredQuestions = questions.filter((q) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.questionText?.toLowerCase().includes(query) ||
      q.fileName?.toLowerCase().includes(query) ||
      q.branchName?.toLowerCase().includes(query) ||
      q.explanation?.toLowerCase().includes(query)
    );
  });

  const handleSelectOption = (questionId: string, optionLabel: string) => {
    if (revealedAnswers[questionId]) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionLabel }));
  };

  const handleCheckAnswer = (questionId: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [questionId]: true }));
    const q = questions.find((item) => item.id === questionId);
    if (q && userAnswers[questionId] === q.correctAnswer) {
      markItemCompleted(questionId);
    }
  };

  const completedCount = Object.keys(completedItems).filter((id) =>
    questions.some((q) => q.id === id)
  ).length;

  return (
    <div className="space-y-6 font-arabic" dir="rtl">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-chalk space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-electric/10 border border-cyan-electric/30 text-cyan-electric text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>بنك التمارين والأسئلة لصفك الدراسي</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              بنك الأسئلة والتمارين ({studentGradeName})
            </h2>
            <p className="text-xs sm:text-sm text-chalk-muted font-medium max-w-2xl">
              تمارين وشيتات م/ رضا خيرت المخصصة لـ <strong className="text-cyan-electric">{studentGradeName}</strong> لمساعدتك على التطبيق العملي وتثبيت المفاهيم الرياضية.
            </p>
          </div>

          {/* Stats & Grade Badge */}
          <div className="flex flex-col sm:items-end gap-2 shrink-0 self-start sm:self-auto">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-electric/30 text-right space-y-0.5">
              <div className="flex items-center gap-2 text-xs font-black text-cyan-electric">
                <GraduationCap className="w-4 h-4" />
                <span>الصف الدراسي:</span>
              </div>
              <p className="text-xs font-bold text-chalk">
                {studentGradeName}
              </p>
            </div>

            {completedCount > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>أنجزت {completedCount} من أصل {questions.length} تمرين وشيت 🎯</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث في الأسئلة والشيتات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-chalk outline-none focus:border-cyan-electric transition-colors"
          />
        </div>

        {/* Branch and Type Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          {/* Branch Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setSelectedBranch('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedBranch === 'ALL'
                  ? 'bg-cyan-electric text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-chalk'
              }`}
            >
              جميع الفروع
            </button>
            <button
              onClick={() => setSelectedBranch('الجبر')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedBranch === 'الجبر'
                  ? 'bg-cyan-electric text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-chalk'
              }`}
            >
              الجبر والإحصاء
            </button>
            <button
              onClick={() => setSelectedBranch('الهندسة')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedBranch === 'الهندسة'
                  ? 'bg-cyan-electric text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-chalk'
              }`}
            >
              الهندسة والقياس
            </button>
          </div>

          {/* Type Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedType === 'ALL'
                  ? 'bg-cyan-electric text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-chalk'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedType('FILE')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                selectedType === 'FILE'
                  ? 'bg-cyan-electric text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-chalk'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>شيتات PDF</span>
            </button>
            <button
              onClick={() => setSelectedType('QUESTION')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                selectedType === 'QUESTION'
                  ? 'bg-cyan-electric text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-chalk'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>أسئلة تفاعلية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="p-12 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="w-8 h-8 text-cyan-electric animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            جاري تحميل بنك الأسئلة الخاص بـ ({studentGradeName})...
          </p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-cyan-electric/10 border border-cyan-electric/20 text-cyan-electric flex items-center justify-center mx-auto">
            <FileQuestion className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-chalk">
            لا توجد شيتات أو أسئلة مرفوعة حالياً لـ ({studentGradeName})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            سيقوم م/ رضا خيرت برفع شيتات وتمارين جديدة لهذا الصف الدراسي قريباً وستظهر لك هنا تلقائياً!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((item) => {
            const isFile = item.entryType === 'FILE' || item.questionType === 'FILE' || Boolean(item.fileUrl);

            return (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-cyan-electric/40 transition-all flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  {/* Badges row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-cyan-electric/15 text-cyan-electric border border-cyan-electric/30">
                        {item.branchName || 'مادة الرياضيات'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item.gradeName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {completedItems[item.id] && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>{isFile ? 'تمت دراسته' : 'تم الحل بنجاح'}</span>
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.difficulty === 'HARD'
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : item.difficulty === 'EASY'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}
                      >
                        {item.difficulty === 'HARD' ? 'مستوى متقدم' : item.difficulty === 'EASY' ? 'مستوى سهل' : 'مستوى متوسط'}
                      </span>
                    </div>
                  </div>

                  {/* Title / Description */}
                  {isFile ? (
                    <div className="space-y-2">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="overflow-hidden space-y-0.5">
                          <h4 className="text-sm font-black text-slate-900 dark:text-chalk truncate" title={item.fileName || item.questionText}>
                            {item.fileName || item.questionText || 'شيت تدريب بصيغة PDF'}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            ملف شيت وتمارين م/ رضا خيرت
                          </p>
                        </div>
                      </div>

                      {item.explanation && item.explanation !== item.fileName && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                          <strong className="text-cyan-electric block mb-0.5">ملاحظات المستر:</strong>
                          {item.explanation}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="text-sm font-black text-slate-900 dark:text-chalk leading-relaxed">
                        {item.questionText}
                      </h4>

                      {item.questionLatex && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center font-mono text-cyan-electric text-xs">
                          {item.questionLatex}
                        </div>
                      )}

                      {/* Options */}
                      {item.options && item.options.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {item.options.map((opt) => {
                            const isSelected = userAnswers[item.id] === opt.label;
                            const isRevealed = revealedAnswers[item.id];
                            const isCorrect = opt.label === item.correctAnswer;

                            let optClass = 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-chalk hover:border-slate-300 dark:hover:border-slate-700';

                            if (isRevealed) {
                              if (isCorrect) {
                                optClass = 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black';
                              } else if (isSelected && !isCorrect) {
                                optClass = 'bg-red-500/15 border-red-500 text-red-600 dark:text-red-400 font-bold';
                              }
                            } else if (isSelected) {
                              optClass = 'bg-cyan-500/15 border-cyan-electric text-cyan-electric font-black ring-1 ring-cyan-electric';
                            }

                            return (
                              <button
                                key={opt.label}
                                type="button"
                                disabled={isRevealed}
                                onClick={() => handleSelectOption(item.id, opt.label)}
                                className={`w-full p-2.5 rounded-xl border text-xs text-right transition-all flex items-center justify-between ${optClass}`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-mono text-[11px] font-black shrink-0">
                                    {opt.label}
                                  </span>
                                  <span>{opt.text}</span>
                                </div>

                                {isRevealed && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                                {isRevealed && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Explanation Reveal */}
                      {revealedAnswers[item.id] && item.explanation && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-cyan-electric/30 text-xs text-slate-700 dark:text-slate-300 space-y-1 animate-in fade-in">
                          <span className="font-bold text-cyan-electric block">شرح وتوضيح المستر:</span>
                          <p>{item.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  {isFile && item.fileUrl ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          markItemCompleted(item.id);
                          onOpenPdf(item.fileName || 'ملف التمرين', item.fileUrl!);
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black text-slate-950 bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>فتح ومعاينة الشيت</span>
                      </button>

                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-chalk transition-colors"
                        title="تحميل الملف مباشرة"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ) : !isFile && item.options && item.options.length > 0 ? (
                    <div>
                      {!revealedAnswers[item.id] ? (
                        <button
                          disabled={!userAnswers[item.id]}
                          onClick={() => handleCheckAnswer(item.id)}
                          className="w-full py-2.5 rounded-xl text-xs font-black text-slate-950 bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تحقق من الإجابة</span>
                        </button>
                      ) : (
                        <div className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 py-1">
                          {userAnswers[item.id] === item.correctAnswer ? (
                            <span className="text-emerald-500 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>إجابة صحيحة! أحسنت يا بطل</span>
                            </span>
                          ) : (
                            <span className="text-amber-500 flex items-center justify-center gap-1">
                              <span>راجع الشرح أعلاه لتعرف الحل الصحيح</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
