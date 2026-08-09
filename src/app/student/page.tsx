'use client';

import React, { useState } from 'react';
import { DashboardSidebar } from '@/components/ui/dashboard-sidebar';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import {
  PlayCircle,
  KeyRound,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  TrendingUp,
  Sparkles,
  Search,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';

export default function StudentDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherStatus, setVoucherStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleActivateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;
    
    // Simulate server action code check
    if (voucherInput.toUpperCase().startsWith('ALM-')) {
      setVoucherStatus({
        success: true,
        message: 'تم تفعيل كود الشحن بنجاح! تم تمديد اشتراكك لمدة 30 يوماً.',
      });
      setVoucherInput('');
    } else {
      setVoucherStatus({
        success: false,
        message: 'كود الشحن غير صحيح أو تم استخدامه سابقاً. يرجى التثبت وإعادة المحاولة.',
      });
    }
  };

  return (
    <DarkGradientBg>
      <div className="flex min-h-screen w-full font-arabic">
        <DashboardSidebar
          role="STUDENT"
          userFullName="أحمد محمود"
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8">
          
          {/* Top Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-chalk">
                أهلاً يا أحمد 👋
              </h1>
              <p className="text-slate-600 dark:text-chalk-muted text-sm mt-1">
                الصف الأول الإعدادي — الترم الأول (جبر وهندسة)
              </p>
            </div>

            {/* Active Subscription Badge */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-500/30 flex items-center gap-3 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-chalk">
                    اشتراكك الحالي: نشط
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ينتهي خلال 28 يوم (اشتراك شهر)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Learning Banner */}
          <div className="chalk-card rounded-3xl p-6 lg:p-8 bg-gradient-to-r from-cyan-electric/15 via-blue-ink/20 to-transparent border border-cyan-electric/30 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-electric/20 text-cyan-electric text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>تابع دراستك (موقف المشاهدة الأخير)</span>
                </div>
                
                <h2 className="text-2xl font-black text-slate-900 dark:text-chalk">
                  الدرس الثاني: الأعداد النسبية والعمليات عليها
                </h2>
                
                <p className="text-xs text-slate-600 dark:text-chalk-muted leading-relaxed max-w-xl">
                  وحدة الجبر والأعداد — الصف الأول الإعدادي. متبقي 12 دقيقة لإكمال الدرس واجتياز الاختبار النهائي.
                </p>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2 max-w-lg">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-chalk/90">
                    <span>مستوى الإنجاز في الدرس</span>
                    <span className="text-cyan-electric">68%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-cyan-electric h-2.5 rounded-full shadow-cyan-glow transition-all duration-500" style={{ width: '68%' }} />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-end">
                <button className="px-6 py-3.5 rounded-2xl text-sm font-extrabold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  <span>متابعة الدرس الآن</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="chalk-card rounded-2xl p-5 space-y-2 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15">
              <div className="flex items-center justify-between text-cyan-electric">
                <BookOpen className="w-6 h-6" />
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-electric/10">مكتمل</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-chalk">14 / 24</div>
              <div className="text-xs text-slate-500 dark:text-chalk-muted">درساً مكتمل في المنهج</div>
            </div>

            <div className="chalk-card rounded-2xl p-5 space-y-2 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15">
              <div className="flex items-center justify-between text-emerald-500">
                <Award className="w-6 h-6" />
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10">ممتاز</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-chalk">94%</div>
              <div className="text-xs text-slate-500 dark:text-chalk-muted">متوسط درجات الاختبارات</div>
            </div>

            <div className="chalk-card rounded-2xl p-5 space-y-2 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15">
              <div className="flex items-center justify-between text-amber-500">
                <Clock className="w-6 h-6" />
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10">ساعات</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-chalk">18.5 س</div>
              <div className="text-xs text-slate-500 dark:text-chalk-muted">إجمالي ساعات المشاهدة</div>
            </div>

            <div className="chalk-card rounded-2xl p-5 space-y-2 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15">
              <div className="flex items-center justify-between text-blue-500">
                <TrendingUp className="w-6 h-6" />
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10">تقييم</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-chalk">8 / 8</div>
              <div className="text-xs text-slate-500 dark:text-chalk-muted">اختبارات مجتازة بنجاح</div>
            </div>
          </div>

          {/* Two-Column Section: Voucher Activation & Upcoming Exams */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Activate Voucher Card */}
            <div className="lg:col-span-6 chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-chalk">تفعيل كود الشحن</h3>
                  <p className="text-xs text-slate-500 dark:text-chalk-muted">أدخل الكود المكون من 12 حرفاً المكتوب على كارت الشحن</p>
                </div>
              </div>

              <form onSubmit={handleActivateVoucher} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">رمز التفعيل (Voucher Code)</label>
                  <input
                    type="text"
                    placeholder="مثال: ALM-2026-X7K9"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk font-mono text-center tracking-widest text-base uppercase focus:border-cyan-electric outline-none transition-colors"
                  />
                </div>

                {voucherStatus && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    voucherStatus.success
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                  }`}>
                    {voucherStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{voucherStatus.message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-sm font-extrabold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all"
                >
                  تفعيل كود الشحن الآن
                </button>
              </form>
            </div>

            {/* Upcoming Quizzes */}
            <div className="lg:col-span-6 chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-chalk">الاختبارات المتاحة لك</h3>
                <span className="text-xs font-bold text-cyan-electric">2 اختبار متاح</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-chalk">اختبار درس الأعداد النسبية (MCQ)</h4>
                    <p className="text-xs text-slate-500 dark:text-chalk-muted">10 أسئلة • الزمن: 15 دقيقة • محاولة واحدة</p>
                  </div>
                  <button className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-sm">
                    بدء الاختبار
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-chalk">اختبار تجميعي: مفاهيم الهندسة الأولى</h4>
                    <p className="text-xs text-slate-500 dark:text-chalk-muted">15 سؤالاً • الزمن: 20 دقيقة • محاولة واحدة</p>
                  </div>
                  <button className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-sm">
                    بدء الاختبار
                  </button>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>
    </DarkGradientBg>
  );
}
