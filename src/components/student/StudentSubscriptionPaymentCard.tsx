'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Phone,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Clock,
  CheckCircle2,
  Star,
  AlertCircle,
} from 'lucide-react';
import { StudentProfileDTO, StudentSubscriptionDTO } from '@/lib/types/dashboard';

interface StudentSubscriptionPaymentCardProps {
  profile: StudentProfileDTO;
  subscription: StudentSubscriptionDTO;
}

const PLANS = [
  {
    id: 'month',
    name: 'اشتراك شهر',
    durationDays: 30,
    price: 150,
    popular: false,
    description: 'وصول كامل لجميع المحاضرات والاختبارات ومذكرات الـ PDF لمدة شهر.',
    features: [
      'مشاهدة فيديوهات الشرح وحل التمارين',
      'دخول جميع الاختبارات والشيتات الأسبوعية',
      'تحميل المذكرات والملخصات بصيغة PDF',
    ],
  },
  {
    id: 'term',
    name: 'اشتراك ترم كامل',
    durationDays: 120,
    price: 450,
    popular: true,
    description: 'شامل الترم الدراسي بالكامل بالإضافة إلى معسكرات ومراجعات ليلة الامتحان.',
    features: [
      'كل مميزات الاشتراك الشهري',
      'تغطية شاملة للمنهج حتى نهاية امتحانات الترم',
      'مراجعات نهائية مكثفة ونماذج امتحانات المحافظات',
      'متابعة مستمرة ومباشرة مع م/ رضا خيرت',
    ],
  },
  {
    id: 'year',
    name: 'اشتراك العام الدراسي كامل',
    durationDays: 365,
    price: 850,
    popular: false,
    description: 'تغطية العام الدراسي بالكامل (الترمين الأول والثاني) مع توفير كبير.',
    features: [
      'وصول غير محدود طوال العام الدراسي كاملاً',
      'شامل مراجعات الترم الأول والترم الثاني',
      'أولوية التصحيح والرد على استفسارات الطالب',
    ],
  },
];

export function StudentSubscriptionPaymentCard({
  profile,
  subscription,
}: StudentSubscriptionPaymentCardProps) {
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]); // Default to term
  const [copiedNumber, setCopiedNumber] = useState(false);

  const paymentPhone = '01008901896';

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(paymentPhone);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const whatsappMessage = encodeURIComponent(
    `السلام عليكم يا مستر رضا، أنا الطالب: ${profile.fullName}، ورقمي المسجل على المنصة: ${profile.phone}.\n\nقمت بتحويل مبلغ اشتراك (${selectedPlan.name} — ${selectedPlan.price} ج.م) عبر فودافون كاش / إنستاباي، ومرفق صورة إشعار التحويل لتفعيل حسابي.`
  );

  const whatsappUrl = `https://wa.me/20${paymentPhone.replace(/^0/, '')}?text=${whatsappMessage}`;

  return (
    <div className="space-y-6 font-arabic max-w-4xl mx-auto" dir="rtl">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-chalk space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-electric/10 border border-cyan-electric/30 text-cyan-electric text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>طرق الاشتراك وتفعيل الحساب</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              تفعيل اشتراك منصة المهندس
            </h2>
            <p className="text-xs sm:text-sm text-chalk-muted font-medium max-w-2xl">
              اختر باقة الاشتراك المناسبة، وحوّل الرسوم عبر فودافون كاش أو إنستاباي، ثم أرسل إشعار التحويل عبر واتساب ليتم التفعيل فوراً.
            </p>
          </div>

          {subscription.hasActiveSubscription && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-right space-y-1 shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>لديك اشتراك نشط حالياً</span>
              </div>
              <p className="text-xs text-slate-300">
                الخطة: <strong className="text-chalk">{subscription.subscription?.planName}</strong>
              </p>
              <p className="text-[11px] text-emerald-400 font-bold">
                متبقي {subscription.subscription?.daysRemaining} يوماً
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Step 1: Select Plan */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-chalk flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-cyan-electric text-slate-950 flex items-center justify-center text-xs font-black">1</span>
          <span>اختر باقة الاشتراك:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan.id === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`p-6 rounded-3xl cursor-pointer transition-all relative border flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-slate-50 dark:bg-slate-900 border-cyan-electric shadow-lg shadow-cyan-electric/10 ring-2 ring-cyan-electric/40'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-black bg-cyan-electric text-slate-950 shadow-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>الأكثر اختياراً</span>
                  </span>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-black text-slate-900 dark:text-chalk">
                      {plan.name}
                    </h4>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {plan.durationDays} يوماً
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-cyan-600 dark:text-cyan-electric">
                      {plan.price}
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      جنية مصري
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-chalk-muted leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-electric shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <div
                    className={`w-full py-2.5 rounded-xl text-xs font-black text-center transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-electric text-slate-950 shadow-cyan-glow'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-chalk-muted'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>تم اختيار هذه الباقة</span>
                      </>
                    ) : (
                      <span>اختيار الباقة</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Payment Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-chalk flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-cyan-electric text-slate-950 flex items-center justify-center text-xs font-black">2</span>
          <span>بيانات وطريقة التحويل:</span>
        </h3>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vodafone Cash Box */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-chalk flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-cyan-electric" />
                  <span>فودافون كاش (Vodafone Cash)</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                المبلغ المطلوب تحويله: <strong className="text-slate-900 dark:text-chalk font-black">{selectedPlan.price} ج.م</strong>
              </p>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800">
                <span className="font-mono font-black text-base text-slate-900 dark:text-chalk" dir="ltr">
                  {paymentPhone}
                </span>
                <button
                  onClick={handleCopyNumber}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-chalk hover:bg-cyan-electric hover:text-black text-xs font-bold transition-all flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                >
                  {copiedNumber ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNumber ? 'تم النسخ' : 'نسخ الرقم'}</span>
                </button>
              </div>
            </div>

            {/* InstaPay Box */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-chalk flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-cyan-electric" />
                  <span>إنستاباي (InstaPay)</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                المبلغ المطلوب تحويله: <strong className="text-slate-900 dark:text-chalk font-black">{selectedPlan.price} ج.م</strong>
              </p>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800">
                <span className="font-mono font-black text-base text-slate-900 dark:text-chalk" dir="ltr">
                  {paymentPhone}
                </span>
                <button
                  onClick={handleCopyNumber}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-chalk hover:bg-cyan-electric hover:text-black text-xs font-bold transition-all flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                >
                  {copiedNumber ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNumber ? 'تم النسخ' : 'نسخ الرقم'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 leading-relaxed space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>تنبيه هام بعد إتمام التحويل:</span>
            </p>
            <p className="pr-5">
              يرجى التقاط لقطة شاشة (Screenshot) واضحة تبيّن نجاح عملية التحويل ورقم المعاملة ورقم المحفظة المحول منها.
            </p>
          </div>
        </div>
      </div>

      {/* Step 3: Send Receipt via WhatsApp */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-chalk flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-cyan-electric text-slate-950 flex items-center justify-center text-xs font-black">3</span>
          <span>إرسال إشعار التحويل للتفعيل:</span>
        </h3>

        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="space-y-1">
            <h4 className="text-base font-black text-slate-900 dark:text-chalk">
              اضغط على الزر أدناه لإرسال الإشعار لمستر رضا خيرت مباشرة
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              سيتم فتح محادثة واتساب مجهزة تلقائياً باسمك وبيانات حسابك لترفق صورة التحويل
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full max-w-md mx-auto py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/20 hover:scale-[1.02]"
          >
            <MessageCircle className="w-5 h-5 fill-slate-950" />
            <span>إرسال إيصال التحويل عبر واتساب لتفعيل الاشتراك</span>
          </a>

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 pt-1">
            <Clock className="w-4 h-4 text-cyan-electric" />
            <span>متوسط وقت مراجعة التحويل وتفعيل الحساب: من 5 إلى 15 دقيقة فقط</span>
          </div>
        </div>
      </div>
    </div>
  );
}
