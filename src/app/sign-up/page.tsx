'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/actions/auth';
import AuthSectionThree, { AuthFormData } from '@/components/ui/auth-section-3';
import { Clock, CheckCircle2, ShieldAlert, MessageCircle, ArrowLeft } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [pendingApproval, setPendingApproval] = useState(false);
  const [studentInfo, setStudentInfo] = useState<{ name: string; phone: string }>({ name: '', phone: '' });

  const handleSignUp = async (formData: AuthFormData) => {
    const cleanPhone = (formData.phone || '').trim().replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()).replace(/\s+/g, '');
    const cleanParentPhone = (formData.parentPhone || '').trim().replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()).replace(/\s+/g, '');
    const phoneRegex = /^01[0125]\d{8}$/;

    if (!formData.fullName?.trim()) {
      setErrorMsg('يرجى كتابة اسم الطالب بالكامل.');
      return;
    }

    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      setErrorMsg('يرجى إدخال رقم هاتف محمول صحيح (مثال: 01012345678)');
      return;
    }

    if (!cleanParentPhone || !phoneRegex.test(cleanParentPhone)) {
      setErrorMsg('يرجى إدخال رقم ولي الأمر بشكل صحيح للتواصل والمتابعة.');
      return;
    }

    if (cleanPhone === cleanParentPhone) {
      setErrorMsg('لا يمكن أن يكون رقم الطالب هو نفسه رقم ولي الأمر.');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setErrorMsg('يجب أن تتكون كلمة المرور من 6 أحرف أو أرقام على الأقل.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await registerUser({
        fullName: formData.fullName.trim(),
        phone: cleanPhone,
        parentPhone: cleanParentPhone,
        governorate: formData.governorate,
        password: formData.password,
        gradeId: formData.gradeId,
      });

      if (res.success) {
        if ((res as any).pendingApproval) {
          setStudentInfo({ name: formData.fullName.trim(), phone: cleanPhone });
          setPendingApproval(true);
        } else {
          router.refresh();
          router.push('/student');
        }
      } else {
        setErrorMsg(res.message || 'فشل إنشاء الحساب. تأكد من أن رقم الهاتف غير مسجل مسبقاً.');
      }
    } catch {
      setErrorMsg('حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (pendingApproval) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-arabic" dir="rtl">
        <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-cyan-electric/30 p-6 sm:p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-cyan-electric/10 border border-cyan-electric/30 flex items-center justify-center mx-auto text-cyan-electric shadow-lg shadow-cyan-electric/20">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تم تسجيل بياناتك بنجاح</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-chalk">
              بانتظار موافقة الإدارة
            </h2>
            <p className="text-xs sm:text-sm text-cyan-electric font-bold">
              أهلاً بك يا {studentInfo.name}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-right space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>حالة الحساب: قيد المراجعة</span>
            </div>
            <p className="text-xs text-chalk-muted leading-relaxed">
              يقوم م/ رضا خيرت وفريق العمل بمراجعة الحسابات الجديدة لضمان صحة البيانات والتواصل مع ولي الأمر لتفعيل الحساب.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href={`https://wa.me/201008901896?text=${encodeURIComponent(`السلام عليكم، قمت بالتسجيل في منصة المهندس باسم: ${studentInfo.name} ورقم الهاتف: ${studentInfo.phone}، وأرجو تفعيل الحساب.`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>تواصل عبر واتساب لتسريع التفعيل</span>
            </a>

            <button
              onClick={() => router.push('/sign-in')}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-chalk font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>الذهاب لصفحة تسجيل الدخول</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthSectionThree
      mode="signup"
      onSubmit={handleSignUp}
      loading={loading}
      errorMsg={errorMsg}
    />
  );
}
