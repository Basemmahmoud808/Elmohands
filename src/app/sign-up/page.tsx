'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import { registerUser } from '@/lib/actions/auth';
import { GraduationCap, Phone, User, BookOpen, MapPin, Users, ArrowLeft, AlertCircle } from 'lucide-react';

const GRADES = [
  'الصف الأول الإعدادي',
  'الصف الثاني الإعدادي',
  'الصف الثالث الإعدادي',
  'الصف الأول الثانوي',
];

const GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'الشرقية',
  'القليوبية',
  'البحيرة',
  'المنوفية',
  'الغربية',
  'كفر الشيخ',
  'الفيوم',
  'بني سويف',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'البحر الأحمر',
  'الوادي الجديد',
  'مطروح',
  'شمال سيناء',
  'جنوب سيناء',
  'بورسعيد',
  'السويس',
  'الإسماعيلية',
  'دمياط',
];

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [governorate, setGovernorate] = useState(GOVERNORATES[0]);
  const [gradeId, setGradeId] = useState(GRADES[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !parentPhone.trim()) {
      setErrorMsg('يرجى إدخال اسم الطالب، رقم هاتف الطالب ورقم هاتف ولي الأمر بشكل صحيح');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await registerUser({
      fullName,
      phone,
      parentPhone,
      governorate,
      gradeId,
    });

    setLoading(false);

    if (res.success) {
      router.push('/student');
    } else {
      setErrorMsg(res.message || 'فشل إنشاء الحساب.');
    }
  };

  return (
    <DarkGradientBg>
      <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 font-arabic my-6">
        
        {/* Card Container */}
        <div className="w-full max-w-lg chalk-card rounded-3xl p-8 bg-white/90 dark:bg-slate-950/80 border-slate-200 dark:border-cyan-electric/30 shadow-cyan-glow-lg space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-electric to-blue-ink text-black shadow-cyan-glow">
              <GraduationCap className="w-8 h-8" />
            </Link>
            
            <h1 className="text-2xl font-black text-slate-900 dark:text-chalk">
              إنشاء حساب طالب جديد
            </h1>
            <p className="text-xs text-slate-500 dark:text-chalk-muted font-medium">
              سجل حسابك مجاناً للوصول للدروس والاختبارات التفاعلية مع م/ رضا خيرت
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-chalk/90 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-electric" />
                اسم الطالب بالكامل
              </label>
              <input
                type="text"
                required
                placeholder="أحمد محمود السيد"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk outline-none focus:border-cyan-electric transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-chalk/90 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-electric" />
                  رقم هاتف الطالب
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk font-mono text-left outline-none focus:border-cyan-electric transition-colors"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-chalk/90 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-electric" />
                  رقم هاتف ولي الأمر
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01223456789"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk font-mono text-left outline-none focus:border-cyan-electric transition-colors"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-chalk/90 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-electric" />
                  المحافظة
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric transition-colors"
                >
                  {GOVERNORATES.map((g, i) => (
                    <option key={i} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-chalk/90 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-electric" />
                  الصف الدراسي
                </label>
                <select
                  value={gradeId}
                  onChange={(e) => setGradeId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric transition-colors"
                >
                  {GRADES.map((g, i) => (
                    <option key={i} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-base font-extrabold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 pt-2"
            >
              {loading ? (
                <span>جاري إنشاء الحساب...</span>
              ) : (
                <>
                  <span>إنشاء حساب والبدء</span>
                  <ArrowLeft className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-xs text-slate-600 dark:text-chalk-muted font-semibold">
            لديك حساب بالفعل؟{' '}
            <Link href="/sign-in" className="text-cyan-electric hover:underline font-bold">
              تسجيل الدخول من هنا
            </Link>
          </div>

        </div>
      </div>
    </DarkGradientBg>
  );
}
