'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/actions/auth';
import AuthSectionThree from '@/components/ui/auth-section-3';

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignIn = async (formData: { phone: string; password?: string }) => {
    if (!formData.phone.trim()) {
      setErrorMsg('يرجى إدخال رقم الهاتف بشكل صحيح');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await loginUser(formData.phone, formData.password);
    setLoading(false);

    if (res.success && res.user) {
      router.refresh();
      if (res.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/student');
      }
    } else {
      setErrorMsg(res.message || 'فشل تسجيل الدخول. يرجى التثبت وإعادة المحاولة.');
    }
  };

  return (
    <AuthSectionThree
      mode="signin"
      onSubmit={handleSignIn}
      loading={loading}
      errorMsg={errorMsg}
    />
  );
}
