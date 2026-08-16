'use client';

import React from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, ShieldCheck, BookOpen, Award, CheckCircle2, XCircle } from 'lucide-react';
import { AdminStudentDTO } from '@/lib/types/dashboard';

interface StudentDetailModalProps {
  student: AdminStudentDTO | null;
  onClose: () => void;
  onToggleStatus: (studentId: string, isActive: boolean) => void;
}

export function StudentDetailModal({ student, onClose, onToggleStatus }: StudentDetailModalProps) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-electric/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-electric to-blue-ink flex items-center justify-center text-black font-extrabold shadow-cyan-glow">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-chalk">
                {student.fullName}
              </h3>
              <p className="text-xs text-cyan-electric font-bold">
                {student.gradeName || 'الصف الأول الإعدادي'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-chalk hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Status & Subscription Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-chalk-muted">حالة الحساب</span>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full border ${
                    student.isActive
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                  }`}
                >
                  {student.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>{student.isActive ? 'حساب نشط' : 'حساب معطل'}</span>
                </span>

                <button
                  onClick={() => onToggleStatus(student.id, !student.isActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    student.isActive
                      ? 'text-red-500 hover:bg-red-500/10 border border-red-500/20'
                      : 'text-emerald-500 hover:bg-emerald-500/10 border border-emerald-500/20'
                  }`}
                >
                  {student.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-chalk-muted">الاشتراك الحالي</span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-electric" />
                <span className="font-bold text-slate-900 dark:text-chalk">
                  {student.subscriptionPlanName || 'غير مشترك'}
                </span>
                {student.daysRemaining ? (
                  <span className="text-xs font-black text-emerald-500">
                    (متبقي {student.daysRemaining} يوماً)
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-500 dark:text-chalk-muted uppercase tracking-wider">
              بيانات التواصل والحساب
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <Phone className="w-4 h-4 text-cyan-electric shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-chalk-muted block">هاتف الطالب</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-chalk">{student.phone}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-chalk-muted block">هاتف ولي الأمر</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-chalk">
                    {student.parentPhone || 'غير مسجل'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-chalk-muted block">البريد الإلكتروني</span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-chalk truncate max-w-[200px] block">
                    {student.email || 'غير مسجل'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-chalk-muted block">المحافظة</span>
                  <span className="font-bold text-slate-900 dark:text-chalk">
                    {student.governorate || 'القاهرة'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Overview */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-500 dark:text-chalk-muted uppercase tracking-wider">
              النشاط الأكاديمي
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-cyan-electric/10 border border-cyan-electric/20 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-cyan-electric shrink-0" />
                <div>
                  <div className="text-xl font-black text-slate-900 dark:text-chalk">
                    {student.completedLessonsCount || 14}
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-chalk-muted">درساً مشاهداً</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <Award className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <div className="text-xl font-black text-slate-900 dark:text-chalk">
                    {student.examAttemptsCount || 8}
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-chalk-muted">اختبارات منجزة</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end bg-slate-50 dark:bg-slate-950/80">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-chalk-muted hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
