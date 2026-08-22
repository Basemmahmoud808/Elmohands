'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/actions/auth';
import AuthSectionThree, { AuthFormData } from '@/components/ui/auth-section-3';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      router.refresh();
      router.push('/student');
    } else {
      setErrorMsg(res.message || 'فشل إنشاء الحساب.');
    }
  };

  return (
    <AuthSectionThree
      mode="signup"
      onSubmit={handleSignUp}
      loading={loading}
      errorMsg={errorMsg}
    />
  );
}
