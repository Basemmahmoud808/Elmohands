'use client';

import React from 'react';
import { StudentQuizItemDTO, StudentExamResultDTO } from '@/lib/types/dashboard';
import {
  HelpCircle,
  Award,
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  ChevronLeft,
  FileText,
} from 'lucide-react';

interface QuickAccessCardsProps {
  quizzes: StudentQuizItemDTO[];
  recentResults: StudentExamResultDTO[];
  onStartQuiz: (quiz: StudentQuizItemDTO) => void;
  onOpenExamFile: (quiz: StudentQuizItemDTO) => void;
}

export function QuickAccessCards({
  quizzes,
  recentResults,
  onStartQuiz,
  onOpenExamFile,
}: QuickAccessCardsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Teacher Advice Card */}
      <div className="lg:col-span-7 chalk-card rounded-3xl p-6 sm:p-7 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-chalk">
              نصيحة المهندس للدرجات النهائية
            </h3>
            <p className="text-xs text-slate-500 dark:text-chalk-muted">
              مع م/ رضا خيرت — خطوات الإتقان في الرياضيات
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-electric/10 border border-cyan-electric/20 space-y-2 text-xs font-semibold text-slate-800 dark:text-chalk/90 leading-relaxed">
          <p>
             <strong>خطة التفوق الأسبوعية:</strong> شاهد كل درس بتركيز، واكتب خطوات البرهان
            الهندسي بيدك، ثم اختبر فهمك في الاختبار الإلكتروني المخصص للدرس فوراً. الرياضيات علم يُبنى
            بالتدريب والممارسة!
          </p>
        </div>

        {/* Quizzes Quick List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-chalk">
              اختبارات متاحة للتقييم الفوري:
            </span>
            <span className="text-[11px] font-bold text-cyan-electric">{quizzes.length} اختبارات</span>
          </div>

          <div className="space-y-2.5">
            {quizzes.slice(0, 2).map((quiz) => (
              <div
                key={quiz.id}
                className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cyan-electric/30 transition-all"
              >
                <div className="space-y-1">
                  <span className="text-xs font-black text-slate-900 dark:text-chalk block">
                    {quiz.title}
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-chalk-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {quiz.durationMinutes} دقيقة
                    </span>
                    <span>•</span>
                    <span>{quiz.branchName}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (quiz.type === 'file') {
                      onOpenExamFile(quiz);
                    } else {
                      onStartQuiz(quiz);
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-1.5 self-end sm:self-auto shrink-0"
                >
                  {quiz.type === 'file' ? <FileText className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{quiz.type === 'file' ? 'عرض الورقة' : 'بدء الاختبار'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Recent Results Card */}
      <div className="lg:col-span-5 chalk-card rounded-3xl p-6 sm:p-7 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-chalk">
                آخر النتائج والتقييمات
              </h3>
            </div>
            <span className="text-xs font-bold text-cyan-electric">مباشر</span>
          </div>

          <div className="space-y-3 text-xs">
            {recentResults.slice(0, 3).map((res) => (
              <div
                key={res.attemptId}
                className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                      res.passed
                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                        : 'bg-red-500/15 text-red-500 border border-red-500/30'
                    }`}
                  >
                    {res.percentage}%
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-chalk block leading-tight">
                      {res.quizTitle}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-chalk-muted">
                      {res.branchName} • المحاولة {res.attemptNumber}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    res.passed
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}
                >
                  {res.passed ? 'ناجح ' : 'إعادة'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-500 dark:text-chalk-muted font-semibold">
            جميع النتائج والدرجات محفوظة في سجلك الأكاديمي 
          </span>
        </div>
      </div>
    </div>
  );
}
