'use client';

import React from 'react';
import { StudentProgressSummaryDTO } from '@/lib/types/dashboard';
import { BookOpen, Award, Clock, TrendingUp } from 'lucide-react';

interface StudentStatsGridProps {
  summary: StudentProgressSummaryDTO;
}

export function StudentStatsGrid({ summary }: StudentStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* 1. Lessons Completed */}
      <div className="chalk-card rounded-2xl p-5 space-y-3 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 hover:border-cyan-electric/40 transition-all">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-cyan-electric/10 text-cyan-electric flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-electric/15 text-cyan-electric border border-cyan-electric/30">
            {summary.overallProgressPercentage}%
          </span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-chalk">
            {summary.completedLessonsCount} / {summary.totalLessonsInGrade}
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-chalk-muted mt-1">
            درساً مكتمل في المنهج
          </div>
        </div>
      </div>

      {/* 2. Average Quiz Score */}
      <div className="chalk-card rounded-2xl p-5 space-y-3 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 hover:border-emerald-500/40 transition-all">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            {summary.averageQuizScorePercentage >= 85 ? 'ممتاز' : 'جيد جداً'}
          </span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-chalk">
            {summary.averageQuizScorePercentage}%
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-chalk-muted mt-1">
            متوسط درجات الاختبارات
          </div>
        </div>
      </div>

      {/* 3. Watch Time */}
      <div className="chalk-card rounded-2xl p-5 space-y-3 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 hover:border-amber-500/40 transition-all">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            ساعات
          </span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-chalk">
            {summary.totalWatchHours} س
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-chalk-muted mt-1">
            إجمالي ساعات المشاهدة والتدريب
          </div>
        </div>
      </div>

      {/* 4. Quizzes Passed */}
      <div className="chalk-card rounded-2xl p-5 space-y-3 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 hover:border-blue-500/40 transition-all">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            تقييم
          </span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-chalk">
            {summary.passedQuizzesCount} / {summary.totalQuizzesCount}
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-chalk-muted mt-1">
            اختبارات مجتازة بنجاح
          </div>
        </div>
      </div>
    </div>
  );
}
