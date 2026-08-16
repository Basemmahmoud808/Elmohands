'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import { getQuizForStudentAction, StudentExamSessionDTO } from '@/lib/actions/quizzes';
import { ExamSolver } from '@/components/exam/ExamSolver';
import {
  ArrowRight,
  AlertCircle,
  ShieldAlert,
  Loader2,
  Lock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function DedicatedExamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [session, setSession] = useState<StudentExamSessionDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadExamSession = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await getQuizForStudentAction(params.id);
      if (res.success && res.data) {
        setSession(res.data);
      } else {
        setErrorMsg(res.error || 'تعذر تحميل جلسة الامتحان');
      }
    } catch {
      setErrorMsg('حدث خطأ غير متوقع أثناء الاتصال بخادم الامتحانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamSession();
  }, [params.id]);

  if (loading) {
    return (
      <DarkGradientBg>
        <div className="min-h-screen flex items-center justify-center font-arabic">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 border-4 border-cyan-electric border-t-transparent rounded-full animate-spin mx-auto shadow-lg shadow-cyan-electric/20" />
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-chalk">
                جاري تجهيز بيئة الامتحان المؤمّنة...
              </h3>
              <p className="text-xs text-slate-500 dark:text-chalk-muted font-bold">
                منصة المهندس • م/ رضا خيرت
              </p>
            </div>
          </div>
        </div>
      </DarkGradientBg>
    );
  }

  if (errorMsg || !session) {
    return (
      <DarkGradientBg>
        <div className="min-h-screen flex items-center justify-center font-arabic p-4">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-red-500/30 text-center space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500 shadow-lg">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-chalk">
                تعذر الوصول إلى الامتحان
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-red-400 font-bold leading-relaxed">
                {errorMsg}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={loadExamSession}
                className="w-full sm:w-auto flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-chalk font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>

              <Link
                href="/student"
                className="w-full sm:w-auto flex-1 py-2.5 rounded-xl bg-cyan-electric hover:bg-cyan-electric-hover text-slate-950 font-black text-xs shadow-cyan-glow transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>لوحة التحكم</span>
              </Link>
            </div>
          </div>
        </div>
      </DarkGradientBg>
    );
  }

  return (
    <ExamSolver
      session={session}
      onExit={() => router.push('/student')}
    />
  );
}
