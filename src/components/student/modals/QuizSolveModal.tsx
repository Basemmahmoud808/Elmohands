'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, HelpCircle, CheckCircle2, XCircle, Award, Sparkles, Loader2, Maximize, AlertTriangle, Shield, Clock } from 'lucide-react';
import { StudentQuizItemDTO } from '@/lib/types/dashboard';
import { getQuizForStudentAction, submitQuizAttemptAction, QuizAttemptResultDTO, StudentExamSessionDTO } from '@/lib/actions/quizzes';
import { ExamSolver } from '@/components/exam/ExamSolver';

interface QuizSolveModalProps {
  quiz: StudentQuizItemDTO | null;
  onClose: () => void;
  onQuizCompleted?: (result: QuizAttemptResultDTO) => void;
}

export function QuizSolveModal({ quiz, onClose, onQuizCompleted }: QuizSolveModalProps) {
  const [session, setSession] = useState<StudentExamSessionDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!quiz) return;

    let isMounted = true;
    const fetchSession = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await getQuizForStudentAction(quiz.id);
        if (!isMounted) return;
        if (res.success && res.data) {
          setSession(res.data);
        } else {
          setErrorMsg(res.error || 'تعذر تحميل جلسة الاختبار');
        }
      } catch {
        if (isMounted) setErrorMsg('حدث خطأ أثناء تحميل الاختبار');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSession();

    return () => {
      isMounted = false;
    };
  }, [quiz]);

  if (!quiz) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
        {/* Modal Top Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-chalk">
                {quiz.title}
              </h3>
              <p className="text-[11px] text-chalk-muted font-bold">
                {quiz.branchName} • المدة: {quiz.durationMinutes} دقيقة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/exams/${quiz.id}`}
              className="p-2 rounded-xl text-cyan-electric hover:bg-cyan-electric/10 text-xs font-bold transition-colors hidden sm:flex items-center gap-1"
              title="فتح في صفحة مستقلة كاملة"
            >
              <Maximize className="w-4 h-4" />
              <span>شاشة مستقلة</span>
            </Link>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-chalk hover:bg-slate-800 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-16 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-cyan-electric animate-spin mx-auto" />
              <p className="text-xs font-bold text-chalk-muted">
                جاري إعداد جلسة الاختبار المؤمّنة...
              </p>
            </div>
          ) : errorMsg || !session ? (
            <div className="p-10 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black text-chalk">تعذر فتح الاختبار</h4>
              <p className="text-xs text-red-400 font-bold leading-relaxed">{errorMsg}</p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 text-chalk font-bold text-xs hover:bg-slate-700 transition-colors"
              >
                إغلاق
              </button>
            </div>
          ) : (
            <ExamSolver
              session={session}
              onFinish={(res) => {
                if (onQuizCompleted) onQuizCompleted(res);
              }}
              onExit={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
