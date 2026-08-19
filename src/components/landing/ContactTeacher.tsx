'use client';

import React from 'react';
import { Phone, Mail, MapPin, MessageSquare, ExternalLink } from 'lucide-react';

export default function ContactTeacher() {
  return (
    <section id="contact" className="py-16 sm:py-24 bg-transparent border-t border-slate-200 dark:border-slate-800/80 relative overflow-hidden transition-colors duration-200">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-electric/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30 text-cyan-electric text-xs font-bold shadow-cyan-glow">
            <MessageSquare className="w-4 h-4" />
            <span>الدعم والتواصل المباشر</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-chalk tracking-tight">
            تواصل مباشرة مع م/ رضا خيرت
          </h2>

          <p className="text-sm text-slate-600 dark:text-chalk-muted font-bold leading-relaxed">
            لأي استفسارات حول الاشتراكات، أكواد الشحن، أو المواعيد في السنتر، يسعدنا التواصل مع الطلاب وأولياء الأمور مباشرة.
          </p>
        </div>

        {/* 3 Interactive Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Phone & WhatsApp */}
          <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-cyan-electric/20 space-y-5 hover:border-cyan-electric/50 transition-all flex flex-col justify-between shadow-cyan-glow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-electric/15 border border-cyan-electric/30 flex items-center justify-center text-cyan-electric">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-cyan-electric block">رقم الاتصال والواتساب</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-chalk tracking-wider pt-1" dir="ltr">
                  <a
                    href="https://wa.me/201008901896"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cyan-electric transition-colors underline decoration-cyan-electric/40 decoration-2 underline-offset-4"
                    title="فتح واتساب م/ رضا خيرت مباشرة"
                  >
                    01008901896
                  </a>
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-chalk-muted font-medium">
                متاح للاستفسارات الهاتفيّة والواتساب المباشر طوال الأسبوع.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href="https://wa.me/201008901896"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl text-xs font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>محادثة واتساب م/ رضا خيرت</span>
              </a>
              <a
                href="tel:01008901896"
                className="w-full py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-chalk bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 hover:border-cyan-electric/40 transition-all text-center"
              >
                اتصال هاتفي مباشر
              </a>
            </div>
          </div>

          {/* Card 2: Email Support */}
          <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-cyan-electric/20 space-y-5 hover:border-cyan-electric/50 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-electric/15 border border-cyan-electric/30 flex items-center justify-center text-cyan-electric">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-cyan-electric block">البريد الإلكتروني الرسمي</span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-chalk break-all pt-1">
                  Khyratreda@gmail.com
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-chalk-muted font-medium">
                للمراسلات الرسمية واستلام تقارير الطلاب وتأكيدات الشحن.
              </p>
            </div>

            <div className="pt-2">
              <a
                href="mailto:Khyratreda@gmail.com"
                className="w-full py-3 rounded-2xl text-xs font-bold text-slate-800 dark:text-chalk bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 hover:border-cyan-electric/40 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <ExternalLink className="w-4 h-4 text-cyan-electric" />
                <span>إرسال إيميل رسمي</span>
              </a>
            </div>
          </div>

          {/* Card 3: Physical Location / Center */}
          <div className="chalk-card rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-cyan-electric/20 space-y-5 hover:border-cyan-electric/50 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-electric/15 border border-cyan-electric/30 flex items-center justify-center text-cyan-electric">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-cyan-electric block">مقر السنتر المباشر</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-chalk pt-1">
                  الدقهلية - منية النصر - النزل
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-chalk-muted font-medium">
                المركز التعليمي والسنتر المباشر لحضور المحاضرات واستلام الأكواد.
              </p>
            </div>

            <div className="pt-2">
              <div className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs font-bold text-cyan-electric"> مواعيد الحضور متاحة في السنتر</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
