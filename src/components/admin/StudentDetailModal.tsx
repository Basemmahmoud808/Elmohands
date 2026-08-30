'use client';

import React from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  BookOpen,
  Award,
  CheckCircle2,
  XCircle,
  GraduationCap,
  MessageCircle,
  Clock,
} from 'lucide-react';
import { AdminStudentDTO } from '@/lib/types/dashboard';

interface StudentDetailModalProps {
  student: AdminStudentDTO | null;
  onClose: () => void;
  onToggleStatus: (studentId: string, isActive: boolean) => void;
}

export function StudentDetailModal({ student, onClose, onToggleStatus }: StudentDetailModalProps) {
  if (!student) return null;

  const studentCleanPhone = student.phone.replace(/^0/, '');
  const parentCleanPhone = student.parentPhone ? student.parentPhone.replace(/^0/, '') : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-arabic" dir="rtl">
      <div className="bg-slate-900 border border-cyan-electric/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-electric/10 border border-cyan-electric/30 flex items-center justify-center text-cyan-electric shadow-lg shadow-cyan-electric/15 shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-chalk">
                {student.fullName}
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-cyan-electric flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {student.gradeName || 'غير محدد'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">
                  انضم: {new Date(student.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-chalk hover:bg-slate-800 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Status & Subscription Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Account Status Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 block">حالة الحساب</span>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full border ${
                    student.isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {student.isActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>حساب مفعّل</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>بانتظار الموافقة والتفعيل</span>
                    </>
                  )}
                </span>

                <button
                  onClick={() => onToggleStatus(student.id, !student.isActive)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border ${
                    student.isActive
                      ? 'text-red-400 hover:bg-red-500/10 border-red-500/30'
                      : 'bg-cyan-electric hover:bg-cyan-electric-hover text-slate-950 border-cyan-electric shadow-cyan-glow'
                  }`}
                >
                  {student.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب الآن'}
                </button>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 block">الاشتراك والوصول</span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-electric shrink-0" />
                  <span className="font-bold text-chalk">
                    {student.subscriptionPlanName || 'غير مشترك'}
                  </span>
                </div>
                {student.hasActiveSubscription && student.daysRemaining !== null && student.daysRemaining !== undefined ? (
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    متبقي {student.daysRemaining} يوماً
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
                    حساب مجاني
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-cyan-electric uppercase tracking-wider flex items-center gap-1.5">
              <span>بيانات الطالب والتواصل الحقيقية</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Student Phone */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-electric/10 border border-cyan-electric/25 flex items-center justify-center text-cyan-electric shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">هاتف الطالب</span>
                    <span className="font-mono font-bold text-chalk text-sm" dir="ltr">{student.phone}</span>
                  </div>
                </div>
                <a
                  href={`https://wa.me/20${studentCleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition-all text-xs font-bold flex items-center gap-1 shrink-0"
                  title="مراسلة عبر واتساب"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">واتساب</span>
                </a>
              </div>

              {/* Parent Phone */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">هاتف ولي الأمر</span>
                    <span className="font-mono font-bold text-chalk text-sm" dir="ltr">
                      {student.parentPhone || 'غير مسجل'}
                    </span>
                  </div>
                </div>
                {student.parentPhone && (
                  <a
                    href={`https://wa.me/20${parentCleanPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition-all text-xs font-bold flex items-center gap-1 shrink-0"
                    title="مراسلة ولي الأمر عبر واتساب"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">واتساب</span>
                  </a>
                )}
              </div>

              {/* Governorate */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">المحافظة</span>
                  <span className="font-bold text-chalk text-sm">
                    {student.governorate || 'غير محدد'}
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">البريد الإلكتروني</span>
                  <span className="font-mono text-xs font-bold text-chalk truncate max-w-[180px] block">
                    {student.email || 'غير مسجل'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real Academic Activity Overview */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-cyan-electric uppercase tracking-wider">
              النشاط الأكاديمي الفعلي على المنصة
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-electric/10 border border-cyan-electric/25 flex items-center justify-center text-cyan-electric shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-chalk">
                    {student.completedLessonsCount ?? 0}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">دروس مكتملة</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-chalk">
                    {student.examAttemptsCount ?? 0}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">اختبارات منجزة</span>
                </div>
              </div>
            </div>

            {(student.completedLessonsCount === 0 || !student.completedLessonsCount) && (
              <p className="text-[11px] text-slate-500 text-center font-medium">
                • لم يقم الطالب بإتمام أي محاضرات أو اختبارات حتى الآن •
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end bg-slate-950/90">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-chalk bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
