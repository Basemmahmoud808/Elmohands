'use client';

import React from 'react';
import Link from 'next/link';
import { ContinueLearningLessonDTO } from '@/lib/types/dashboard';
import { PlayCircle, Clock, BookOpen, ChevronLeft } from 'lucide-react';

interface ContinueLearningCardProps {
  lesson: ContinueLearningLessonDTO | null;
  onOpenVideo?: (title: string, url: string) => void;
}

export function ContinueLearningCard({ lesson, onOpenVideo }: ContinueLearningCardProps) {
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

  const handlePlayClick = (e: React.MouseEvent) => {
    if (onOpenVideo && lesson.videoPath) {
      e.preventDefault();
      onOpenVideo(lesson.title, lesson.videoPath);
    }
  };

  return (
    <div className="chalk-card rounded-3xl p-6 lg:p-8 bg-gradient-to-r from-cyan-electric/15 via-blue-ink/20 to-transparent border border-cyan-electric/30 relative overflow-hidden shadow-lg shadow-cyan-electric/5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-electric/20 text-cyan-electric text-xs font-extrabold border border-cyan-electric/30">
              <Clock className="w-3.5 h-3.5" />
              <span>تابع دراستك (الدرس المتاح حالياً)</span>
            </div>
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
                مستوى الإنجاز: دقيقة {currentMinutes} من {totalMinutes} دقيقة
              </span>
              <span className="text-cyan-electric font-black">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-300 dark:border-slate-700">
              <div
                className="bg-gradient-to-r from-cyan-electric to-blue-ink h-full rounded-full shadow-cyan-glow transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end items-stretch lg:items-end">
          <Link
            href={`/lessons/${lesson.id}`}
            onClick={handlePlayClick}
            className="px-6 py-4 rounded-2xl text-sm font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2 group"
          >
            <PlayCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span>متابعة مشاهدة الدرس</span>
            <ChevronLeft className="w-4 h-4 mr-auto sm:mr-0 lg:mr-auto" />
          </Link>
          <span className="text-[11px] text-center text-slate-500 dark:text-chalk-muted font-medium">
            يتم حفظ نقطة التوقف تلقائياً ⏱️
          </span>
        </div>
      </div>
    </div>
  );
}
