'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/actions/auth';
import AuthSectionThree from '@/components/ui/auth-section-3';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignUp = async (formData: {
    fullName: string;
    phone: string;
    parentPhone: string;
    password?: string;
    governorate: string;
    gradeId: string;
  }) => {
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.parentPhone.trim() || !formData.password?.trim()) {
      setErrorMsg('يرجى إدخال كافة البيانات وكلمة المرور بشكل صحيح');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await registerUser({
      fullName: formData.fullName,
      phone: formData.phone,
      parentPhone: formData.parentPhone,
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
