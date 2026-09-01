'use client';

import React from 'react';
import Link from 'next/link';
import { ContinueLearningLessonDTO } from '@/lib/types/dashboard';
import { PlayCircle, Clock, BookOpen, ChevronLeft, Lock, CheckCircle2 } from 'lucide-react';

interface ContinueLearningCardProps {
  lesson: ContinueLearningLessonDTO | null;
  hasActiveSubscription?: boolean;
  onOpenVideo?: (
    title: string,
    url: string,
    lessonId?: string,
    lastPosition?: number,
    watchPercentage?: number,
    durationMinutes?: number
  ) => void;
}

export function ContinueLearningCard({ lesson, hasActiveSubscription = false, onOpenVideo }: ContinueLearningCardProps) {
  if (!hasActiveSubscription) {
    return (
      <div className="chalk-card rounded-3xl p-6 lg:p-8 bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-transparent border border-amber-500/30 relative overflow-hidden shadow-lg shadow-amber-500/5">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
            <Lock className="w-3.5 h-3.5" />
            <span>تفعيل الاشتراك مطلوب</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk flex items-center gap-2">
            <span>اشترك لتفعيل الدروس والمحاضرات الكاملة</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-chalk-muted max-w-xl">
            قم بالاشتراك لتفعيل الباقة وفتح جميع فيديوهات الشرح وحل الامتحانات التفاعلية ومذكرات المنهج.
          </p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="chalk-card rounded-3xl p-6 lg:p-8 bg-gradient-to-r from-cyan-electric/15 via-blue-ink/20 to-transparent border border-cyan-electric/30 relative overflow-hidden">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-electric/20 text-cyan-electric text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>ابدأ رحلتك التعليمية</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">
            جاهز للانطلاق مع م/ رضا خيرت؟
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-chalk-muted max-w-xl">
            اختر درساً من قائمة المناهج والدروس وابدأ بمشاهدة الفيديو التفاعلي وحل الشيتات.
          </p>
        </div>
      </div>
    );
  }

  const currentMinutes = Math.floor(lesson.lastPosition / 60);
  const totalMinutes = lesson.durationMinutes || 45;
  const progressPercent = Math.min(100, Math.max(0, lesson.watchPercentage || 0));
  const isLessonCompleted = Boolean(lesson.isCompleted) || progressPercent >= 90;

  const handlePlayClick = (e: React.MouseEvent) => {
    if (onOpenVideo && lesson.videoPath) {
      e.preventDefault();
      onOpenVideo(
        lesson.title,
        lesson.videoPath,
        lesson.id,
        lesson.lastPosition,
        lesson.watchPercentage,
        lesson.durationMinutes
      );
    }
  };

  return (
    <div className={`chalk-card rounded-3xl p-6 lg:p-8 bg-gradient-to-r ${
      isLessonCompleted
        ? 'from-emerald-500/15 via-slate-900/60 to-transparent border-emerald-500/30 shadow-emerald-500/5'
        : 'from-cyan-electric/15 via-blue-ink/20 to-transparent border-cyan-electric/30 shadow-cyan-electric/5'
    } border relative overflow-hidden shadow-lg`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {isLessonCompleted ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-extrabold border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>تم إكمال هذا الدرس بنجاح (100%)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-electric/20 text-cyan-electric text-xs font-extrabold border border-cyan-electric/30">
                <Clock className="w-3.5 h-3.5" />
                <span>تابع دراستك (الدرس المتاح حالياً)</span>
              </div>
            )}
            <span className="text-xs font-bold text-slate-500 dark:text-chalk-muted">
              {lesson.branchName} • {lesson.unitTitle}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk leading-tight">
            {lesson.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-chalk-muted leading-relaxed max-w-2xl line-clamp-2">
            {lesson.description || 'شرح تفصيلي مع مسائل مبرهنة وتطبيقات عملية وتمارين محلولة باحترافية.'}
          </p>

          {/* Progress Bar and Timestamp */}
          <div className="space-y-2 pt-1 max-w-xl">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-chalk/90">
                {isLessonCompleted
                  ? 'تمت مشاهدة وإتقان كامل الدرس بنجاح'
                  : `مستوى الإنجاز: دقيقة ${currentMinutes} من ${totalMinutes} دقيقة`}
              </span>
              <span className={isLessonCompleted ? 'text-emerald-400 font-black' : 'text-cyan-electric font-black'}>
                {isLessonCompleted ? '100%' : `${progressPercent}%`}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-300 dark:border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isLessonCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-cyan-electric to-blue-ink shadow-cyan-glow'
                }`}
                style={{ width: `${isLessonCompleted ? 100 : progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end items-stretch lg:items-end">
          <Link
            href={`/lessons/${lesson.id}`}
            onClick={handlePlayClick}
            className={`px-6 py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 group ${
              isLessonCompleted
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-chalk hover:bg-emerald-500 hover:text-black'
                : 'text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow'
            }`}
          >
            <PlayCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span>{isLessonCompleted ? 'إعادة مشاهدة الدرس' : 'متابعة مشاهدة الدرس'}</span>
            <ChevronLeft className="w-4 h-4 mr-auto sm:mr-0 lg:mr-auto" />
          </Link>
          <span className="text-[11px] text-center text-slate-500 dark:text-chalk-muted font-medium flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-cyan-electric" />
            <span>يتم حفظ نقطة التوقف تلقائياً</span>
          </span>
        </div>
      </div>
    </div>
  );
}
