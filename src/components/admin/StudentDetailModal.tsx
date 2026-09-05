'use client';

import React, { useState } from 'react';
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
  Loader2,
  Zap,
  KeyRound,
  Copy,
  Check,
  Send,
  ExternalLink,
  Users,
} from 'lucide-react';
import { AdminStudentDTO } from '@/lib/types/dashboard';
import {
  grantStudentSubscriptionAction,
  cancelStudentSubscriptionAction,
  adminResetStudentPasswordAction,
} from '@/lib/actions/admin';
import {
  getSubscriptionWelcomeMessage,
  getPasswordResetMessage,
  getWhatsAppDirectUrl,
} from '@/lib/services/whatsapp';

interface StudentDetailModalProps {
  student: AdminStudentDTO | null;
  onClose: () => void;
  onToggleStatus: (studentId: string, isActive: boolean) => void;
}

export function StudentDetailModal({ student, onClose, onToggleStatus }: StudentDetailModalProps) {
  const [subLoading, setSubLoading] = useState(false);
  const [subSuccessMsg, setSubSuccessMsg] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState<string | null>(null);

  // WhatsApp Message Hub state
  const [activeMsgTab, setActiveMsgTab] = useState<'subscription' | 'password' | 'parent'>('subscription');
  const [customTempPass, setCustomTempPass] = useState<string>('123456');
  const [copiedMsg, setCopiedMsg] = useState(false);

  if (!student) return null;

  const studentCleanPhone = student.phone.replace(/^0/, '');
  const parentCleanPhone = student.parentPhone ? student.parentPhone.replace(/^0/, '') : '';

  // Generate dynamic message templates
  const subscriptionMsg = getSubscriptionWelcomeMessage({
    studentName: student.fullName,
    planName: student.subscriptionPlanName || 'اشتراك شهر',
    gradeName: student.gradeName || 'الصف الدراسي',
    durationDays: student.daysRemaining || 30,
  });

  const passwordMsg = getPasswordResetMessage({
    studentName: student.fullName,
    phone: student.phone,
    temporaryPassword: customTempPass,
  });

  const parentFollowupMsg = `ولي أمر الطالب المحترم / ${student.fullName} 📊
تقرير منصة المهندس في الرياضيات (م/ رضا خيرت)

• حالة الحساب: ${student.isActive ? 'مفعل ونشط 🟢' : 'قيد المراجعة 🟡'}
• الصف الدراسي: ${student.gradeName || 'الصف الدراسي'}
• باقة الاشتراك: ${student.subscriptionPlanName || 'حساب عادي'}
• المحاضرات المكتملة: ${student.completedLessonsCount || 0} درس
• الاختبارات المنجزة: ${student.examAttemptsCount || 0} امتحان

يمكنكم متابعة تقارير ابنكم الدورية عبر المنصة:
https://elmohands-one.vercel.app

مع تحيات م/ رضا خيرت 🌟`;

  const activeMessageText =
    activeMsgTab === 'subscription'
      ? subscriptionMsg
      : activeMsgTab === 'password'
      ? passwordMsg
      : parentFollowupMsg;

  const studentDirectUrl = getWhatsAppDirectUrl(student.phone, activeMessageText);
  const parentDirectUrl = student.parentPhone ? getWhatsAppDirectUrl(student.parentPhone, activeMessageText) : null;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(activeMessageText);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleGrantSubscription = async (days: number, name: string) => {
    setSubLoading(true);
    setSubSuccessMsg('');
    try {
      const res = await grantStudentSubscriptionAction(student.id, days, name);
      if (res.success) {
        student.hasActiveSubscription = true;
        student.subscriptionPlanName = name;
        student.daysRemaining = days;
        student.isActive = true;
        setActiveMsgTab('subscription');
        if (res.data?.whatsAppUrl) {
          setLastWhatsAppUrl(res.data.whatsAppUrl);
        }
        setSubSuccessMsg(res.message || `تم تفعيل ${name} بنجاح!`);
        setTimeout(() => setSubSuccessMsg(''), 8000);
      } else {
        alert(res.error || 'فشل تفعيل الاشتراك');
      }
    } catch {
      alert('حدث خطأ أثناء تفعيل الاشتراك');
    } finally {
      setSubLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('هل أنت متأكد من رغبتك في إلغاء اشتراك هذا الطالب؟')) return;
    setSubLoading(true);
    try {
      const res = await cancelStudentSubscriptionAction(student.id);
      if (res.success) {
        student.hasActiveSubscription = false;
        student.subscriptionPlanName = 'غير مشترك';
        student.daysRemaining = 0;
        setSubSuccessMsg('تم إلغاء الاشتراك بنجاح');
        setTimeout(() => setSubSuccessMsg(''), 4000);
      } else {
        alert(res.error || 'فشل إلغاء الاشتراك');
      }
    } catch {
      alert('حدث خطأ أثناء إلغاء الاشتراك');
    } finally {
      setSubLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const newPass = prompt('أدخل كلمة المرور الجديدة للطالب، أو اضغط موافق لتعيينها إلى (123456):', '123456');
    if (newPass === null) return;
    if (newPass.trim().length < 6) {
      alert('كلمة المرور يجب أن تتكون من 6 خانات على الأقل');
      return;
    }
    const cleanPass = newPass.trim();
    setCustomTempPass(cleanPass);
    setPassLoading(true);
    setPassSuccessMsg('');
    try {
      const res = await adminResetStudentPasswordAction(student.id, cleanPass);
      if (res.success) {
        setActiveMsgTab('password');
        if (res.data?.whatsAppUrl) {
          setLastWhatsAppUrl(res.data.whatsAppUrl);
        }
        setPassSuccessMsg(res.message || 'تم تحديث كلمة المرور بنجاح');
        setTimeout(() => setPassSuccessMsg(''), 8000);
      } else {
        alert(res.error || 'فشل تغيير كلمة المرور');
      }
    } catch {
      alert('حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-arabic" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-electric/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/90">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500/10 dark:bg-cyan-electric/10 border border-cyan-500/20 dark:border-cyan-electric/30 flex items-center justify-center text-cyan-600 dark:text-cyan-electric shadow-sm shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-chalk">
                {student.fullName}
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-cyan-600 dark:text-cyan-electric flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {student.gradeName || 'غير محدد'}
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400">
                  انضم: {new Date(student.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-chalk hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm bg-white dark:bg-slate-900">
          {/* Status & Subscription Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Account Status Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">حالة الحساب</span>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full border ${
                    student.isActive
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                  }`}
                >
                  {student.isActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>حساب مفعّل</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>بانتظار الموافقة والتفعيل</span>
                    </>
                  )}
                </span>

                <button
                  onClick={() => onToggleStatus(student.id, !student.isActive)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border ${
                    student.isActive
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-500/10 border-red-200 dark:border-red-500/30'
                      : 'bg-cyan-electric hover:bg-cyan-electric-hover text-slate-950 border-cyan-electric shadow-cyan-glow'
                  }`}
                >
                  {student.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب الآن'}
                </button>
              </div>
            </div>

            {/* Subscription Card & Quick Grant Controls */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">الاشتراك والوصول</span>
                {student.hasActiveSubscription && (
                  <button
                    disabled={subLoading}
                    onClick={handleCancelSubscription}
                    className="text-[11px] font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:underline transition-colors disabled:opacity-50"
                  >
                    إلغاء الاشتراك
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-electric shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-chalk">
                    {student.subscriptionPlanName || 'غير مشترك'}
                  </span>
                </div>
                {student.hasActiveSubscription && student.daysRemaining !== null && student.daysRemaining !== undefined ? (
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    متبقي {student.daysRemaining} يوماً
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                    حساب مجاني
                  </span>
                )}
              </div>

              {/* Direct Grant Buttons */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-cyan-700 dark:text-cyan-electric flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>تفعيل اشتراك فوري (بعد تأكيد تحويل واتساب):</span>
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    disabled={subLoading}
                    onClick={() => handleGrantSubscription(30, 'اشتراك شهر')}
                    className="py-2 px-2 rounded-xl text-[11px] font-black bg-slate-100 dark:bg-slate-900 hover:bg-cyan-500/10 hover:border-cyan-500/40 text-slate-800 dark:text-chalk border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <span>شهر (30 يوم)</span>
                  </button>
                  <button
                    disabled={subLoading}
                    onClick={() => handleGrantSubscription(120, 'اشتراك ترم كامل')}
                    className="py-2 px-2 rounded-xl text-[11px] font-black bg-slate-100 dark:bg-slate-900 hover:bg-cyan-500/10 hover:border-cyan-500/40 text-slate-800 dark:text-chalk border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <span>ترم (120 يوم)</span>
                  </button>
                  <button
                    disabled={subLoading}
                    onClick={() => handleGrantSubscription(365, 'اشتراك عام دراسي')}
                    className="py-2 px-2 rounded-xl text-[11px] font-black bg-slate-100 dark:bg-slate-900 hover:bg-cyan-500/10 hover:border-cyan-500/40 text-slate-800 dark:text-chalk border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <span>سنة (365 يوم)</span>
                  </button>
                </div>
                {subSuccessMsg && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in">
                    {subSuccessMsg}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {/* WHATSAPP MESSAGE HUB & INSTANT DISPATCH PREVIEW                           */}
          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/5 dark:bg-slate-950 border border-emerald-500/30 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-chalk">
                    رسائل الواتساب الجاهزة للإرسال للطالب
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    اختر نوع الرسالة، عاين النص، وانسخها أو أرسلها بضغطة زر واحدة
                  </p>
                </div>
              </div>

              {/* Message Template Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                <button
                  onClick={() => setActiveMsgTab('subscription')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    activeMsgTab === 'subscription'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-chalk'
                  }`}
                >
                  تفعيل الاشتراك
                </button>
                <button
                  onClick={() => setActiveMsgTab('password')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    activeMsgTab === 'password'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-chalk'
                  }`}
                >
                  كلمة المرور
                </button>
                <button
                  onClick={() => setActiveMsgTab('parent')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    activeMsgTab === 'parent'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-chalk'
                  }`}
                >
                  تقرير ولي الأمر
                </button>
              </div>
            </div>

            {/* WhatsApp Bubble Preview Box */}
            <div className="relative p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-800/80">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>معاينة نص الرسالة التي ستصل للطالب:</span>
                </span>
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1 text-cyan-600 dark:text-cyan-electric hover:underline"
                >
                  {copiedMsg ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedMsg ? 'تم نسخ الرسالة!' : 'نسخ النص'}</span>
                </button>
              </div>

              <pre className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed select-all bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 max-h-48 overflow-y-auto">
                {activeMessageText}
              </pre>

              {/* Action Buttons: Student WhatsApp & Parent WhatsApp */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <a
                  href={studentDirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال إلى واتساب الطالب ({student.phone})</span>
                </a>

                {parentDirectUrl && (
                  <a
                    href={parentDirectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
                    title={`إرسال إلى ولي الأمر: ${student.parentPhone}`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>واتساب ولي الأمر</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-cyan-700 dark:text-cyan-electric uppercase tracking-wider flex items-center gap-1.5">
              <span>بيانات الطالب والتواصل الحقيقية</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Student Phone */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 dark:bg-cyan-electric/10 border border-cyan-500/20 dark:border-cyan-electric/25 flex items-center justify-center text-cyan-600 dark:text-cyan-electric shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">هاتف الطالب</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-chalk text-sm" dir="ltr">{student.phone}</span>
                  </div>
                </div>
                <a
                  href={`https://wa.me/20${studentCleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 transition-all text-xs font-bold flex items-center gap-1 shrink-0"
                  title="مراسلة عبر واتساب"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">واتساب</span>
                </a>
              </div>

              {/* Parent Phone */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">هاتف ولي الأمر</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-chalk text-sm" dir="ltr">
                      {student.parentPhone || 'غير مسجل'}
                    </span>
                  </div>
                </div>
                {student.parentPhone && (
                  <a
                    href={`https://wa.me/20${parentCleanPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 transition-all text-xs font-bold flex items-center gap-1 shrink-0"
                    title="مراسلة ولي الأمر عبر واتساب"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">واتساب</span>
                  </a>
                )}
              </div>

              {/* Governorate */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">المحافظة</span>
                  <span className="font-bold text-slate-900 dark:text-chalk text-sm">
                    {student.governorate || 'غير محدد'}
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">البريد الإلكتروني</span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-chalk truncate max-w-[180px] block">
                    {student.email || 'غير مسجل'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real Academic Activity Overview */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-cyan-700 dark:text-cyan-electric uppercase tracking-wider">
              النشاط الأكاديمي الفعلي على المنصة
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-slate-950/80 border border-cyan-200/60 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 dark:bg-cyan-electric/10 border border-cyan-500/20 dark:border-cyan-electric/25 flex items-center justify-center text-cyan-600 dark:text-cyan-electric shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-chalk">
                    {student.completedLessonsCount ?? 0}
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">دروس مكتملة</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-slate-950/80 border border-emerald-200/60 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-chalk">
                    {student.examAttemptsCount ?? 0}
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">اختبارات منجزة</span>
                </div>
              </div>
            </div>

            {(student.completedLessonsCount === 0 || !student.completedLessonsCount) && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
                • لم يقم الطالب بإتمام أي محاضرات أو اختبارات حتى الآن •
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/90 dark:bg-slate-950/90">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              disabled={passLoading}
              onClick={handleResetPassword}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-cyan-electric hover:text-black text-slate-800 dark:text-chalk transition-all flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 disabled:opacity-50"
            >
              {passLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5 text-cyan-electric" />}
              <span>إعادة تعيين كلمة المرور</span>
            </button>

            {lastWhatsAppUrl && (
              <a
                href={lastWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-sm animate-in fade-in"
                title="فتح محادثة واتساب مع الطالب بالبيانات مباشرة"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>إرسال التفاصيل واتساب</span>
              </a>
            )}

            {passSuccessMsg && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in">
                {passSuccessMsg}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-chalk bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
