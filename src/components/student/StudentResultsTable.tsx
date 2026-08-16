'use client';

import React from 'react';
import { StudentExamResultDTO } from '@/lib/types/dashboard';
import { Award, CheckCircle2, XCircle, Calendar, BookOpen } from 'lucide-react';

interface StudentResultsTableProps {
  results: StudentExamResultDTO[];
}

export function StudentResultsTable({ results }: StudentResultsTableProps) {
  const getAppreciation = (percentage: number) => {
    if (percentage >= 90) return { label: 'ممتاز 🌟', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
    if (percentage >= 80) return { label: 'جيد جداً 🎯', color: 'text-cyan-electric bg-cyan-electric/10 border-cyan-electric/30' };
    if (percentage >= 65) return { label: 'جيد 👍', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    if (percentage >= 50) return { label: 'مقبول ⚠️', color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' };
    return { label: 'يحتاج تحسين ❌', color: 'text-red-500 bg-red-500/10 border-red-500/30' };
  };

  return (
    <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">
              سجل الدرجات والنتائج الأكاديمية
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-chalk-muted mt-0.5">
              تفاصيل أداءك في جميع الاختبارات والواجبات المكتملة
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-chalk self-start sm:self-auto">
          إجمالي الاختبارات: {results.length}
        </span>
      </div>

      {results.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <Award className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-900 dark:text-chalk">
            لم تسجل أي نتائج اختبارات بعد
          </h3>
          <p className="text-xs text-slate-500 dark:text-chalk-muted">
            ابدأ بحل الاختبارات المتاحة في صفحة الاختبارات لتظهر درجاتك وتقييماتك هنا!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-black text-slate-500 dark:text-chalk-muted">
                <th className="pb-3 px-3">الفرع / المادة</th>
                <th className="pb-3 px-3">اسم الاختبار</th>
                <th className="pb-3 px-3 text-center">المحاولة</th>
                <th className="pb-3 px-3 text-center">الدرجة</th>
                <th className="pb-3 px-3 text-center">النسبة</th>
                <th className="pb-3 px-3 text-center">التقدير العام</th>
                <th className="pb-3 px-3 text-left">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {results.map((res) => {
                const app = getAppreciation(res.percentage);
                return (
                  <tr key={res.attemptId} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                    <td className="py-4 px-3 font-bold text-slate-900 dark:text-chalk flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-electric shrink-0" />
                      <span>{res.branchName}</span>
                    </td>
                    <td className="py-4 px-3 font-semibold text-slate-700 dark:text-chalk/90 max-w-xs truncate">
                      {res.quizTitle}
                    </td>
                    <td className="py-4 px-3 text-center text-xs font-bold text-slate-500 dark:text-chalk-muted">
                      #{res.attemptNumber}
                    </td>
                    <td className="py-4 px-3 text-center font-black text-slate-900 dark:text-chalk">
                      {res.score} / {res.maxScore}
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className="font-mono font-bold text-cyan-electric">{res.percentage}%</span>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${app.color}`}>
                        {res.passed ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500" />
                        )}
                        <span>{app.label}</span>
                      </span>
                    </td>
                    <td className="py-4 px-3 text-left text-xs font-medium text-slate-500 dark:text-chalk-muted">
                      {new Date(res.submittedAt).toLocaleDateString('ar-EG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
