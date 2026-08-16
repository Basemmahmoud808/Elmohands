'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CurriculumTermDTO, CurriculumLessonDTO } from '@/lib/types/dashboard';
import {
  Layers,
  BookOpen,
  PlayCircle,
  FileText,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface EnrolledCoursesGridProps {
  curriculum: CurriculumTermDTO[];
  gradeName?: string;
  onOpenVideo?: (title: string, url: string) => void;
  onOpenPdf?: (title: string, url: string) => void;
}

export function EnrolledCoursesGrid({
  curriculum,
  gradeName = 'الصف الأول الإعدادي',
  onOpenVideo,
  onOpenPdf,
}: EnrolledCoursesGridProps) {
  const [selectedTermIndex, setSelectedTermIndex] = useState(0);
  const [branchFilter, setBranchFilter] = useState<'all' | 'algebra' | 'geometry'>('all');
  const [collapsedUnits, setCollapsedUnits] = useState<Record<string, boolean>>({});

  const toggleUnit = (unitId: string) => {
    setCollapsedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const currentTerm = curriculum[selectedTermIndex] || curriculum[0];

  const filteredBranches = (currentTerm?.branches || []).filter((branch) => {
    if (branchFilter === 'algebra') return branch.name.includes('جبر');
    if (branchFilter === 'geometry') return branch.name.includes('هندسة');
    return true;
  });

  const totalLessonsInTerm = (currentTerm?.branches || []).reduce(
    (acc, b) => acc + b.units.reduce((uAcc, u) => uAcc + u.lessons.length, 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">
            مناهجي والدروس الدراسية ({gradeName})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-chalk-muted mt-0.5">
            استعرض وحدات المنهج وشاهد شرح الفيديو التفاعلي وحمل مذكرات PDF لكل درس
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setBranchFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              branchFilter === 'all'
                ? 'bg-cyan-electric text-black shadow-cyan-glow'
                : 'text-slate-700 dark:text-chalk/80 hover:text-cyan-electric'
            }`}
          >
            جميع الفروع
          </button>
          <button
            onClick={() => setBranchFilter('algebra')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              branchFilter === 'algebra'
                ? 'bg-cyan-electric text-black shadow-cyan-glow'
                : 'text-slate-700 dark:text-chalk/80 hover:text-cyan-electric'
            }`}
          >
            الجبر والإحصاء
          </button>
          <button
            onClick={() => setBranchFilter('geometry')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              branchFilter === 'geometry'
                ? 'bg-cyan-electric text-black shadow-cyan-glow'
                : 'text-slate-700 dark:text-chalk/80 hover:text-cyan-electric'
            }`}
          >
            الهندسة والقياس
          </button>
        </div>
      </div>

      {/* Term Selector Tabs */}
      {curriculum.length > 1 && (
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          {curriculum.map((term, idx) => (
            <button
              key={term.id}
              onClick={() => setSelectedTermIndex(idx)}
              className={`pb-2 px-4 text-sm font-extrabold transition-all relative ${
                selectedTermIndex === idx
                  ? 'text-cyan-electric border-b-2 border-cyan-electric'
                  : 'text-slate-500 dark:text-chalk-muted hover:text-slate-800 dark:hover:text-chalk'
              }`}
            >
              {term.name}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {totalLessonsInTerm === 0 || filteredBranches.length === 0 ? (
        <div className="chalk-card rounded-3xl p-8 sm:p-12 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 text-center space-y-4 my-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-electric/10 text-cyan-electric flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-chalk">
            لا توجد دروس مرفوعة في هذا الفرع بعد
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-chalk-muted max-w-md mx-auto font-medium">
            يتم تحديث المنهج باستمرار من قِبل م/ رضا خيرت وستظهر الدروس الجديدة تلقائياً هنا!
          </p>
        </div>
      ) : (
        filteredBranches.map((branch) => (
          <div key={branch.id} className="space-y-6">
            {/* Branch Header */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-cyan-electric/20 text-slate-900 dark:text-chalk text-base font-black w-fit">
              <Layers className="w-5 h-5 text-cyan-electric" />
              <span>{branch.name}</span>
            </div>

            {/* Units Container */}
            <div className="space-y-6">
              {branch.units.map((unit) => {
                const isCollapsed = !!collapsedUnits[unit.id];
                return (
                  <div
                    key={unit.id}
                    className="chalk-card rounded-3xl p-5 sm:p-7 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-5"
                  >
                    {/* Unit Accordion Header */}
                    <div
                      onClick={() => toggleUnit(unit.id)}
                      className="flex items-center justify-between cursor-pointer select-none border-b border-slate-200 dark:border-slate-800/80 pb-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-electric" />
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-chalk">
                            {unit.title}
                          </h3>
                        </div>
                        {unit.description && (
                          <p className="text-xs text-slate-500 dark:text-chalk-muted pr-4">
                            {unit.description}
                          </p>
                        )}
                      </div>

                      <button
                        className="p-2 rounded-xl text-slate-500 dark:text-chalk-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="طي الوحدة"
                      >
                        {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Lesson Cards Grid */}
                    {!isCollapsed && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-1">
                        {unit.lessons.map((les: CurriculumLessonDTO, index: number) => {
                          const isDone = les.isCompleted || les.watchPercentage >= 90;
                          const inProgress = les.watchPercentage > 0 && !isDone;

                          return (
                            <div
                              key={les.id}
                              className="rounded-2xl p-5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/90 flex flex-col justify-between hover:border-cyan-electric/40 transition-all space-y-4 shadow-sm"
                            >
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="w-9 h-9 rounded-xl bg-cyan-electric/10 border border-cyan-electric/30 flex items-center justify-center text-cyan-electric font-black text-xs">
                                    0{index + 1}
                                  </div>

                                  {/* Status Pill */}
                                  {isDone ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>مكتمل ✓</span>
                                    </span>
                                  ) : inProgress ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-electric/15 text-cyan-electric border border-cyan-electric/30">
                                      <span>قيد المشاهدة {les.watchPercentage}%</span>
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                      {les.durationMinutes} دقيقة فيديو
                                    </span>
                                  )}
                                </div>

                                <h4 className="text-base font-extrabold text-slate-900 dark:text-chalk leading-snug">
                                  {les.title}
                                </h4>

                                <p className="text-xs text-slate-600 dark:text-chalk-muted leading-relaxed line-clamp-2">
                                  {les.description || 'شرح شامل وتمارين تطبيقية محلولة مع م/ رضا خيرت.'}
                                </p>
                              </div>

                              {/* Action Buttons */}
                              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
                                <Link
                                  href={`/lessons/${les.id}`}
                                  onClick={(e) => {
                                    if (onOpenVideo && les.videoPath) {
                                      e.preventDefault();
                                      onOpenVideo(les.title, les.videoPath);
                                    }
                                  }}
                                  className="px-4 py-2 rounded-xl text-xs font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover transition-all flex items-center gap-1.5 shadow-sm shadow-cyan-electric/10"
                                >
                                  <PlayCircle className="w-4 h-4" />
                                  <span>مشاهدة الفيديو</span>
                                </Link>

                                {les.pdfPath && (
                                  <button
                                    onClick={() => onOpenPdf && onOpenPdf(les.title, les.pdfPath || '')}
                                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-chalk/90 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-cyan-electric transition-all flex items-center gap-1.5"
                                  >
                                    <FileText className="w-4 h-4 text-cyan-electric" />
                                    <span>مذكرة PDF</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
