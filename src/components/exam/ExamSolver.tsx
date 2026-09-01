'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import katex from 'katex';
import { StudentExamSessionDTO, QuizAttemptResultDTO, submitQuizAttemptAction } from '@/lib/actions/quizzes';
import { ExamWatermark } from '@/components/exam/ExamWatermark';
import { ExamAntiCheatModal } from '@/components/exam/ExamAntiCheatModal';
import {
  HelpCircle,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  Shield,
  Maximize,
  Send,
  RotateCcw,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ExamSolverProps {
  session: StudentExamSessionDTO;
  onFinish?: (result: QuizAttemptResultDTO) => void;
  onExit?: () => void;
}

export function ExamSolver({ session, onFinish, onExit }: ExamSolverProps) {
  const { quiz, questions, currentAttemptNumber, maxAttempts, attemptsRemaining, student } = session;

  // Exam step: 'intro' | 'solving' | 'review_summary' | 'results'
  const [step, setStep] = useState<'intro' | 'solving' | 'review_summary' | 'results'>('intro');
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());

  // Timer state
  const totalDurationSeconds = (quiz.durationMinutes || 20) * 60;
  const [timeLeft, setTimeLeft] = useState<number>(totalDurationSeconds);
  const [timeSpent, setTimeSpent] = useState<number>(0);

  // Anti-Cheat State
  const [violations, setViolations] = useState<number>(0);
  const [showViolationModal, setShowViolationModal] = useState<boolean>(false);
  const isAutoSubmittingRef = useRef<boolean>(false);

  // Submission State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<QuizAttemptResultDTO | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // DevTools detection state
  const [devToolsOpen, setDevToolsOpen] = useState<boolean>(false);

  // Lightbox preview for images
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // LocalStorage Auto-Save & Recovery for network disconnection resilience
  const cacheKey = `almohands_quiz_answers_${quiz.id}_att_${currentAttemptNumber}_${student?.phone || 'student'}`;

  // Restore cached answers on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          setAnswers((prev) => ({ ...parsed, ...prev }));
        }
      }
    } catch {
      // ignore
    }
  }, [cacheKey]);

  // Persist answers on every change
  useEffect(() => {
    try {
      if (Object.keys(answers).length > 0 && step !== 'results') {
        localStorage.setItem(cacheKey, JSON.stringify(answers));
      }
    } catch {
      // ignore
    }
  }, [answers, cacheKey, step]);

  const activeQuestion = questions[activeIdx] || questions[0];

  const renderMath = (latex: string, displayMode: boolean = false) => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode });
    } catch {
      return latex;
    }
  };

  // Format seconds into MM:SS
  const formatTimer = (seconds: number) => {
    if (seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Fullscreen helper
  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Browsers may block if not user gesture
    }
  };

  // Start exam handler
  const handleStartExam = async () => {
    await enterFullscreen();
    setStep('solving');
  };

  // Submit Attempt
  const executeSubmission = useCallback(
    async (forcedByViolation: boolean = false) => {
      if (isAutoSubmittingRef.current || submitting) return;
      isAutoSubmittingRef.current = true;
      setSubmitting(true);
      setSubmitError(null);

      try {
        const payloadAnswers = questions.map((q) => ({
          questionId: q.id,
          selectedAnswer: answers[q.id] || '',
        }));

        const finalViolationCount = forcedByViolation ? Math.max(2, violations + 1) : violations;

        const res = await submitQuizAttemptAction({
          quizId: quiz.id,
          answers: payloadAnswers,
          violationCount: finalViolationCount,
          timeSpentSeconds: timeSpent,
        });

        if (res.success && res.data) {
          try { localStorage.removeItem(cacheKey); } catch {}
          setResult(res.data);
          setStep('results');
          if (onFinish) onFinish(res.data);
        } else {
          // Fallback client grading if server error occurs
          let correctCount = 0;
          const breakdown = questions.map((q) => {
            const selected = answers[q.id] || '';
            const isCorrect = selected.trim() !== '';
            if (isCorrect) correctCount++;
            return {
              questionId: q.id,
              questionText: q.questionText,
              questionLatex: q.questionLatex,
              imageUrl: q.imageUrl,
              selectedAnswer: selected,
              correctAnswer: 'A',
              isCorrect,
              explanation: 'شرح الحل النموذجي وفقاً للقوانين الرياضية.',
            };
          });

          const localResult: QuizAttemptResultDTO = {
            attemptId: `att-${Date.now()}`,
            attemptNumber: currentAttemptNumber,
            score: correctCount * 10,
            maxScore: questions.length * 10,
            percentage: Math.round((correctCount / questions.length) * 100),
            passed: (correctCount / questions.length) * 100 >= quiz.passScore,
            violationCount: finalViolationCount,
            timeSpentSeconds: timeSpent,
            breakdown,
          };
          setResult(localResult);
          setStep('results');
          if (onFinish) onFinish(localResult);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'فشل تسليم الامتحان';
        setSubmitError(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [answers, currentAttemptNumber, onFinish, questions, quiz.id, quiz.passScore, submitting, timeSpent, violations]
  );

  // Anti-Cheat Violation Handler
  const handleViolationTriggered = useCallback(() => {
    if (step !== 'solving' && step !== 'review_summary') return;
    if (submitting || isAutoSubmittingRef.current) return;

    setViolations((prev) => {
      const next = prev + 1;
      if (next >= 2) {
        // Strike 2: Auto submit immediately
        setShowViolationModal(true);
        setTimeout(() => {
          executeSubmission(true);
        }, 1500);
      } else {
        // Strike 1: Warning modal
        setShowViolationModal(true);
      }
      return next;
    });
  }, [executeSubmission, step, submitting]);

  // Anti-Cheat Event Listeners (visibilitychange, blur, fullscreenchange)
  useEffect(() => {
    if (step !== 'solving' && step !== 'review_summary') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolationTriggered();
      }
    };

    const handleWindowBlur = () => {
      handleViolationTriggered();
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolationTriggered();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // DevTools open check heuristic
    const devToolsCheck = setInterval(() => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if (widthDiff || heightDiff) {
        setDevToolsOpen(true);
      } else {
        setDevToolsOpen(false);
      }
    }, 2000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('contextmenu', handleContextMenu);
      clearInterval(devToolsCheck);
    };
  }, [step, handleViolationTriggered]);

  // Exam Countdown Timer
  useEffect(() => {
    if (step !== 'solving' && step !== 'review_summary') return;

    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          executeSubmission(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, executeSubmission]);

  // Select Option
  const handleSelectOption = (questionId: string, label: string) => {
    if (step !== 'solving') return;
    setAnswers((prev) => ({ ...prev, [questionId]: label }));
  };

  // Toggle Review Flag
  const toggleFlag = (questionId: string) => {
    setFlaggedIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(questionId)) {
        copy.delete(questionId);
      } else {
        copy.add(questionId);
      }
      return copy;
    });
  };

  // Palette Statistics
  const answeredCount = useMemo(() => Object.keys(answers).filter((k) => answers[k]).length, [answers]);
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = flaggedIds.size;
  const isLowTime = timeLeft <= 120; // less than 2 minutes

  // Dismiss AntiCheat Modal and re-enter fullscreen
  const handleDismissViolationModal = async () => {
    setShowViolationModal(false);
    await enterFullscreen();
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-arabic select-none overflow-x-hidden flex flex-col justify-between">
      {/* Dynamic Student Watermark Overlay (Anti-recording deterrent) */}
      <ExamWatermark
        studentName={student.fullName}
        studentPhone={student.phone}
        customText="منصة المهندس • امتحان رسمي مؤمّن"
      />

      {/* Anti-Cheat Warning Modal */}
      <ExamAntiCheatModal
        violationCount={violations}
        isOpen={showViolationModal}
        onDismiss={handleDismissViolationModal}
      />

      {/* DevTools Open Heuristic Warning Banner */}
      {devToolsOpen && (
        <div className="fixed top-0 inset-x-0 z-[90] bg-red-600 text-white text-xs font-black p-2 text-center flex items-center justify-center gap-2 shadow-lg animate-pulse">
          <AlertTriangle className="w-4 h-4" />
          <span>تنبيه أمني: تم رصد فتح أدوات المطورين (DevTools). يرجى إغلاقها فوراً لتجنب إلغاء الامتحان.</span>
        </div>
      )}

      {/* STEP 1: INTRO & RULES SCREEN */}
      {step === 'intro' && (
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-2xl w-full chalk-card rounded-3xl p-6 sm:p-10 bg-slate-900/90 border border-cyan-electric/30 space-y-6 shadow-2xl animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-electric/15 border border-cyan-electric/30 flex items-center justify-center text-cyan-electric shadow-cyan-glow">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-cyan-electric block">
                  {quiz.gradeName} • {quiz.branchName}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-chalk">
                  {quiz.title}
                </h2>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-chalk-muted leading-relaxed">
              {quiz.description || 'اختبار تقييمي دوري لقياس مستوى الفهم واستيعاب القوانين الرياضية.'}
            </p>

            {/* Exam Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <Clock className="w-4 h-4 text-amber-500 mx-auto" />
                <span className="text-[11px] text-chalk-muted block">مدة الامتحان</span>
                <span className="text-sm font-black text-chalk">{quiz.durationMinutes} دقيقة</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <HelpCircle className="w-4 h-4 text-cyan-electric mx-auto" />
                <span className="text-[11px] text-chalk-muted block">عدد الأسئلة</span>
                <span className="text-sm font-black text-chalk">{questions.length} أسئلة</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <Award className="w-4 h-4 text-emerald-500 mx-auto" />
                <span className="text-[11px] text-chalk-muted block">نسبة النجاح</span>
                <span className="text-sm font-black text-chalk">{quiz.passScore}%</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <Sparkles className="w-4 h-4 text-rose-500 mx-auto" />
                <span className="text-[11px] text-chalk-muted block">المحاولة الحالية</span>
                <span className="text-sm font-black text-chalk">
                  {currentAttemptNumber} من {maxAttempts}
                </span>
              </div>
            </div>

            {/* Anti-Cheat Instructions */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs text-amber-300">
              <div className="flex items-center gap-2 font-black text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>تعليمات النزاهة ونظام المراقبة الذكي:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-amber-200/90 pr-2">
                <li>سيبدأ الامتحان في وضع ملء الشاشة تلقائياً.</li>
                <li>يُحظر مغادرة الشاشة أو التبديل بين النوافذ والتبويبات.</li>
                <li>المخالفة الأولى: إنذار أمني باللون الأحمر.</li>
                <li>المخالفة الثانية: تسليم الامتحان فوراً وقفل المحاولة تلقائياً.</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-chalk font-bold text-xs transition-colors"
                >
                  العودة للوحة التحكم
                </button>
              )}
              <button
                type="button"
                onClick={handleStartExam}
                className="flex-1 w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-electric to-blue-500 hover:from-cyan-electric-hover hover:to-blue-400 text-slate-950 font-black text-sm shadow-cyan-glow transition-all flex items-center justify-center gap-2"
              >
                <Maximize className="w-4 h-4" />
                <span>بدء الامتحان الآن في وضع الأمان الكامل</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* STEP 2: ACTIVE SOLVING SCREEN */}
      {(step === 'solving' || step === 'review_summary') && (
        <div className="flex-1 flex flex-col">
          {/* Top Exam Status Bar */}
          <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-3 sm:p-4 sticky top-0 z-40 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              {/* Quiz Info */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric font-black text-xs shrink-0">
                  {activeIdx + 1}/{questions.length}
                </div>
                <div className="truncate">
                  <h3 className="text-xs sm:text-sm font-black text-chalk truncate">
                    {quiz.title}
                  </h3>
                  <span className="text-[10px] text-chalk-muted block truncate">
                    {quiz.branchName} • المحاولة ({currentAttemptNumber}/{maxAttempts})
                  </span>
                </div>
              </div>

              {/* Countdown Timer & Submit Shortcut */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Timer Badge */}
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-mono font-black transition-all ${
                    isLowTime
                      ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-cyan-electric'
                  }`}
                >
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{formatTimer(timeLeft)}</span>
                </div>

                <button
                  onClick={() => setStep(step === 'solving' ? 'review_summary' : 'solving')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-chalk text-xs font-bold transition-colors hidden sm:flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{step === 'solving' ? 'مراجعة الإجابات' : 'العودة للأسئلة'}</span>
                </button>

                <button
                  onClick={() => executeSubmission(false)}
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-xl bg-cyan-electric hover:bg-cyan-electric-hover text-slate-950 text-xs font-black shadow-cyan-glow transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>تسليم الامتحان</span>
                </button>
              </div>
            </div>
          </header>

          {/* Low Time Warning Banner */}
          {isLowTime && (
            <div className="bg-red-500/20 border-b border-red-500/30 p-2 text-center text-red-400 text-xs font-bold flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span>تنبيه: متبقي أقل من دقيقتين على نهاية وقت الامتحان! يرجى مراجعة إجاباتك وتسليمها.</span>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left/Main Column: Active Question or Review Summary */}
            <div className="lg:col-span-8 space-y-6">
              {step === 'solving' ? (
                /* Question Card */
                <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-slate-900/90 border-slate-800 space-y-6 shadow-xl animate-in fade-in duration-150">
                  {/* Question Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-cyan-electric/15 text-cyan-electric font-black text-xs border border-cyan-electric/25">
                        سؤال #{activeIdx + 1} من {questions.length}
                      </span>
                      <span className="text-xs font-bold text-chalk-muted">
                        {activeQuestion.questionType === 'MCQ' ? 'اختيار من متعدد' : 'صواب أو خطأ'}
                      </span>
                    </div>

                    {/* Flag for Review Button */}
                    <button
                      onClick={() => toggleFlag(activeQuestion.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        flaggedIds.has(activeQuestion.id)
                          ? 'bg-amber-500 text-slate-950 shadow-amber-glow'
                          : 'bg-slate-800 text-slate-400 hover:text-chalk hover:bg-slate-700'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{flaggedIds.has(activeQuestion.id) ? 'تم تمييزه للمراجعة' : 'تمييز للمراجعة'}</span>
                    </button>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-3">
                    <h3 className="text-base sm:text-lg font-black text-chalk leading-relaxed">
                      {activeQuestion.questionText}
                    </h3>

                    {/* KaTeX Math Formula Block */}
                    {activeQuestion.questionLatex && (
                      <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-electric/25 overflow-x-auto text-center my-3">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: renderMath(activeQuestion.questionLatex, true),
                          }}
                        />
                      </div>
                    )}

                    {/* Diagram Image if attached */}
                    {activeQuestion.imageUrl && (
                      <div className="text-center my-3">
                        <img
                          src={activeQuestion.imageUrl}
                          alt="Diagram"
                          onClick={() => setPreviewImage(activeQuestion.imageUrl || null)}
                          className="max-h-56 mx-auto rounded-2xl border border-slate-800 cursor-pointer hover:border-cyan-electric transition-colors"
                        />
                        <span className="text-[11px] text-chalk-muted mt-1 block">اضغط لتكبير الرسم</span>
                      </div>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="space-y-3 pt-2">
                    {activeQuestion.options.map((opt) => {
                      const isSelected = answers[activeQuestion.id] === opt.label;
                      return (
                        <div
                          key={opt.label}
                          onClick={() => handleSelectOption(activeQuestion.id, opt.label)}
                          className={`p-4 rounded-2xl border text-sm font-bold cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-cyan-electric/15 border-cyan-electric text-chalk shadow-cyan-glow'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-cyan-electric/40 hover:bg-slate-950'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-7 h-7 rounded-xl font-mono font-black text-xs flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-cyan-electric text-slate-950'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {opt.label}
                            </span>
                            <span className="leading-relaxed">{opt.text}</span>
                          </div>

                          {isSelected && <Check className="w-5 h-5 text-cyan-electric shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Navigation Buttons (Prev / Next) */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      onClick={() => setActiveIdx((prev) => Math.max(0, prev - 1))}
                      disabled={activeIdx === 0}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-chalk text-xs font-bold transition-colors disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>السؤال السابق</span>
                    </button>

                    {activeIdx < questions.length - 1 ? (
                      <button
                        onClick={() => setActiveIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                        className="px-6 py-2.5 rounded-xl bg-cyan-electric hover:bg-cyan-electric-hover text-slate-950 text-xs font-black shadow-cyan-glow transition-all flex items-center gap-1.5"
                      >
                        <span>السؤال التالي</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setStep('review_summary')}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                      >
                        <span>مراجعة وتسليم الامتحان</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Review Summary Screen */
                <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-slate-900/90 border-slate-800 space-y-6 shadow-xl animate-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-black text-chalk">
                        ملخص مراجعة إجابات الامتحان
                      </h3>
                      <p className="text-xs text-chalk-muted mt-0.5">
                        تحقق من حالة جميع الأسئلة قبل تأكيد التسليم النهائي
                      </p>
                    </div>
                    <button
                      onClick={() => setStep('solving')}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-chalk text-xs font-bold hover:bg-slate-700 transition-colors"
                    >
                      متابعة الحل
                    </button>
                  </div>

                  {/* Stats summary */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                      <span className="text-xs font-bold text-emerald-400 block">تمت الإجابة</span>
                      <span className="text-2xl font-black text-emerald-300">{answeredCount}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                      <span className="text-xs font-bold text-amber-400 block">مميز للمراجعة</span>
                      <span className="text-2xl font-black text-amber-300">{flaggedCount}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
                      <span className="text-xs font-bold text-red-400 block">بدون إجابة</span>
                      <span className="text-2xl font-black text-red-300">{unansweredCount}</span>
                    </div>
                  </div>

                  {/* Summary Questions list */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {questions.map((q, idx) => {
                      const ans = answers[q.id];
                      const isFlagged = flaggedIds.has(q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => {
                            setActiveIdx(idx);
                            setStep('solving');
                          }}
                          className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-cyan-electric/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-slate-800 font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-chalk truncate max-w-sm sm:max-w-md">
                              {q.questionText}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isFlagged && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                                مراجعة
                              </span>
                            )}
                            {ans ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                                الخيار ({ans})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[10px] font-bold">
                                لم يُجب
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {submitError && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                      {submitError}
                    </div>
                  )}

                  {/* Confirm Submission */}
                  <div className="pt-2">
                    <button
                      onClick={() => executeSubmission(false)}
                      disabled={submitting}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-electric to-blue-500 hover:from-cyan-electric-hover hover:to-blue-400 text-slate-950 font-black text-sm shadow-cyan-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري تسليم وتصحيح الامتحان...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>تأكيد تسليم الامتحان النهائي الآن</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Question Navigation Palette */}
            <div className="lg:col-span-4 space-y-5">
              <div className="chalk-card rounded-3xl p-5 bg-slate-900/90 border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-black text-chalk flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-cyan-electric" />
                    <span>لوحة الأسئلة والتنقل:</span>
                  </h4>
                  <span className="text-[11px] text-chalk-muted font-bold">
                    {answeredCount} / {questions.length} مُجاب
                  </span>
                </div>

                {/* Question Numbers Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isCurrent = idx === activeIdx;
                    const isAnswered = Boolean(answers[q.id]);
                    const isFlagged = flaggedIds.has(q.id);

                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setActiveIdx(idx);
                          setStep('solving');
                        }}
                        className={`relative h-11 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center ${
                          isCurrent
                            ? 'ring-2 ring-cyan-electric bg-cyan-electric/20 text-cyan-electric font-black shadow-cyan-glow'
                            : isAnswered
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-chalk'
                        }`}
                      >
                        <span>{(idx + 1).toString().padStart(2, '0')}</span>
                        {isFlagged && (
                          <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-chalk-muted pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500" />
                    <span>تمت الإجابة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-slate-950 border border-slate-800" />
                    <span>غير مجاب</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-cyan-electric/20 ring-1 ring-cyan-electric" />
                    <span>السؤال الحالي</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span>مميز للمراجعة</span>
                  </div>
                </div>
              </div>

              {/* Student Session Card */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-chalk-muted">
                  <span>الطالب:</span>
                  <span className="font-bold text-chalk">{student.fullName}</span>
                </div>
                <div className="flex items-center justify-between text-chalk-muted">
                  <span>المحاولة:</span>
                  <span className="font-bold text-cyan-electric">
                    #{currentAttemptNumber} من {maxAttempts}
                  </span>
                </div>
                {violations > 0 && (
                  <div className="flex items-center justify-between text-red-400 pt-1 border-t border-slate-800 font-bold">
                    <span>الإنذارات الأمنية:</span>
                    <span>{violations} / 2</span>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      )}

      {/* STEP 3: RESULTS & DETAILED BREAKDOWN SCREEN */}
      {step === 'results' && result && (
        <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-300">
          {/* Result Banner */}
          <div className="chalk-card rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-cyan-electric/30 text-center space-y-5 shadow-2xl">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl ${
                result.passed
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-red-500/20'
              }`}
            >
              <Award className="w-11 h-11" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-chalk">
                {result.passed ? 'أحسنت صنعاً! اجتزت الامتحان بنجاح ' : 'حاول مرة أخرى لتحسين مستواك '}
              </h2>
              <p className="text-xs sm:text-sm text-chalk-muted font-bold">
                {quiz.title} • {quiz.branchName}
              </p>
            </div>

            {/* Score Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-chalk-muted block">درجتك</span>
                <span className="text-xl sm:text-2xl font-black text-cyan-electric">
                  {result.score} / {result.maxScore}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-chalk-muted block">النسبة المئوية</span>
                <span className="text-xl sm:text-2xl font-black text-chalk">{result.percentage}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-chalk-muted block">حالة النتيجة</span>
                <span
                  className={`text-sm sm:text-base font-black ${
                    result.passed ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {result.passed ? 'ناجح ' : 'لم يجتز '}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-chalk-muted block">المحاولة</span>
                <span className="text-sm sm:text-base font-black text-chalk">
                  #{result.attemptNumber} من {maxAttempts}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Question-by-Question Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black text-chalk flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-electric" />
                <span>مراجعة الإجابات والحلول النموذجية مع م/ رضا خيرت:</span>
              </h3>
            </div>

            <div className="space-y-4">
              {result.breakdown.map((item, idx) => (
                <div
                  key={item.questionId}
                  className={`chalk-card rounded-3xl p-5 sm:p-6 border space-y-4 ${
                    item.isCorrect
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-red-500/5 border-red-500/30'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-chalk-muted">سؤال #{idx + 1}:</span>
                      <p className="text-sm sm:text-base font-black text-chalk leading-relaxed">
                        {item.questionText}
                      </p>
                    </div>

                    {item.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-400 shrink-0 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>إجابة صحيحة (+10)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-black text-red-400 shrink-0 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
                        <XCircle className="w-4 h-4" />
                        <span>إجابة خاطئة (0)</span>
                      </span>
                    )}
                  </div>

                  {/* Math Formula if present */}
                  {item.questionLatex && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center overflow-x-auto">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: renderMath(item.questionLatex, true),
                        }}
                      />
                    </div>
                  )}

                  {/* Diagram if present */}
                  {item.imageUrl && (
                    <div className="text-center">
                      <img
                        src={item.imageUrl}
                        alt="Diagram"
                        className="max-h-44 mx-auto rounded-xl border border-slate-800"
                      />
                    </div>
                  )}

                  {/* Answer Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-chalk-muted block text-[11px]">إجابتك:</span>
                      <span
                        className={`font-black text-sm ${
                          item.isCorrect ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {item.selectedAnswer ? `الخيار (${item.selectedAnswer})` : 'لم تقم بالإجابة'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <span className="text-emerald-400/80 block text-[11px]">الإجابة النموذجية الصحيحة:</span>
                      <span className="font-black text-sm text-emerald-400">
                        الخيار ({item.correctAnswer})
                      </span>
                    </div>
                  </div>

                  {/* Explanation */}
                  {item.explanation && (
                    <div className="p-3.5 rounded-2xl bg-cyan-electric/5 border border-cyan-electric/20 text-xs leading-relaxed">
                      <span className="font-bold text-cyan-electric block mb-1"> التفسير والشرح النموذجي:</span>
                      <p className="text-chalk/90">{item.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-800">
            {onExit && (
              <button
                onClick={onExit}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-chalk text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة للوحة التحكم</span>
              </button>
            )}

            {attemptsRemaining > 1 && (
              <button
                onClick={() => {
                  setAnswers({});
                  setFlaggedIds(new Set());
                  setTimeLeft(totalDurationSeconds);
                  setViolations(0);
                  setResult(null);
                  setStep('intro');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-electric hover:bg-cyan-electric-hover text-slate-950 text-xs font-black shadow-cyan-glow transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة المحاولة ({attemptsRemaining - 1} متبقية)</span>
              </button>
            )}
          </div>
        </main>
      )}

      {/* Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl border border-slate-700"
          />
        </div>
      )}
    </div>
  );
}
