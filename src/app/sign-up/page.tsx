'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/actions/auth';
import AuthSectionThree, { AuthFormData } from '@/components/ui/auth-section-3';

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
      setErrorMsg('رقم هاتف الطالب غير صحيح! يجب إدخال رقم محمول مصري مكون من 11 رقماً ويبدأ بـ (010 أو 011 أو 012 أو 015).');
      return;
    }

    if (!cleanParentPhone) {
      setErrorMsg('رقم هاتف ولي الأمر إلزامي! يرجى إدخال رقم هاتف ولي الأمر للمتابعة.');
      return;
    }

    if (!phoneRegex.test(cleanParentPhone)) {
      setErrorMsg('رقم هاتف ولي الأمر غير صحيح! يجب أن يتكون من 11 رقماً ويبدأ بـ (010 أو 011 أو 012 أو 015).');
      return;
    }

    if (cleanParentPhone === cleanPhone) {
      setErrorMsg('رقم ولي الأمر يجب أن يكون مختلفاً تماماً عن رقم هاتف الطالب.');
      return;
    }

    if (!formData.password?.trim() || formData.password.length < 6) {
      setErrorMsg('كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await registerUser({
      fullName: formData.fullName,
      phone: cleanPhone,
      parentPhone: cleanParentPhone,
      governorate: formData.governorate,
      password: formData.password,
      gradeId: formData.gradeId,
    });

    setLoading(false);

    if (res.success) {
      if ((res as any).pendingApproval) {
        setStudentInfo({ name: formData.fullName, phone: cleanPhone });
        setPendingApproval(true);
      } else {
        router.refresh();
        router.push('/student');
      }
    } else {
      setErrorMsg(res.message || 'فشل إنشاء الحساب.');
    }
  };

  if (pendingApproval) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-arabic" dir="rtl">
        <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-cyan-electric/30 p-6 sm:p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-cyan-electric/10 border border-cyan-electric/30 flex items-center justify-center mx-auto text-cyan-electric shadow-lg shadow-cyan-electric/20">
            <span className="text-3xl">⏳</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-chalk">
              تم تسجيل بياناتك بنجاح! 🎉
            </h2>
            <p className="text-xs sm:text-sm text-cyan-electric font-bold">
              أهلاً بك يا {studentInfo.name}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-right space-y-2">
            <p className="text-xs text-chalk-muted leading-relaxed">
              📌 <strong className="text-chalk">حالة الحساب:</strong> بانتظار مراجعة وتفعيل إدارة المنصة.
            </p>
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
              <span>تواصل عبر واتساب لتسريع التفعيل 💬</span>
            </a>

            <button
              onClick={() => router.push('/sign-in')}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-chalk font-bold text-xs transition-all"
            >
              الذهاب لصفحة تسجيل الدخول
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
